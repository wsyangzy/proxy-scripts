/**
 * 配置常量类 - 集中管理所有硬编码配置
 * 遵循 DRY 原则，便于统一维护和修改
 */
class ConfigConstants {
  // ===== URL 配置 =====
  /** CDN 基础URL */
  static CDN = {
    FASTLY_JSDELIVR: "https://fastly.jsdelivr.net/gh",
    JSDELIVR: "https://cdn.jsdelivr.net/gh",
    RAW_GITHUB: "https://raw.githubusercontent.com",
  };

  /** 图标基础URL */
  static ICON_BASE =
    "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons";

  // ===== 代理组配置 =====
  /** 代理组基础选项 */
  static PROXY_GROUP_BASE = {
    interval: 300,
    timeout: 3000,
    url: "http://cp.cloudflare.com/generate_204",
    lazy: true,
    "max-failed-times": 3,
    hidden: false,
  };

  // ===== 地区关键词配置 =====
  /**
   * 地区匹配正则表达式
   *
   * 每个地区包含以下变体：
   * - 英文全称和缩写（支持连接符变体）
   * - 中文简体和繁体
   * - 地区别名
   * - Emoji标识
   * - 常见城市名
   *
   * 匹配示例：
   * - "🇭🇰 香港 01" ✓
   * - "HK-Premium" ✓
   * - "港区 IPLC" ✓
   * - "Hong-Kong" ✓
   */
  static REGION_KEYWORDS = {
    // 香港：HongKong, HK, 香港, 港区, emoji
    hk: "(?:Hong[-\\s]*Kong|HK|香港|港区|🇭🇰)",

    // 新加坡：Singapore, SG, 新加坡, 狮城（常用别名）, 坡（简称）
    sg: "(?:Singapore|SG|新加坡|狮城|坡|🇸🇬)",

    // 台湾：Taiwan, TW, 台湾/臺灣（简繁体）, 台区
    tw: "(?:Taiwan|TW|台湾|台区|臺灣|🇹🇼)",

    // 日本：Japan, JP, 日本, 东京（代表性城市）, 日区
    jp: "(?:Japan|JP|日本|东京|東京|日区|🇯🇵)",

    // 韩国：Korea, KR, 韩国/韓國（简繁体）, 首尔
    kr: "(?:Korea|KR|韩国|韓國|首尔|🇰🇷)",

    // 美国：United States, US/USA, 美国, 美區（繁体）, 主要城市
    us: "(?:United[-\\s]*States|USA?|美国|美區|洛杉矶|西雅图|🇺🇸)",
  };

  /**
   * 高倍率节点关键词（x2及以上）
   *
   * 匹配模式：
   * - x2-x9：x2, x5, x9 等
   * - x10及以上：x10, x15, x100 等
   * - 2-9倍：2倍, 5x, 9X 等
   * - 10倍及以上：10倍, 15x, 100X 等
   * - 特殊标识：Premium, Pro 等高级标识
   *
   * 注意：x1 或 1倍 不视为高倍率
   *
   * 用途：排除高倍率节点，避免混入普通地区节点组
   */
  static MULTI_KEYWORDS = "(?:x[2-9]|x[1-9]\\d+|[2-9][xX倍]|[1-9]\\d+[xX倍]|Premium|Pro)";

  // ===== 规则提供器配置 =====
  /** 规则提供器通用配置 */
  static RULE_PROVIDER_COMMON = {
    type: "http",
    format: "yaml",
    interval: 86400, // 24小时
  };
}

/**
 * 配置验证器 - 验证 Clash 配置的有效性
 * 确保配置包含必要的代理和代理提供者
 */
class ConfigValidator {
  /**
   * 验证配置对象的完整性
   * @param {Object} config - Clash 配置对象
   * @returns {string[]} 错误信息数组，空数组表示验证通过
   */
  static validateConfig(config) {
    const errors = [];

    if (!config || typeof config !== "object") {
      errors.push("配置不是有效的对象。");
      return errors;
    }

    // 验证代理
    const proxyCount = config?.proxies?.length ?? 0;
    const proxyProviderCount =
      typeof config?.["proxy-providers"] === "object"
        ? Object.keys(config["proxy-providers"]).length
        : 0;

    if (proxyCount === 0 && proxyProviderCount === 0) {
      errors.push("未检测到任何代理或代理提供者。");
    }

    // 验证必要字段
    if (config.proxies && !Array.isArray(config.proxies)) {
      errors.push("proxies 字段必须为数组。");
    }

    return errors;
  }
}

