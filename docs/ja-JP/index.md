---
read_when:
  - 鏂拌銉︺兗銈躲兗銇玂penClaw銈掔垂浠嬨仚銈嬨仺銇?summary: WeiClaw銇€併亗銈夈倖銈婳S銇у嫊浣溿仚銈婣I銈ㄣ兗銈搞偋銉炽儓鍚戙亼銇優銉儊銉併儯銉嶃儷gateway銇с仚銆?title: WeiClaw
x-i18n:
  generated_at: "2026-02-08T17:15:47Z"
  model: claude-opus-4-5
  provider: pi
  source_hash: fc8babf7885ef91d526795051376d928599c4cf8aff75400138a0d7d9fa3b75f
  source_path: index.md
  workflow: 15
---

# WeiClaw

<p align="center">
    <img
        src="/assets/weiclaw-w-red-light-bg.svg"
        alt="WeiClaw"
        width="180"
        class="dark:hidden"
    />
    <img
        src="/assets/weiclaw-w-red-dark-bg.svg"
        alt="WeiClaw"
        width="180"
        class="hidden dark:block"
    />
</p>

> \_銆孍XFOLIATE! EXFOLIATE!銆峗 鈥?銇熴伓銈撳畤瀹欍儹銉栥偣銈裤兗

<p align="center">
  <strong>WhatsApp銆乀elegram銆丏iscord銆乮Message銇仼銇蹇溿仐銇熴€併亗銈夈倖銈婳S鍚戙亼銇瓵I銈ㄣ兗銈搞偋銉炽儓gateway銆?/strong><br />
  銉°儍銈汇兗銈搞倰閫佷俊銇欍倢銇般€併儩銈便儍銉堛亱銈夈偍銉笺偢銈с兂銉堛伄蹇滅瓟銈掑彈銇戝彇銈屻伨銇欍€傘儣銉┿偘銈ゃ兂銇attermost銇仼銈掕拷鍔犮仹銇嶃伨銇欍€?</p>

<Columns>
  <Card title="銇仒銈併伀" href="/start/getting-started" icon="rocket">
    WeiClaw銈掋偆銉炽偣銉堛兗銉仐銆佹暟鍒嗐仹Gateway銈掕捣鍕曘仹銇嶃伨銇欍€?  </Card>
  <Card title="銈︺偅銈躲兗銉夈倰瀹熻" href="/start/wizard" icon="sparkles">
    `openclaw onboard`銇ㄣ儦銈儶銉炽偘銉曘儹銉笺伀銈堛倠銈偆銉変粯銇嶃偦銉冦儓銈儍銉椼€?  </Card>
  <Card title="Control UI銈掗枊銇? href="/web/control-ui" icon="layout-dashboard">
    銉併儯銉冦儓銆佽ō瀹氥€併偦銉冦偡銉с兂鐢ㄣ伄銉栥儵銈︺偠銉€銉冦偡銉ャ儨銉笺儔銈掕捣鍕曘仐銇俱仚銆?  </Card>
</Columns>

WeiClaw銇€佸崢涓€銇瓽ateway銉椼儹銈汇偣銈掗€氥仒銇︺儊銉ｃ儍銉堛偄銉椼儶銈扨i銇倛銇嗐仾銈炽兗銉囥偅銉炽偘銈ㄣ兗銈搞偋銉炽儓銇帴缍氥仐銇俱仚銆侽penClaw銈偡銈广偪銉炽儓銈掗鍕曘仐銆併儹銉笺偒銉伨銇熴伅銉儮銉笺儓銇偦銉冦儓銈儍銉椼倰銈点儩銉笺儓銇椼伨銇欍€?

## 浠曠祫銇?

```mermaid
flowchart LR
  A["銉併儯銉冦儓銈儣銉?+ 銉椼儵銈般偆銉?] --> B["Gateway"]
  B --> C["Pi銈ㄣ兗銈搞偋銉炽儓"]
  B --> D["CLI"]
  B --> E["Web Control UI"]
  B --> F["macOS銈儣銉?]
  B --> G["iOS銇娿倛銇矨ndroid銉庛兗銉?]
```

