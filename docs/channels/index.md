---
summary: "Messaging platforms WeiClaw can connect to"
read_when:
  - You want to choose a chat channel for WeiClaw
  - You need a quick overview of supported messaging platforms
title: "Chat Channels"
---

# Chat Channels

WeiClaw can talk to you on the chat app you already use. Each channel connects through the gateway.
Text is supported everywhere; media, reactions, and setup depth vary by channel.

## Recommended starting point

- [Telegram](/channels/telegram): still the fastest default setup path in the public repo

## China-region optional foundation in v2.0.1

- [China Channel Foundation](/channels/china-channel-foundation): overview of the v2.0.1 WeCom + Feishu adapter skeleton
- [WeCom](/channels/wecom): optional WeCom adapter foundation
- [Feishu](/channels/feishu): optional Feishu adapter foundation

These China-region channels are optional adapter foundations in `v2.0.1`. They are not enabled by
default and they do not replace the Telegram-first public mainline.

## Other supported channels

- [BlueBubbles](/channels/bluebubbles): recommended iMessage route for new setups
- [Discord](/channels/discord): Discord Bot API + Gateway
- [Google Chat](/channels/googlechat): Google Chat app via HTTP webhook
- [iMessage (legacy)](/channels/imessage): legacy macOS integration via `imsg`
- [IRC](/channels/irc): classic IRC servers with channels and DMs
- [Signal](/channels/signal): `signal-cli` based integration
- [Slack](/channels/slack): workspace app integration
- [WhatsApp](/channels/whatsapp): Baileys-based integration with QR pairing
- [WebChat](/web/webchat): browser-based WebChat UI

## Plugin channels

- [LINE](/channels/line)
- [Matrix](/channels/matrix)
- [Mattermost](/channels/mattermost)
- [Microsoft Teams](/channels/msteams)
- [Nextcloud Talk](/channels/nextcloud-talk)
- [Nostr](/channels/nostr)
- [Synology Chat](/channels/synology-chat)
- [Tlon](/channels/tlon)
- [Twitch](/channels/twitch)
- [Zalo](/channels/zalo)
- [Zalo Personal](/channels/zalouser)

## Notes

- Multiple channels can run at the same time.
- Group behavior differs by channel; see [Groups](/channels/groups).
- DM pairing and allowlists remain part of the public safety model; see [Security](/gateway/security).
- Troubleshooting is documented in [Channel troubleshooting](/channels/troubleshooting).