/**
 * 规则提供器管理器 - 管理所有规则集的配置
 * 包含 Loyalsoldier、blackmatrix7 两个来源的规则
 */
class RuleProviderManager {
  static getRuleProviderCommon() {
    return ConfigConstants.RULE_PROVIDER_COMMON;
  }

  /**
   * 创建 blackmatrix7 规则集配置
   * @param {string} name - 规则集名称
   * @param {string} behavior - 规则行为类型 (classical/domain)
   */
  static createBlackmatrix7Rule(name, behavior = "classical") {
    const common = this.getRuleProviderCommon();
    const cdn = ConfigConstants.CDN;
    return {
      ...common,
      behavior,
      url: `${cdn.JSDELIVR}/blackmatrix7/ios_rule_script@master/rule/Clash/${name}/${name}.yaml`,
      path: `./ruleset/blackmatrix7/${name}.yaml`,
    };
  }

  static createRuleProviders() {
    const common = this.getRuleProviderCommon();
    const cdn = ConfigConstants.CDN;

    // blackmatrix7 规则列表（classical 格式）
    const bm7Rules = [
      "Google", "GoogleDrive", "GoogleEarth", "GoogleFCM", "GoogleSearch", "GoogleVoice",
      "YouTube", "YouTubeMusic", "Discord", "Twitter", "Instagram", "Threads",
      "Facebook", "Pixiv", "TikTok", "Twitch", "Telegram", "Spotify",
    ];

    // 生成 blackmatrix7 规则配置
    const bm7RuleProviders = Object.fromEntries(
      bm7Rules.map((name) => [name, this.createBlackmatrix7Rule(name)])
    );

    return {
      // 自定义规则集
      AI: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/custom/AI.yaml",
      },
      WebRTC: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/custom/WebRTC.yaml",
      },

      // Loyalsoldier 规则集
      direct: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/direct.txt`,
        path: "./ruleset/loyalsoldier/direct.yaml",
      },
      proxy: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/proxy.txt`,
        path: "./ruleset/loyalsoldier/proxy.yaml",
      },
      reject: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/reject.txt`,
        path: "./ruleset/loyalsoldier/reject.yaml",
      },
      private: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/private.txt`,
        path: "./ruleset/loyalsoldier/private.yaml",
      },
      icloud: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/icloud.txt`,
        path: "./ruleset/loyalsoldier/icloud.yaml",
      },
      apple: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/apple.txt`,
        path: "./ruleset/loyalsoldier/apple.yaml",
      },
      gfw: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/gfw.txt`,
        path: "./ruleset/loyalsoldier/gfw.yaml",
      },
      tldNotCn: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/tld-not-cn.txt`,
        path: "./ruleset/loyalsoldier/tld-not-cn.yaml",
      },
      telegramcidr: {
        ...common,
        behavior: "ipcidr",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/telegramcidr.txt`,
        path: "./ruleset/loyalsoldier/telegramcidr.yaml",
      },
      lancidr: {
        ...common,
        behavior: "ipcidr",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/lancidr.txt`,
        path: "./ruleset/loyalsoldier/lancidr.yaml",
      },
      cncidr: {
        ...common,
        behavior: "ipcidr",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/cncidr.txt`,
        path: "./ruleset/loyalsoldier/cncidr.yaml",
      },
      applications: {
        ...common,
        behavior: "classical",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/applications.txt`,
        path: "./ruleset/loyalsoldier/applications.yaml",
      },

      // blackmatrix7 规则集 (特殊规则)
      Netflix: {
        ...common,
        behavior: "classical",
        url: `${cdn.RAW_GITHUB}/blackmatrix7/ios_rule_script/release/rule/Clash/Netflix/Netflix.yaml`,
        path: "./ruleset/blackmatrix7/Netflix.yaml",
      },
      GitHub: this.createBlackmatrix7Rule("GitHub"),

      // blackmatrix7 规则集
      ...bm7RuleProviders,
    };
  }
}

