export type ItineraryItem = { id:string; time:string; title:string; summary:string; details:string[]; dateTime:string; tone?:string; image?:string }
export type DayPlan = { date:string; weekday:string; title:string; intensity:string; items:ItineraryItem[] }
export const itinerary:DayPlan[]=[
 {date:'9/7',weekday:'周一',title:'深圳 → 吉隆坡',intensity:'较轻松',items:[
  {id:'d7-1',time:'08:00',title:'深圳机场',summary:'办理值机、托运，带着期待出发。',details:['10:30起飞','14:40抵达KUL','16:30—17:30预计到The FACE'],dateTime:'2026-09-07T08:00:00+08:00'},
  {id:'d7-2',time:'18:30',title:'KLCC夜游',summary:'KLCC公园 · 双子塔外观 · Suria KLCC · 晚餐',details:['9月7日双子塔观景台关闭','如有精力可去武吉免登 / 阿罗街'],dateTime:'2026-09-07T18:30:00+08:00',image:'images/hero-malaysia.webp'}
 ]},
 {date:'9/8',weekday:'周二',title:'老城散步＋榴莲局',intensity:'舒适',items:[
  {id:'d8-1',time:'09:30',title:'独立广场老城线',summary:'独立广场 → 苏丹阿都沙末大厦 → 中央市场 → 茨厂街 → 鬼仔巷',details:['建议慢慢走，午间注意防晒补水','13:30—16:00回酒店午休 / 泳池'],dateTime:'2026-09-08T09:30:00+08:00',image:'images/places/merdeka.webp'},
  {id:'d8-2',time:'16:30',title:'双子塔观景台 / Pavilion',summary:'二选一：登塔，或在Pavilion→武吉免登逛街。',details:['晚上安排吉隆坡名品榴莲局','推荐顺序：D24→红虾→猫山王D197→黑刺D200'],dateTime:'2026-09-08T16:30:00+08:00'}
 ]},
 {date:'9/9',weekday:'周三',title:'黑风洞＋飞亚庇',intensity:'移动日',items:[
  {id:'d9-1',time:'07:30',title:'黑风洞',summary:'早餐 → 08:30 Grab → 09:00—10:45 黑风洞 → 11:15 返回',details:['12:00午餐','12:45—13:00 Grab去KUL T2','16:30起飞，19:05抵达BKI'],dateTime:'2026-09-09T07:30:00+08:00',tone:'image-event',image:'images/places/batu.webp'},
  {id:'d9-2',time:'19:05',title:'沙巴入境检查',summary:'抵达BKI后先办理沙巴移民检查，再离开机场。',details:['寻找Immigration','办理沙巴入境并翻护照检查沙巴入境章','Sheraton入住，海鲜 / 夜宵，早点休息'],dateTime:'2026-09-09T19:05:00+08:00',tone:'warning'}
 ]},
 {date:'9/10',weekday:'周四',title:'亚庇天气排期日',intensity:'动态',items:[]},
 {date:'9/11',weekday:'周五',title:'换酒店＋动态主活动',intensity:'固定事件＋动态',items:[]},
 {date:'9/12',weekday:'周六',title:'动态海岛＋丹绒亚路',intensity:'动态',items:[]},
 {date:'9/13',weekday:'周日',title:'亚庇 → 深圳',intensity:'早起返程',items:[
  {id:'d13-1',time:'06:00',title:'返程机场动线',summary:'06:00起床 · 06:30退房 · 06:40 Grab。',details:['07:00—07:15抵达BKI','07:15—08:00托运＋出境＋安检','08:30前到登机口，09:20起飞，12:35抵达深圳'],dateTime:'2026-09-13T06:00:00+08:00',tone:'warning'}
 ]}
]
