import { alternativeById, type AlternativeAttraction } from './alternatives'

export type ReservationStatus = 'must' | 'recommended' | 'none' | 'booked'
export type Replaceability = 'fixed' | 'major' | 'flexible'
export type SlotType = 'short' | 'half-day' | 'full-day'
export type ItineraryItemKind = 'activity' | 'transport' | 'fixed-event'

export type ItineraryItem = {
  id: string
  time: string
  title: string
  summary: string
  details: string[]
  dateTime: string
  tone?: string
  image?: string
  galleryPlaceId?: string
  from?: string
  to?: string
  transportMode?: string
  distance?: string
  duration?: string
  recommendedDepartureTime?: string
  arrivalTime?: string
  buffer?: string
  reservationStatus?: ReservationStatus
  reservationTiming?: string
  bookingChannel?: string
  bookingLink?: string
  ticketOrFee?: string
  meetingPoint?: string
  documents?: string[]
  whatToBring?: string[]
  dressCode?: string
  paymentTip?: string
  weatherRisk?: string
  lastReturnTime?: string
  fallbackPlan?: string
  onSiteSteps?: string[]
  notes?: string
  verifiedAt?: string
  sourceName?: string
  sourceLink?: string
  mapTarget?: string
  replaceability?: Replaceability
  slotType?: SlotType
  slotId?: string
  source?: 'default' | 'custom'
  alternativeId?: string
  /** 活动时间表示抵达 / 开始游览；交通事项时间表示出发。 */
  itemKind?: ItineraryItemKind
  zone?: string
  routeMinutes?: number
  nextRouteMinutes?: number
  environment?: 'indoor' | 'outdoor' | 'mixed'
  sunExposure?: 'low' | 'medium' | 'high'
}

export type DayPlan = { date: string; weekday: string; title: string; intensity: string; items: ItineraryItem[] }

const localImage = (path: string) => path

