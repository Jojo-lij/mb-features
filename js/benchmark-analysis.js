window.benchmarkAnalysis = {
  _strategy: {
    headline: "万豪 Bonvoy App 属于国际酒店集团第一梯队，但在中国市场下一阶段应先成为最好用的住宿旅程管家。",
    coreGap: "参考定位分析将关键补齐方向归纳为住前选择权、住中自助服务、离店后闭环，而不是继续横向堆叠低频功能。",
    benchmarkSet: "第一优先级标杆：Hilton Honors、华住会、Four Seasons、IHG One Rewards。",
    mot: {
      title: "关键 MOT 组",
      thesis: "从“能订酒店”升级为“能掌控住宿过程”。",
      summary: "用户真正形成品牌判断的瞬间，是住宿旅程出现不确定性时，App 能否给出可确认、可操作、可追踪的答案。当前建议用 6 个 MOT 覆盖从找酒店到离店后的完整链路。",
      moments: [
        {
          priority: "P0",
          name: "发现与选择",
          detail: "用户开始找酒店时，需要快速比较目的地、位置、品牌、房型和口碑；搜索、地图、筛选和酒店详情决定第一轮选择效率。"
        },
        {
          priority: "P0",
          name: "价格与权益确认",
          detail: "用户准备下单时，会判断在万豪订是否值得；会员价、积分、权益、优惠和取消政策需要被清楚解释。"
        },
        {
          priority: "P0",
          name: "入住前确定性",
          detail: "选房、升房、同行人、特殊需求、抵达时间和 Mobile Check-in，是用户到店前最敏感的确定感来源。"
        },
        {
          priority: "P0",
          name: "到店入住",
          detail: "用户到达酒店后，需要知道是否已完成入住、房间是否准备好、房卡是否可用、前台等待是否可避免。"
        },
        {
          priority: "P1",
          name: "住中即时服务",
          detail: "Chat、服务请求、续住、餐饮/SPA 和服务状态追踪，决定 App 能不能在问题发生时真正帮上忙。"
        },
        {
          priority: "P1",
          name: "离店后闭环",
          detail: "实时账单、电子发票、退房、评价、反馈和补登，让用户离店后仍能确认问题被处理。"
        }
      ]
    },
    featurePositions: {
      F001: {
        domain: "获客与发现",
        route: "P2 智能化增长",
        benchmark: "华住会、IHG、Hilton",
        takeaway: "开屏广告属于运营触达能力，不是万豪中国最核心短板；优化重点应放在频控、落地页和 App 内转化闭环。"
      },
      F002: {
        domain: "忠诚度与生态",
        route: "P2 智能化增长",
        benchmark: "亚朵、IHG",
        takeaway: "注册引导要把 Bonvoy 的全球忠诚度资产讲清楚，并把新用户带到首单或偏好收集路径。"
      },
      F003: {
        domain: "获客与发现",
        route: "P2 智能化增长",
        benchmark: "华住会、亚朵",
        takeaway: "新手引导应帮助用户理解搜索、探索、会员权益和行程服务的关系，降低首次使用成本。"
      },
      F004: {
        domain: "忠诚度与生态",
        route: "P2 智能化增长",
        benchmark: "亚朵、华住会",
        takeaway: "新人福利不是单纯发券，而是把注册价值转化为可行动激励，补强首单转化。"
      },
      F005: {
        domain: "获客与发现",
        route: "P2 智能化增长",
        benchmark: "华住会、Hilton",
        takeaway: "推荐位应围绕住宿主链路组织，避免外跳削弱从内容到预订的闭环效率。"
      },
      F006: {
        domain: "获客与发现",
        route: "P2 智能化增长",
        benchmark: "华住会、Hilton",
        takeaway: "弹窗推广可以补运营触达，但必须服从频控和关键节点触发，避免干扰核心住宿旅程。"
      },
      F007: {
        domain: "获客与发现",
        route: "P2 智能化增长",
        benchmark: "华住会、IHG",
        takeaway: "目的地推荐应从灵感内容走向可预订选择，是 AI 推荐和个性化套餐的前置能力。"
      },
      F012: {
        domain: "忠诚度与生态",
        route: "P2 审慎扩展生态",
        benchmark: "Hilton、华住会",
        takeaway: "品牌专区要服务多品牌导购，而不是只做品牌展示；核心是把品牌认知接回酒店选择和预订。"
      },
      F013: {
        domain: "获客与发现",
        route: "P2 智能化增长",
        benchmark: "华住会、Hilton",
        takeaway: "目的地主题需要连接攻略、酒店、套餐和活动，否则内容无法有效驱动直订。"
      },
      F017: {
        domain: "忠诚度与生态",
        route: "P2 审慎扩展生态",
        benchmark: "华住会、Hilton",
        takeaway: "万豪会员资产强，抽屉应强调如何把权益、活动和积分机会集中呈现，提升会员价值感知。"
      }
    }
  },

  F001: {
    practice: "启动页广告在华住会、洲际、希尔顿等 App 中已作为活动曝光或品牌展示入口使用。该能力适合承接大促、会员日和品牌活动，但需要控制频次、跳过机制和落地页一致性。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会启动页会展示近期活动，例如 618 活动，用于首屏营销触达。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "ihg",
        brandLabel: "洲际优悦会",
        description: "对标评分显示洲际在启动页广告能力上为 3 分，具备较完整的启动阶段品牌或活动展示能力。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "hilton",
        brandLabel: "希尔顿荣誉会",
        description: "对标评分显示希尔顿在启动页广告能力上为 2 分，可作为启动阶段触达参考。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "已核验",
      method: "功能库匹配",
      finding: "万豪功能库中已匹配未登录开屏广告与已登录开屏广告，说明 China App 已具备启动阶段展示能力。",
      note: "后续需补充运营配置范围、投放规则、跳转落地页和频控策略。"
    },
    gap: {
      level: "低",
      summary: "万豪已具备开屏展示基础能力，差距不在功能有无，而在运营策略、个性化触达和活动闭环承接。",
      impact: "若落地页跳转、频控和人群策略不足，启动页会变成单次曝光，难以有效提升活动转化。",
      directions: [
        {
          priority: "P1",
          action: "补充启动页广告配置字段",
          detail: "明确投放人群、展示频次、展示时段、跳转目标和关闭规则，避免运营不可控。"
        },
        {
          priority: "P2",
          action: "建立活动闭环核验",
          detail: "核验开屏点击后是否能在 App 内完成浏览、注册或预订，避免跳出到外部页面造成转化损耗。"
        }
      ]
    }
  },

  F002: {
    practice: "新用户注册引导的标杆做法不是只给登录入口，而是在注册前后解释会员权益、首单价值和下一步行动。",
    evidence: [
      {
        brand: "atour",
        brandLabel: "亚朵",
        description: "对标表记录亚朵有新人权益引导登录注册领取，能把注册动作与可获得权益直接绑定。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "ihg",
        brandLabel: "洲际优悦会",
        description: "对标评分显示洲际在新用户注册引导上具备一定能力，可作为会员权益说明参考。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "已核验",
      method: "功能库匹配",
      finding: "万豪功能库中目前匹配到未登录开屏广告，但注册引导与会员权益说明的承接深度仍需核验。",
      note: "建议补看注册成功页、登录弹窗、未登录态账户页是否说明会员权益。"
    },
    gap: {
      level: "中",
      summary: "万豪有注册入口与开屏承接，但新用户注册前后的权益解释可能不够集中。",
      impact: "新用户无法快速理解加入万豪旅享家的即时收益，会影响注册转化和首单转化。",
      directions: [
        {
          priority: "P1",
          action: "强化注册前权益说明",
          detail: "在未登录态账户页、登录弹窗或注册页增加积分、会员价、房晚累积等核心权益摘要。"
        },
        {
          priority: "P2",
          action: "增加注册成功后的下一步引导",
          detail: "注册成功后引导用户完成偏好、搜索酒店或领取可用优惠，形成首单路径。"
        }
      ]
    }
  },

  F003: {
    practice: "新用户功能引导的核心价值是降低首次使用成本，把首页按钮、搜索、会员权益和预订路径用少量步骤串起来。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会首次进入 App 时有整页介绍、会员特权和主页按钮功能说明。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "atour",
        brandLabel: "亚朵",
        description: "对标评分显示亚朵在新用户功能引导上为 3 分，具备较完整的新手引导能力。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "待核验",
      method: "App 实测",
      finding: "万豪当前竞品矩阵未匹配到明确的新用户功能引导编号，需要确认首次安装、首次登录和注册成功后的引导链路。",
      note: "重点核验是否存在遮罩引导、分步引导、权益引导或首页关键入口提示。"
    },
    gap: {
      level: "高",
      summary: "当前资料暂未发现万豪有系统化的新用户功能引导，弱于华住会和亚朵。",
      impact: "用户可能不知道探索、会员权益、搜索预订和行程服务之间的关系，首次使用效率偏低。",
      directions: [
        {
          priority: "P1",
          action: "补齐首次使用引导",
          detail: "围绕首页搜索、会员权益、行程、探索四个入口设计 3 到 5 步轻量引导。"
        },
        {
          priority: "P2",
          action: "按用户状态触发",
          detail: "区分未注册、已注册未预订、已预订未入住等状态，避免所有用户看到同一套引导。"
        }
      ]
    }
  },

  F004: {
    practice: "新用户专属福利常用于把注册价值转化为可行动激励，例如新人礼包、首晚折扣或会员专属券。",
    evidence: [
      {
        brand: "atour",
        brandLabel: "亚朵",
        description: "对标表记录亚朵首页新人礼包、首晚 8 折提示和会员 Tab 新人礼领取入口。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会有订酒店和商城新用户优惠，但价格竞争力需进一步比较。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "未找到",
      method: "功能库核验",
      finding: "当前万豪竞品矩阵评分为 0，功能库未匹配到明确的新用户专属福利入口。",
      note: "如业务上已有新人权益，需要补充截图和对应功能编号。"
    },
    gap: {
      level: "高",
      summary: "万豪缺少明确的新用户专属福利承接，注册价值感不如亚朵等本土竞品直接。",
      impact: "新客注册后缺少即时奖励，可能降低注册完成率和首单转化率。",
      directions: [
        {
          priority: "P1",
          action: "设计新人权益包",
          detail: "可包括首单优惠、积分加赠、会员价解释或指定酒店新人权益。"
        },
        {
          priority: "P1",
          action: "明确领取和使用闭环",
          detail: "新人福利应在注册后可见，并能直接跳转到可用酒店或预订路径。"
        }
      ]
    }
  },

  F005: {
    practice: "广告及推荐位需要兼顾运营曝光和 App 内闭环，标杆差异主要体现在内容是否能直接引导用户完成下一步动作。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会广告占位较小，但会引导用户在 App 内完成操作。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "hilton",
        brandLabel: "希尔顿荣誉会",
        description: "对标评分显示希尔顿在广告及推荐能力上为 2 分，可作为推荐位组织参考。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "已核验",
      method: "功能库匹配",
      finding: "万豪功能库已匹配首页轮播 Banner，但对标备注指出存在跳转小程序、无法在 App 内完成流程的问题。",
      note: "需核验当前版本广告位是否仍存在外跳，以及外跳后的回流和转化数据。"
    },
    gap: {
      level: "中",
      summary: "万豪已有广告推荐位，但 App 内闭环承接弱于华住会。",
      impact: "外跳会打断用户路径，尤其影响活动注册、套餐浏览和预订转化。",
      directions: [
        {
          priority: "P1",
          action: "减少关键活动外跳",
          detail: "优先将高价值活动落在 App 内原生页或可追踪的 WebView 页面。"
        },
        {
          priority: "P2",
          action: "补充推荐位运营规则",
          detail: "按会员等级、近期搜索、行程状态配置不同推荐内容，提高推荐相关性。"
        }
      ]
    }
  },

  F006: {
    practice: "弹窗推广适合短周期活动和强提醒，但需要有频控、关闭机制和明确行动按钮，否则容易造成打扰。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标评分显示华住会在弹窗推广上为 2 分，具备活动弹窗能力。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "hilton",
        brandLabel: "希尔顿荣誉会",
        description: "对标评分显示希尔顿在弹窗推广上为 2 分，说明该能力在酒店 App 中较常见。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "未找到",
      method: "功能库核验",
      finding: "当前万豪矩阵评分为 0，功能库仅匹配到首页轮播 Banner，未见明确弹窗推广能力。",
      note: "需核验首页、登录后、预订成功后等关键节点是否存在弹窗活动。"
    },
    gap: {
      level: "高",
      summary: "万豪缺少可识别的弹窗推广能力，短周期活动和强提醒缺少原生触达位。",
      impact: "运营只能依赖 Banner 或外部渠道，难以在关键节点触发即时转化。",
      directions: [
        {
          priority: "P1",
          action: "建立弹窗推广组件",
          detail: "支持活动图、标题、说明、主按钮、关闭按钮、展示频控和目标人群配置。"
        },
        {
          priority: "P2",
          action: "限定触发场景",
          detail: "优先放在启动后、登录后、预订成功后等业务节点，避免无差别打扰。"
        }
      ]
    }
  },

  F007: {
    practice: "目的地推荐的领先形态是把城市、旅程类型、攻略内容和酒店列表连接起来，而不是单纯跳到搜索结果。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会逛逛页有 PGC、顶部轮播、活动推广，可检索目的地并按旅程类型分 Tab。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "已核验",
      method: "功能库匹配",
      finding: "万豪功能库匹配到首页目的地入口，但对标备注指出内容分散在首页为你推荐和探索板块。",
      note: "需要核验目的地内容是否能形成从灵感到酒店预订的完整链路。"
    },
    gap: {
      level: "中",
      summary: "万豪具备目的地入口，但内容组织分散，目的地推荐的专题化和转化承接不足。",
      impact: "用户从内容灵感到酒店选择之间缺少清晰路径，影响探索页和预订页之间的转化。",
      directions: [
        {
          priority: "P1",
          action: "整合目的地专题页",
          detail: "按城市或旅行主题组织攻略、活动、品牌酒店和可订房价入口。"
        },
        {
          priority: "P2",
          action: "增加旅程类型筛选",
          detail: "支持亲子、周末、商务、度假等场景标签，让目的地内容更接近用户意图。"
        }
      ]
    }
  },

  F012: {
    practice: "品牌专区应帮助用户理解品牌差异，并能从品牌内容直接进入酒店选择或活动转化。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会有旗下酒店简介 PGC，但部分内容缺少跳转预订按钮。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "hilton",
        brandLabel: "希尔顿荣誉会",
        description: "对标评分显示希尔顿品牌专区为 2 分，可作为品牌内容与消费活动组织参考。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "已核验",
      method: "功能库匹配",
      finding: "万豪功能库已匹配探索模块品牌专区，但对标备注指出部分跳转到品牌官网，且可能出现落地页不匹配。",
      note: "需重点核验品牌专区到酒店列表、品牌活动和预订页的跳转一致性。"
    },
    gap: {
      level: "中",
      summary: "万豪有品牌专区基础，但品牌内容与 App 内预订转化之间存在断点。",
      impact: "品牌认知内容无法稳定承接到预订动作，削弱多品牌矩阵的导购价值。",
      directions: [
        {
          priority: "P1",
          action: "品牌专区原生化",
          detail: "减少跳转官网，优先在 App 内展示品牌介绍、品牌活动和适用酒店。"
        },
        {
          priority: "P2",
          action: "补齐品牌到预订链路",
          detail: "每个品牌页应提供探索该品牌、查看酒店、查看优惠等明确 CTA。"
        }
      ]
    }
  },

  F013: {
    practice: "目的地主题内容应提供攻略、酒店推荐、套餐活动和地理筛选，帮助用户从灵感进入可预订选择。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会逛逛页可选择目的地，出现包含攻略和酒店特色的 PGC 内容。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "hilton",
        brandLabel: "希尔顿荣誉会",
        description: "对标表记录希尔顿主要按城市分类酒店和消费活动，目的地内容具备一定组织能力。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "已核验",
      method: "功能库匹配",
      finding: "万豪功能库匹配到首页目的地入口，但对标备注显示当前更像搜索入口，目的地内容不足。",
      note: "需要核验探索页是否已有目的地主题内容，以及是否能回流到酒店列表。"
    },
    gap: {
      level: "高",
      summary: "万豪目的地主题目前偏入口化，内容深度和消费承接弱于华住会。",
      impact: "用户获得灵感后缺少具体攻略和可订产品，内容无法充分驱动预订。",
      directions: [
        {
          priority: "P1",
          action: "建设目的地内容模板",
          detail: "每个目的地至少包含简介、推荐酒店、主题玩法、附近活动和可预订入口。"
        },
        {
          priority: "P2",
          action: "打通搜索结果",
          detail: "目的地内容页中的酒店卡片应能直接进入搜索结果或酒店详情页。"
        }
      ]
    }
  },

  F017: {
    practice: "会员活动应集中展示权益、任务、促销和积分机会，让用户知道当前能赚什么、领什么、用什么。",
    evidence: [
      {
        brand: "huazhu",
        brandLabel: "华住会",
        description: "对标表记录华住会会员 Tab 介绍权益、特权卡、优惠、任务和积分，会员活动露出更集中。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      },
      {
        brand: "hilton",
        brandLabel: "希尔顿荣誉会",
        description: "对标评分显示希尔顿会员活动为 2 分，说明其具备一定会员活动露出能力。",
        source: "酒店行业 APP 功能对标分析表",
        screenshot: ""
      }
    ],
    verification: {
      status: "已核验",
      method: "功能库匹配",
      finding: "万豪功能库当前匹配到首页预订流程中的会员流程，但会员活动的集中展示和注册闭环仍需核验。",
      note: "建议进一步核验账户页促销优惠、积分专区、活动详情和注册流程。"
    },
    gap: {
      level: "中",
      summary: "万豪会员能力基础强，但会员活动露出可能分散，缺少类似华住会会员 Tab 的集中运营入口。",
      impact: "会员权益和活动信息分散会降低用户对会员价值的感知，影响活动参与率。",
      directions: [
        {
          priority: "P1",
          action: "集中会员活动入口",
          detail: "在账户或会员中心聚合促销、积分任务、专属优惠和权益说明。"
        },
        {
          priority: "P2",
          action: "补齐活动注册状态",
          detail: "展示未注册、已注册、进行中、已完成等状态，并支持一键注册。"
        }
      ]
    }
  }
};