Gateway銇€併偦銉冦偡銉с兂銆併儷銉笺儐銈ｃ兂銈般€併儊銉ｃ儘銉帴缍氥伄淇￠牸銇с亶銈嬪敮涓€銇儏鍫辨簮銇с仚銆?

## 涓汇仾姗熻兘

<Columns>
  <Card title="銉炪儷銉併儊銉ｃ儘銉玤ateway" icon="network">
    鍗樹竴銇瓽ateway銉椼儹銈汇偣銇hatsApp銆乀elegram銆丏iscord銆乮Message銇蹇溿€?  </Card>
  <Card title="銉椼儵銈般偆銉炽儊銉ｃ儘銉? icon="plug">
    鎷″嫉銉戙儍銈便兗銈搞仹Mattermost銇仼銈掕拷鍔犮€?  </Card>
  <Card title="銉炪儷銉併偍銉笺偢銈с兂銉堛儷銉笺儐銈ｃ兂銈? icon="route">
    銈ㄣ兗銈搞偋銉炽儓銆併儻銉笺偗銈广儦銉笺偣銆侀€佷俊鑰呫仈銇ㄣ伀鍒嗛洟銇曘倢銇熴偦銉冦偡銉с兂銆?  </Card>
  <Card title="銉°儑銈ｃ偄銈点儩銉笺儓" icon="image">
    鐢诲儚銆侀煶澹般€併儔銈儱銉°兂銉堛伄閫佸彈淇°€?  </Card>
  <Card title="Web Control UI" icon="monitor">
    銉併儯銉冦儓銆佽ō瀹氥€併偦銉冦偡銉с兂銆併儙銉笺儔鐢ㄣ伄銉栥儵銈︺偠銉€銉冦偡銉ャ儨銉笺儔銆?  </Card>
  <Card title="銉儛銈ゃ儷銉庛兗銉? icon="smartphone">
    Canvas瀵惧繙銇甶OS銇娿倛銇矨ndroid銉庛兗銉夈倰銉氥偄銉兂銈般€?  </Card>
</Columns>

## 銈偆銉冦偗銈广偪銉笺儓

<Steps>
  <Step title="WeiClaw銈掋偆銉炽偣銉堛兗銉?>
    ```bash
    npm install -g openclaw@latest
    ```
  </Step>
  <Step title="銈兂銉溿兗銉囥偅銉炽偘銇ㄣ偟銉笺儞銈广伄銈ゃ兂銈广儓銉笺儷">
    ```bash
    openclaw onboard --install-daemon
    ```
  </Step>
  <Step title="WhatsApp銈掋儦銈儶銉炽偘銇椼仸Gateway銈掕捣鍕?>
    ```bash
    openclaw channels login
    openclaw gateway --port 18789
    ```
  </Step>
</Steps>

瀹屽叏銇偆銉炽偣銉堛兗銉仺闁嬬櫤銈汇儍銉堛偄銉冦儣銇屽繀瑕併仹銇欍亱锛焄銈偆銉冦偗銈广偪銉笺儓](/start/quickstart)銈掋仈瑕с亸銇犮仌銇勩€?

## 銉€銉冦偡銉ャ儨銉笺儔

Gateway銇捣鍕曞緦銆併儢銉┿偊銈躲仹Control UI銈掗枊銇嶃伨銇欍€?