export const itinerary: DayPlan[] = [
  {
    date: '9/7',
    weekday: '周一',
    title: '深圳 → 吉隆坡',
    intensity: '较轻松',
    items: [
      {
        id: 'd7-1',
        time: '08:00',
        title: '深圳机场 · 值机出发',
        summary: '办理值机、托运，带着期待出发；10:30航班飞往吉隆坡。',
        details: ['10:30起飞 · 14:40抵达KUL', '20kg托运行李 / 人；证件、三段机票和酒店订单放在离线文件夹'],
        dateTime: '2026-09-07T08:00:00+08:00',
        reservationStatus: 'booked',
        documents: ['护照', '深圳 → 吉隆坡机票', '酒店订单'],
        whatToBring: ['护照', '手机充电宝', '一支笔'],
        paymentTip: '机场消费优先刷 MYR，避免动态货币转换。',
      },
      {
        id: 'd7-2',
        time: '14:40',
        title: '吉隆坡国际机场 T2（KUL T2）入境 · 取行李 · 找 Grab',
        summary: '落地后按 Immigration → Baggage Claim → Customs 动线走，先处理入境和行李。',
        details: ['预留约60—90分钟：沙巴以外的马来西亚入境在KUL完成', '取行李后打开官方Grab，核对车牌、司机姓名和上车点'],
        dateTime: '2026-09-07T14:40:00+08:00',
        reservationStatus: 'none',
        buffer: '入境、行李和叫车合计预留60—90分钟',
        onSiteSteps: ['跟随 Immigration 指示办理入境', '取行李并确认行李条', '过海关后在官方Grab App叫车'],
        documents: ['护照', 'MDAC确认信息', '酒店地址'],
        whatToBring: ['手机网络 / eSIM', '离线酒店地址'],
        mapTarget: 'KUL T2',
      },
      {
        id: 'd7-3',
        time: '16:30',
        title: '吉隆坡国际机场 T2 → 菲斯时尚酒店',
        summary: '出机场后找 Grab 前往菲斯时尚酒店（The FACE）；约57km，正常预留60—75分钟。',
        details: ['预计16:30—17:30抵达菲斯时尚酒店，堵车时不要用机场时间倒推晚餐', '入住后先放行李、补水，再决定是否去KLCC夜游'],
        dateTime: '2026-09-07T16:30:00+08:00',
        from: '吉隆坡国际机场 T2（KUL T2）',
        to: '菲斯时尚酒店',
        transportMode: 'Grab',
        distance: '约57km',
        duration: '约60—75分钟',
        recommendedDepartureTime: '15:45左右出机场',
        arrivalTime: '约16:30—17:30',
        buffer: '至少留30分钟堵车缓冲',
        reservationStatus: 'none',
        bookingChannel: 'Grab 官方 App',
        paymentTip: '上车前核对车型、车牌和司机；下车前确认行李齐全。',
        mapTarget: 'The FACE',
      },
      {
        id: 'd7-4',
        time: '18:30',
        title: 'KLCC（吉隆坡城中城）夜游',
        summary: 'KLCC公园 · 双子塔外观 · Suria KLCC · 晚餐，第一晚不赶观景台。',
        details: ['9月7日双子塔观景台关闭，今晚只做地面夜景', '如有精力可去武吉免登 / 阿罗街；累了就回酒店休息'],
        dateTime: '2026-09-07T18:30:00+08:00',
        reservationStatus: 'none',
        whatToBring: ['舒适步行鞋', '防蚊用品'],
        paymentTip: '商场和正规餐厅可刷Visa；夜市现金优先。',
        mapTarget: 'Petronas Twin Towers',
        image: localImage('images/places/petronas/night-01.webp'),
        galleryPlaceId: 'petronas',
      },
    ],
  },
  {
    date: '9/8',
    weekday: '周二',
    title: '老城散步＋榴莲局',
    intensity: '舒适',
    items: [
      {
        id: 'd8-1',
        time: '09:30',
        title: '中央市场段 · 独立广场老城连续步行线',
        summary: '独立广场 → 苏丹阿都沙末大厦 → 中央市场 → 茨厂街 → 鬼仔巷。',
        details: ['全程约3—4km，慢走约3小时；中央市场安排为室内降温中场', '13:30—16:00回酒店午休 / 泳池，不把老城线和下午登塔硬拼'],
        dateTime: '2026-09-08T09:30:00+08:00',
        from: '独立广场',
        to: '鬼仔巷',
        transportMode: '步行',
        distance: '约3—4km',
        duration: '约3小时',
        recommendedDepartureTime: '09:30',
        buffer: '每小时补水、预留拍照和找路时间',
        reservationStatus: 'none',
        onSiteSteps: ['独立广场拍照', '沿大厦拱廊走到中央市场', '中央市场补水 / 逛手信后继续茨厂街和鬼仔巷'],
        whatToBring: ['帽子', '防晒', '饮用水'],
        dressCode: '进入宗教或传统场所时穿过膝、遮肩衣物更稳妥。',
        weatherRisk: '午间炎热或雷雨时，把中央市场作为室内避雨点。',
        fallbackPlan: '雷雨时缩短户外段，改为中央市场 → 茨厂街室内 / 餐饮。',
        mapTarget: 'Merdeka Square',
        image: localImage('images/places/merdeka/square-01.webp'),
        galleryPlaceId: 'merdeka',
      },
      {
        id: 'd8-2',
        time: '13:30',
        title: '酒店午休 · 泳池',
        summary: '回菲斯时尚酒店降温、午睡、整理照片；下午再决定是否登塔。',
        details: ['把13:30—16:00留给身体恢复', '如果午后雷雨，优先保留柏威年广场（Pavilion）和商场路线'],
        dateTime: '2026-09-08T13:30:00+08:00',
        reservationStatus: 'none',
        fallbackPlan: '体力不足时取消登塔，晚餐后直接安排榴莲。',
        mapTarget: 'The FACE',
      },
      {
        id: 'd8-3',
        time: '16:30',
        title: '吉隆坡双子塔登塔 / 柏威年广场备选',
        summary: '二选一：已订到时段就登吉隆坡双子塔；否则走柏威年广场（Pavilion）→ 武吉免登商场线。',
        details: ['吉隆坡双子塔（PETRONAS）按时段入场，至少提前15分钟到场 Check-in / 值机确认', '没有合适时段、天气不佳或不想赶时，直接执行柏威年广场备选方案'],
        dateTime: '2026-09-08T16:30:00+08:00',
        from: '菲斯时尚酒店',
        to: '吉隆坡双子塔 / 柏威年广场',
        transportMode: '步行 / Grab',
        distance: '约1—2km',
        duration: '约2—3小时',
        recommendedDepartureTime: '登塔时段前约30分钟出发',
        arrivalTime: '至少提前15分钟 Check-in',
        buffer: '登塔严格按时段；迟到风险高',
        reservationStatus: 'must',
        reservationTiming: '建议提前购买 timed entry；到场至少提前15分钟 Check-in',
        bookingChannel: 'PETRONAS官方售票',
        bookingLink: 'https://eticket.petronastwintowers.com/',
        ticketOrFee: '门票价格以官方售票页实时显示为准',
        onSiteSteps: ['打开订单二维码 / 票据', '按时段到入口 Check-in / 值机确认', '无票或不想赶时执行柏威年广场备选方案'],
        whatToBring: ['订单二维码', '手机充电宝', '舒适步行鞋'],
        weatherRisk: '雷雨不影响商场 Plan B，但可能影响步行段。',
        fallbackPlan: '柏威年广场（Pavilion）→ 武吉免登 → 晚餐，不为了登塔打乱全晚节奏。',
        mapTarget: 'Petronas Twin Towers',
        sourceName: 'PETRONAS Twin Towers 官方售票',
        sourceLink: 'https://eticket.petronastwintowers.com/',
        image: localImage('images/places/petronas/klcc-park.webp'),
        galleryPlaceId: 'petronas',
      },
      {
        id: 'd8-4',
        time: '20:00',
        title: '吉隆坡名品榴莲局',
        summary: 'D24 → 红虾 → 猫山王D197 → 黑刺D200；购买前确认RM/kg。',
        details: ['先问价格和称重方式，再决定单果；不要把“品种名”当成固定价格', '商场 / 正规店优先刷卡，路边摊先确认总价'],
        dateTime: '2026-09-08T20:00:00+08:00',
        reservationStatus: 'none',
        paymentTip: '确认 RM/kg、总重和总价；需要打包时确认是否另收费。',
        mapTarget: 'Pavilion',
      },
    ],
  },
  {
    date: '9/9',
    weekday: '周三',
    title: '黑风洞＋飞亚庇',
    intensity: '移动日',
    items: [
      {
        id: 'd9-1',
        time: '07:30',
        title: '黑风洞',
        summary: '早餐 → 08:30 Grab → 09:00—10:45黑风洞 → 11:15返回。',
        details: ['菲斯时尚酒店到黑风洞约11.5km，实际预留20—30分钟车程', '主洞 Temple Cave 无需提前预约；上午更舒服，注意272级台阶和猴子'],
        dateTime: '2026-09-09T07:30:00+08:00',
        from: '菲斯时尚酒店',
        to: '黑风洞',
        transportMode: 'Grab',
        distance: '约11.5km',
        duration: '约20—30分钟',
        recommendedDepartureTime: '08:30',
        arrivalTime: '约09:00',
        buffer: '回程和去机场至少留60分钟机动',
        reservationStatus: 'none',
        meetingPoint: '主 Temple Cave 入口',
        documents: [],
        whatToBring: ['防晒', '饮用水', '防蚊用品'],
        dressCode: '宗教场所建议遮肩、过膝；不要穿过于暴露的衣物。',
        paymentTip: '小额现金备用；不拿食物逗猴。',
        weatherRisk: '大雨时阶梯湿滑，按现场开放和安全提示调整。',
        fallbackPlan: '如果出发晚或雷雨，缩短拍照，不要牺牲KUL T2航班缓冲。',
        onSiteSteps: ['先看现场安全 / 宗教提示', '沿彩色阶梯上Temple Cave', '拍照后按原路回到Grab上车点'],
        mapTarget: 'Batu Caves',
        image: localImage('images/places/batu/entrance.webp'),
        galleryPlaceId: 'batu',
      },
      {
        id: 'd9-2',
        time: '11:15',
        title: '回酒店 · 取行李 · 午餐',
        summary: '从黑风洞返回菲斯时尚酒店，快速整理行李并吃午餐。',
        details: ['12:00午餐；12:20前后完成退房 / 行李确认', '不要把纪念品或湿衣物散放，机场段保持轻装可取'],
        dateTime: '2026-09-09T11:15:00+08:00',
        reservationStatus: 'none',
        mapTarget: 'The FACE',
      },
      {
        id: 'd9-3',
        time: '12:45',
        title: '菲斯时尚酒店 → 吉隆坡国际机场 T2',
        summary: '午餐后叫Grab去KUL T2，给16:30航班留出值机、托运和安检时间。',
        details: ['建议12:45—13:00出发，约14:00左右抵达机场', '16:30起飞；到机场后先办理托运，再找登机口和补水'],
        dateTime: '2026-09-09T12:45:00+08:00',
        from: '菲斯时尚酒店',
        to: '吉隆坡国际机场 T2（KUL T2）',
        transportMode: 'Grab',
        duration: '以实时路况为准，建议预留60—75分钟',
        recommendedDepartureTime: '12:45—13:00',
        arrivalTime: '约14:00',
        buffer: '至少预留2小时办理托运和安检',
        reservationStatus: 'booked',
        bookingChannel: 'Grab 官方 App',
        documents: ['KUL → BKI机票', '护照'],
        mapTarget: 'KUL T2',
      },
      {
        id: 'd9-4',
        time: '19:05',
        title: '亚庇国际机场（BKI）抵达 · 沙巴入境检查',
        summary: '抵达BKI后先办理沙巴移民检查，再离开机场前往市区。',
        details: ['寻找 Immigration / 入境检查指示，按现场工作人员要求出示护照和行程', '翻护照确认沙巴入境章或电子记录，再去取行李 / 找Grab'],
        dateTime: '2026-09-09T19:05:00+08:00',
        from: '亚庇国际机场（BKI）',
        to: '亚庇喜来登酒店',
        transportMode: '入境检查 → Grab',
        duration: '入境、取行李和进城合计预留60—90分钟',
        reservationStatus: 'none',
        documents: ['护照', '酒店订单', '返程机票'],
        onSiteSteps: ['先办沙巴入境检查', '确认护照记录和行李', '再打开Grab去亚庇喜来登酒店'],
        notes: '沙巴有单独入境检查，不能按国内转机心态直接离开机场。',
        mapTarget: 'BKI',
      },
      {
        id: 'd9-5',
        time: '20:30',
        title: '亚庇喜来登酒店入住 · 海鲜 / 夜宵',
        summary: '办理入住后就近吃饭；移动日早点休息，为第二天远海活动留体力。',
        details: ['如机场段延误，晚餐就近解决，不再额外赶景点', '睡前检查9/10运营商通知和接送时间'],
        dateTime: '2026-09-09T20:30:00+08:00',
        reservationStatus: 'booked',
        paymentTip: '海鲜点单先确认单价、重量和加工费。',
        mapTarget: 'Sheraton',
      },
    ],
  },
  { date: '9/10', weekday: '周四', title: '亚庇天气排期日', intensity: '动态', items: [] },
  { date: '9/11', weekday: '周五', title: '换酒店＋动态主活动', intensity: '固定事件＋动态', items: [] },
  { date: '9/12', weekday: '周六', title: '动态海岛＋丹绒亚路', intensity: '动态', items: [] },
  {
    date: '9/13',
    weekday: '周日',
    title: '亚庇 → 深圳',
    intensity: '早起返程',
    items: [
      {
        id: 'd13-1',
        time: '06:00',
        title: '亚庇凯悦尚萃酒店 → 亚庇国际机场返程动线',
        summary: '06:00起床 · 06:30退房 · 06:40 Grab；09:20航班返回深圳。',
        details: ['07:00—07:15抵达BKI；07:15—08:00托运＋出境＋安检', '08:30前到登机口，09:20起飞，12:35抵达深圳'],
        dateTime: '2026-09-13T06:00:00+08:00',
        from: '亚庇凯悦尚萃酒店',
        to: '亚庇国际机场（BKI）',
        transportMode: 'Grab',
        duration: '约20—30分钟，按清晨路况确认',
        recommendedDepartureTime: '06:40',
        arrivalTime: '07:00—07:15',
        buffer: '至少给托运、出境和安检预留75分钟',
        reservationStatus: 'booked',
        bookingChannel: 'Grab 官方 App',
        documents: ['护照', 'BKI → 深圳机票'],
        onSiteSteps: ['06:30左右退房并核对房间', '抵达后立即托运', '完成出境和安检后08:30前到登机口'],
        mapTarget: 'BKI',
      },
    ],
  },
]