/**
 * 代理组管理器 - 管理所有代理组的配置
 * 包含节点选择、地区分组、负载均衡、功能分组等
 */
class ProxyGroupManager {
  static getGroupBaseOption() {
    return ConfigConstants.PROXY_GROUP_BASE;
  }

  static createProxyGroups() {
    const base = this.getGroupBaseOption();
    const iconBase = ConfigConstants.ICON_BASE;

    return [
      {
        ...base,
        name: "节点选择",
        type: "select",
        proxies: [
          "延迟选优",
          "故障转移",
          "负载均衡",
          "香港节点",
          "新加坡节点",
          "台湾节点",
          "日本节点",
          "韩国节点",
          "美国节点",
          "高倍节点",
          "其他节点",
        ],
        icon: `${iconBase}/adjust.svg`,
      },
      {
        ...base,
        name: "延迟选优",
        type: "url-test",
        tolerance: 100,
        proxies: [
          "负载均衡",
          "香港节点",
          "新加坡节点",
          "台湾节点",
          "韩国节点",
          "日本节点",
          "美国节点",
        ],
        icon: `${iconBase}/speed.svg`,
      },
      {
        ...base,
        name: "负载均衡",
        type: "url-test",
        tolerance: 100,
        proxies: ["负载均衡(散列)", "负载均衡(轮询)"],
        icon: `${iconBase}/balance.svg`,
      },
      {
        ...base,
        name: "故障转移",
        type: "fallback",
        proxies: [
          "香港节点",
          "新加坡节点",
          "台湾节点",
          "日本节点",
          "韩国节点",
          "美国节点",
          "负载均衡",
        ],
        icon: `${iconBase}/ambulance.svg`,
      },
      // 地区节点组
      ...this.createRegionalGroups(base, iconBase),
      // 特殊节点组
      ...this.createSpecialGroups(base, iconBase),
      // 负载均衡组
      ...this.createLoadBalanceGroups(base, iconBase),
      // 功能组
      ...this.createFunctionGroups(base, iconBase),
    ];
  }

  /**
   * 创建地区节点组
   * 包含：香港、新加坡、台湾、日本、韩国、美国
   */
  static createRegionalGroups(base, iconBase) {
    const { REGION_KEYWORDS, MULTI_KEYWORDS } = ConfigConstants;
    const regions = [
      {
        name: "香港节点",
        filter: `^(?:(?!${MULTI_KEYWORDS}).)*${REGION_KEYWORDS.hk}.*`,
        flag: "hk",
      },
      {
        name: "新加坡节点",
        filter: `^(?:(?!${MULTI_KEYWORDS}).)*${REGION_KEYWORDS.sg}.*`,
        flag: "sg",
      },
      {
        name: "台湾节点",
        filter: `^(?:(?!${MULTI_KEYWORDS}).)*${REGION_KEYWORDS.tw}.*`,
        flag: "tw",
      },
      {
        name: "日本节点",
        filter: `^(?:(?!${MULTI_KEYWORDS}).)*${REGION_KEYWORDS.jp}.*`,
        flag: "jp",
      },
      {
        name: "韩国节点",
        filter: `^(?:(?!${MULTI_KEYWORDS}).)*${REGION_KEYWORDS.kr}.*`,
        flag: "kr",
      },
      {
        name: "美国节点",
        filter: `^(?:(?!${MULTI_KEYWORDS}).)*${REGION_KEYWORDS.us}.*`,
        flag: "us",
      },
    ];

    return regions.map((region) => ({
      ...base,
      name: region.name,
      type: "url-test",
      tolerance: 100,
      "include-all": true,
      filter: region.filter,
      proxies: ["REJECT"],
      icon: `${iconBase}/flags/${region.flag}.svg`,
    }));
  }

  /**
   * 创建特殊节点组
   * 包含：高倍节点、其他节点
   */
  static createSpecialGroups(base, iconBase) {
    const { REGION_KEYWORDS, MULTI_KEYWORDS } = ConfigConstants;
    return [
      {
        ...base,
        name: "高倍节点",
        type: "select",
        tolerance: 100,
        "include-all": true,
        filter: MULTI_KEYWORDS,
        proxies: ["REJECT"],
        icon: `https://fastly.jsdelivr.net/gh/wsyangzy/My-Profiles@main/icon/urltest.svg`,
      },
      {
        ...base,
        name: "其他节点",
        type: "select",
        tolerance: 100,
        "include-all": true,
        filter: `^(?:(?!${Object.values(REGION_KEYWORDS).join("|")}).)*$`,
        proxies: ["REJECT"],
        icon: `${iconBase}/unknown.svg`,
      },
    ];
  }

