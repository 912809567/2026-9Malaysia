export type Airport = { code: string; nameZh: string; nameEn: string }

export type Flight = { date: string; route: string; from: Airport; to: Airport; depart: string; arrive: string; note: string; details: string[] }

const SZX: Airport = { code: 'SZX', nameZh: '深圳宝安国际机场', nameEn: "Shenzhen Bao'an International Airport" }
const KUL_T2: Airport = { code: 'KUL T2', nameZh: '吉隆坡国际机场 T2', nameEn: 'Kuala Lumpur International Airport · Terminal 2' }
const BKI: Airport = { code: 'BKI', nameZh: '亚庇国际机场', nameEn: 'Kota Kinabalu International Airport' }

export const flights: Flight[] = [
  { date: '9月7日', route: '深圳 → 吉隆坡', from: SZX, to: KUL_T2, depart: '10:30', arrive: '14:40', note: '20kg 托运行李 / 人', details: ['08:00 到深圳宝安国际机场', '建议至少提前 2 小时办理值机', '预计 16:30—17:30 到菲斯时尚酒店（The FACE）'] },
  { date: '9月9日', route: '吉隆坡 → 亚庇', from: KUL_T2, to: BKI, depart: '16:30', arrive: '19:05', note: '20kg 托运行李 / 人', details: ['07:30 早餐，08:30 Grab 去黑风洞', '12:45—13:00 Grab 去 KUL T2', '14:00 左右抵达机场'] },
  { date: '9月13日', route: '亚庇 → 深圳', from: BKI, to: SZX, depart: '09:20', arrive: '12:35', note: '20kg 托运行李 / 人', details: ['06:00 起床 · 06:30 退房 · 06:40 Grab', '07:00—07:15 抵达 BKI，07:15—08:00 托运＋出境＋安检', '08:30 前到登机口'] },
]
