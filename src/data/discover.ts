export type DiscoverCategory = '吉隆坡' | '亚庇城市' | '海岛与活动'
export type DiscoverPlace = { id:string; category:DiscoverCategory; title:string; english:string; image?:string; positioning:string; tags:string[]; intro:string; day?:string; details?:string[]; placeName?:string; activity?:'mengalum'|'tarp'|'mangrove'|'city'|'rest' }
export const discoverPlaces: DiscoverPlace[] = [
 {id:'petronas',category:'吉隆坡',title:'双子塔',english:'Petronas Twin Towers',positioning:'吉隆坡最具代表性的城市地标，第一晚以地面夜景为主。',tags:['城市地标','夜景','KLCC','9/7'],intro:'9/7观景台关闭；9/8如需要可登塔，KLCC公园适合拍双塔全景。',day:'9/7',details:['9/7观景台关闭','9/8如需要可登塔','KLCC公园适合拍双塔全景'],placeName:'KLCC'},
 {id:'merdeka',category:'吉隆坡',title:'独立广场',english:'Merdeka Square',image:'/images/places/merdeka.webp',positioning:'老城区步行线的起点，马来西亚独立历史核心区域。',tags:['历史','建筑','老城区','9/8'],intro:'从独立广场出发，串起苏丹阿都沙末大厦、中央市场和茨厂街。',day:'9/8',placeName:'独立广场'},
 {id:'sultan',category:'吉隆坡',title:'苏丹阿都沙末大厦',english:'Sultan Abdul Samad Building',image:'/images/places/merdeka.webp',positioning:'一眼能认出的殖民建筑，和独立广场一起看最顺路。',tags:['殖民建筑','拍照','老城'],intro:'拱廊、钟楼和红砖立面是老城线的视觉重点。',day:'9/8',placeName:'独立广场'},
 {id:'central',category:'吉隆坡',title:'中央市场',english:'Central Market',positioning:'室内逛手信的舒适中场，适合避开午间炎热。',tags:['室内','手信','老城区'],intro:'把伴手礼和本地手作放在老城步行线中段解决。',day:'9/8',placeName:'中央市场'},
 {id:'petaling',category:'吉隆坡',title:'茨厂街',english:'Petaling Street',positioning:'唐人街的热闹街区，美食与街景一起扫。',tags:['唐人街','美食','街区'],intro:'沿着老城线慢慢逛，不必为了打卡把节奏拉满。',day:'9/8',placeName:'茨厂街'},
 {id:'kwai-chai',category:'吉隆坡',title:'鬼仔巷',english:'Kwai Chai Hong',positioning:'短小但很上镜的壁画街巷，适合拍照收尾。',tags:['街巷','壁画','拍照'],intro:'把它当成老城线的轻量收尾，不需要单独安排半天。',day:'9/8',placeName:'鬼仔巷'},
 {id:'batu',category:'吉隆坡',title:'黑风洞',english:'Batu Caves',image:'/images/places/batu.webp',positioning:'彩色阶梯、巨大金色神像和天然洞穴组成的经典宗教景点。',tags:['印度教','洞穴','272阶','9/9'],intro:'上午去更舒服；注意防晒、猴子和宗教着装。',day:'9/9',details:['防晒','猴子','宗教着装','9/9上午安排'],placeName:'黑风洞'},
 {id:'tanjung-aru',category:'亚庇城市',title:'丹绒亚路',english:'Tanjung Aru',positioning:'亚庇的傍晚答案：把时间留给海风和日落。',tags:['日落','海滩','默认9/12'],intro:'推荐17:35—17:45抵达，约18:17日落；远海日要根据回程时间决定是否赶。',day:'9/12',placeName:'丹绒亚路'},
 {id:'gaya',category:'亚庇城市',title:'加雅街',english:'Gaya Street',positioning:'酒店换好后，最适合用步行开启亚庇市区的一段。',tags:['吃喝','市区','步行'],intro:'9/11是周五，没有Sunday Market；适合吃生肉面、叻沙、咖啡或按摩。',day:'9/11',placeName:'加雅街'},
 {id:'api-api',category:'亚庇城市',title:'Api Api Night Food Market',english:'Api Api夜市',positioning:'周五晚上的小吃收尾，和换酒店日天然合拍。',tags:['周五','夜市','小吃','9/11'],intro:'晚上正式入住Hyatt后再去逛，注意现金和价格确认。',day:'9/11',placeName:'Api Api'},
 {id:'waterfront',category:'亚庇城市',title:'KK Waterfront',english:'Kota Kinabalu Waterfront',positioning:'海滨夜景、海鲜和城市散步可以一次解决。',tags:['海滨','夜景','海鲜'],intro:'适合放在海岛日之后或换酒店日的弹性晚间。',placeName:'海鲜区'},
 {id:'mengalum',category:'海岛与活动',title:'环滩岛',english:'Mengalum Island',image:'/images/places/mengalum.webp',positioning:'远海、白沙、浮潜，最吃海况的一天。',tags:['远海','浮潜','天气敏感','★★★★★优先级'],intro:'船程长，晕船药要带；动态排期把最早的good留给它。',activity:'mengalum',details:['远海感和海水通透','船程长，最吃海况','出发前确认取消与改期政策']},
 {id:'tarp',category:'海岛与活动',title:'TARP双岛',english:'Tunku Abdul Rahman Park',image:'/images/places/manukan.webp',positioning:'近海、轻松、天气容错更高的默认双岛方案。',tags:['近海','轻松','浮潜','Sapi＋Manukan'],intro:'两岛少换一次船，更多浮潜和沙滩时间；默认Sapi＋Manukan。',activity:'tarp',details:['Sapi：初学浮潜、岛小、体验集中','Manukan：岛较大、沙滩、躺平、散步','08:30—15:00左右']},
 {id:'sapi',category:'海岛与活动',title:'Sapi Island',english:'Sapi Island',positioning:'给初学浮潜的集中体验，小岛但不无聊。',tags:['初学浮潜','小岛','热带鱼'],intro:'把浮潜时间集中在一座小岛，节奏更简单。',activity:'tarp'},
 {id:'manukan',category:'海岛与活动',title:'Manukan Island',english:'Manukan Island',image:'/images/places/manukan.webp',positioning:'更适合沙滩躺平、散步和把体力留给下午。',tags:['沙滩','躺平','岛较大'],intro:'和Sapi组合时，一个负责浮潜，一个负责放松。',activity:'tarp'},
 {id:'klias',category:'海岛与活动',title:'Klias红树林',english:'Klias Mangrove',positioning:'下午＋晚上的大半日活动，不是市郊轻松散步。',tags:['长鼻猴','萤火虫','长车程','可舍弃'],intro:'约100km，通常下午出发、看长鼻猴、晚餐、萤火虫，晚上返回；不与TARP同日。',activity:'mangrove'}
]

