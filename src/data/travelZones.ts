export type TravelCity = 'kuala-lumpur' | 'kota-kinabalu'

export type TravelZone =
  | 'KLCC'
  | 'Bukit Bintang'
  | 'Old Town'
  | 'Bukit Nanas'
  | 'Perdana'
  | 'Brickfields'
  | 'Batu Caves'
  | 'Outer KL'
  | 'Gaya / City Centre'
  | 'Waterfront'
  | 'Tanjung Aru'
  | 'Likas'
  | 'Sepanggar'
  | 'Outside KK'
  | 'Kundasang'
  | 'Klias'
  | 'Offshore'

export type TravelEstimate = {
  city: TravelCity
  from: TravelZone
  to: TravelZone
  minutes: number
  distanceKm: number
  mode: string
  quality: 'green' | 'yellow' | 'red'
  label: string
  note: string
}

const matrix: Partial<Record<`${TravelZone}|${TravelZone}`, Omit<TravelEstimate, 'city' | 'from' | 'to'>>> = {
  'Old Town|Old Town': { minutes: 8, distanceKm: 1.2, mode: '步行 / Grab', quality: 'green', label: '🟢 很顺路', note: '同一区域，优先步行或短途 Grab。' },
  'Old Town|Perdana': { minutes: 12, distanceKm: 2.2, mode: 'Grab / 步行', quality: 'green', label: '🟢 很顺路', note: '相邻区域，午间可用国家清真寺或博物馆做室内段。' },
  'Old Town|Brickfields': { minutes: 13, distanceKm: 2.8, mode: 'Grab', quality: 'green', label: '🟢 很顺路', note: '沿老城南侧移动，留意午间炎热。' },
  'Old Town|Bukit Nanas': { minutes: 24, distanceKm: 3.8, mode: 'Grab', quality: 'yellow', label: '🟡 可以安排', note: '会离开老城步行线，交通以当天 Grab 为准。' },
  'Old Town|KLCC': { minutes: 23, distanceKm: 4.1, mode: 'Grab / LRT', quality: 'yellow', label: '🟡 可以安排', note: '跨到 KLCC，适合安排在午休后，不建议与老城长线硬叠。' },
  'Old Town|Bukit Bintang': { minutes: 20, distanceKm: 3.5, mode: 'Grab / 步行', quality: 'yellow', label: '🟡 可以安排', note: '可接商场或晚餐，但会增加一段市区移动。' },
  'Old Town|Batu Caves': { minutes: 42, distanceKm: 14.5, mode: 'Grab / KTM', quality: 'red', label: '🔴 不建议直接替换', note: '北郊半日属性与老城小时级景点不匹配。' },
  'KLCC|Bukit Bintang': { minutes: 15, distanceKm: 2.4, mode: '步行 / Grab', quality: 'green', label: '🟢 很顺路', note: '相邻商圈，适合商场、夜景和晚餐串联。' },
  'KLCC|Bukit Nanas': { minutes: 10, distanceKm: 1.7, mode: 'Grab / 步行', quality: 'green', label: '🟢 很顺路', note: '同一城市核心区，交通弹性较好。' },
  'KLCC|Outer KL': { minutes: 35, distanceKm: 9, mode: 'Grab', quality: 'yellow', label: '🟡 可以安排', note: '需要额外交通缓冲，不建议放在航班日前。' },
  'Perdana|Brickfields': { minutes: 10, distanceKm: 1.8, mode: 'Grab / 步行', quality: 'green', label: '🟢 很顺路', note: '湖滨、公园、博物馆与 Brickfields 可做半日线。' },
  'Bukit Bintang|Bukit Nanas': { minutes: 18, distanceKm: 2.4, mode: 'Grab / 步行', quality: 'yellow', label: '🟡 可以安排', note: '短途可达，但高峰期需要预留缓冲。' },
  'Gaya / City Centre|Waterfront': { minutes: 8, distanceKm: 1.1, mode: '步行 / Grab', quality: 'green', label: '🟢 很顺路', note: '市中心相邻区域，适合在同一晚串联。' },
  'Gaya / City Centre|Likas': { minutes: 15, distanceKm: 4.5, mode: 'Grab', quality: 'green', label: '🟢 很顺路', note: '市区北侧短途，注意高温和开闭馆时间。' },
  'Gaya / City Centre|Tanjung Aru': { minutes: 22, distanceKm: 7, mode: 'Grab', quality: 'yellow', label: '🟡 可以安排', note: '日落时段拥堵明显，建议至少提前 30 分钟出发。' },
  'Gaya / City Centre|Sepanggar': { minutes: 30, distanceKm: 14, mode: 'Grab / 包车', quality: 'yellow', label: '🟡 可以安排', note: '市区北移，适合单独安排半天。' },
  'Gaya / City Centre|Offshore': { minutes: 30, distanceKm: 2, mode: 'Grab → 码头 → 船', quality: 'yellow', label: '🟡 可以安排', note: '水上项目还要叠加报到、候船与海况缓冲。' },
  'Gaya / City Centre|Kundasang': { minutes: 150, distanceKm: 90, mode: '包车 / 运营商接送', quality: 'red', label: '🔴 不建议直接替换', note: '高地全天线路，不适合塞进市区小时级空位。' },
  'Gaya / City Centre|Klias': { minutes: 150, distanceKm: 100, mode: '运营商接送', quality: 'red', label: '🔴 不建议直接替换', note: '长途红树林是下午至夜间大半日活动。' },
  'Gaya / City Centre|Outside KK': { minutes: 60, distanceKm: 35, mode: 'Grab / 包车', quality: 'yellow', label: '🟡 可以安排', note: '城外项目需按运营商接送窗口安排。' },
  'Likas|Sepanggar': { minutes: 24, distanceKm: 12, mode: 'Grab', quality: 'yellow', label: '🟡 可以安排', note: '北侧相邻，但不是市区步行可达。' },
  'Outside KK|Kundasang': { minutes: 110, distanceKm: 60, mode: '包车 / 运营商接送', quality: 'yellow', label: '🟡 可以安排', note: '山路时间受天气影响，全天项目要留返程缓冲。' },
  'Offshore|Offshore': { minutes: 10, distanceKm: 0.5, mode: '步行 / 船', quality: 'green', label: '🟢 很顺路', note: '同一海上活动窗口内移动。' },
}

