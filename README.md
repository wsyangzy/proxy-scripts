# Proxy Profiles 配置文件集合

本项目为 Clash 和其他代理工具提供预配置文件和脚本，帮助用户快速设置和管理代理配置。

## 目录

- [项目结构](#项目结构)
- [Clash for Windows 配置](#clash-for-windows-配置)
  - [预处理配置](#预处理配置)
  - [ini 配置](#ini-配置)
  - [问题解决](#问题解决)
  - [规则集资源](#规则集资源)
- [其他代理工具](#其他代理工具)
  - [Clash.Meta](#clashmeta)
  - [Clash Verge](#clash-verge)
  - [Clash Nyanpasu](#clash-nyanpasu)
  - [mihomo](#mihomo)
  - [clashtui](#clashtui)
  - [Clash.Mini](#clashmini)
  - [clashN](#clashn)
- [v2Ray](#v2ray)
- [sing-box](#sing-box)
  - [机场订阅转singbox配置](#机场订阅转singbox配置)
  - [sing-box使用免费vless节点](#sing-box使用免费vless节点)

## 项目结构

```
proxy-profiles/
├── Full_MultiMode.ini       # ACL4SSR 多模式配置文件
├── Parsers.yaml             # Clash for Windows 的预处理配置
├── qx.conf                  # Quantumult X 配置
├── README.md                # 本文档
├── script_file.js           # 脚本文件
├── script.js                # 脚本文件
├── icon/                    # 图标目录
│   └── urltest.svg          # URL测试图标
└── Scripts/                 # 各种脚本文件
    ├── IP_API.js            # IP API 脚本
    ├── IPCheck.js           # IP 检查脚本
    ├── nf-ui-check.js       # Netflix 解锁检查脚本
    ├── ytb-ui-check.js      # YouTube 解锁检查脚本
    └── ...                  # 其他脚本文件
```

## Clash for Windows 配置

### 官方文档

- [CFW 官方文档](https://docs.cfw.lbyczf.com/)
- [Dreamacro Clash 文档](https://dreamacro.github.io/clash/)

### 预处理配置

在 Clash for Windows 中，可以通过预处理功能自定义订阅配置。

#### 设置方法

1. 打开 Clash for Windows
2. 进入 `Settings` -> `Profiles` -> `Parsers` -> `Edit`
3. 在订阅链接末尾添加 `#slbable` 后缀并更新订阅

#### 相关文档和资源

- [配置文件预处理参数说明](https://docs.cfw.lbyczf.com/contents/parser.html)
- [负载均衡配置](https://bulianglin.com/archives/lb.html)
- [Loyalsoldier Clash 规则](https://github.com/Loyalsoldier/clash-rules)
- [parser自动替换订阅规则，自由切换黑白名单](https://github.com/Fndroid/clash_for_windows_pkg/issues/2193)
- [parse配置/.ini配置](https://github.com/Fndroid/clash_for_windows_pkg/issues/2729)
- [过滤节点、分组（code实现）](https://github.com/Fndroid/clash_for_windows_pkg/issues/2579#issuecomment-1567688925)

### ini 配置

本项目包含 [ACL4SSR_Online_Full_MultiMode.ini](Full_MultiMode.ini) 文件，适用于重度用户。

#### 相关资源

- [ACL4SSR 配置文件](https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini)
- [在线订阅转换](https://acl4ssr-sub.github.io)
- [远程配置](https://raw.githubusercontent.com/wsyangzy/My-Clash-Profiles/main/Full_MultiMode.ini)
- [cutethotw/ClashRule](https://github.com/cutethotw/ClashRule)

### 问题解决

#### 常见问题

- [获取配置文件和在线规则集时只能直连，导致无法获取配置和规则集](https://github.com/Dreamacro/clash/issues/2775)

#### 解决方案

- [jsDelivr CDN](https://github.com/Fndroid/clash_for_windows_pkg/issues/2979#issuecomment-1116196740)
- [FastGit](https://github.com/Dreamacro/clash/issues/898#issuecomment-675908855)
- [本地配置规则](https://github.com/Dreamacro/clash/issues/2775#issuecomment-1595928740)
- [parser预加载rule-providers到本地](https://github.com/Dreamacro/clash/issues/1385#issuecomment-1583996210)

### 规则集资源

- [ACL4SSR/ACL4SSR](https://github.com/ACL4SSR/ACL4SSR/tree/master/Clash/config)
- [SleepyHeeead/subconverter-config](https://github.com/SleepyHeeead/subconverter-config)
- [Mazeorz/airports](https://github.com/Mazeorz/airports)
- [blackmatrix7 规则集](https://github.com/blackmatrix7/ios_rule_script/tree/master/rule/Clash)

## 其他代理工具

### Clash.Meta

- [官方 Wiki](https://wiki.metacubex.one)
- [GitHub 仓库](https://github.com/MetaCubeX/mihomo)
- [ClashX.Meta](https://github.com/MetaCubeX/ClashX.Meta)
- [ClashMetaForAndroid](https://github.com/MetaCubeX/ClashMetaForAndroid)

### Clash Verge

- [使用指南](https://github.com/zzzgydi/clash-verge/wiki/%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)
- [clash verge 配置详解](https://wiki.metacubex.one/config/proxy-groups/filter/)
- [clash verge 配置示例](https://wiki.metacubex.one/example/)
- [abrclano/Merge+Script](https://github.com/abrclano/Self-use-Rules/tree/main/Clash.verge)
- [test482/cfw parse](https://gist.github.com/test482/3572dbd15b4838a7f999a749104a77ee#file-paser-yaml)
- [test482/clash verge merge](https://gist.github.com/test482/62439ebb2fdba846c0e3071d299eae91#file-clash-verge-local-config-yaml)

**替换 clash.meta 内核**: [Clash-Core-Change](https://github.com/kayaladream/Clash-Core-Change)

### Clash Nyanpasu

- [GitHub 仓库](https://github.com/keiko233/clash-nyanpasu)

### mihomo

- [GitHub 仓库](https://github.com/MetaCubeX/mihomo)

### clashtui

- [GitHub 仓库](https://github.com/JohanChane/clashtui)

### Clash.Mini

- [GitHub 仓库](https://github.com/MetaCubeX/Clash.Mini)
- [ClashMetaForWindows_Mini](https://github.com/kogekiplay/ClashMetaForWindows_Mini)

### clashN

- [GitHub 仓库](https://github.com/2dust/clashN)

## v2Ray

- [v2rayN](https://github.com/2dust/v2rayN)
- [v2rayNG](https://github.com/2dust/v2rayNG)

## sing-box

### 官方资源

- [sing-box GitHub](https://github.com/SagerNet/sing-box)
- [hiddify-next](https://github.com/hiddify/hiddify-next)
- [sing-land](https://github.com/net-breaker/sing-land)
- [sing-box 订阅转换](https://github.com/Toperlock/sing-box-subscribe)

### 使用方法

机场订阅分流用于 singbox：`https://sing-box-subscribe.vercel.app/config/机场订阅`

#### 客户端推荐

**iOS/Mac**
- [sing-box](https://apps.apple.com/hk/app/sing-box/id6451272673)
- [potaso lite](https://apps.apple.com/us/app/potatso-lite/id1239860606)

**Android**
- [nekobox](https://github.com/MatsuriDayo/NekoBoxForAndroid)

**Windows**
- [clash-verge](https://github.com/zzzgydi/clash-verge)
- [clash meta 内核](https://github.com/MetaCubeX/Clash.Meta)
- [nekobox](https://github.com/MatsuriDayo/nekoray/releases)
- [v2rayN](https://github.com/2dust/v2rayN)

**其他工具**
- [hysteria](https://github.com/apernet/hysteria)

### 机场订阅转singbox配置，本地部署

- [教程](https://jdssl.top/index.php/2023/12/07/singboxjson/)

### sing-box使用免费vless节点

- [教程](https://jdssl.top/index.php/2023/12/12/mac-ios-singbxvless/)