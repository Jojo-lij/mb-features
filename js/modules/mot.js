modules.push({
  id: 'mot',
  name: 'MOT',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  desc: '关键时刻 — 围绕住宿旅程不确定性补齐新增与迭代功能',
  isBenchmark: false,
  sections: [
    {
      name: '发现与选择',
      features: [
        { id: 'MOT-001', name: '智能选店助手', desc: '用户输入出行目的、同行人、预算、偏好后，系统推荐合适酒店并说明推荐依据。', status: '新功能', priority: 'P0' },
        { id: 'MOT-002', name: '酒店横向对比', desc: '支持将 2-3 家候选酒店横向比较位置、价格、权益、设施、政策和用户评价。', status: '新功能', priority: 'P0' },
        { id: 'MOT-003', name: '场景化酒店推荐', desc: '按商务出差、亲子、周末度假、近地铁、近景点、带宠物等真实场景组织推荐。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-004', name: '人群化专项推荐', desc: '按照亲子、商务、高端休闲、会员等级、新客等不同用户群体进行专项酒店和内容推荐。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-005', name: '目的地便利度评估', desc: '输入目的地后展示到酒店的通勤时间、交通方式、步行距离、周边商圈和便利度。', status: '新功能', priority: 'P0' },
        { id: 'MOT-006', name: '推荐理由解释', desc: '在酒店卡片或推荐结果中解释为什么推荐这家酒店，降低选择焦虑。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-007', name: '决策证据增强', desc: '在酒店详情和卡片中强化用户点评、周边商圈、设施亮点和会员权益露出，帮助用户确认选择。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-008', name: '候选酒店清单', desc: '允许用户暂存候选酒店，结合浏览历史稍后统一比较、分享或继续预订。', status: '新功能', priority: 'P1' }
      ]
    },
    {
      name: '价格与权益确认',
      features: [
        { id: 'MOT-009', name: '权益最优推荐', desc: '告诉用户哪家酒店最适合使用积分、会员权益、套券或优惠，放大 Bonvoy 价值。', status: '新功能', priority: 'P0' },
        { id: 'MOT-010', name: '积分现金组合建议', desc: '在价格确认环节建议积分、现金、积分+现金的最优使用方式。', status: '新功能', priority: 'P1' },
        { id: 'MOT-011', name: '会员权益价值显性化', desc: '解释会员价、积分累积、等级权益、可得福利和取消政策带来的实际价值差异。', status: '功能迭代', priority: 'P0' },
        { id: 'MOT-012', name: '低价提醒', desc: '用户关注酒店或目的地后，当价格下降或出现更优日期时主动提醒。', status: '新功能', priority: 'P1' },
        { id: 'MOT-013', name: '灵活日期找低价', desc: '展示目的地在不同日期的价格趋势，帮助价格敏感用户选择更优入住日期。', status: '新功能', priority: 'P1' },
        { id: 'MOT-014', name: '优惠适用性提示', desc: '在用户选择房型和价格时提示当前可用优惠、不可用原因和替代选择。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-015', name: '候选房型与价格方案暂存', desc: '支持把酒店房型、价格方案或积分兑换方案加入候选清单，便于比较后再决策。', status: '新功能', priority: 'P1' },
        { id: 'MOT-016', name: '积分获取与兑换闭环', desc: '支持用户在 App 内直接查看积分获取方式、可兑换内容、兑换路径和兑换结果。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-017', name: '总价与政策摘要', desc: '在下单前集中展示税费、押金、取消规则、早餐和会员权益，减少临门犹豫。', status: '功能迭代', priority: 'P0' }
      ]
    },
    {
      name: '入住前确定性',
      features: [
        { id: 'MOT-018', name: '低摩擦身份认证', desc: '支持微信绑定登录、手机号验证码登录等低门槛认证方式，减少预订和入住前流程阻力。', status: '功能迭代', priority: 'P0' },
        { id: 'MOT-019', name: '入住准备清单', desc: '按订单状态展示到店前需要完成的事项，如证件、到达时间、偏好、付款和特殊需求。', status: '新功能', priority: 'P0' },
        { id: 'MOT-020', name: '在线选房前置', desc: '支持到店前选择楼层、朝向、连通房或安静房等偏好，并展示确认状态。', status: '新功能', priority: 'P0' },
        { id: 'MOT-021', name: '升房机会提示', desc: '基于会员等级、库存和付费升级选项，提示可升级房型及预计权益。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-022', name: '同行人与房卡准备', desc: '支持提前添加同行人、共享入住信息或准备数字房卡授权。', status: '新功能', priority: 'P1' },
        { id: 'MOT-023', name: '特殊需求确认', desc: '对高楼层、婴儿床、无烟房、纪念日等需求给出接收、处理中或已确认状态。', status: '功能迭代', priority: 'P0' },
        { id: 'MOT-024', name: '到店交通与停车指引', desc: '在入住前推送酒店入口、停车、接驳、打车落点和周边施工等到店信息。', status: '功能迭代', priority: 'P1' }
      ]
    },
    {
      name: '到店入住',
      features: [
        { id: 'MOT-025', name: '房间准备状态', desc: '展示房间是否已准备好、预计可入住时间和可选等待方案。', status: '新功能', priority: 'P0' },
        { id: 'MOT-026', name: '移动入住进度', desc: '把证件核验、押金、房间分配、房卡生成等步骤做成可追踪状态。', status: '新功能', priority: 'P0' },
        { id: 'MOT-027', name: '数字房卡可用性提示', desc: '明确当前酒店是否支持 Mobile Key、何时可用、失败时如何处理。', status: '功能迭代', priority: 'P0' },
        { id: 'MOT-028', name: '前台排队替代方案', desc: '当移动入住不可用或需人工处理时，提示自助机、优先通道或预计等待时间。', status: '待确认', priority: 'P1' },
        { id: 'MOT-029', name: '到店欢迎与导航', desc: '用户抵达附近后推送入口、前台、房间、电梯、早餐位置等室内外导航。', status: '新功能', priority: 'P1' }
      ]
    },
    {
      name: '住中即时服务',
      features: [
        { id: 'MOT-030', name: 'AI 服务助手', desc: 'AI 客服可承接房型升级、在线续住、服务请求和常见问题，并在必要时转人工。', status: '新功能', priority: 'P0' },
        { id: 'MOT-031', name: '服务进度追踪', desc: '客房用品、维修、清洁、餐饮等服务请求显示已提交、已接单、处理中、已完成。', status: '新功能', priority: 'P0' },
        { id: 'MOT-032', name: '住中服务入口整合', desc: '在行程或房卡页聚合 Chat、客房服务、餐饮、设施预约、续住和账单入口。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-033', name: '在线续住与换房', desc: '支持住中发起续住、换房、延迟退房申请，并展示酒店确认状态。', status: '新功能', priority: 'P1' },
        { id: 'MOT-034', name: '住中异常主动提醒', desc: '当房卡失效、服务超时、账单异常或权益未兑现时主动提醒并给出处理入口。', status: '待确认', priority: 'P1' },
        { id: 'MOT-035', name: '餐饮与设施即时预约', desc: '支持餐厅、SPA、健身、行政酒廊等住中消费服务预约和状态确认。', status: '新功能', priority: 'P2' },
        { id: 'MOT-036', name: '酒店本地服务推荐', desc: '根据入住酒店推荐周边交通、洗衣、会议、亲子、宠物或本地体验服务。', status: '功能迭代', priority: 'P2' }
      ]
    },
    {
      name: '离店后闭环',
      features: [
        { id: 'MOT-037', name: '电子发票与水单闭环', desc: '支持离店后申请、下载、重开或补开发票和酒店水单，并展示处理状态。', status: '功能迭代', priority: 'P0' },
        { id: 'MOT-038', name: '实时账单核对', desc: '离店前后展示房费、餐饮、押金、积分抵扣和异常费用，支持在线申诉。', status: '新功能', priority: 'P0' },
        { id: 'MOT-039', name: '缺失住宿与积分补登', desc: '用户可提交缺失住宿、积分未到账或权益未兑现问题，并跟踪处理结果。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-040', name: '问题反馈处理进度', desc: '线上反馈、投诉、服务不满、物品遗失等形成工单状态，避免只提交无回音。', status: '新功能', priority: 'P0' },
        { id: 'MOT-041', name: '离店体验回访', desc: '根据入住场景触发待点评和简短评价，差评自动进入服务补救流程。', status: '功能迭代', priority: 'P1' },
        { id: 'MOT-042', name: '复住行动建议', desc: '离店后基于浏览历史、历史住店足迹、积分、目的地和偏好推荐下一次预订或权益使用。', status: '待确认', priority: 'P2' }
      ]
    }
  ]
});