function key(from: TravelZone, to: TravelZone) {
  return `${from}|${to}` as `${TravelZone}|${TravelZone}`
}

function fallbackEstimate(city: TravelCity, from: TravelZone, to: TravelZone): Omit<TravelEstimate, 'city' | 'from' | 'to'> {
  if (from === to) return { minutes: 8, distanceKm: 1, mode: '步行 / Grab', quality: 'green', label: '🟢 很顺路', note: '同一区域，优先步行或短途 Grab。' }
  const isLong = ['Batu Caves', 'Kundasang', 'Klias', 'Offshore'].includes(to)
  return {
    minutes: city === 'kuala-lumpur' ? (isLong ? 42 : 22) : (isLong ? 55 : 20),
    distanceKm: city === 'kuala-lumpur' ? (isLong ? 14 : 4) : (isLong ? 20 : 6),
    mode: isLong ? 'Grab / 包车 / 运营商接送' : 'Grab',
    quality: 'yellow',
    label: '🟡 可以安排',
    note: '跨区域静态估算；当天以 Grab / Google Maps 实时路线为准。',
  }
}

export function estimateTravel(city: TravelCity, from: TravelZone, to: TravelZone): TravelEstimate {
  const direct = matrix[key(from, to)] ?? matrix[key(to, from)]
  return { city, from, to, ...(direct ?? fallbackEstimate(city, from, to)) }
}

export const travelZones = {
  kualaLumpur: ['KLCC', 'Bukit Bintang', 'Old Town', 'Bukit Nanas', 'Perdana', 'Brickfields', 'Batu Caves', 'Outer KL'] as TravelZone[],
  kotaKinabalu: ['Gaya / City Centre', 'Waterfront', 'Tanjung Aru', 'Likas', 'Sepanggar', 'Outside KK', 'Kundasang', 'Klias', 'Offshore'] as TravelZone[],
}