  static createLoadBalanceGroups(base, iconBase) {
    const regionalProxies = [
      "香港节点",
      "新加坡节点",
      "台湾节点",
      "日本节点",
      "韩国节点",
    ];

    return [
      {
        ...base,
        name: "负载均衡(散列)",
        type: "load-balance",
        strategy: "consistent-hashing",
        proxies: regionalProxies,
        icon: `${iconBase}/merry_go.svg`,
      },
      {
        ...base,
        name: "负载均衡(轮询)",
        type: "load-balance",
        strategy: "round-robin",
        proxies: regionalProxies,
        icon: `${iconBase}/balance.svg`,
      },
    ];
  }

  static createFunctionGroups(base, iconBase) {
    return [
      {
        ...base,
        name: "解锁流媒体",
        type: "select",
        proxies: [
          "DIRECT",
          "节点选择",
          "延迟选优",
          "故障转移",
          "负载均衡",
          "香港节点",
          "新加坡节点",
          "台湾节点",
        ],
        icon: `${iconBase}/youtube.svg`,
      },
      {
        ...base,
        name: "全局直连",
        type: "select",
        proxies: ["DIRECT", "节点选择", "延迟选优", "故障转移", "负载均衡"],
        icon: `${iconBase}/link.svg`,
      },
      {
        ...base,
        name: "全局拦截",
        type: "select",
        proxies: ["REJECT", "DIRECT"],
        icon: `${iconBase}/block.svg`,
      },
      {
        ...base,
        name: "漏网之鱼",
        type: "select",
        proxies: ["节点选择", "延迟选优", "故障转移", "负载均衡", "全局直连"],
        icon: `${iconBase}/fish.svg`,
      },
    ];
  }
}

/**
 * 规则管理器 - 管理流量路由规则
 * 规则按优先级从上到下匹配，一旦匹配就不再继续
 */
