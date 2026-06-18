const iconMap = {
  "benchmark": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-8"/></svg>`,
  "overview": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  "launch": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
  "homepage": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  "discover": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  "shop": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  "trips": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  "account": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  "wallet": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
  "auth": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  "mbop": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`,
  "group": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

let activeDetailId = null;

    // 飞书同步开关：true = 启用飞书在线数据，false = 仅用本地数据
    const USE_FEISHU = false;

    const FEISHU_API_URL = 'https://mb-features-api.415537164.workers.dev/';
    const fallbackModules = modules;
    const benchmarkModule = modules.find(m => m.isBenchmark);

    function ensureBenchmarkModule(mods) {
      if (!mods.some(m => m.isBenchmark) && benchmarkModule) {
        mods.unshift(benchmarkModule);
      }
      return mods;
    }

    // ===== STATE =====
    let currentModule = 'benchmark';
    let currentFilter = 'all';
    let motPriorityFilter = 'all';
    let expandedSections = new Set();
    let globalSearchQuery = '';
    let searchMatches = new Map(); // moduleId -> Set(featureIds)
    let overviewFilter = null; // null | 'all' | 'live' | 'new' | 'iterate' | 'pending'

    function parseHash() {
      const hash = location.hash.replace(/^#/, '');
      const params = {};
      hash.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
      });
      return params;
    }

    function navigateToHash() {
      const params = parseHash();
      if (!params.module) return;
      const targetModule = modules.find(m => m.id === params.module);
      if (!targetModule) return;

      currentModule = params.module;
      renderNav();
      renderContent();

      if (params.feature && !targetModule.isOverview) {
        setTimeout(() => {
          const sectionIndex = targetModule.sections.findIndex(s =>
            s.features.some(f => f.id === params.feature)
          );
          if (sectionIndex === -1) return;

          const sectionId = `${targetModule.id}-section-${sectionIndex}`;
          if (!expandedSections.has(sectionId)) {
            const header = document.querySelector(`[data-section="${sectionId}"]`);
            if (header) header.click();
          }

          setTimeout(() => {
            const detailId = `${sectionId}-detail-${params.feature}`;
            const row = document.querySelector(`[data-detail="${detailId}"]`);
            if (row) {
              toggleFeatureDetail(detailId, row);
              setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            }
          }, 100);
        }, 50);
      }
    }

    // ===== BENCHMARK MATRIX =====
    const benchmarkData = {"summary":{"level1":11,"level2":40,"level3":144,"matched":43,"suggested":35,"unmatched":66,"pending":101},"modules":[{"name":"启动与引导","sections":[{"name":"启动页","features":[{"id":"F001","name":"启动页广告","description":"APP启动时的全屏广告/品牌展示页","ratings":{"marriott":{"score":3,"note":""},"huazhu":{"score":3,"note":"展现近期活动（如618）"},"ihg":{"score":3,"note":""},"atour":{"score":2,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"LH03","name":"未登录-开屏广告","moduleId":"launch","moduleName":"启动","sectionName":"启动","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"},{"id":"LH04","name":"已登录-开屏广告","moduleId":"launch","moduleName":"启动","sectionName":"启动","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"新用户引导","features":[{"id":"F002","name":"新用户注册引导","description":"新用户注册流程、会员权益介绍","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":1,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":3,"note":"新人权益引导登录注册领取"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"LH03","name":"未登录-开屏广告","moduleId":"launch","moduleName":"启动","sectionName":"启动","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F003","name":"新用户功能引导","description":"首次打开APP的核心功能操作指引","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":3,"note":"刚进入app时整页介绍+会员特权+主页按钮功能"},"ihg":{"score":0,"note":""},"atour":{"score":3,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F004","name":"新用户专属福利","description":"新用户注册/首单专属优惠券、权益","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":1,"note":"订酒店+商城新用户优惠但对比后发现比其他OTA贵"},"ihg":{"score":0,"note":""},"atour":{"score":3,"note":"- 首页新人礼包 \n- 立即预定按钮提示新客首晚8折\n- 会员tab引导领取入会新人礼"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]},{"name":"营销","sections":[{"name":"营销推荐位","features":[{"id":"F005","name":"广告及推荐","description":"轮播广告、活动推广位","ratings":{"marriott":{"score":1,"note":"跳转去小程序 无法在app内完成流程"},"huazhu":{"score":2,"note":"占位小 但会引导用户在app内完成操作"},"ihg":{"score":1,"note":"广告内容少，单调"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP01","name":"轮播 Banner","moduleId":"homepage","moduleName":"首页","sectionName":"Home Hero","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F006","name":"弹窗推广","description":"弹窗推广热门活动","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP01","name":"轮播 Banner","moduleId":"homepage","moduleName":"首页","sectionName":"Home Hero","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F007","name":"目的地推荐","description":"目的地营销、特色旅游目的地推广","ratings":{"marriott":{"score":1,"note":"有，但是内容相当分散，分散在首页为你推荐和探索板块"},"huazhu":{"score":3,"note":"“逛逛”页中PGC 顶部有轮播广告+活动推广 可检索目的地和按旅程类型分成不同tab"},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP04","name":"目的地","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F008","name":"旅程类型分类","description":"按照旅游目的/形成类型 智能分类推荐目的地及酒店 以PGC展现","ratings":{"marriott":{"score":null,"note":"待验证"},"huazhu":{"score":3,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F009","name":"日历","description":"每日推荐目的地/酒店","ratings":{"marriott":{"score":2,"note":"对比后可能为3"},"huazhu":{"score":1,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F010","name":"个性化推荐","description":"基于用户行为的酒店/活动个性化推荐","ratings":{"marriott":{"score":1,"note":"有近期查看；“为你推荐”模块看不出千人千面"},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F011","name":"合作伙伴推广","description":"合作伙伴信息推广","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":"例如滴滴联名"},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]},{"name":"内容","sections":[{"name":"主题内容推荐","features":[{"id":"F012","name":"品牌专区","description":"各品牌介绍、专属活动、内容推荐","ratings":{"marriott":{"score":1,"note":"有，但跳转到对应品牌官网，还会出现landing page不匹配的情况"},"huazhu":{"score":2,"note":"旗下酒店简介PGC 但有些没有跳转预定的按钮"},"ihg":{"score":1,"note":"按旅行类型分类但介绍较少 无活动"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"DC03","name":"品牌专区","moduleId":"discover","moduleName":"探索","sectionName":"品牌专区","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F013","name":"目的地主题","description":"按目的地分类的旅游攻略、酒店套餐、活动","ratings":{"marriott":{"score":1,"note":"有，但是没有内容，直接去到搜索结果页"},"huazhu":{"score":3,"note":"“逛逛”页可选择目的地 出现PGC包含攻略+酒店特色"},"ihg":{"score":1,"note":"搜索页简单地点介绍"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP04","name":"目的地","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F014","name":"特色酒店推荐","description":"如新酒店专属推广、开业福利","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":1,"note":""},"ihg":{"score":2,"note":"首页广告轮播位有新店推广双倍积分活动"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F015","name":"餐饮主题","description":"餐饮套餐、下午茶、特色餐厅推荐","ratings":{"marriott":{"score":1,"note":"酒店详情页"},"huazhu":{"score":1,"note":"酒店详情页"},"ihg":{"score":2,"note":"酒店详情页"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP23","name":"餐饮","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F016","name":"其他主题","description":"按照不同用户群体进行专项推荐","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":1,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F017","name":"会员活动","description":"会员活动信息露出","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":3,"note":"“会员”tab介绍权益+特权卡+优惠+任务+积分"},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP38","name":"会员流程","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"内容社区","features":[{"id":"F018","name":"UGC内容专区","description":"用户生成的旅行攻略、酒店体验、打卡内容","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]},{"name":"搜索","sections":[{"name":"搜索核心入口","features":[{"id":"F019","name":"搜索中心入口","description":"酒店/目的地搜索核心入口","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP02","name":"搜索栏","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"搜索中心","features":[{"id":"F020","name":"目的地搜索","description":"按城市/目的地搜索酒店","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP04","name":"目的地","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F021","name":"酒店名称搜索","description":"直接输入酒店名称精准搜索","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP04","name":"目的地","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F022","name":"全场景搜索栏","description":"支持内容/酒店/目的地全维度关键词搜索","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP02","name":"搜索栏","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F023","name":"搜索自动联想","description":"输入关键词时自动推荐相关酒店/目的地","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP04","name":"目的地","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F024","name":"关键词搜索","description":"根据最近的搜索记录在搜索栏下显示关键词","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":3,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F025","name":"最近搜索记录","description":"展示用户历史搜索的酒店/目的地","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP04","name":"目的地","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F026","name":"热门城市列表","description":"快速选择热门旅游/商务城市","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP04","name":"目的地","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F027","name":"附近酒店定位","description":"基于用户定位推荐附近的酒店","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP07","name":"获取定位权限","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"搜索结果","features":[{"id":"F028","name":"搜索结果展示","description":"清晰展示出搜索结果","ratings":{"marriott":{"score":3,"note":"地图、卡片、列表形式展现搜索结果"},"huazhu":{"score":3,"note":"周边商圈/景点+卡片形式"},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP15","name":"地图视图/列表视图/网格视图","moduleId":"homepage","moduleName":"首页","sectionName":"搜索结果","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F029","name":"筛选与排序","description":"可对搜索结果进行筛选","ratings":{"marriott":{"score":2,"note":"需要对比别的品牌该功能，对比完有可能是3"},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP12","name":"筛选","moduleId":"homepage","moduleName":"首页","sectionName":"搜索结果","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"},{"id":"HP13","name":"排序","moduleId":"homepage","moduleName":"首页","sectionName":"搜索结果","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F030","name":"酒店信息卡片","description":"搜索结果中展示酒店核心信息","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP18","name":"酒店卡片","moduleId":"homepage","moduleName":"首页","sectionName":"搜索结果","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]}]},{"name":"酒店预订全流程","sections":[{"name":"酒店详情页","features":[{"id":"F031","name":"酒店基础信息展示","description":"酒店地址、星级、品牌、设施、用户评分等核心信息","ratings":{"marriott":{"score":1,"note":"用户评分基于用户住完后的调研得到"},"huazhu":{"score":3,"note":"有酒店周边推荐地点app内直接查看路线+常见问题Q&A+住客评价"},"ihg":{"score":1,"note":"无评分和星级"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP21","name":"酒店信息（现有）","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F032","name":"酒店房型展示","description":"各房型信息、价格、床型、面积、设施展示","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP40","name":"支付","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F033","name":"积分兑换/购买","description":"提供积分兑换住宿方案","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP14","name":"使用积分","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F034","name":"其他房价方案","description":"提供其他房价方案（如企业/推广活动代码，学生/长者折扣）","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":1,"note":"学生认证可领特权但在会员页"},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP07","name":"特别房价","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F035","name":"Offfolio推荐","description":"酒店餐饮服务、套餐及配套设施推广","ratings":{"marriott":{"score":1,"note":"对比后可能为2"},"huazhu":{"score":1,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F036","name":"用户评价与图片","description":"用户真实评价、酒店实景图片、VR看房","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":"酒店周边+房型+设施照片+用户真实评价"},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP21","name":"酒店信息（现有）","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F037","name":"酒店设施与服务","description":"酒店配套设施、服务项目详细介绍","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP21","name":"酒店信息（现有）","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F038","name":"酒店位置与交通","description":"酒店地图定位、周边交通、景点、商圈介绍","ratings":{"marriott":{"score":2,"note":"用户体验不是很好，不太明显"},"huazhu":{"score":3,"note":"搜索结果页和酒店详情页都有"},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP21","name":"酒店信息（现有）","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F039","name":"相关内容推荐","description":"同目的地其他酒店、相关活动套餐推荐","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F040","name":"优惠券入口","description":"该酒店可用的优惠券、套餐券领取入口","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP21","name":"酒店信息（现有）","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F041","name":"套餐推荐","description":"推荐套餐（住宿+x）房价","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP21","name":"酒店信息（现有）","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F042","name":"增值服务推荐","description":"房型升级、早餐、延迟退房等增值服务推荐","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"预订流程","features":[{"id":"F043","name":"一键预订页","description":"完成房型选择、日期选择、入住人信息填写","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP40","name":"支付","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F044","name":"入住人信息管理","description":"入住人信息填写、保存、快速选择","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F045","name":"特殊需求填写","description":"床型偏好、吸烟/无烟、无障碍房等特殊需求","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":"可提交偏好 但只能从标签中选择 入住当日反馈结果"},"ihg":{"score":2,"note":"可提交偏好但按当日情况看是否可满足"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP06","name":"房间&宾客&宠物设置","moduleId":"homepage","moduleName":"首页","sectionName":"Search Hub","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F046","name":"预定价格保障","description":"规定时段如门市价出现降价将进行差价赔付","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":3,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F047","name":"预订信息确认","description":"预订前订单信息、价格、取消政策核对","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP42","name":"银联支付","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"支付流程","features":[{"id":"F048","name":"多支付方式支持","description":"微信支付、银联、信用卡、积分抵扣等支付方式","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP43","name":"预订确认","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F049","name":"支付安全保障","description":"支付环境加密、支付失败处理、订单状态同步","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":"跳转到对应结算app支付"},"ihg":{"score":2,"note":"跳转到对应结算app支付"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP40","name":"支付","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"预订结果","features":[{"id":"F050","name":"预订成功页","description":"预订成功后订单信息、入住须知、酒店联系方式展示","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP44","name":"商品推荐位","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F051","name":"订单状态实时同步","description":"预订、支付、确认、取消等订单状态实时更新","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F052","name":"订单通知","description":"预订成功、订单变更、入住提醒等推送/短信通知","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":2,"note":"短信+邮箱"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"订单管理","features":[{"id":"F053","name":"订单修改","description":"预订后修改入住日期、房型、入住人信息等","ratings":{"marriott":{"score":0,"note":"有修改功能，但是只能换酒店"},"huazhu":{"score":0,"note":"支付后无法修改"},"ihg":{"score":0,"note":"支付后无法修改"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F054","name":"订单取消","description":"按取消政策申请订单取消、退款处理","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F055","name":"取消政策展示","description":"订单取消规则、退款比例、时限清晰展示","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]},{"name":"行程与在住服务","sections":[{"name":"行程管理","features":[{"id":"F056","name":"即将入住行程","description":"未来即将入住的酒店订单展示","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP09","name":"入住中心","moduleId":"trips","moduleName":"行程","sectionName":"行程详情","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F057","name":"历史行程","description":"已完成入住的酒店订单历史记录","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP20","name":"筛选历史行程","moduleId":"trips","moduleName":"行程","sectionName":"其他行程","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F058","name":"已取消行程","description":"已取消的酒店订单记录","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP19","name":"历史与取消行程","moduleId":"trips","moduleName":"行程","sectionName":"其他行程","confidence":0.6,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F059","name":"行程筛选","description":"按时间、酒店、订单状态等筛选行程","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP20","name":"筛选历史行程","moduleId":"trips","moduleName":"行程","sectionName":"其他行程","confidence":0.5,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F060","name":"待支付","description":"待支付订单","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F061","name":"待评价","description":"待评价订单","ratings":{"marriott":{"score":0,"note":"邮件通知评价"},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"行程卡片","features":[{"id":"F062","name":"入住前快捷操作","description":"房型升级、修改订单等快捷入口","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP09","name":"入住中心","moduleId":"trips","moduleName":"行程","sectionName":"行程详情","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F063","name":"入住后快捷操作","description":"移动端房卡、客房服务、延迟退房、一键退房等","ratings":{"marriott":{"score":1,"note":"有此功能（部分酒店上线）"},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP09","name":"入住中心","moduleId":"trips","moduleName":"行程","sectionName":"行程详情","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"行程详情页","features":[{"id":"F064","name":"行程基础信息","description":"入住/退房日期、酒店信息、房型、订单号等","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F065","name":"在住服务中心","description":"在住期间的客房服务、需求提交、聊天咨询、FAQ","ratings":{"marriott":{"score":1,"note":"但是很多酒店找不到入口"},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F066","name":"移动端入住/退房","description":"线上提前办理入住、一键退房功能","ratings":{"marriott":{"score":1,"note":"有该功能但是并未有实际效果"},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP09","name":"入住中心","moduleId":"trips","moduleName":"行程","sectionName":"行程详情","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F067","name":"移动端电子房卡","description":"手机蓝牙房卡、无接触开门功能","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F068","name":"房型升级入口","description":"在住期间/入住前的房型升级申请、付费升级","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F069","name":"酒店设施与门店","description":"酒店配套设施、餐厅、健身中心等入口与介绍","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":1,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP14","name":"酒店设施","moduleId":"trips","moduleName":"行程","sectionName":"行程详情","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F070","name":"优惠券推荐","description":"行程相关的餐饮、SPA、升级等优惠券推荐","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP21","name":"酒店信息（现有）","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F071","name":"天气信息","description":"入住目的地的天气情况展示","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F072","name":"到店指南","description":"介绍如何到达，提供哪些服务，酒店特色，周边推荐等信息","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":1,"note":""},"ihg":{"score":3,"note":""},"atour":{"score":3,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F073","name":"增值服务","description":"进行个性化增值服务选购与搭配","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":3,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"行程服务","features":[{"id":"F074","name":"入住码","description":"分享入住码给好友提前办理登记，用入住码核销早餐/乘电梯","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":3,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"TP09","name":"入住中心","moduleId":"trips","moduleName":"行程","sectionName":"行程详情","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F075","name":"在线选房","description":"支持地图选房/偏好选房","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":3,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F076","name":"访客邀请","description":"分享访客码","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F077","name":"在线续住","description":"一键续住","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F078","name":"开发票","description":"提前预约开具发票","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"客房服务","features":[{"id":"F079","name":"客房送物","description":"提交所需物品需求","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F080","name":"智能客房","description":"控制窗帘/灯光等等","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F081","name":"智慧洗衣","description":"提前查看是否有空闲衣物，并获取洗衣状态提醒","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"其他行程服务","features":[{"id":"F082","name":"住宿问题反馈","description":"住宿期间问题、补登申请、投诉反馈入口","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":"酒店详情页有用户评价 入住结束后可能有评论和投诉入口"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]},{"name":"会员体系","sections":[{"name":"会员信息展示","features":[{"id":"F083","name":"会员等级展示","description":"当前会员等级、升级进度、等级权益展示","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC01","name":"会员等级展示","moduleId":"account","moduleName":"账户","sectionName":"账户状态","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F084","name":"会员电子卡","description":"会员电子会员卡、支持添加到手机数字钱包","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP38","name":"会员流程","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"会员等级与权益","features":[{"id":"F085","name":"等级升级保级规则","description":"会员等级升级保级积分规则说明","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC01","name":"会员等级展示","moduleId":"account","moduleName":"账户","sectionName":"账户状态","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F086","name":"专属会员权益","description":"会员专属房价、延迟退房、免费早餐、行政酒廊等权益","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC01","name":"会员等级展示","moduleId":"account","moduleName":"账户","sectionName":"账户状态","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F087","name":"会员专属活动","description":"会员专属促销、套餐、抽奖、体验活动","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP38","name":"会员流程","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"快捷入口","features":[{"id":"F088","name":"酒店订单快速跳转","description":"一键跳转至行程/订单管理页","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":"行程页包括服务快捷键"},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC06","name":"酒店订单","moduleId":"account","moduleName":"账户","sectionName":"会员快捷入口","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F089","name":"商城订单快速跳转","description":"一键跳转至商城/我的订单页","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC07","name":"商城订单","moduleId":"account","moduleName":"账户","sectionName":"会员快捷入口","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F090","name":"心愿单/收藏","description":"酒店、套餐、商品的收藏与心愿单管理","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC08","name":"愿望清单","moduleId":"account","moduleName":"账户","sectionName":"会员快捷入口","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F091","name":"浏览历史","description":"用户浏览过的酒店、商品、内容的历史记录","ratings":{"marriott":{"score":1,"note":"首页有"},"huazhu":{"score":3,"note":"看过/收藏/住过都有"},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC09","name":"浏览历史","moduleId":"account","moduleName":"账户","sectionName":"会员快捷入口","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"会员中心","features":[{"id":"F092","name":"签到","description":"连续签到林任务/积分/奖励","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":2,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F093","name":"任务中心","description":"做任务赚福利","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":2,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F094","name":"领券活动","description":"根据会员等级抢不同品牌/合作伙伴的不同种类券","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F095","name":"积分兑换","description":"积分抵扣现金/兑换房晚/兑换商品","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC12","name":"兑换积分","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":0.67,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F096","name":"积分公益","description":"和社会组织联动用积分兑换相关商品献爱心","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F097","name":"积分竞拍","description":"积分竞拍好物品","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F098","name":"会员等级赠送","description":"可以赠送好友某会员等级体验卡","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":2,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP38","name":"会员流程","moduleId":"homepage","moduleName":"首页","sectionName":"预订流程","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"积分管理","features":[{"id":"F099","name":"积分余额展示","description":"当前可用积分、即将过期积分展示","ratings":{"marriott":{"score":1,"note":"跳转到website"},"huazhu":{"score":1,"note":"位置不明显"},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC02","name":"保级进度条","moduleId":"account","moduleName":"账户","sectionName":"账户状态","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F100","name":"积分明细","description":"积分获取、消耗、过期的明细记录","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":1,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC02","name":"保级进度条","moduleId":"account","moduleName":"账户","sectionName":"账户状态","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F101","name":"积分兑换入口","description":"积分兑换商品、房券、权益的入口","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC12","name":"兑换积分","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":0.67,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F102","name":"积分购买/赠送","description":"积分充值购买、转赠给他人的功能","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC13","name":"购买积分","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":0.5,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"勋章与足迹","features":[{"id":"F103","name":"成就勋章","description":"展示成就勋章","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F104","name":"足迹","description":"历史入住酒店、旅行城市的足迹统计与展示","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":3,"note":""},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]},{"name":"商城与购物","sections":[{"name":"商城首页","features":[{"id":"F105","name":"商城搜索栏","description":"支持关键词、酒店、目的地的商品搜索","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"SP01","name":"商城搜索栏","moduleId":"shop","moduleName":"商城","sectionName":"商城首页","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F106","name":"新人领券","description":"新人领取优惠","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F107","name":"营销推荐位","description":"商城活动、直播、爆款商品推荐位","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F108","name":"直播带货入口","description":"酒店套餐、商品的直播带货专区","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"SP03","name":"直播","moduleId":"shop","moduleName":"商城","sectionName":"商城首页","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"商品分类","features":[{"id":"F109","name":"优惠券商店","description":"酒店房券、餐饮券、SPA券等各类优惠券购买","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F110","name":"精品周边商店","description":"品牌周边、实物商品、礼品卡购买","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F111","name":"会员积分商店","description":"积分兑换商品、房券、权益、积分购买/赠送","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":3,"note":"积分专区分类用处多"},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"商品详情","features":[{"id":"F112","name":"商品信息展示","description":"商品详情、使用规则、有效期、价格展示","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"SP02","name":"商品推荐位","moduleId":"shop","moduleName":"商城","sectionName":"商城首页","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F113","name":"购买流程","description":"商品选择、规格选择、下单、支付流程","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"SP23","name":"购买积分","moduleId":"shop","moduleName":"商城","sectionName":"店铺入口","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F114","name":"会员折扣","description":"特定会员等级享有优惠价格","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F115","name":"券码核销","description":"优惠券的核销、使用、退款流程","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F116","name":"商品赠送好友","description":"购买后转赠好友发送祝福","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":0,"note":""},"shangriLa":{"score":2,"note":""},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"订单管理","features":[{"id":"F117","name":"优惠券订单管理","description":"优惠券订单的查看、核销、退款、售后","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"SP07","name":"券订单","moduleId":"shop","moduleName":"商城","sectionName":"我的订单","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F118","name":"精品订单管理","description":"实物商品订单的查看、物流、售后","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"SP10","name":"精品订单","moduleId":"shop","moduleName":"商城","sectionName":"我的订单","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F119","name":"积分订单管理","description":"积分兑换订单的查看、核销、售后","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"购物车","features":[{"id":"F120","name":"购物车","description":"购物车管理、批量下单","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"SP04","name":"购物车","moduleId":"shop","moduleName":"商城","sectionName":"购物车","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]}]},{"name":"账户与个人中心","sections":[{"name":"个人资料管理","features":[{"id":"F121","name":"个人信息编辑","description":"姓名、手机号、邮箱、身份证等个人信息管理","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC10","name":"积分余额详情","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F122","name":"偏好设置","description":"酒店偏好、床型偏好、吸烟偏好、通知偏好设置","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":3,"note":"旅行偏好可设置客房/宠物/品味/兴趣/心仪品牌"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":3,"note":"分步多次收集，颗粒度很细，如旅行灵感，水的偏好"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC11","name":"赚取积分","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F123","name":"账单信息管理","description":"历史消费账单、发票管理、下载","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F124","name":"地址管理","description":"收货地址、酒店入住地址的新增、编辑、删除","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":1,"note":"只有商城内收货地址"},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC27","name":"地址管理","moduleId":"account","moduleName":"账户","sectionName":"个人资料","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F125","name":"系统设置","description":"账号安全、密码修改、隐私设置、通用设置","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":1,"note":""},"ihg":{"score":1,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC12","name":"兑换积分","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"账户动态","features":[{"id":"F126","name":"账户操作记录","description":"登录、订单、支付、积分变动等账户动态记录","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"联名卡管理","features":[{"id":"F127","name":"联名卡申请","description":"联名信用卡申请入口、权益介绍","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC13","name":"购买积分","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F128","name":"联名卡权益","description":"联名卡专属权益、活动、积分规则","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC04","name":"联名卡","moduleId":"account","moduleName":"账户","sectionName":"账户状态","confidence":0.82,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]}]},{"name":"客服与帮助","sections":[{"name":"客服中心","features":[{"id":"F129","name":"在线客服","description":"APP内在线聊天客服、人工客服入口","ratings":{"marriott":{"score":0,"note":"未预定状态下没有看到"},"huazhu":{"score":2,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":2,"note":""},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC14","name":"积分商城","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F130","name":"客服热线","description":"官方客服电话、服务时间展示","ratings":{"marriott":{"score":1,"note":""},"huazhu":{"score":2,"note":"无服务时间"},"ihg":{"score":2,"note":"无服务时间"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC14","name":"积分商城","moduleId":"account","moduleName":"账户","sectionName":"积分专区","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"帮助中心","features":[{"id":"F131","name":"常见问题FAQ","description":"预订、入住、会员、积分等常见问题解答","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":2,"note":"在在线智能客服入口"},"ihg":{"score":1,"note":"只有积分相关少数常见问题"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC15","name":"免费房晚(FNA)","moduleId":"account","moduleName":"账户","sectionName":"奖励","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]},{"id":"F132","name":"操作指南","description":"APP核心功能的操作教程、图文指引","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":""},"ihg":{"score":0,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F133","name":"政策规则","description":"预订政策、取消规则、会员规则、隐私政策等","ratings":{"marriott":{"score":2,"note":""},"huazhu":{"score":2,"note":""},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"AC15","name":"免费房晚(FNA)","moduleId":"account","moduleName":"账户","sectionName":"奖励","confidence":1,"method":"manual","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"反馈与投诉","features":[{"id":"F134","name":"问题反馈","description":"APP使用、酒店服务、订单问题的反馈入口","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":2,"note":""},"ihg":{"score":1,"note":"目前只发现APP问题反馈"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F135","name":"投诉处理","description":"投诉提交、进度查询、结果反馈","ratings":{"marriott":{"score":0,"note":"尚未发现，可能有"},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]},{"name":"特色与增值服务","sections":[{"name":"礼宾服务","features":[{"id":"F136","name":"专属礼宾服务","description":"高端会员专属礼宾服务、行程定制、需求对接","ratings":{"marriott":{"score":null,"note":"这部分流程暂时走不通"},"huazhu":{"score":null,"note":"这部分流程暂时走不通"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"商务服务","features":[{"id":"F137","name":"会议与活动","description":"酒店会议室、活动场地预订、商务服务","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":null,"note":"待验证"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F138","name":"办公服务","description":"酒店办公空间、打印、网络等商务服务","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":null,"note":"待验证"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]},{"name":"休闲服务","features":[{"id":"F139","name":"SPA与健身","description":"酒店SPA、健身中心、瑜伽等服务预订","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F140","name":"亲子服务","description":"亲子房、儿童乐园、亲子活动等服务","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F141","name":"餐饮服务","description":"酒店餐厅预订、下午茶、自助餐、特色餐饮套餐","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":"尚未发现，可能有"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[{"id":"HP23","name":"餐饮","moduleId":"homepage","moduleName":"首页","sectionName":"酒店详情","confidence":1,"method":"fuzzy","url":"https://jojo-lij.github.io/mb-features/"}]}]},{"name":"出行服务","features":[{"id":"F142","name":"接送机服务","description":"酒店接送机、接送站服务预订","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":"需电话联系"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F143","name":"租车服务","description":"目的地租车、包车服务预订","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":0,"note":"需电话联系"},"ihg":{"score":0,"note":"尚未发现，可能有"},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]},{"id":"F144","name":"旅游攻略","description":"目的地旅游攻略、景点推荐、行程规划","ratings":{"marriott":{"score":0,"note":""},"huazhu":{"score":3,"note":"地图上展示 app内可直接展示路线"},"ihg":{"score":2,"note":""},"atour":{"score":null,"note":"待验证"},"mandarinOriental":{"score":null,"note":"待验证"},"shangriLa":{"score":null,"note":"待验证"},"hilton":{"score":null,"note":"待验证"}},"matches":[]}]}]}]};
    const bmBrands = [
      { key: "marriott", label: "万豪旅享家", enabled: true },
      { key: "huazhu", label: "华住会", enabled: true },
      { key: "ihg", label: "洲际优悦会", enabled: true },
      { key: "atour", label: "亚朵", enabled: false },
      { key: "mandarinOriental", label: "文华东方", enabled: false },
      { key: "shangriLa", label: "香格里拉", enabled: false },
      { key: "hilton", label: "希尔顿荣誉会", enabled: false }
    ];
    const bmModuleColors = ["#273B70","#273B70","#273B70","#273B70","#273B70","#273B70","#273B70","#273B70","#273B70","#273B70","#273B70"];
    const bmModuleReviews = {
      "启动与引导": "开屏表现较强，但新客福利与功能引导弱于华住，转化承接不足。",
      "营销": "具备基础推荐位，但目的地运营、弹窗触达和个性化明显落后华住。",
      "内容": "内容以品牌与酒店信息为主，目的地攻略和社区化内容深度不足。",
      "搜索": "地图与结果展示有优势，但精准搜索、联想和关键词运营仍弱于华住。",
      "酒店预订全流程": "预订主链路已覆盖，但支付安全、订单通知、修改与取消能力明显弱于华住。",
      "行程与在住服务": "仅覆盖基础行程和部分移动能力，选房、入住码、续住及客房服务明显缺失。",
      "会员体系": "等级权益基础清晰，但任务、领券、积分玩法和会员运营显著弱于华住。",
      "商城与购物": "当前框架下基本缺位，是万豪相对华住最明显的功能空白。",
      "账户与个人中心": "个人资料与联名卡能力相对领先，但账单、地址和账户动态仍有缺口。",
      "客服与帮助": "热线与政策可见，但在线客服、FAQ、反馈闭环明显弱于华住。",
      "特色与增值服务": "除礼宾待确认外基本未覆盖，餐饮、接送、亲子和商务服务均缺少线上入口。"
    };
    const bmState = { brand: "marriott", query: "", gapOnly: false };
    const bmScoreLabels = ["无功能", "有功能", "有特色", "行业顶尖"];
    const bmEsc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    const bmScoreClass = s => s === null ? "bm-score-unknown" : "bm-score-" + s;
    const bmScoreLabel = s => s === null ? "待确认" : bmScoreLabels[s];

    function bmAllFeatures() {
      return benchmarkData.modules.flatMap(m => m.sections.flatMap(s => s.features));
    }

    function bmCurrentBrand() {
      return bmBrands.find(b => b.key === bmState.brand);
    }

    function bmCoverage() {
      const r = { covered: 0, missing: 0, pending: 0 };
      bmAllFeatures().forEach(f => {
        const s = f.ratings[bmState.brand].score;
        if (s === null) r.pending++;
        else if (s === 0) r.missing++;
        else r.covered++;
      });
      return r;
    }

    function renderBenchmark() {
      const stats = bmCoverage();
      const brandLabel = bmCurrentBrand().label;

      const brandTabsHtml = bmBrands.map(b =>
        `<button type="button" class="bm-brand-tab ${bmState.brand === b.key ? 'active' : ''}" data-bm-brand="${b.key}" ${b.enabled ? '' : 'disabled'}>${b.label}${b.enabled ? '' : '<span class="bm-brand-status">未上线</span>'}</button>`
      ).join('');

      const coverageHtml = `
        <div class="bm-coverage-stat primary"><strong>${stats.covered}</strong><span>${brandLabel} · 已覆盖</span></div>
        <div class="bm-coverage-stat missing"><strong>${stats.missing}</strong><span>无功能</span></div>
        <div class="bm-coverage-stat pending"><strong>${stats.pending}</strong><span>待确认</span></div>
      `;

      const renderModule = (mod, mi) => {
        const sections = mod.sections.map(s => ({
          ...s,
          features: s.features.filter(f => {
            const rating = f.ratings[bmState.brand];
            if (bmState.gapOnly && rating.score !== 0) return false;
            if (!bmState.query) return true;
            const text = [f.name, f.description, ...f.matches.map(m => m.id + m.name)].join(' ').toLowerCase();
            return text.includes(bmState.query.toLowerCase());
          })
        })).filter(s => s.features.length);
        if (!sections.length) return '';
        const vc = sections.reduce((s, sec) => s + sec.features.length, 0);
        const dc = vc >= 22 ? 'bm-extra-dense' : vc >= 10 ? 'bm-dense' : '';
        const sectionColumns = [[], []];
        const sectionWeights = [0, 0];
        sections.forEach(sec => {
          const target = sectionWeights[0] <= sectionWeights[1] ? 0 : 1;
          sectionColumns[target].push(sec);
          sectionWeights[target] += sec.features.length + 1;
        });
        const renderSection = sec => `<div class="bm-section-group">
          <h4 title="${bmEsc(sec.name)}">${bmEsc(sec.name)}</h4>
          <div class="bm-feature-grid">
            ${sec.features.map(f => {
              const r = f.ratings[bmState.brand];
              const m0 = f.matches[0];
              const code = m0?.method === 'manual' ? m0.id : '';
              return `<button type="button" class="bm-feature-tile ${bmScoreClass(r.score)}" data-bm-feature="${f.id}" title="${bmEsc(f.name)} · ${bmScoreLabel(r.score)}">
                <span class="bm-feature-name">${bmEsc(f.name)}</span>
                ${code ? `<span class="bm-match-code">${code}</span>` : ''}
              </button>`;
            }).join('')}
          </div>
        </div>`;
        return `<section class="bm-module-card ${dc}">
          <div class="bm-module-heading">
            <span class="bm-module-number">${String(mi + 1).padStart(2, '0')}</span>
            <h3>${bmEsc(mod.name)}</h3>
            <small>${vc}项</small>
          </div>
          <div class="bm-section-grid">
            ${sectionColumns.map(col => `<div class="bm-section-column">${col.map(renderSection).join('')}</div>`).join('')}
          </div>
          <div class="bm-module-review"><strong>差距结论</strong><span>${bmEsc(bmModuleReviews[mod.name])}</span></div>
        </section>`;
      };

      const visibleModules = benchmarkData.modules.map((mod, i) => ({
        html: renderModule(mod, i),
        weight: mod.sections.reduce((sum, sec) => sum + sec.features.length + 2, 0)
      })).filter(item => item.html);
      const moduleColumns = [[], [], []];
      const moduleColumnWeights = [0, 0, 0];
      visibleModules.forEach(item => {
        const target = moduleColumnWeights.indexOf(Math.min(...moduleColumnWeights));
        moduleColumns[target].push(item.html);
        moduleColumnWeights[target] += item.weight;
      });
      const matrixHtml = moduleColumns.map(col =>
        `<div class="bm-matrix-column">${col.join('')}</div>`
      ).join('');

      return `<div class="bm-view">
        <header class="bm-topbar">
          <div class="bm-title-row">
            <div class="bm-title-block">
              <h2>酒店行业 APP 功能全景矩阵</h2>
              <p>统一 144 个功能框架，切换品牌即可查看完整覆盖全貌</p>
            </div>
            <div class="bm-total-badge"><strong>144</strong><span>个三级功能</span></div>
          </div>
          <div class="bm-coverage-stats">${coverageHtml}</div>
        </header>
        <div class="bm-controlbar">
          <div class="bm-brand-tabs" id="bmBrandTabs">${brandTabsHtml}</div>
          <div class="bm-controlbar-right">
            <label class="bm-search-box">
              <span>搜索</span>
              <input id="bmSearchInput" placeholder="功能名称 / 功能说明 / 万豪编号">
              <button id="bmClearSearch" type="button" hidden>×</button>
            </label>
            <button type="button" class="bm-gap-toggle ${bmState.gapOnly ? 'active' : ''}" id="bmGapToggle">只看差距 ${stats.missing}</button>
            <div class="bm-legend">
              <span class="bm-legend-item"><i class="bm-legend-swatch bm-score-0" style="background:var(--bm-score-0)"></i>无功能</span>
              <span class="bm-legend-item"><i class="bm-legend-swatch bm-score-1" style="background:var(--bm-score-1)"></i>有功能</span>
              <span class="bm-legend-item"><i class="bm-legend-swatch bm-score-2" style="background:var(--bm-score-2)"></i>有特色</span>
              <span class="bm-legend-item"><i class="bm-legend-swatch bm-score-3" style="background:var(--bm-score-3)"></i>行业顶尖</span>
              <span class="bm-legend-item"><i class="bm-legend-swatch bm-score-unknown"></i>待确认</span>
            </div>
          </div>
        </div>
        <main class="bm-matrix-layout">${matrixHtml}</main>
      </div>`;
    }

    function bindBenchmarkHandlers() {
      document.querySelectorAll('[data-bm-brand]:not(:disabled)').forEach(btn => {
        btn.onclick = () => {
          bmState.brand = btn.dataset.bmBrand;
          renderContent();
        };
      });

      document.querySelectorAll('[data-bm-feature]').forEach(btn => {
        btn.onclick = () => bmOpenDrawer(btn.dataset.bmFeature);
      });

      const searchInput = document.getElementById('bmSearchInput');
      const clearBtn = document.getElementById('bmClearSearch');
      if (searchInput) {
        searchInput.oninput = () => {
          bmState.query = searchInput.value.trim();
          if (clearBtn) clearBtn.hidden = !bmState.query;
          renderContent();
          const si = document.getElementById('bmSearchInput');
          if (si) { si.focus(); si.value = bmState.query; }
        };
      }
      if (clearBtn) {
        clearBtn.onclick = () => {
          bmState.query = '';
          renderContent();
        };
      }
      const gapToggle = document.getElementById('bmGapToggle');
      if (gapToggle) {
        gapToggle.onclick = () => {
          bmState.gapOnly = !bmState.gapOnly;
          renderContent();
        };
      }
    }

    function bmOpenDrawer(id) {
      const feature = bmAllFeatures().find(f => f.id === id);
      if (!feature) return;
      const rating = feature.ratings[bmState.brand];
      const match = feature.matches[0];
      const brandLabel = bmCurrentBrand().label;

      // Build evidence panels for all brands that have ratings for this feature
      const evidenceHtml = bmBrands.filter(b => b.enabled).map(b => {
        const r = feature.ratings[b.key];
        if (!r) return '';
        const scoreLabel = bmScoreLabel(r.score);
        const scoreClass = bmScoreClass(r.score);
        const note = r.note || '暂无备注';
        // Evidence level based on score
        const level = r.score === 3 ? '官方直接证据' : r.score === 2 ? '官方 App 描述' : r.score === 1 ? '功能存在' : r.score === 0 ? '待补证' : '待验证';
        const levelClass = r.score === 3 ? 'evidence-direct' : r.score === 2 ? 'evidence-app' : r.score === 1 ? 'evidence-exists' : 'evidence-pending';
        // Leading judgment text
        const leadingText = r.score >= 2 ? '品牌被列为该能力域参考对象，但此项领先性仍需通过功能实测、覆盖率和体验评分确认。' :
                           r.score === 1 ? '功能存在但覆盖范围、体验细节或与其他环节的衔接仍需核验。' :
                           '当前已收集来源尚未直接证明该 App 在此原子功能上的领先表现。';
        // Screenshot placeholder
        const screenshotHtml = r.screenshot ?
          `<div class="bm-evidence-screenshot"><img src="${bmEsc(r.screenshot)}" alt="${bmEsc(b.label)} 证据截图" loading="lazy"></div>` :
          `<div class="bm-evidence-screenshot bm-evidence-screenshot--empty"><span>待补充 App 实测截图</span></div>`;
        return `<article class="bm-evidence-item" data-score="${r.score ?? -1}">
          <header><strong>${bmEsc(b.label)}</strong><span class="bm-evidence-level ${levelClass}">${level}</span></header>
          ${screenshotHtml}
          <div class="bm-evidence-rating"><span class="bm-rating-label ${scoreClass}">${scoreLabel}</span></div>
          <p><b>能力证据：</b>${bmEsc(note)}</p>
          <p class="bm-evidence-leading"><b>领先判断：</b>${bmEsc(leadingText)}</p>
        </article>`;
      }).filter(Boolean).join('');

      // Gap analysis based on current brand rating vs best competitor
      const allRatings = Object.entries(feature.ratings).filter(([k, v]) => v && v.score !== null && bmBrands.find(b => b.key === k && b.enabled));
      const bestScore = allRatings.length ? Math.max(...allRatings.map(([_, v]) => v.score)) : 0;
      const currentScore = rating.score ?? 0;
      const gapLevel = currentScore >= bestScore ? '轻微' : currentScore >= bestScore - 1 ? '中等' : '显著';
      const gapPriority = currentScore === 0 ? 'P0' : currentScore === 1 ? 'P1' : 'P2';
      const gapShortcoming = currentScore === 0 ? `项目资料暂未发现"${feature.name}"，与代表性标杆存在明确能力缺口。` : currentScore === 1 ? `"${feature.name}"功能存在但覆盖范围、体验细节或与其他环节的衔接仍需核验。` : `"${feature.name}"已具备基础能力，但领先性仍有提升空间。`;
      const gapImpact = `影响${feature.name.includes('预订') || feature.name.includes('支付') ? '转化效率' : feature.name.includes('会员') || feature.name.includes('积分') ? '会员价值认知' : '用户体验完整性'}，${currentScore < bestScore ? '与行业标杆存在明显差距。' : '需持续保持竞争力。'}`;
      const gapAction = currentScore === 0 ? `建议优先补齐"${feature.name}"，参考${allRatings.filter(([_, v]) => v.score >= 2).map(([k, _]) => bmBrands.find(b => b.key === k)?.label || k).join('、') || '行业标杆'}的领先实践。` : `建议优化"${feature.name}"体验深度，向行业顶尖水平看齐。`;

      let matchHtml;
      if (match) {
        const deepLink = `#module=${match.moduleId}&feature=${match.id}`;
        matchHtml = `<div class="bm-match-panel">
          <div class="bm-match-topline">
            <span>${match.id}</span>
            <small>${match.method === 'manual' ? '已确认匹配' : '候选匹配，待确认'}</small>
          </div>
          <strong>${bmEsc(match.moduleName)} / ${bmEsc(match.sectionName)} / ${bmEsc(match.name)}</strong>
          <a class="bm-match-link" href="${deepLink}" target="_blank">查看万豪功能详情 →</a>
        </div>`;
      } else {
        matchHtml = `<div class="bm-unmatched-panel">
          <strong>暂无对应编号</strong>
          <p>线上功能库中未找到可靠的对应功能。</p>
        </div>`;
      }

      document.getElementById('bmDrawerRoot').innerHTML = `
        <div class="bm-drawer-layer">
          <aside class="bm-detail-drawer" role="dialog" aria-modal="true">
            <button class="bm-drawer-close" type="button">×</button>
            <div class="bm-drawer-kicker">${brandLabel} · ${feature.id}</div>
            <h2>${bmEsc(feature.name)}</h2>
            <p class="bm-drawer-description">${bmEsc(feature.description)}</p>

            <!-- Tags row -->
            <div class="bm-drawer-tags">
              <span class="bm-tag">${bmEsc(feature.id)}</span>
              <span class="bm-tag">${bmEsc(rating.score === null ? '待确认' : bmScoreLabel(rating.score))}</span>
              <span class="bm-tag">差距：${gapLevel}</span>
              <span class="bm-tag">${gapPriority}</span>
            </div>

            <!-- Function description & leaders -->
            <div class="bm-drawer-section">
              <div class="bm-info-grid">
                <div><b>功能说明</b><p>${bmEsc(feature.description)}</p></div>
                <div><b>领先 App</b><p>${bmEsc(bmBrands.filter(b => b.enabled && feature.ratings[b.key]?.score >= 2).map(b => b.label).join('、') || '待确认')}</p></div>
              </div>
            </div>

            <!-- Benchmark practice assessment -->
            <div class="bm-drawer-section">
              <h3>标杆实践判断</h3>
              <div class="bm-practice-panel">
                <p>${bmEsc(allRatings.filter(([_, v]) => v.score >= 2).map(([k, _]) => bmBrands.find(b => b.key === k)?.label || k).join('、') || '行业标杆')}等代表性 App 已围绕"${bmEsc(feature.name)}"形成公开实践或行业探索；实际覆盖品牌、门店和区域存在差异。</p>
              </div>
            </div>

            <!-- Marriott verification hint -->
            <div class="bm-drawer-section">
              <h3>万豪核验提示</h3>
              <div class="bm-verify-panel">
                <p>${rating.score === null ? '公开信息或项目资料不足，建议进行 App 与门店实测。' : rating.score === 0 ? '项目资料暂未发现，需与产品团队确认是否存在其他入口。' : '项目资料显示已具备，仍建议抽样核验端到端体验。'}</p>
              </div>
            </div>

            <!-- Gap analysis -->
            <div class="bm-drawer-section">
              <h3>万豪不足与补齐方向</h3>
              <div class="bm-gap-panel">
                <div class="bm-gap-head">
                  <b>差距分析</b>
                  <span class="bm-gap-level">${gapLevel}差距 · ${gapPriority}</span>
                </div>
                <div class="bm-gap-columns">
                  <section><strong>当前不足</strong><p>${bmEsc(gapShortcoming)}</p></section>
                  <section><strong>潜在影响</strong><p>${bmEsc(gapImpact)}</p></section>
                  <section><strong>建议补齐</strong><p>${bmEsc(gapAction)}</p></section>
                </div>
              </div>
            </div>

            <!-- Evidence section -->
            <div class="bm-drawer-section">
              <div class="bm-evidence-title">
                <b>领先 App 证据</b>
                <span>核验日期：2026-06-15</span>
              </div>
              <div class="bm-evidence-list">
                ${evidenceHtml}
                <div class="bm-evidence-caution">图片为官方网页或官方 App Store 页面截图，用于证明品牌及相关能力方向；不是 App 实测截图。单项领先性及门店覆盖率仍需通过统一任务脚本横向实测。</div>
              </div>
            </div>

            <!-- Match link -->
            <div class="bm-drawer-section">
              <h3>万豪完整功能对应</h3>
              ${matchHtml}
            </div>
          </aside>
        </div>`;

      const root = document.getElementById('bmDrawerRoot');
      root.querySelector('.bm-drawer-close').onclick = bmCloseDrawer;
      root.querySelector('.bm-drawer-layer').onclick = e => {
        if (e.target.classList.contains('bm-drawer-layer')) bmCloseDrawer();
      };
    }

    function bmCloseDrawer() {
      const root = document.getElementById('bmDrawerRoot');
      if (root) root.innerHTML = '';
    }

    function initApp() {
      const cachedModules = readModulesCache();
      if (cachedModules) modules = ensureBenchmarkModule(cachedModules);

      updateHeaderStats();
      renderNav();
      renderContent();
      renderStatusFilters();
      renderFilters();
      bindGlobalSearch();

      navigateToHash();
      window.addEventListener('hashchange', navigateToHash);

      if (USE_FEISHU) {
        loadOnlineModules();
        setInterval(loadOnlineModules, 60000);
      } else {
        setDataSourceStatus('本地数据', 'fallback');
      }
    }

    async function loadOnlineModules() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const requestUrl = `${FEISHU_API_URL}?_=${Date.now()}`;
        const response = await fetch(requestUrl, {
          signal: controller.signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const payload = await response.json();
        if (payload.success === false) throw new Error(payload.error || '飞书接口返回失败');

        const records = payload.records || payload.data?.items || [];
        const onlineModules = transformFeishuRecords(records);
        if (!isUsableOnlineModules(onlineModules)) {
          throw new Error('飞书表格缺少模块名称、分组名称或完整功能记录');
        }

        const newModules = ensureBenchmarkModule(onlineModules);
        const oldJson = JSON.stringify(modules);
        const newJson = JSON.stringify(newModules);
        if (oldJson === newJson) {
          setDataSourceStatus('飞书在线', 'online');
          return;
        }
        modules = newModules;
        localStorage.setItem('mb-features-online-cache', JSON.stringify(onlineModules));

        if (!modules.some(module => module.id === currentModule)) currentModule = 'overview';
        updateHeaderStats();
        renderNav();
        if (!activeDetailId) {
          renderContent();
        }
        setDataSourceStatus('飞书在线', 'online');
      } catch (error) {
        setDataSourceStatus('本地数据', 'fallback', error.message);
        console.warn('[DATA] 飞书在线数据加载失败，继续使用缓存或内嵌数据：', error.message);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    function setDataSourceStatus(text, state, detail = '') {
      const element = document.getElementById('dataSourceStatus');
      if (!element) return;
      element.textContent = text;
      element.dataset.state = state;
      element.title = detail || (state === 'online'
        ? '数据来自飞书多维表格，每分钟自动同步'
        : '飞书数据暂不可用，当前使用本地数据');
    }

    function readModulesCache() {
      try {
        const cached = JSON.parse(localStorage.getItem('mb-features-online-cache'));
        return isUsableOnlineModules(cached) ? cached : null;
      } catch {
        return null;
      }
    }

    function isUsableOnlineModules(candidate) {
      if (!Array.isArray(candidate) || candidate.length <= 1) return false;
      const featureModules = candidate.filter(module => !module.isOverview);
      const featureCount = featureModules.reduce((sum, module) =>
        sum + module.sections.reduce((sectionSum, section) => sectionSum + section.features.length, 0), 0);
      return featureCount > 0
        && featureModules.every(module => module.name && module.name !== '未分类')
        && featureModules.every(module => module.sections.every(section => section.name && section.name !== '未分类'));
    }

    function transformFeishuRecords(records) {
      const fallbackById = new Map(fallbackModules.map(module => [module.id, module]));
      const fallbackByName = new Map(fallbackModules.map(module => [module.name, module]));
      const moduleMap = new Map();
      const generatedModuleIds = new Map();
      const statusAliases = {
        '已上线': 'live', live: 'live',
        '新增': 'new', new: 'new',
        '迭代中': 'iterate', '计划更新': 'iterate', iterate: 'iterate',
        '设计中': 'design', design: 'design',
        '待确认': 'pending', pending: 'pending'
      };

      records.forEach((record, recordIndex) => {
        const fields = record.fields || record;
        const featureId = getFieldText(fields, ['功能编号', '编号', 'featureId', 'id']);
        const featureName = getFieldText(fields, ['功能名称', 'name']);
        if (!featureId || !featureName) return;

        const moduleName = getFieldText(fields, ['模块名称', '模块', 'moduleName', 'module']) || '未分类';
        const knownModule = fallbackByName.get(moduleName);
        const moduleId = getFieldText(fields, ['模块编码', 'moduleId'])
          || knownModule?.id
          || generatedModuleIds.get(moduleName)
          || `online-${moduleMap.size + 1}`;
        generatedModuleIds.set(moduleName, moduleId);
        const sectionName = getFieldText(fields, ['分组名称', '功能分组', '分组', 'section']) || '未分类';

        if (!moduleMap.has(moduleId)) {
          const fallback = fallbackById.get(moduleId) || knownModule;
          moduleMap.set(moduleId, {
            id: moduleId,
            name: moduleName,
            desc: getFieldText(fields, ['模块说明', 'moduleDesc']) || fallback?.desc || '',
            order: getFieldNumber(fields, ['模块排序', 'moduleOrder'], fallbackModules.indexOf(fallback)),
            sections: new Map()
          });
        }

        const module = moduleMap.get(moduleId);
        if (!module.sections.has(sectionName)) {
          module.sections.set(sectionName, {
            name: sectionName,
            order: getFieldNumber(fields, ['分组排序', 'sectionOrder'], module.sections.size),
            features: []
          });
        }

        const screenshotText = getFieldText(fields, ['截图路径', '截图', 'screenshots']);
        const screenshots = screenshotText
          ? screenshotText.split(/\r?\n|\s*\|\s*/).map(item => item.trim()).filter(Boolean)
          : [];
        const rawStatus = getFieldText(fields, ['状态', 'status']);

        const feature = {
          id: featureId,
          name: featureName,
          status: statusAliases[rawStatus] || 'pending',
          desc: getFieldText(fields, ['简要说明', '说明', 'desc']),
          detail: getFieldText(fields, ['功能说明', '详情', 'detail']),
          updateLog: getFieldText(fields, ['更新记录', '更新日志', 'updateLog']),
          order: getFieldNumber(fields, ['排序', '功能排序', 'order'], recordIndex)
        };

        if (screenshots.length === 1) feature.screenshot = screenshots[0];
        if (screenshots.length > 1) feature.screenshots = screenshots;
        module.sections.get(sectionName).features.push(feature);
      });

      const overview = {
        ...fallbackModules.find(module => module.isOverview),
        id: 'overview',
        name: '总览',
        isOverview: true
      };

      const result = [...moduleMap.values()]
        .sort((a, b) => a.order - b.order)
        .map(module => ({
          id: module.id,
          name: module.name,
          desc: module.desc,
          sections: [...module.sections.values()]
            .sort((a, b) => a.order - b.order)
            .map(section => ({
              name: section.name,
              features: section.features
                .sort((a, b) => a.order - b.order)
                .map(({ order, ...feature }) => feature)
            }))
        }));

      return [overview, ...result];
    }

    function getFieldText(fields, aliases) {
      for (const alias of aliases) {
        const value = fields[alias];
        if (value === undefined || value === null) continue;
        const text = normalizeFeishuValue(value);
        if (text !== '') return text;
      }
      return '';
    }

    function getFieldNumber(fields, aliases, fallback = 0) {
      const value = getFieldText(fields, aliases);
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    }

    function normalizeFeishuValue(value) {
      if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
      if (Array.isArray(value)) return value.map(normalizeFeishuValue).filter(Boolean).join('\n');
      if (typeof value === 'object') {
        return normalizeFeishuValue(value.text ?? value.name ?? value.value ?? value.link ?? '');
      }
      return '';
    }

    function updateHeaderStats() {
      const moduleList = modules.filter(isPrimaryFeatureModule);
      const totalFeatures = moduleList.reduce((sum, m) => sum + getModuleFeatureCount(m), 0);
      const allFeatures = moduleList.flatMap(m => getAllFeatures(m));
      const statusCounts = countByStatus(allFeatures);

      const statTotal = document.getElementById('statTotal');
      const statModules = document.getElementById('statModules');
      const statLive = document.getElementById('statLive');
      const statNew = document.getElementById('statNew');

      if (statTotal) statTotal.textContent = totalFeatures;
      if (statModules) statModules.textContent = moduleList.length;
      if (statLive) statLive.textContent = statusCounts['已上线'] || '—';
      if (statNew) statNew.textContent = (statusCounts['新功能'] + statusCounts['功能迭代']) || '—';
    }

    // ===== GLOBAL SEARCH =====
    function bindGlobalSearch() {
      const input = document.getElementById('globalSearchInput');
      const clearBtn = document.getElementById('globalSearchClear');
      if (!input) return;

      input.addEventListener('input', (e) => {
        globalSearchQuery = e.target.value.trim().toLowerCase();
        clearBtn.style.display = globalSearchQuery ? 'flex' : 'none';

        if (globalSearchQuery) {
          performGlobalSearch();
        } else {
          searchMatches.clear();
          // If we were on a search result module, stay there; otherwise stay
          renderContent();
        }
      });

      clearBtn.addEventListener('click', () => {
        input.value = '';
        globalSearchQuery = '';
        searchMatches.clear();
        clearBtn.style.display = 'none';
        renderContent();
        input.focus();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          clearBtn.click();
        }
      });
    }

    function performGlobalSearch() {
      searchMatches.clear();
      const query = globalSearchQuery;
      if (!query) return;

      modules.forEach(module => {
        if (module.isOverview) return;
        const matchedIds = new Set();
        module.sections.forEach(section => {
          section.features.forEach(f => {
            const text = [
              f.id,
              f.name,
              f.desc,
              f.detail,
              f.note,
              section.name,
              module.name
            ].filter(Boolean).join(' ').toLowerCase();
            if (text.includes(query)) {
              matchedIds.add(f.id);
            }
          });
        });
        if (matchedIds.size > 0) {
          searchMatches.set(module.id, matchedIds);
        }
      });

      // Always show results in overview when searching globally
      if (currentModule !== 'overview' && searchMatches.size > 0) {
        currentModule = 'overview';
        renderNav();
      }

      renderContent();
    }

    function featureMatchesSearch(feature, moduleId) {
      if (!globalSearchQuery) return true;
      const moduleMatches = searchMatches.get(moduleId || currentModule);
      return moduleMatches ? moduleMatches.has(feature.id) : false;
    }

    // ===== HELPERS =====
    const statusMap = {
      '已上线':   { label: '已上线', class: 'status-live', badge: 'badge-live' },
      '新功能':   { label: '新功能', class: 'status-new', badge: 'badge-new' },
      '功能迭代': { label: '功能迭代', class: 'status-iterate', badge: 'badge-iterate' },
      '待确认':   { label: '待确认', class: 'status-pending', badge: 'badge-pending' }
    };

    function countByStatus(features) {
      const counts = { '已上线': 0, '新功能': 0, '功能迭代': 0, '待确认': 0 };
      features.forEach(f => { if (counts[f.status] !== undefined) counts[f.status]++; });
      return counts;
    }

    function isPrimaryFeatureModule(module) {
      return !module.isOverview && !module.isBenchmark && module.id !== 'mot';
    }

    function getAllFeatures(module) {
      if (!module.sections) return [];
      return module.sections.flatMap(s => s.features);
    }

    function getModuleFeatureCount(module) {
      if (!module.sections) return 0;
      return module.sections.reduce((sum, s) => sum + (s.features ? s.features.length : 0), 0);
    }

    function filterFeatures(features, filter) {
      if (filter === 'all') return features;
      return features.filter(f => f.status === filter);
    }

    function filterMotPriority(features) {
      if (motPriorityFilter === 'all') return features;
      return features.filter(f => (f.priority || 'P2') === motPriorityFilter);
    }

    // ===== RENDER =====
    function renderNav() {
      const navList = document.getElementById('navList');
      navList.innerHTML = modules.map(m => {
        const isActive = m.id === currentModule;
        return `
          <li class="nav-item">
            <a class="nav-link ${isActive ? 'active' : ''}" data-module="${m.id}">
              <span style="display:flex;align-items:center;">
                <span class="nav-icon">${iconMap[m.id] || iconMap.overview}</span>
                ${m.name}
              </span>
              ${(!m.isOverview && !m.isBenchmark) ? `<span class="nav-count">${getModuleFeatureCount(m)}</span>` : ''}
            </a>
          </li>
        `;
      }).join('');

      navList.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          currentModule = link.dataset.module;
          renderNav();
          renderContent();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }

    function renderOverview() {
      const moduleList = modules.filter(isPrimaryFeatureModule);
      const totalFeatures = moduleList.reduce((sum, m) => sum + getModuleFeatureCount(m), 0);
      const allFeatures = moduleList.flatMap(m => getAllFeatures(m));
      const statusCounts = countByStatus(allFeatures);

      if (overviewFilter) {
        return renderOverviewFeatureList(overviewFilter, totalFeatures, statusCounts);
      }

      const moduleCards = moduleList.map(m => {
        const features = getAllFeatures(m);
        const counts = countByStatus(features);
        return `
          <div class="overview-card" style="cursor:pointer;" data-module="${m.id}">
            <div class="overview-number">${getModuleFeatureCount(m)}</div>
            <div class="overview-label">${m.name}</div>
            <div style="margin-top:8px;display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">
              ${counts['已上线'] > 0 ? `<span class="badge badge-live" style="font-size:10px;padding:2px 6px;">${counts['已上线']} 已上线</span>` : ''}
              ${counts['新功能'] > 0 ? `<span class="badge badge-new" style="font-size:10px;padding:2px 6px;">${counts['新功能']} 新功能</span>` : ''}
              ${counts['功能迭代'] > 0 ? `<span class="badge badge-iterate" style="font-size:10px;padding:2px 6px;">${counts['功能迭代']} 功能迭代</span>` : ''}
              ${counts['待确认'] > 0 ? `<span class="badge badge-pending" style="font-size:10px;padding:2px 6px;">${counts['待确认']} 待确认</span>` : ''}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="module-header">
          <div class="module-title-row">
            <div class="module-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <h1 class="module-title">功能总览</h1>
          </div>
          <p class="module-desc">万豪旅享家 China App 功能说明，基于信息架构图组织</p>
        </div>

        <div class="overview-grid">
          <div class="overview-card overview-stat-card highlight" data-filter="all">
            <div class="overview-number">${totalFeatures}</div>
            <div class="overview-label">功能总数</div>
          </div>
          <div class="overview-card overview-stat-card" data-filter="已上线">
            <div class="overview-number">${statusCounts['已上线']}</div>
            <div class="overview-label">已上线</div>
          </div>
          <div class="overview-card overview-stat-card" data-filter="新功能">
            <div class="overview-number">${statusCounts['新功能']}</div>
            <div class="overview-label">新功能</div>
          </div>
          <div class="overview-card overview-stat-card" data-filter="功能迭代">
            <div class="overview-number">${statusCounts['功能迭代']}</div>
            <div class="overview-label">功能迭代</div>
          </div>
          <div class="overview-card overview-stat-card" data-filter="待确认">
            <div class="overview-number">${statusCounts['待确认']}</div>
            <div class="overview-label">待确认</div>
          </div>
          <div class="overview-card overview-stat-card" data-scroll="modules">
            <div class="overview-number">${moduleList.length}</div>
            <div class="overview-label">功能模块</div>
          </div>
          <div class="overview-card">
            <div class="overview-number">5</div>
            <div class="overview-label">底部 Tab</div>
          </div>
        </div>

        <div class="status-legend">
          <div class="legend-item"><span class="filter-dot dot-live"></span> 已上线</div>
          <div class="legend-item"><span class="filter-dot dot-new"></span> 新功能</div>
          <div class="legend-item"><span class="filter-dot dot-iterate"></span> 功能迭代</div>
          <div class="legend-item"><span class="filter-dot dot-pending"></span> 待确认</div>
        </div>

        <h2 id="overviewModuleDistribution" style="font-size:18px;font-weight:700;margin-bottom:16px;color:var(--bonvoy-black);">按模块分布</h2>
        <div class="overview-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
          ${moduleCards}
        </div>
      `;
    }

    function renderOverviewFeatureList(filter, totalFeatures, statusCounts) {
      const moduleList = modules.filter(isPrimaryFeatureModule);
      const filterLabelMap = {
        all: { label: '全部功能', count: totalFeatures },
        '已上线': { label: '已上线功能', count: statusCounts['已上线'] },
        '新功能': { label: '新功能', count: statusCounts['新功能'] },
        '功能迭代': { label: '功能迭代', count: statusCounts['功能迭代'] },
        '待确认': { label: '待确认功能', count: statusCounts['待确认'] }
      };
      const filterInfo = filterLabelMap[filter] || { label: '功能列表', count: 0 };

      const matchedModules = [];
      moduleList.forEach(module => {
        const matchedFeatures = [];
        module.sections.forEach(section => {
          section.features.forEach(f => {
            if (filter === 'all' || f.status === filter) {
              matchedFeatures.push({ ...f, sectionName: section.name });
            }
          });
        });
        if (matchedFeatures.length > 0) {
          matchedModules.push({ module, features: matchedFeatures });
        }
      });

      const totalMatched = matchedModules.reduce((sum, m) => sum + m.features.length, 0);

      if (totalMatched === 0) {
        return `
          <div class="overview-filter-header">
            <button class="overview-back-btn" id="overviewBackBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              返回总览
            </button>
            <h1>${filterInfo.label}</h1>
            <p>共 ${filterInfo.count} 项功能</p>
          </div>
          <div class="search-empty-state">没有符合条件的功能</div>
        `;
      }

      const modulesHtml = matchedModules.map(({ module, features }) => {
        const rowsHtml = features.map(f => {
          const s = statusMap[f.status];
          const detailId = `overview-detail-${f.id}`;
          const detailPanel = renderFeatureDetail(f, detailId);
          return `
            <tr class="search-result-row feature-row" data-detail="${detailId}" data-module="${module.id}" data-section="${f.sectionName}" data-feature="${f.id}" onclick="toggleFeatureDetail('${detailId}', this)">
              <td><span class="feature-id">${f.id}</span></td>
              <td><span class="feature-name">${f.name}</span></td>
              <td><span class="feature-status ${s.class}"><span class="status-dot" style="background:currentColor;"></span>${s.label}</span></td>
              <td class="feature-note">${f.desc || f.note || ''}</td>
              <td class="feature-module">${module.name}</td>
              <td class="feature-section">${f.sectionName}</td>
            </tr>
            ${detailPanel}
          `;
        }).join('');

        return `
          <div class="search-results-module">
            <div class="search-results-module-header">
              <div class="search-results-module-title">
                <span class="module-icon" style="width:20px;height:20px;">${iconMap[module.id] || iconMap.overview}</span>
                <span>${module.name}</span>
                <span class="search-results-count">${features.length} 项</span>
              </div>
            </div>
            <table class="feature-table search-results-table">
              <thead>
                <tr>
                  <th style="width:80px;">编号</th>
                  <th>功能名称</th>
                  <th style="width:100px;">状态</th>
                  <th>说明</th>
                  <th style="width:100px;">模块</th>
                  <th style="width:120px;">分组</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        `;
      }).join('');

      return `
        <div class="overview-filter-header">
          <button class="overview-back-btn" id="overviewBackBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            返回总览
          </button>
          <h1>${filterInfo.label}</h1>
          <p>共 <strong>${totalMatched}</strong> 项功能，分布在 <strong>${matchedModules.length}</strong> 个模块中</p>
        </div>
        <div class="search-results-list">
          ${modulesHtml}
        </div>
      `;
    }

    function highlightText(text, query) {
      if (!text || !query) return text || '';
      const lowerText = String(text).toLowerCase();
      const lowerQuery = query.toLowerCase();
      if (!lowerText.includes(lowerQuery)) return text;

      const result = [];
      let lastIndex = 0;
      let index = lowerText.indexOf(lowerQuery);
      while (index !== -1) {
        result.push(String(text).slice(lastIndex, index));
        result.push(`<span class="search-highlight">${String(text).slice(index, index + query.length)}</span>`);
        lastIndex = index + query.length;
        index = lowerText.indexOf(lowerQuery, lastIndex);
      }
      result.push(String(text).slice(lastIndex));
      return result.join('');
    }

    function renderSearchResults() {
      if (!globalSearchQuery) return renderOverview();

      let totalMatches = 0;
      const matchedModules = [];

      modules.forEach(module => {
        if (module.isOverview) return;
        const matchedIds = searchMatches.get(module.id);
        if (!matchedIds || matchedIds.size === 0) return;

        const matchedFeatures = [];
        module.sections.forEach(section => {
          section.features.forEach(f => {
            if (matchedIds.has(f.id)) {
              matchedFeatures.push({ ...f, sectionName: section.name });
            }
          });
        });

        if (matchedFeatures.length === 0) return;
        totalMatches += matchedFeatures.length;
        matchedModules.push({ module, features: matchedFeatures });
      });

      if (totalMatches === 0) {
        return `
          <div class="search-results-header">
            <h1>"${globalSearchQuery}" 的搜索结果</h1>
            <p>未找到匹配的功能</p>
          </div>
          <div class="search-empty-state">没有功能匹配 "${globalSearchQuery}"，请尝试其他关键词</div>
        `;
      }

      const modulesHtml = matchedModules.map(({ module, features }) => {
        const statusCounts = countByStatus(features);
        const badgesHtml = Object.entries(statusCounts)
          .filter(([_, count]) => count > 0)
          .map(([status, count]) => `<span class="badge ${statusMap[status].badge}">${count}</span>`)
          .join('');

        const query = globalSearchQuery;
        const rowsHtml = features.map(f => {
          const s = statusMap[f.status];
          const detailId = `search-detail-${f.id}`;
          const detailPanel = renderFeatureDetail(f, detailId);
          return `
            <tr class="search-result-row feature-row" data-detail="${detailId}" data-module="${module.id}" data-section="${f.sectionName}" data-feature="${f.id}" onclick="toggleFeatureDetail('${detailId}', this)">
              <td><span class="feature-id">${highlightText(f.id, query)}</span></td>
              <td><span class="feature-name">${highlightText(f.name, query)}</span></td>
              <td><span class="feature-status ${s.class}"><span class="status-dot" style="background:currentColor;"></span>${s.label}</span></td>
              <td class="feature-note">${highlightText(f.desc || f.note || '', query)}</td>
              <td class="feature-module">${highlightText(module.name, query)}</td>
              <td class="feature-section">${highlightText(f.sectionName, query)}</td>
            </tr>
            ${detailPanel}
          `;
        }).join('');

        return `
          <div class="search-results-module">
            <div class="search-results-module-header">
              <div class="search-results-module-title">
                <span class="module-icon" style="width:20px;height:20px;">${iconMap[module.id] || iconMap.overview}</span>
                <span>${module.name}</span>
                <span class="search-results-count">${features.length} 项</span>
              </div>
              <div class="search-results-badges">${badgesHtml}</div>
            </div>
            <table class="feature-table search-results-table">
              <thead>
                <tr>
                  <th style="width:80px;">编号</th>
                  <th>功能名称</th>
                  <th style="width:100px;">状态</th>
                  <th>说明</th>
                  <th style="width:100px;">模块</th>
                  <th style="width:120px;">分组</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        `;
      }).join('');

      return `
        <div class="search-results-header">
          <h1>"${globalSearchQuery}" 的搜索结果</h1>
          <p>找到 <strong>${totalMatches}</strong> 项功能，分布在 <strong>${matchedModules.length}</strong> 个模块中</p>
        </div>
        <div class="search-results-list">
          ${modulesHtml}
        </div>
      `;
    }

    function renderFeatureDetail(f, detailId) {
      const s = statusMap[f.status];
      const query = globalSearchQuery;

      // 收集所有截图
      const shots = [];
      if (f.screenshot) shots.push({ src: f.screenshot, label: '图1', path: f.screenshot });
      if (f.screenshot2) shots.push({ src: f.screenshot2, label: '图2', path: f.screenshot2 });
      if (f.screenshots && Array.isArray(f.screenshots)) {
        f.screenshots.forEach((s, i) => shots.push({ src: s, label: '图' + (i + 1), path: s }));
      }

      const galleryId = 'gallery-' + f.id;

      // 截图区域 HTML
      let screenshotHtml = '';
      if (shots.length === 0) {
        screenshotHtml = `<div class="detail-screenshot-main" style="border:2px dashed var(--border-light);">
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--text-muted);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span style="font-size:12px;">暂无截图</span>
          </div>
        </div>`;
      } else {
        screenshotHtml = `
          <div class="detail-screenshot-main" id="${galleryId}-main">
            <img src="${shots[0].src}" alt="${f.name}" onclick="openLightbox('${shots[0].src}', '${f.name}')">
          </div>
          <div class="detail-thumbs">
            ${shots.map((s, i) => `
              <div class="detail-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="switchScreenshot('${galleryId}', ${i}, '${s.src}')">
                <img src="${s.src}" alt="${s.label}">
              </div>
            `).join('')}
          </div>
        `;
      }

      // 解析 detail 为表格
      const detail = f.detail || f.desc || '';
      let tableHtml = '';
      if (detail) {
        const items = detail.match(/\d+\.\s*[^\d]+/g);
        if (items && items.length > 0) {
          const parsed = [];
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const nextItem = items[i + 1];
            let content = item;
            if (nextItem) {
              const endIdx = detail.indexOf(nextItem, detail.indexOf(item) + item.length);
              content = detail.substring(detail.indexOf(item), endIdx);
            } else {
              content = detail.substring(detail.indexOf(item));
            }
            const m = content.trim().match(/^(\d+)\.\s*([^：:]+)[：:]([\s\S]*)$/);
            if (m) {
              const num = m[1];
              const field = m[2].trim();
              let desc = m[3].trim();
              // 检查是否有备注
              const noteMatch = desc.match(/(.+?)(?:\s*备注[：:](.+))?$/);
              const mainDesc = noteMatch ? noteMatch[1] : desc;
              const note = noteMatch && noteMatch[2] ? noteMatch[2].trim() : '';
              parsed.push({ num, field, desc: mainDesc, note });
            }
          }
          if (parsed.length > 0) {
            tableHtml = `
              <table class="detail-note-table">
                <thead><tr><th style="width:50px;">序号</th><th style="width:120px;">字段</th><th>说明</th><th style="width:150px;">备注</th></tr></thead>
                <tbody>
                  ${parsed.map(p => `<tr>
                    <td>${highlightText(p.num, query)}</td>
                    <td>${highlightText(p.field, query)}</td>
                    <td>${highlightText(p.desc, query)}</td>
                    <td>${p.note ? highlightText(p.note, query) : '—'}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            `;
          }
        }
        if (!tableHtml) {
          tableHtml = `<div class="detail-description">${highlightText(detail, query)}</div>`;
        }
      } else {
        tableHtml = `<div class="detail-description">暂无详细说明</div>`;
      }

      // 更新记录（从数据中提取或默认）
      const updateLog = f.updateLog || '2026-06-12: 新增';

      return `
        <tr class="feature-detail-row" id="${detailId}" style="display:none;">
          <td colspan="6" style="padding:0;border:none;">
            <div class="feature-detail-panel" id="${detailId}-panel">
              <div class="detail-panel-inner">
                <div class="detail-left">
                  ${screenshotHtml}
                </div>
                <div class="detail-right">
                  <div class="detail-right-header">
                    <div class="detail-right-title">
                      <span class="detail-id">${highlightText(f.id, query)}</span>
                      <span class="detail-name">${highlightText(f.name, query)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px;">
                      <span class="feature-status ${s.class}"><span class="status-dot" style="background:currentColor;"></span>${s.label}</span>
                      <span class="detail-version">当前版本：V1</span>
                    </div>
                  </div>
                  <div class="detail-table-wrapper">
                    <div class="detail-section-title">功能详情</div>
                    ${tableHtml}
                  </div>
                  <div class="detail-update-log">
                    <div class="detail-update-title">更新记录</div>
                    <div class="detail-update-content">${updateLog}</div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }

    function renderModule(module) {
      const isMotModule = module.id === 'mot';
      const allFeatures = getAllFeatures(module);
      const filteredFeatures = (isMotModule
        ? filterMotPriority(filterFeatures(allFeatures, currentFilter))
        : filterFeatures(allFeatures, currentFilter))
        .filter(f => featureMatchesSearch(f, module.id));
      const counts = countByStatus(filteredFeatures);

      let sectionsHtml = '';
      module.sections.forEach((section, idx) => {
        const sectionFeatures = (isMotModule
          ? filterMotPriority(filterFeatures(section.features, currentFilter))
          : filterFeatures(section.features, currentFilter))
          .filter(f => featureMatchesSearch(f, module.id));
        const hasActiveFilter = currentFilter !== 'all' || globalSearchQuery || (isMotModule && motPriorityFilter !== 'all');
        if (sectionFeatures.length === 0 && hasActiveFilter) return;

        const sectionId = `${module.id}-section-${idx}`;
        const isExpanded = expandedSections.has(sectionId);
        const sectionCounts = countByStatus(section.features);

        const badgesHtml = Object.entries(sectionCounts)
          .filter(([_, count]) => count > 0)
          .map(([status, count]) => `<span class="badge ${statusMap[status].badge}">${count}</span>`)
          .join('');

        // MOT 模块使用卡片样式
        const isMot = isMotModule;

        let featuresHtml;
        if (isMot) {
          // MOT 旅程泳道布局
          featuresHtml = sectionFeatures.map(f => {
            const s = statusMap[f.status] || statusMap['待确认'];
            const priority = f.priority || 'P2';
            return `
            <div class="mot-card mot-card-${priority.toLowerCase()}">
              <div class="mot-card-meta">
                <span class="mot-card-id">${f.id}</span>
                <span class="mot-card-priority mot-priority-${priority.toLowerCase()}">${priority}</span>
                <span class="mot-card-status feature-status ${s.class}"><span class="status-dot" style="background:currentColor;"></span>${s.label}</span>
              </div>
              <div class="mot-card-name">${f.name}</div>
              <div class="mot-card-desc">${f.desc || ''}</div>
            </div>
          `;
          }).join('');
        } else {
          // 原有表格布局
          featuresHtml = sectionFeatures.map(f => {
            const s = statusMap[f.status];
            const detailId = `${sectionId}-detail-${f.id}`;
            const screenshotCount = (() => {
              let count = 0;
              if (f.screenshot) count++;
              if (f.screenshot2) count++;
              if (f.screenshots && Array.isArray(f.screenshots)) count += f.screenshots.length;
              return count;
            })();
            const hasScreenshot = screenshotCount > 0;
            const screenshotCell = hasScreenshot
              ? `<button class="screenshot-count-badge has-screenshot" onclick="event.stopPropagation(); toggleFeatureDetail('${detailId}', this.closest('tr'))">${screenshotCount} 张</button>`
              : `<span class="screenshot-placeholder-text">—</span>`;

            const detailPanel = renderFeatureDetail(f, detailId);

            return `
              <tr class="feature-row" data-detail="${detailId}" onclick="toggleFeatureDetail('${detailId}', this)">
                <td><span class="feature-id">${f.id}</span></td>
                <td><span class="feature-name">${f.name}</span></td>
                <td><span class="feature-status ${s.class}"><span class="status-dot" style="background:currentColor;"></span>${s.label}</span></td>
                <td class="feature-note">${f.desc || f.note || ''}</td>
                <td class="feature-screenshot-cell" onclick="event.stopPropagation();">${screenshotCell}</td>
              </tr>
              ${detailPanel}
            `;
          }).join('');
        }

        const allExpanded = !isMot && sectionFeatures.every(f => {
          const did = `${sectionId}-detail-${f.id}`;
          const dp = document.getElementById(did + '-panel');
          return dp && dp.classList.contains('expanded');
        });

        if (isMot) {
          // MOT 平摊分类布局
          sectionsHtml += `
            <div class="mot-section-card">
              <div class="mot-section-header">
                <div class="mot-section-index">${String(idx + 1).padStart(2, '0')}</div>
                <div class="mot-section-title">
                  <strong>${section.name}</strong>
                </div>
                <small>${sectionFeatures.length}${hasActiveFilter ? '' : '/' + section.features.length}</small>
              </div>
              <div class="mot-card-grid">${featuresHtml}</div>
            </div>
          `;
        } else {
          // 原有表格布局
          sectionsHtml += `
            <div class="section-card">
              <div class="section-header" data-section="${sectionId}">
                <div class="section-header-left">
                  <span class="section-toggle ${isExpanded ? 'expanded' : ''}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </span>
                  <span class="section-name">${section.name}</span>
                  <span class="section-count">(${sectionFeatures.length}${hasActiveFilter ? '' : '/' + section.features.length})</span>
                </div>
                <div class="section-header-right">
                  <div class="section-badges">${badgesHtml}</div>
                </div>
              </div>
              <div class="section-content ${isExpanded ? 'expanded' : ''}">
                <table class="feature-table">
                  <thead>
                    <tr>
                      <th style="width:80px;">编号</th>
                      <th>功能名称</th>
                      <th style="width:100px;">状态</th>
                      <th>说明</th>
                      <th style="width:100px;">截图</th>
                    </tr>
                  </thead>
                  <tbody>${featuresHtml}</tbody>
                </table>
              </div>
            </div>
          `;
        }
      });

      const searchInfoHtml = globalSearchQuery ? `
        <div class="search-info-bar">
          <span>"${globalSearchQuery}" 的搜索结果：找到 <strong>${filteredFeatures.length}</strong> 项功能</span>
          ${searchMatches.size > 1 ? `<span class="search-modules-hint">共 ${searchMatches.size} 个模块匹配</span>` : ''}
        </div>
      ` : '';
      const motFilterHtml = isMotModule ? `
        <div class="mot-filter-bar">
          <div class="mot-filter-group">
            <span class="mot-filter-label">状态</span>
            ${[
              { value: 'all', label: '全部' },
              { value: '新功能', label: '新功能' },
              { value: '功能迭代', label: '功能迭代' },
              { value: '待确认', label: '待确认' }
            ].map(option => `
              <button type="button" class="mot-filter-chip ${currentFilter === option.value ? 'active' : ''}" data-mot-status="${option.value}">
                ${option.label}
              </button>
            `).join('')}
          </div>
          <div class="mot-filter-group">
            <span class="mot-filter-label">优先级</span>
            ${[
              { value: 'all', label: '全部' },
              { value: 'P0', label: 'P0' },
              { value: 'P1', label: 'P1' },
              { value: 'P2', label: 'P2' }
            ].map(option => `
              <button type="button" class="mot-filter-chip mot-filter-priority ${motPriorityFilter === option.value ? 'active' : ''}" data-mot-priority="${option.value}">
                ${option.label}
              </button>
            `).join('')}
          </div>
        </div>
      ` : '';
      const sectionsOutputHtml = sectionsHtml
        ? (isMotModule ? `<div class="mot-board">${sectionsHtml}</div>` : sectionsHtml)
        : ((globalSearchQuery || currentFilter !== 'all' || (isMotModule && motPriorityFilter !== 'all'))
          ? '<div class="search-empty-state">没有符合当前条件的功能</div>'
          : '');

      return `
        <div class="module-header">
          <div class="module-title-row">
            <div class="module-icon">${iconMap[module.id] || iconMap.overview}</div>
            <h1 class="module-title">${module.name}</h1>
          </div>
          <p class="module-desc">${module.desc}</p>
          <div class="module-stats-bar">
            <div class="module-stat"><strong>${filteredFeatures.length}</strong> 项功能</div>
            ${counts['已上线'] > 0 ? `<div class="module-stat"><strong>${counts['已上线']}</strong> 已上线</div>` : ''}
            ${counts['新功能'] > 0 ? `<div class="module-stat"><strong>${counts['新功能']}</strong> 新功能</div>` : ''}
            ${counts['功能迭代'] > 0 ? `<div class="module-stat"><strong>${counts['功能迭代']}</strong> 功能迭代</div>` : ''}
            ${counts['待确认'] > 0 ? `<div class="module-stat"><strong>${counts['待确认']}</strong> 待确认</div>` : ''}
          </div>
        </div>

        ${searchInfoHtml}

        <div class="search-bar">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" class="search-input" id="searchInput" placeholder="搜索功能名称、编号或说明...">
        </div>

        ${motFilterHtml}

        ${sectionsOutputHtml}
      `;
    }

    function renderContent() {
      const content = document.getElementById('content');
      const module = modules.find(m => m.id === currentModule);
      if (!module) {
        currentModule = 'overview';
        renderNav();
        renderContent();
        return;
      }

      if (module.isBenchmark) {
        content.innerHTML = renderBenchmark();
        bindBenchmarkHandlers();
        return;
      }

      if (globalSearchQuery && module.isOverview) {
        content.innerHTML = renderSearchResults();
      } else if (module.isOverview) {
        content.innerHTML = renderOverview();

        // Module cards click -> navigate to module
        content.querySelectorAll('.overview-card[data-module]').forEach(card => {
          card.addEventListener('click', () => {
            currentModule = card.dataset.module;
            renderNav();
            renderContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });

        // Stat cards click -> show filtered feature list
        content.querySelectorAll('.overview-stat-card[data-filter]').forEach(card => {
          card.addEventListener('click', () => {
            overviewFilter = card.dataset.filter;
            renderContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });

        // Scroll to module distribution
        content.querySelectorAll('.overview-stat-card[data-scroll="modules"]').forEach(card => {
          card.addEventListener('click', () => {
            const target = document.getElementById('overviewModuleDistribution');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        });

        // Back button -> return to overview
        const backBtn = document.getElementById('overviewBackBtn');
        if (backBtn) {
          backBtn.addEventListener('click', () => {
            overviewFilter = null;
            renderContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }
      } else {
        content.innerHTML = renderModule(module);
        bindModuleHandlers(content);
        if (activeDetailId) {
          const row = document.querySelector(`[data-detail="${activeDetailId}"]`);
          const detailRow = document.getElementById(activeDetailId);
          const detailPanel = document.getElementById(activeDetailId + '-panel');
          if (row && detailRow && detailPanel) {
            row.classList.add('active');
            detailRow.style.display = 'table-row';
            detailPanel.classList.add('expanded');
          } else {
            activeDetailId = null;
          }
        }
      }
    }

    function bindModuleHandlers(content) {
      // Section toggle handlers
      content.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
          const sectionId = header.dataset.section;
          const sectionContent = header.nextElementSibling;
          const toggle = header.querySelector('.section-toggle');

          if (expandedSections.has(sectionId)) {
            expandedSections.delete(sectionId);
            sectionContent.classList.remove('expanded');
            toggle.classList.remove('expanded');
          } else {
            expandedSections.add(sectionId);
            sectionContent.classList.add('expanded');
            toggle.classList.add('expanded');
          }
        });
      });

      // Search handler
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          content.querySelectorAll('.feature-table tbody tr').forEach(row => {
            // 跳过详情面板行
            if (row.classList.contains('feature-detail-row')) return;
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(query);
            row.style.display = shouldShow ? '' : 'none';
            // 同时隐藏对应的详情面板
            const detailId = row.dataset.detail;
            if (detailId) {
              const detailRow = document.getElementById(detailId);
              if (detailRow) detailRow.style.display = 'none';
            }
          });
          // 搜索时重置展开状态
          if (activeDetailId) {
            const prevDetailPanel = document.getElementById(activeDetailId + '-panel');
            const prevRow = document.querySelector(`[data-detail="${activeDetailId}"]`);
            if (prevDetailPanel) prevDetailPanel.classList.remove('expanded');
            if (prevRow) prevRow.classList.remove('active');
            activeDetailId = null;
          }
        });
      }

      content.querySelectorAll('[data-mot-status]').forEach(btn => {
        btn.addEventListener('click', () => {
          currentFilter = btn.dataset.motStatus;
          document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === currentFilter);
          });
          renderContent();
        });
      });

      content.querySelectorAll('[data-mot-priority]').forEach(btn => {
        btn.addEventListener('click', () => {
          motPriorityFilter = btn.dataset.motPriority;
          renderContent();
        });
      });
    }

    function renderStatusFilters() {
      const container = document.getElementById('statusFilterContainer');
      if (!container) return;

      const statusEntries = [
        { key: '已上线', dotClass: 'dot-live' },
        { key: '新功能', dotClass: 'dot-new' },
        { key: '功能迭代', dotClass: 'dot-iterate' },
        { key: '待确认', dotClass: 'dot-pending' }
      ];

      statusEntries.forEach(({ key, dotClass }) => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.dataset.filter = key;
        btn.innerHTML = `<span class="filter-dot ${dotClass}"></span>${key}`;
        container.appendChild(btn);
      });
    }

    function renderFilters() {
      document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentFilter = chip.dataset.filter;
          if (!modules.find(m => m.id === currentModule).isOverview) {
            renderContent();
          }
        });
      });
    }

    // ===== Lightbox =====
    function openLightbox(src, caption) {
      let lightbox = document.getElementById('lightbox');
      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
          <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
          <img class="lightbox-img" id="lightboxImg" src="" alt="">
          <div class="lightbox-caption" id="lightboxCaption"></div>
        `;
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) closeLightbox();
        });
        document.body.appendChild(lightbox);
      }
      document.getElementById('lightboxImg').src = src;
      document.getElementById('lightboxCaption').textContent = caption;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      const lightbox = document.getElementById('lightbox');
      if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    function switchScreenshot(galleryId, index, src) {
      const main = document.getElementById(galleryId + '-main');
      if (!main) return;
      const mainImg = main.querySelector('img');
      const thumbs = document.querySelectorAll('#' + galleryId + '-main').length > 0
        ? main.parentElement.querySelectorAll('.detail-thumb')
        : [];
      if (mainImg) {
        mainImg.src = src;
        mainImg.onclick = () => openLightbox(src, mainImg.alt);
      }
      thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
      });
    }

    // ===== Feature Detail Toggle =====

    function toggleFeatureDetail(detailId, rowEl) {
      const detailRow = document.getElementById(detailId);
      const detailPanel = document.getElementById(detailId + '-panel');
      // 如果点击的是当前已展开的功能，则收起
      if (activeDetailId === detailId) {
        detailPanel.classList.remove('expanded');
        setTimeout(() => {
          detailRow.style.display = 'none';
        }, 400);
        rowEl.classList.remove('active');
        activeDetailId = null;
        return;
      }

      // 收起之前展开的面板
      if (activeDetailId) {
        const prevDetailRow = document.getElementById(activeDetailId);
        const prevDetailPanel = document.getElementById(activeDetailId + '-panel');
        const prevRow = document.querySelector(`[data-detail="${activeDetailId}"]`);
        if (prevDetailPanel) prevDetailPanel.classList.remove('expanded');
        if (prevDetailRow) {
          setTimeout(() => { prevDetailRow.style.display = 'none'; }, 400);
        }
        if (prevRow) prevRow.classList.remove('active');
      }

      // 展开新面板
      detailRow.style.display = 'table-row';
      // 强制重排以确保 transition 生效
      detailRow.offsetHeight;
      requestAnimationFrame(() => {
        detailPanel.classList.add('expanded');
      });
      rowEl.classList.add('active');
      activeDetailId = detailId;

      // 滚动到视图
      setTimeout(() => {
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeLightbox(); bmCloseDrawer(); }
    });

    // ===== INIT =====
    initApp();
