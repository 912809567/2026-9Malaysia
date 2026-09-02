export type Place = {
  city: '吉隆坡' | '亚庇'
  name: string
  nameZh: string
  nameEn: string
  mapQuery: string
  lat: number
  lng: number
  use: string
}

export const places: Place[] = [
  { city: '吉隆坡', name: 'The FACE', nameZh: '菲斯时尚酒店', nameEn: 'The FACE Style Hotel', mapQuery: 'The FACE Style Hotel Kuala Lumpur', lat: 3.1567, lng: 101.7044, use: '9/7—9/9入住 / 行李点' },
  { city: '吉隆坡', name: 'Petronas Twin Towers', nameZh: '吉隆坡双子塔', nameEn: 'Petronas Twin Towers', mapQuery: 'Petronas Twin Towers', lat: 3.1579, lng: 101.7116, use: '9/7夜游 / 9/8登塔' },
  { city: '吉隆坡', name: 'Merdeka Square', nameZh: '独立广场', nameEn: 'Merdeka Square', mapQuery: 'Merdeka Square', lat: 3.1488, lng: 101.693, use: '9/8老城线起点' },
  { city: '吉隆坡', name: 'Sultan Abdul Samad Building', nameZh: '苏丹阿都沙末大厦', nameEn: 'Sultan Abdul Samad Building', mapQuery: 'Sultan Abdul Samad Building', lat: 3.1487, lng: 101.6941, use: '9/8老城线' },
  { city: '吉隆坡', name: 'Central Market', nameZh: '中央市场', nameEn: 'Central Market', mapQuery: 'Central Market Kuala Lumpur', lat: 3.1457, lng: 101.6958, use: '9/8老城线 / 避暑' },
  { city: '吉隆坡', name: 'Petaling Street', nameZh: '茨厂街', nameEn: 'Petaling Street', mapQuery: 'Petaling Street', lat: 3.1438, lng: 101.6964, use: '9/8老城线' },
  { city: '吉隆坡', name: 'Kwai Chai Hong', nameZh: '鬼仔巷', nameEn: 'Kwai Chai Hong', mapQuery: 'Kwai Chai Hong', lat: 3.1431, lng: 101.6972, use: '9/8老城线收尾' },
  { city: '吉隆坡', name: 'Pavilion', nameZh: '柏威年广场', nameEn: 'Pavilion Kuala Lumpur', mapQuery: 'Pavilion Kuala Lumpur', lat: 3.149, lng: 101.713, use: '9/8登塔备选 / 榴莲' },
  { city: '吉隆坡', name: 'Batu Caves', nameZh: '黑风洞', nameEn: 'Batu Caves', mapQuery: 'Batu Caves', lat: 3.2379, lng: 101.684, use: '9/9上午' },
  { city: '吉隆坡', name: 'KUL T2', nameZh: '吉隆坡国际机场 T2', nameEn: 'Kuala Lumpur International Airport · Terminal 2', mapQuery: 'Kuala Lumpur International Airport Terminal 2', lat: 2.7447, lng: 101.689, use: '9/9飞亚庇' },
  { city: '亚庇', name: 'BKI', nameZh: '亚庇国际机场', nameEn: 'Kota Kinabalu International Airport', mapQuery: 'Kota Kinabalu International Airport', lat: 5.937, lng: 116.051, use: '9/9抵达 / 9/13返程' },
  { city: '亚庇', name: 'Sheraton', nameZh: '亚庇喜来登酒店', nameEn: 'Sheraton Kota Kinabalu', mapQuery: 'Sheraton Kota Kinabalu', lat: 5.976, lng: 116.074, use: '9/9—9/11入住' },
  { city: '亚庇', name: 'Hyatt Centric', nameZh: '亚庇凯悦尚萃酒店', nameEn: 'Hyatt Centric Kota Kinabalu', mapQuery: 'Hyatt Centric Kota Kinabalu', lat: 5.9833, lng: 116.076, use: '9/11—9/13入住' },
  { city: '亚庇', name: 'South Jetty, KK Port', nameZh: '南码头（亚庇港）', nameEn: 'South Jetty, Kota Kinabalu Port', mapQuery: 'South Jetty Kota Kinabalu Port', lat: 5.978, lng: 116.0732, use: '2026临时码头 / TARP出发' },
  { city: '亚庇', name: 'Gaya Street', nameZh: '加雅街', nameEn: 'Gaya Street', mapQuery: 'Gaya Street', lat: 5.984, lng: 116.075, use: '9/11市区休闲' },
  { city: '亚庇', name: 'Tanjung Aru', nameZh: '丹绒亚路海滩', nameEn: 'Tanjung Aru Beach', mapQuery: 'Tanjung Aru Beach', lat: 5.946, lng: 116.044, use: '约18:17日落' },
  { city: '亚庇', name: 'KK Waterfront', nameZh: '亚庇海滨', nameEn: 'KK Waterfront', mapQuery: 'KK Waterfront', lat: 5.978, lng: 116.078, use: '海鲜 / 夜景 / 备选' },
  { city: '亚庇', name: 'Klias Mangrove', nameZh: 'Klias红树林', nameEn: 'Klias Wetlands', mapQuery: 'Klias Wetlands', lat: 5.53, lng: 115.75, use: 'Klias长鼻猴 / 萤火虫' },
]