class RuleManager {
  /**
   * 创建规则列表
   * @returns {string[]} 规则数组
   *
   * 规则优先级说明:
   * 1. AI服务 (需要特定地区节点)
   * 2. 开发工具 (GitHub等)
   * 3. 社交媒体 (根据服务特性选择节点)
   * 4. 通讯应用
   * 5. 流媒体服务
   * 6. 搜索引擎 (Google全系列)
   * 7. 特殊规则 (指定节点或拦截)
   * 8. 直连域名
   * 9. 系统规则 (Clash面板等)
   * 10. 基础规则集 (Loyalsoldier规则)
   * 11. 地理位置规则 (IP段匹配)
   * 12. 兜底规则 (最低优先级)
   */
  static createRules() {
    return [
      // ============================================
      // 1. AI 服务 - 需要美国节点
      // ============================================
      "RULE-SET,AI,美国节点",

      // ============================================
      // 2. 开发工具 - 优先使用香港节点
      // ============================================
      "RULE-SET,GitHub,香港节点",

      // ============================================
      // 3. 社交媒体 - 按服务特性分配节点
      // ============================================
      "RULE-SET,Twitter,香港节点",
      "RULE-SET,Instagram,韩国节点",
      "RULE-SET,Threads,韩国节点",
      "RULE-SET,Facebook,韩国节点",
      "RULE-SET,TikTok,韩国节点",
      "RULE-SET,Discord,节点选择",
      "RULE-SET,Pixiv,节点选择",

      // ============================================
      // 4. 通讯应用
      // ============================================
      "RULE-SET,Telegram,节点选择",
      
      // ============================================
      // 5. 搜索引擎 - Google 全系列
      // ============================================
      "RULE-SET,Google,美国节点",
      "RULE-SET,GoogleDrive,美国节点",
      "RULE-SET,GoogleEarth,美国节点",
      "RULE-SET,GoogleFCM,美国节点",
      "RULE-SET,GoogleSearch,美国节点",
      "RULE-SET,GoogleVoice,美国节点",

      // ============================================
      // 6. 流媒体服务
      // ============================================
      "RULE-SET,Twitch,节点选择",
      "RULE-SET,Spotify,节点选择",
      "RULE-SET,YouTube,节点选择",
      "RULE-SET,YouTubeMusic,节点选择",
      "RULE-SET,Netflix,解锁流媒体",

      // ============================================
      // 7. 特殊规则 - 需要指定节点或拦截
      // ============================================
      "RULE-SET,WebRTC,REJECT",
      "DOMAIN-SUFFIX,battlenet.com,美国节点",
      "DOMAIN-SUFFIX,anthropic.com,REJECT",
      "DOMAIN-KEYWORD,openclaudecode,DIRECT",

      // ============================================
      // 8. 直连域名
      // ============================================
      "DOMAIN-SUFFIX,88code.org,DIRECT",
      "DOMAIN-SUFFIX,privnode.com,DIRECT",

      // ============================================
      // 9. 系统规则 - Clash 面板和工具
      // ============================================
      "DOMAIN,clash.razord.top,DIRECT",
      "DOMAIN,yacd.haishan.me,DIRECT",

      // ============================================
      // 10. 基础规则集 - Loyalsoldier 规则
      // ============================================
      "RULE-SET,private,DIRECT",      // 私有网络
      "RULE-SET,icloud,DIRECT",       // iCloud服务
      "RULE-SET,apple,DIRECT",        // Apple服务
      "RULE-SET,reject,REJECT",       // 广告拦截
      "RULE-SET,proxy,节点选择",       // 需要代理的域名
      "RULE-SET,direct,DIRECT",       // 直连域名
      "RULE-SET,gfw,节点选择",         // GFW列表
      "RULE-SET,tldNotCn,节点选择",    // 非中国顶级域名
      "RULE-SET,lancidr,DIRECT,no-resolve",      // 局域网IP
      "RULE-SET,cncidr,DIRECT,no-resolve",       // 中国大陆IP
      "RULE-SET,telegramcidr,节点选择,no-resolve", // Telegram IP段
      "RULE-SET,applications,DIRECT", // 常见软件

      // ============================================
      // 11. 地理位置规则 - IP 段匹配
      // ============================================
      "GEOIP,LAN,DIRECT,no-resolve",
      "GEOIP,CN,DIRECT,no-resolve",

      // ============================================
      // 12. 兜底规则 - 最低优先级
      // ============================================
      "MATCH,漏网之鱼",
    ];
  }
}

/**
 * 主函数 - Clash 配置预处理器入口
 *
 * @param {Object} config - 原始 Clash 配置对象（来自订阅源）
 * @returns {Object|null} 处理后的完整配置对象，失败时返回 null
 *
 * 功能说明:
 * 1. 验证输入配置的有效性
 * 2. 生成规则提供器配置 (rule-providers)
 * 3. 生成代理组配置 (proxy-groups)
 * 4. 生成路由规则 (rules)
 * 5. 直接修改原始配置对象（Clash Verge 推荐方式）
 *
 * 错误处理:
 * - 配置验证失败: 返回原始配置（保持服务可用）
 * - 运行时错误: 返回 null
 */
function main(config) {
  try {
    // 验证配置
    const errors = ConfigValidator.validateConfig(config);
    if (errors.length > 0) {
      // 返回原始配置而非 null，保持服务可用
      return config;
    }

    // 生成各项配置
    const ruleProviders = RuleProviderManager.createRuleProviders();
    const proxyGroups = ProxyGroupManager.createProxyGroups();
    const rules = RuleManager.createRules();

    // 直接修改原配置对象（Clash Verge 推荐方式）
    config["rule-providers"] = ruleProviders;
    config["proxy-groups"] = proxyGroups;
    config.rules = rules;

    return config;
  } catch (error) {
    // 严重错误返回 null，让调用者处理
    return null;
  }
}

/**
 * 模块导出
 * 导出所有管理器类以支持模块化使用和单元测试
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    main,
    ConfigConstants,
    ConfigValidator,
    RuleProviderManager,
    ProxyGroupManager,
    RuleManager,
  };
}
