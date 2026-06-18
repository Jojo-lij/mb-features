modules.push({
  id: 'mot',
  name: 'MOT',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  desc: '关键时刻 — 从"能订酒店"升级为"能掌控住宿过程"',
  isBenchmark: false,
  sections: [
    {
      name: 'P0 · 发现与选择',
      features: [
        { id: 'MOT-001', name: '按照旅游目的/行程类型智能分类推荐目的地及酒店相关内容', desc: '按照旅游目的/行程类型智能分类推荐目的地及酒店相关内容', status: 'live' },
        { id: 'MOT-002', name: '按照不同用户群体进行专项推荐', desc: '按照不同用户群体进行专项推荐', status: 'live' },
        { id: 'MOT-003', name: '智能选店助手：用户输入出行目的、同行人、预算、偏好，系统推荐合适酒店', desc: '用户输入出行目的、同行人、预算、偏好，系统推荐合适酒店', status: 'live' },
        { id: 'MOT-004', name: '输入目的地后显示到酒店的通勤时间、交通方式、距离', desc: '输入目的地后显示到酒店的通勤时间、交通方式、距离', status: 'live' },
        { id: 'MOT-005', name: '酒店列表：酒店卡片上显示推荐理由', desc: '酒店列表卡片上显示推荐理由', status: 'live' },
        { id: 'MOT-006', name: '酒店详情里放用户点评', desc: '酒店详情页展示用户点评', status: 'live' },
        { id: 'MOT-007', name: '会员权益露出', desc: '酒店详情页展示会员权益', status: 'live' },
        { id: 'MOT-008', name: '酒店周边商圈', desc: '展示酒店周边商圈信息', status: 'live' },
        { id: 'MOT-009', name: '权益最优推荐：告诉用户哪家酒店最适合使用积分、会员权益、套券或优惠放大 Bonvoy 会员价值', desc: '告诉用户哪家酒店最适合使用积分、会员权益、套券或优惠', status: 'live' },
        { id: 'MOT-010', name: '低价提醒', desc: '酒店价格下降时提醒用户', status: 'live' }
      ]
    },
    {
      name: 'P0 · 价格与权益确认',
      features: [
        { id: 'MOT-011', name: '酒店房型加入购物车', desc: '酒店房型可以加入购物车，支持多房型对比', status: 'live' },
        { id: 'MOT-012', name: '在线选房', desc: '支持在线选择具体房间（楼层、朝向等）', status: 'live' }
      ]
    },
    {
      name: 'P0 · 入住前确定性',
      features: [
        { id: 'MOT-013', name: '微信绑定登录/手机号验证码登录', desc: '支持微信绑定登录和手机号验证码登录', status: 'live' }
      ]
    },
    {
      name: 'P0 · 到店入住',
      features: []
    },
    {
      name: 'P1 · 住中即时服务',
      features: [
        { id: 'MOT-014', name: 'AI 客服（房型升级/在线续住）', desc: 'AI客服支持房型升级、在线续住等', status: 'live' },
        { id: 'MOT-015', name: '线上反馈', desc: '支持在线反馈问题和建议', status: 'live' }
      ]
    },
    {
      name: 'P1 · 离店后闭环',
      features: [
        { id: 'MOT-016', name: '报销凭证：在线开发票/酒店水单', desc: '支持在线开发票和获取酒店水单', status: 'live' },
        { id: 'MOT-017', name: '浏览历史', desc: '记录用户浏览过的酒店历史', status: 'live' },
        { id: 'MOT-018', name: '历史住店足迹', desc: '展示用户历史住店记录', status: 'live' },
        { id: 'MOT-019', name: '待点评', desc: '提醒用户对住过的酒店进行点评', status: 'live' }
      ]
    },
    {
      name: '积分',
      features: [
        { id: 'MOT-020', name: '积分在APP内可以直接获取与兑换', desc: '积分在APP内可以直接获取与兑换', status: 'live' }
      ]
    }
  ]
});
