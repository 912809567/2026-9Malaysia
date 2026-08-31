export type ItineraryItem = { id: string; time: string; title: string; summary: string; details: string[]; tone?: string }
export type DayPlan = { date: string; weekday: string; title: string; intensity: string; items: ItineraryItem[] }

export const itinerary: DayPlan[] = [
  { date: '9/7', weekday: '周一', title: '深圳 → 吉隆坡', intensity: '较轻松', items: [
    { id: 'd7-1', time: '08:00', title: '深圳机场', summary: '办理值机、托运，带着期待出发。', details: ['10:30 起飞', '14:40 抵达 KUL', '16:30—17:30 预计到 The FACE'] },
    { id: 'd7-2', time: '18:30+', title: 'KLCC 夜游', summary: 'KLCC 公园 · 双子塔外观 · Suria KLCC · 晚餐', details: ['9 月 7 日双子塔观景台关闭', '如有精力可去武吉免登 / 阿罗街'] },
  ] },
  { date: '9/8', weekday: '周二', title: '老城散步＋榴莲局', intensity: '舒适', items: [
    { id: 'd8-1', time: '09:30', title: '独立广场老城线', summary: '独立广场 → 苏丹阿都沙末大厦 → 中央市场 → 茨厂街 → 鬼仔巷', details: ['建议慢慢走，午间注意防晒补水', '13:30—16:00 回酒店午休 / 泳池'] },
    { id: 'd8-2', time: '16:30+', title: '双子塔观景台 / Pavilion', summary: '二选一：登塔，或在 Pavilion → 武吉免登逛街。', details: ['晚上安排吉隆坡名品榴莲局', '推荐顺序：D24 → 红虾 → 猫山王 D197 → 黑刺 D200'] },
  ] },
  { date: '9/9', weekday: '周三', title: '黑风洞＋飞亚庇', intensity: '移动日', items: [
    { id: 'd9-1', time: '07:30', title: '黑风洞', summary: '早餐 → 08:30 Grab → 09:00—10:45 黑风洞 → 11:15 返回', details: ['12:00 午餐', '12:45—13:00 Grab 去 KUL T2', '16:30 起飞，19:05 抵达 BKI'] },
    { id: 'd9-2', time: '19:05', title: '沙巴入境检查', summary: '抵达 BKI 后先办理沙巴移民检查，再离开机场。', tone: 'warning', details: ['寻找 Immigration', '办理沙巴入境并翻护照检查沙巴入境章', 'Sheraton 入住，海鲜 / 夜宵，早点休息'] },
  ] },
  { date: '9/10', weekday: '周四', title: '环滩岛候选日', intensity: '远海', items: [
    { id: 'd10-1', time: '全天', title: 'Mengalum 环滩岛', summary: '远海、高天气敏感，优先把最好海况留给这里。', details: ['准备：晕船药、防晒、水母服、防水袋、泳衣', '出发前确认：是否正常出海、接送时间、集合地点、码头、取消政策、改期、装备、午餐'] },
  ] },
  { date: '9/11', weekday: '周五', title: '换酒店＋市区休闲', intensity: '固定事件', items: [
    { id: 'd11-1', time: '10:30', title: 'Sheraton → Hyatt Centric', summary: '退房 → 全部行李 Grab → Hyatt 寄存 → 出去玩 → 晚上入住', tone: 'special', details: ['10:45 人＋全部行李 Grab 去 Hyatt', '下午：加雅街、生肉面、叻沙、咖啡、按摩或泳池', '晚上：Api Api Night Food Market'] },
  ] },
  { date: '9/12', weekday: '周六', title: 'TARP 双岛＋丹绒亚路', intensity: '海岛日', items: [
    { id: 'd12-1', time: '08:30', title: 'TARP：Sapi＋Manukan', summary: '默认两岛：少换一次船，更多浮潜和沙滩时间，更轻松。', details: ['08:30—09:00 出发 · 09:00—15:00 游玩 · 15:30 左右回市区', 'Sapi：初学浮潜、岛小、体验集中', 'Manukan：岛较大、沙滩、躺平、散步'] },
    { id: 'd12-2', time: '18:17', title: '丹绒亚路日落', summary: '17:10—17:20 Hyatt 出发，18:17 左右日落。', details: ['17:35—17:45 到丹绒亚路', '日落后：海鲜 → 沙巴特色榴莲 → Hyatt → 收拾行李'] },
  ] },
  { date: '9/13', weekday: '周日', title: '亚庇 → 深圳', intensity: '早起返程', items: [
    { id: 'd13-1', time: '06:00', title: '返程机场动线', summary: '06:00 起床 · 06:30 退房 · 06:40 Grab。', details: ['07:00—07:15 抵达 BKI', '07:15—08:00 托运＋出境＋安检', '08:30 前到登机口，09:20 起飞，12:35 抵达深圳'], tone: 'warning' },
  ] },
]