type CustomSabahActivity = { source: 'alternative'; attractionId: string }

function alternativeSabahItem(date: '2026-09-10' | '2026-09-11' | '2026-09-12', candidate: AlternativeAttraction): ItineraryItem {
  const durationHours = Math.floor(candidate.durationMin / 60)
  const durationText = candidate.durationMin % 60 === 0
    ? `约${durationHours}小时`
    : `约${durationHours}小时${candidate.durationMin % 60}分钟`
  // 自定义活动的 Timeline 时间统一表示抵达并开始游览，不表示从酒店出发。
  const startTime = candidate.timeScope === 'full-day'
    ? '07:30'
    : candidate.recommendedTime === 'morning' ? '09:00'
      : candidate.recommendedTime === 'evening' || candidate.recommendedTime === 'night' ? '16:30' : '11:00'
  const bookingStatus: ReservationStatus = candidate.bookingRequired ? 'must' : 'none'
  return {
    id: `${date}-alternative-${candidate.id}`,
    slotId: `sabah-main-${date}`,
    source: 'custom',
    alternativeId: candidate.id,
    time: startTime,
    title: candidate.nameZh,
    summary: candidate.shortDescription,
    details: [candidate.description, `区域：${candidate.area} · 建议游览${durationText}`, `这是自定义计划；天气助手不会自动改回默认海岛排期。`, ...candidate.recommendationReasons.map(reason => `为什么去：${reason}`)],
    dateTime: `${date}T${startTime}:00+08:00`,
    tone: candidate.physicalLoad === 'high' ? 'warning' : '',
    image: candidate.images[0]?.src,
    galleryPlaceId: `alternative:${candidate.id}`,
    from: '亚庇凯悦尚萃酒店',
    to: candidate.nameZh,
    transportMode: candidate.timeScope === 'full-day' ? 'Grab / 包车 / 运营商接送' : 'Grab / 步行',
    distance: '按官方接送路线与当天路况确认',
    duration: durationText,
    recommendedDepartureTime: candidate.timeScope === 'full-day' ? '约07:00从酒店出发' : `约${startTime}前从酒店 / 上一项出发`,
    arrivalTime: `${startTime} 抵达并开始游览`,
    buffer: candidate.bookingRequired ? '预约 / 报到额外预留20—30分钟' : '保留约15分钟找路和补水缓冲',
    reservationStatus: bookingStatus,
    itemKind: 'activity',
    reservationTiming: candidate.bookingRequired ? candidate.bookingRecommendation : undefined,
    bookingChannel: candidate.bookingRequired ? '景点官方页面 / 运营商' : undefined,
    bookingLink: candidate.bookingRequired ? candidate.sourceUrl : undefined,
    ticketOrFee: '门票、接送和费用以官方页面或运营商最终信息为准',
    meetingPoint: candidate.bookingRequired ? '以官方订单确认的集合点为准' : undefined,
    whatToBring: ['手机充电宝', candidate.environment === 'indoor' ? '轻便衣物' : '防晒与饮用水'],
    dressCode: candidate.category === 'religion' ? '进入宗教场所按现场要求遮肩、过膝并脱鞋。' : undefined,
    weatherRisk: candidate.rainyDayFit === 'poor' ? '纯户外项目；雷雨或大雨时按官方与运营商安排执行 Plan B。' : candidate.rainyDayFit === 'excellent' ? '雨天友好，但仍以官方开放状态为准。' : '天气变化时按现场开放、能见度和交通情况调整。',
    fallbackPlan: '若关闭、预约失败或体力不足，回到亚庇市区安排室内休息、咖啡或提前晚餐，不强行补景点。',
    onSiteSteps: ['打开官方订单或景点页面，确认当天开放与集合安排', '到入口 / 集合点核对预约、人数和入场规则', '按下一项时间和路线继续行程'],
    notes: `${candidate.recommendationReasons[0] ?? '按候选景点资料安排'}；这是用户自定义的亚庇计划，天气助手只提供参考，不会覆盖它。`,
    verifiedAt: candidate.verifiedAt,
    sourceName: candidate.sourceName,
    sourceLink: candidate.sourceUrl,
    mapTarget: candidate.mapQuery,
    replaceability: 'major',
    slotType: candidate.timeScope,
    zone: candidate.area,
    environment: candidate.environment,
    sunExposure: candidate.sunExposure,
  }
}

