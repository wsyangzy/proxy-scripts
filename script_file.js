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

  /** 测试地址 */
  static TEST_URL = {
    CLOUDFLARE: "http://cp.cloudflare.com/generate_204",
    GOOGLE: "http://www.google.com/generate_204",
    GSTATIC: "http://www.gstatic.com/generate_204",
  };

  // ===== DNS 配置 =====
  /**
   * DNS 服务器地址（已移除）
   * 用户要求移除所有 DNS 配置，使用订阅源或客户端默认配置
   */
  // static DNS = { ... };

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
   * 高倍率节点关键词
   *
   * 匹配模式：
   * - x数字：x2, x5, x10 等
   * - 数字+倍/x：2倍, 5x, 10X 等
   * - 特殊标识：Premium, Pro 等高级标识
   *
   * 用途：排除高倍率节点，避免混入普通地区节点组
   */
  static MULTI_KEYWORDS = "(?:x\\d+|\\d+[xX倍]|Premium|Pro)";

  // ===== 规则提供器配置 =====
  /** 规则提供器通用配置 */
  static RULE_PROVIDER_COMMON = {
    type: "http",
    format: "yaml",
    interval: 86400, // 24小时
  };
}

// 向后兼容：保留旧的常量引用
const REGION_KEYWORDS = ConfigConstants.REGION_KEYWORDS;
const MULTI_KEYWORDS = ConfigConstants.MULTI_KEYWORDS;

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
 * 包含 Loyalsoldier、blackmatrix7、ACL4SSR 三个来源的规则
 */
class RuleProviderManager {
  static getRuleProviderCommon() {
    return ConfigConstants.RULE_PROVIDER_COMMON;
  }