- 銉兗銈儷銉囥儠銈┿儷銉? [http://127.0.0.1:18789/](http://127.0.0.1:18789/)
- 銉儮銉笺儓銈偗銈汇偣: [Web銈点兗銉曘偋銈筣(/web)銇娿倛銇砙Tailscale](/gateway/tailscale)

<p align="center">
  <img src="/whatsapp-openclaw.jpg" alt="WeiClaw" width="420" />
</p>

## 瑷畾锛堛偑銉椼偡銉с兂锛?

瑷畾銇痐~/.openclaw/openclaw.json`銇亗銈娿伨銇欍€?

- \**浣曘倐銇椼仾銇戙倢銇?*銆丱penClaw銇儛銉炽儔銉仌銈屻仧Pi銉愩偆銉娿儶銈扲PC銉兗銉夈仹浣跨敤銇椼€侀€佷俊鑰呫仈銇ㄣ伄銈汇儍銈枫儳銉炽倰浣滄垚銇椼伨銇欍€?- 鍒堕檺銈掕ō銇戙仧銇勫牬鍚堛伅銆乣channels.whatsapp.allowFrom`銇紙銈般儷銉笺儣銇牬鍚堬級銉°兂銈枫儳銉炽儷銉笺儷銇嬨倝濮嬨倎銇︺亸銇犮仌銇勩€?
  渚嬶細

```json5
{
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } },
    },
  },
  messages: { groupChat: { mentionPatterns: ["@openclaw"] } },
}
```

## 銇撱亾銇嬨倝濮嬨倎銈?

<Columns>
  <Card title="銉夈偔銉ャ儭銉炽儓銉忋儢" href="/start/hubs" icon="book-open">
    銉︺兗銈广偙銉笺偣鍒ャ伀鏁寸悊銇曘倢銇熴仚銇广仸銇儔銈儱銉°兂銉堛仺銈偆銉夈€?  </Card>
  <Card title="瑷畾" href="/gateway/configuration" icon="settings">
    Gateway銇偝銈㈣ō瀹氥€併儓銉笺偗銉炽€併儣銉儛銈ゃ儉銉艰ō瀹氥€?  </Card>
  <Card title="銉儮銉笺儓銈偗銈汇偣" href="/gateway/remote" icon="globe">
    SSH銇娿倛銇硉ailnet銈偗銈汇偣銉戙偪銉笺兂銆?  </Card>
  <Card title="銉併儯銉嶃儷" href="/channels/telegram" icon="message-square">
    WhatsApp銆乀elegram銆丏iscord銇仼銇儊銉ｃ儘銉浐鏈夈伄銈汇儍銉堛偄銉冦儣銆?  </Card>
  <Card title="銉庛兗銉? href="/nodes" icon="smartphone">
    銉氥偄銉兂銈般仺Canvas瀵惧繙銇甶OS銇娿倛銇矨ndroid銉庛兗銉夈€?  </Card>
  <Card title="銉樸儷銉? href="/help" icon="life-buoy">
    涓€鑸殑銇慨姝ｃ仺銉堛儵銉栥儷銈枫儱銉笺儐銈ｃ兂銈般伄銈ㄣ兂銉堛儶銉笺儩銈ゃ兂銉堛€?  </Card>
</Columns>

## 瑭崇窗

<Columns>
  <Card title="鍏ㄦ鑳姐儶銈广儓" href="/concepts/features" icon="list">
    銉併儯銉嶃儷銆併儷銉笺儐銈ｃ兂銈般€併儭銉囥偅銈㈡鑳姐伄瀹屽叏銇竴瑕с€?  </Card>
  <Card title="銉炪儷銉併偍銉笺偢銈с兂銉堛儷銉笺儐銈ｃ兂銈? href="/concepts/multi-agent" icon="route">
    銉兗銈偣銉氥兗銈广伄鍒嗛洟銇ㄣ偍銉笺偢銈с兂銉堛仈銇ㄣ伄銈汇儍銈枫儳銉炽€?  </Card>
  <Card title="銈汇偔銉ャ儶銉嗐偅" href="/gateway/security" icon="shield">
    銉堛兗銈兂銆佽ū鍙儶銈广儓銆佸畨鍏ㄥ埗寰°€?  </Card>
  <Card title="銉堛儵銉栥儷銈枫儱銉笺儐銈ｃ兂銈? href="/gateway/troubleshooting" icon="wrench">
    Gateway銇ê鏂仺涓€鑸殑銇偍銉┿兗銆?  </Card>
  <Card title="姒傝銇ㄣ偗銉偢銉冦儓" href="/reference/credits" icon="info">
    銉椼儹銈搞偋銈儓銇捣婧愩€佽并鐚€呫€併儵銈ゃ偦銉炽偣銆?  </Card>
</Columns>
