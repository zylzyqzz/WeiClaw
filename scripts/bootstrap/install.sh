#!/usr/bin/env bash
set -euo pipefail

WEICLAW_INSTALL_TARBALL="${WEICLAW_INSTALL_TARBALL:-https://github.com/zylzyqzz/WeiClaw/releases/latest/download/weiclaw-runtime.tgz}"
WEICLAW_DRY_RUN="${WEICLAW_DRY_RUN:-0}"
WEICLAW_SKIP_BOOTSTRAP="${WEICLAW_SKIP_BOOTSTRAP:-0}"

RED='\033[38;5;196m'
DIM='\033[2m'
NC='\033[0m'

print_logo() {
  cat <<'EOF'
 __      __
 \ \ /\ / /
  \ V  V /
   \_/\_/
   WeiClaw
EOF
  printf "%b%s%b\n\n" "$DIM" "极简私有助手 / Minimal private agent" "$NC"
}

log() {
  printf "%b%s%b\n" "$RED" "$1" "$NC"
}

run_cmd() {
  if [[ "$WEICLAW_DRY_RUN" == "1" ]]; then
    printf "[dry-run] %s\n" "$*"
    return 0
  fi
  "$@"
}

have() {
  command -v "$1" >/dev/null 2>&1
}

detect_pm() {
  if have brew; then echo "brew"; return; fi
  if have apt-get; then echo "apt"; return; fi
  if have dnf; then echo "dnf"; return; fi
  if have yum; then echo "yum"; return; fi
  if have pacman; then echo "pacman"; return; fi
  if have zypper; then echo "zypper"; return; fi
  if have apk; then echo "apk"; return; fi
  echo ""
}

install_git() {
  local pm
  pm="$(detect_pm)"
  case "$pm" in
    brew) run_cmd brew install git ;;
    apt) run_cmd sudo apt-get update; run_cmd sudo apt-get install -y git curl ca-certificates ;;
    dnf) run_cmd sudo dnf install -y git curl ca-certificates ;;
    yum) run_cmd sudo yum install -y git curl ca-certificates ;;
    pacman) run_cmd sudo pacman -Sy --noconfirm git curl ca-certificates ;;
    zypper) run_cmd sudo zypper install -y git curl ca-certificates ;;
    apk) run_cmd sudo apk add git curl ca-certificates ;;
    *) printf "缺少 Git / Missing git, and no supported package manager was found.\n" >&2; exit 1 ;;
  esac
}

install_node() {
  local pm
  pm="$(detect_pm)"
  case "$pm" in
    brew)
      run_cmd brew install node@22
      ;;
    apt)
      run_cmd bash -lc "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
      run_cmd sudo apt-get install -y nodejs
      ;;
    dnf)
      run_cmd bash -lc "curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -"
      run_cmd sudo dnf install -y nodejs
      ;;
    yum)
      run_cmd bash -lc "curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -"
      run_cmd sudo yum install -y nodejs
      ;;
    pacman)
      run_cmd sudo pacman -Sy --noconfirm nodejs npm
      ;;
    zypper)
      run_cmd sudo zypper install -y nodejs22 npm22 || run_cmd sudo zypper install -y nodejs npm
      ;;
    apk)
      run_cmd sudo apk add nodejs npm
      ;;
    *)
      printf "缺少 Node.js / Missing node/npm, and no supported package manager was found.\n" >&2
      exit 1
      ;;
  esac
}

ensure_git() {
  if have git; then
    log "Git 就绪 / Git ready"
    return
  fi
  log "缺少 Git，正在安装 / Installing Git"
  install_git
}

ensure_node() {
  if have node && have npm; then
    log "Node 已就绪 / Node ready"
    return
  fi
  log "缺少 Node.js，正在安装 / Installing Node.js"
  install_node
}

install_runtime() {
  log "安装运行包 / Installing runtime package"
  run_cmd npm install -g "$WEICLAW_INSTALL_TARBALL" --omit=dev --no-fund --no-audit
}

run_bootstrap() {
  if [[ "$WEICLAW_SKIP_BOOTSTRAP" == "1" ]]; then
    log "跳过首轮配置 / Skipping bootstrap"
    return
  fi
  log "启动极简安装 / Starting minimal setup"
  run_cmd weiclaw setup --bootstrap
}

main() {
  print_logo
  log "环境检测 / Checking environment"
  ensure_git
  ensure_node
  install_runtime
  run_cmd weiclaw --help >/dev/null
  run_bootstrap
  log "安装完成 / Done"
}

main "$@"