  static createRuleProviders() {
    const common = this.getRuleProviderCommon();
    const cdn = ConfigConstants.CDN;

    return {
      // Loyalsoldier规则集
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
      apple: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/apple.txt`,
        path: "./ruleset/loyalsoldier/apple.yaml",
      },
      icloud: {
        ...common,
        behavior: "domain",
        url: `${cdn.FASTLY_JSDELIVR}/Loyalsoldier/clash-rules@release/icloud.txt`,
        path: "./ruleset/loyalsoldier/icloud.yaml",
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

      // 流媒体和服务规则
      netflix: {
        ...common,
        behavior: "classical",
        url: `${cdn.RAW_GITHUB}/blackmatrix7/ios_rule_script/release/rule/Clash/Netflix/Netflix.yaml`,
        path: "./ruleset/blackmatrix7/netflix.yaml",
      },
      AI: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/blackmatrix7/AI.yaml",
      },

      // ACL4SSR规则集
      ProxyGFWlist: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/ProxyGFWlist.yaml",
      },
      Google: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Google.yaml",
      },
      GoogleCN: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/GoogleCN.yaml",
      },
      GoogleCNProxyIP: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/GoogleCNProxyIP.yaml",
      },
      GoogleEarth: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/GoogleEarth.yaml",
      },
      GoogleFCM: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/GoogleFCM.yaml",
      },
      YouTube: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/YouTube.yaml",
      },
      YouTubeMusic: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/YouTubeMusic.yaml",
      },
      Discord: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Discord.yaml",
      },
      Twitter: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Twitter.yaml",
      },
      Instagram: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Instagram.yaml",
      },
      Threads: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Threads.yaml",
      },
      Facebook: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Facebook.yaml",
      },
      Pixiv: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Pixiv.yaml",
      },
      TikTok: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/TikTok.yaml",
      },
      Twitch: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Twitch.yaml",
      },
      Telegram: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Telegram.yaml",
      },
      Spotify: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Spotify.yaml",
      },

      // 广告拦截规则
      BanAD: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/BanAD.yaml",
      },
      BanEasyList: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/BanEasyList.yaml",
      },
      BanEasyListChina: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/BanEasyListChina.yaml",
      },
      Github: {
        type: "file",
        behavior: "classical",
        path: "./ruleset/ACL4SSR/Github.yaml",
      },
    };
  }
}

// 代理组管理器
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
        // 排除所有地区节点
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
   * 1. 直连域名 (最高优先级，避免被其他规则劫持)
   * 2. 系统/工具规则 (Clash面板等)
   * 3. AI服务 (需要特定地区节点)
   * 4. 开发工具 (Github等)
   * 5. 社交媒体 (根据服务特性选择节点)
   * 6. 通讯应用
   * 7. 流媒体服务
   * 8. 搜索引擎
   * 9. 广告拦截 (优先拦截，减少流量)
   * 10. 基础规则集 (大范围匹配)
   * 11. 地理位置规则 (IP段匹配)
   * 12. 兜底规则 (最低优先级)
   */
  static createRules() {
    return [
      // ============================================
      // 1. 直连域名 - 最高优先级
      // ============================================
      "DOMAIN-SUFFIX,linux.do,DIRECT",
      "DOMAIN-SUFFIX,88code.org,DIRECT",
      "DOMAIN-SUFFIX,privnode.com,DIRECT",

      // ============================================
      // 2. 系统规则 - Clash 面板和工具
      // ============================================
      "DOMAIN,clash.razord.top,DIRECT",
      "DOMAIN,yacd.haishan.me,DIRECT",

      // ============================================
      // 3. AI 服务 - 需要美国节点
      // ============================================
      "RULE-SET,AI,美国节点",

      // ============================================
      // 4. 开发工具 - 优先使用香港节点
      // ============================================
      "RULE-SET,Github,香港节点",

      // ============================================
      // 5. 社交媒体 - 按服务特性分配节点
      // ============================================
      // Twitter 使用香港节点
      "RULE-SET,Twitter,香港节点",
      // Instagram/Threads/Facebook/TikTok 使用韩国节点
      "RULE-SET,Instagram,韩国节点",
      "RULE-SET,Threads,韩国节点",
      "RULE-SET,Facebook,韩国节点",
      "RULE-SET,TikTok,韩国节点",
      // 其他社交平台自动选择
      "RULE-SET,Discord,节点选择",
      "RULE-SET,Pixiv,节点选择",

      // ============================================
      // 6. 通讯应用
      // ============================================
      "RULE-SET,Telegram,节点选择",

      // ============================================
      // 7. 流媒体服务
      // ============================================
      "RULE-SET,Twitch,节点选择",
      "RULE-SET,Spotify,节点选择",
      "RULE-SET,YouTube,节点选择",
      "RULE-SET,YouTubeMusic,节点选择",
      "RULE-SET,netflix,解锁流媒体",

      // ============================================
      // 8. 搜索引擎 - Google 全系列
      // ============================================
      "RULE-SET,Google,节点选择",
      "RULE-SET,GoogleCN,节点选择",
      "RULE-SET,GoogleCNProxyIP,节点选择",
      "RULE-SET,GoogleEarth,节点选择",
      "RULE-SET,GoogleFCM,节点选择",

      // ============================================
      // 9. 广告拦截 - 优先级较高，减少后续规则匹配
      // ============================================
      "RULE-SET,BanAD,REJECT",
      "RULE-SET,BanEasyList,REJECT",
      "RULE-SET,BanEasyListChina,REJECT",

      // ============================================
      // 10. 基础规则集 - Loyalsoldier 规则
      // ============================================
      "RULE-SET,private,DIRECT",      // 私有网络
      "RULE-SET,reject,REJECT",       // 拒绝访问
      "RULE-SET,icloud,DIRECT",       // iCloud 服务
      "RULE-SET,apple,DIRECT",        // Apple 服务
      "RULE-SET,proxy,节点选择",       // 需要代理的域名
      "RULE-SET,direct,DIRECT",       // 直连域名
      "RULE-SET,lancidr,DIRECT",      // 局域网IP
      "RULE-SET,cncidr,DIRECT",       // 中国大陆IP
      "RULE-SET,applications,DIRECT", // 常见软件
      "RULE-SET,ProxyGFWlist,节点选择", // GFW列表

      // ============================================
      // 11. 地理位置规则 - IP 段匹配
      // ============================================
      "GEOIP,LAN,DIRECT",  // 局域网
      "GEOIP,CN,DIRECT",   // 中国大陆

      // ============================================
      // 12. 兜底规则 - 最低优先级，未匹配的流量
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
 * 5. 生成DNS配置 (dns)
 * 6. 直接修改原始配置对象（Clash Verge 推荐方式）
 *
 * 错误处理:
 * - 配置验证失败: 输出错误信息到控制台，返回原始配置（保持服务可用）
 * - 运行时错误: 输出错误堆栈到控制台，返回 null
 *
 * 调试模式:
 * - 执行过程会输出详细的调试日志到控制台
 * - 可通过 Clash Verge 的日志查看执行状态
 *
 * 使用方法:
 * ```javascript
 * // 在 Clash 预处理脚本中使用
 * module.exports.parse = async (raw, { yaml }) => {
 *   const config = yaml.parse(raw);
 *   const result = main(config);
 *   return yaml.stringify(result);
 * };
 * ```
 *
 * @example
 * const config = { proxies: [...], "proxy-providers": {...} };
 * const result = main(config);
 * if (result) {
 *   console.log("配置生成成功");
 * }
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
