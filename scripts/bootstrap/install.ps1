param(
  [string]$Tarball = $(if ($env:WEICLAW_INSTALL_TARBALL) { $env:WEICLAW_INSTALL_TARBALL } else { "https://github.com/zylzyqzz/WeiClaw/releases/latest/download/weiclaw-runtime.tgz" }),
  [switch]$DryRun,
  [switch]$SkipBootstrap
)

$ErrorActionPreference = "Stop"
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Write-Step {
  param([string]$Message)
  Write-Host $Message -ForegroundColor Red
}

function Invoke-Step {
  param([scriptblock]$Action, [string]$Preview)
  if ($DryRun) {
    Write-Host "[dry-run] $Preview"
    return
  }
  & $Action
}

function Show-Logo {
  Write-Host " __      __" -ForegroundColor Red
  Write-Host " \ \ /\ / /" -ForegroundColor Red
  Write-Host "  \ V  V /" -ForegroundColor Red
  Write-Host "   \_/\_/" -ForegroundColor Red
  Write-Host "   WeiClaw" -ForegroundColor Red
  Write-Host "鏋佺畝绉佹湁鍔╂墜 / Minimal private agent" -ForegroundColor DarkGray
  Write-Host ""
}

function Ensure-Git {
  if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Step "Git 灏辩华 / Git ready"
    return
  }
  Write-Step "缂哄皯 Git锛屾鍦ㄥ畨瑁?/ Installing Git"
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Invoke-Step { winget install --id Git.Git --accept-package-agreements --accept-source-agreements } "winget install Git.Git"
    return
  }
  if (Get-Command choco -ErrorAction SilentlyContinue) {
    Invoke-Step { choco install git -y } "choco install git -y"
    return
  }
  if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Invoke-Step { scoop install git } "scoop install git"
    return
  }
  throw "缂哄皯 Git / Git not found, and no supported installer is available."
}

function Ensure-Node {
  if ((Get-Command node -ErrorAction SilentlyContinue) -and (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Step "Node 宸插氨缁?/ Node ready"
    return
  }
  Write-Step "缂哄皯 Node.js锛屾鍦ㄥ畨瑁?/ Installing Node.js"
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Invoke-Step { winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements } "winget install OpenJS.NodeJS.LTS"
    return
  }
  if (Get-Command choco -ErrorAction SilentlyContinue) {
    Invoke-Step { choco install nodejs-lts -y } "choco install nodejs-lts -y"
    return
  }
  if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Invoke-Step { scoop install nodejs-lts } "scoop install nodejs-lts"
    return
  }
  throw "缂哄皯 Node.js / Node.js not found, and no supported installer is available."
}

function Install-Runtime {
  Write-Step "瀹夎杩愯鍖?/ Installing runtime package"
  Invoke-Step { npm install -g $Tarball --omit=dev --no-fund --no-audit } "npm install -g $Tarball --omit=dev --no-fund --no-audit"
}

function Start-Bootstrap {
  if ($SkipBootstrap) {
    Write-Step "璺宠繃棣栬疆閰嶇疆 / Skipping bootstrap"
    return
  }
  Write-Step "鍚姩鏋佺畝瀹夎 / Starting minimal setup"
  Invoke-Step { weiclaw setup --bootstrap } "weiclaw setup --bootstrap"
}

Show-Logo
Write-Step "鐜妫€娴?/ Checking environment"
Ensure-Git
Ensure-Node
Install-Runtime
Invoke-Step { weiclaw --help | Out-Null } "weiclaw --help"
Start-Bootstrap
Write-Step "瀹夎瀹屾垚 / Done"