export function createSabahActivityItem(date: '2026-09-10' | '2026-09-11' | '2026-09-12', activity: string | CustomSabahActivity): ItineraryItem {
  if (typeof activity === 'object') {
    const candidate = alternativeById[activity.attractionId]
    if (candidate) return alternativeSabahItem(date, candidate)
    activity = 'rest'
  }
  const common = {
    mengalum: {
      time: '08:00',
      title: '环滩岛',
      summary: '远海、高天气敏感；把当前最好的海况优先给它。',
      details: ['远海船程长，至少提前2—3天订；运营商前一晚确认最终接送时间', '准备晕船药、防晒、水母服 / 防水袋、泳衣；出发前确认取消与改期政策'],
      transportMode: '酒店接送 → 码头 → 快艇',
      distance: '远海，按运营商路线',
      duration: '全天，船程较长',
      recommendedDepartureTime: '以运营商前一晚确认的接送时间为准',
      reservationStatus: 'must' as ReservationStatus,
      reservationTiming: '至少提前2—3天订；前一晚再次确认',
      bookingChannel: '运营商订单 / Klook搜索页',
      bookingLink: 'https://www.klook.com/zh-CN/search/?query=Mengalum%20Island',
      ticketOrFee: '以订单和运营商最终报价为准',
      meetingPoint: '以运营商确认的酒店接送 / 码头为准',
      whatToBring: ['晕船药', '防晒', '泳衣', '防水袋', '水母服 / 长袖防晒'],
      weatherRisk: '最吃风浪和海况；雷暴或大浪时接受取消 / 改期。',
      fallbackPlan: '改为市区、酒店、按摩、海鲜或榴莲，不强行远海。',
      onSiteSteps: ['前一晚确认接送、码头、取消政策和午餐', '到码头核对订单与人数', '上船后穿救生衣并按船员指引活动'],
      notes: '最终接送时间以运营商前一晚确认消息为准。',
      sourceName: '运营商最终确认',
      mapTarget: 'South Jetty, KK Port',
      image: localImage('images/places/mengalum/beach-reference.webp'),
      galleryPlaceId: 'mengalum',
    },
    tarp: {
      time: '08:30',
      title: '东姑阿都拉曼海洋公园 TARP：沙比岛＋马努干岛',
      summary: '近海、轻松的默认双岛；South Jetty出发，最晚返程船约16:00。',
      details: ['2026临时码头：南码头（South Jetty, Kota Kinabalu Port）', '沙比岛（Sapi）负责集中浮潜，马努干岛（Manukan）负责沙滩和散步；两岛少换一次船'],
      transportMode: 'Grab → South Jetty → 公共 / 运营商船',
      distance: '市区 → South Jetty',
      duration: '约08:30—15:30；最晚返程船16:00',
      recommendedDepartureTime: '08:00左右从亚庇凯悦尚萃酒店出发',
      arrivalTime: '08:30前到South Jetty',
      buffer: '码头报到、购票和等船留30分钟',
      reservationStatus: 'recommended' as ReservationStatus,
      reservationTiming: '建议提前1天确认船班、岛屿和天气',
      bookingChannel: 'South Jetty现场 / Sabah Parks / 运营商',
      bookingLink: 'https://www.sabahparks.org.my/',
      ticketOrFee: '成人船票约RM58/人；Sabah Parks conservation fee RM25/人/天；2026-09-01核验，现场以官方为准',
      meetingPoint: 'South Jetty, Kota Kinabalu Port（2026临时码头）',
      whatToBring: ['防晒', '泳衣', '毛巾', '防水袋', '现金和小额零钱'],
      dressCode: '离岛后穿泳衣外建议加罩衫，公共区域保持得体。',
      paymentTip: '票价、船班和保护区费用现场再次确认；保留票据。',
      weatherRisk: '近海天气容错比环滩高，但雷雨 / 风浪时仍听从船方。',
      lastReturnTime: '最晚返程船约16:00',
      fallbackPlan: '改为市区、咖啡、按摩、亚庇海滨（KK Waterfront）或酒店泳池。',
      onSiteSteps: ['到南码头（South Jetty）确认临时码头和船班', '先去沙比岛浮潜，再到马努干岛放松', '15:30左右回到集合点，不能错过最晚返程船'],
      notes: 'South Jetty和价格信息为出发前核验项，不把公开价格当成最终票价。',
      verifiedAt: '2026-09-01核验',
      sourceName: 'Sabah Parks 官方',
      sourceLink: 'https://www.sabahparks.org.my/',
      mapTarget: 'South Jetty, KK Port',
      image: localImage('images/places/tarp/park-01.webp'),
      galleryPlaceId: 'tarp',
    },
    mangrove: {
      time: '13:30',
      title: 'Klias红树林',
      summary: '约13:30接，长鼻猴、晚餐、萤火虫，约21:00—21:30返回。',
      details: ['约100km，下午出发、看长鼻猴、晚餐、萤火虫；不是市郊轻松散步', '建议提前1—3天订，前一晚确认接送时间、餐食和回程'],
      transportMode: '运营商接送 → Klias',
      distance: '约100km',
      duration: '约13:30—21:00/21:30',
      recommendedDepartureTime: '约13:30集合',
      arrivalTime: '约21:00—21:30返回亚庇',
      buffer: '长途车程和天气都需要缓冲',
      reservationStatus: 'must' as ReservationStatus,
      reservationTiming: '提前1—3天订；前一晚确认接送',
      bookingChannel: '运营商订单 / Klook搜索页',
      bookingLink: 'https://www.klook.com/zh-CN/search/?query=Klias%20Mangrove',
      ticketOrFee: '以运营商最终报价为准',
      meetingPoint: '以运营商确认的酒店接送点为准',
      whatToBring: ['驱蚊用品', '薄外套', '晕车药', '现金'],
      weatherRisk: '雨季可能影响河道、长鼻猴和萤火虫观赏。',
      fallbackPlan: '取消后回到市区，安排亚庇海滨（KK Waterfront）、海鲜、按摩或早休息。',
      onSiteSteps: ['确认司机、车牌和同行人', '按运营商安排乘船观察长鼻猴', '晚餐后等待萤火虫并跟随船员返回'],
      notes: 'Klias是可舍弃项，不与TARP同一天。',
      mapTarget: 'Klias Mangrove',
      image: localImage('images/places/klias/river-01.webp'),
      galleryPlaceId: 'klias',
    },
    city: {
      time: '10:30',
      title: '亚庇市区休闲',
      summary: '把时间留给加雅街、咖啡、按摩、海鲜或榴莲。',
      details: ['根据体力选择加雅街、生肉面、叻沙、咖啡、按摩、泳池', '海鲜和榴莲购买前确认价格；周五没有Gaya Street Sunday Market'],
      transportMode: '步行 / Grab',
      duration: '半天至一天弹性安排',
      reservationStatus: 'none' as ReservationStatus,
      whatToBring: ['防晒', '现金', '舒适步行鞋'],
      paymentTip: '夜市和榴莲现金优先，确认RM/kg和总价。',
      fallbackPlan: '高温或雷雨时转室内商场、咖啡和酒店休息。',
      mapTarget: 'Gaya Street',
    },
    rest: {
      time: '11:00',
      title: '酒店 / 按摩 / 海鲜 / 榴莲',
      summary: '海况或体力不适合出海时的舒服备选。',
      details: ['不强行远海，按当天运营商通知调整', '留出午休和收拾行李时间'],
      transportMode: '步行 / Grab',
      reservationStatus: 'none' as ReservationStatus,
      whatToBring: ['充电宝', '舒适衣物'],
      paymentTip: '海鲜点单先确认价格；榴莲称重前确认RM/kg。',
      fallbackPlan: '保留晚上亚庇海滨（KK Waterfront）散步或直接休息。',
      mapTarget: 'KK Waterfront',
    },
  }[activity as 'mengalum' | 'tarp' | 'mangrove' | 'city' | 'rest']

  return {
    id: `${date}-${activity}`,
    time: common.time,
    title: common.title,
    summary: common.summary,
    details: common.details,
    dateTime: `${date}T${common.time}:00+08:00`,
    tone: activity === 'mengalum' ? 'special' : activity === 'mangrove' ? 'warning' : '',
    image: common.image,
    galleryPlaceId: common.galleryPlaceId,
    from: '亚庇凯悦尚萃酒店',
    to: common.mapTarget,
    transportMode: common.transportMode,
    distance: common.distance,
    duration: common.duration,
    recommendedDepartureTime: common.recommendedDepartureTime,
    arrivalTime: common.arrivalTime,
    buffer: common.buffer,
    reservationStatus: common.reservationStatus,
    reservationTiming: common.reservationTiming,
    bookingChannel: common.bookingChannel,
    bookingLink: common.bookingLink,
    ticketOrFee: common.ticketOrFee,
    meetingPoint: common.meetingPoint,
    whatToBring: common.whatToBring,
    dressCode: common.dressCode,
    paymentTip: common.paymentTip,
    weatherRisk: common.weatherRisk,
    lastReturnTime: common.lastReturnTime,
    fallbackPlan: common.fallbackPlan,
    onSiteSteps: common.onSiteSteps,
    notes: common.notes,
    verifiedAt: common.verifiedAt,
    sourceName: common.sourceName,
    sourceLink: common.sourceLink,
    mapTarget: common.mapTarget,
    replaceability: ['mengalum', 'tarp', 'mangrove'].includes(activity) ? 'major' : 'flexible',
    slotType: ['mengalum', 'tarp', 'mangrove'].includes(activity) ? 'full-day' : 'half-day',
    slotId: `sabah-main-${date}`,
    source: 'default',
    zone: 'Gaya / City Centre',
  }
}
