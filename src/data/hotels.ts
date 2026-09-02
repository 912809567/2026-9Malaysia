export type Hotel = { nameZh: string; nameEn: string; mapQuery: string; dates: string; address?: string; tags: string[]; note: string; color: string }

export const hotels: Hotel[] = [
  { nameZh: '菲斯时尚酒店', nameEn: 'The FACE Style Hotel', mapQuery: 'The FACE Style Hotel Kuala Lumpur', dates: '9/7—9/9 · 吉隆坡 2 晚', address: '1020 Jalan Sultan Ismail, Kuala Lumpur', tags: ['KLCC', 'Bukit Nanas', '泳池'], note: '不属于武吉免登核心区。距离双子塔约 1.2km，天气炎热时去柏威年广场（Pavilion）/ 阿罗街建议 Grab。', color: 'teal' },
  { nameZh: '亚庇喜来登酒店', nameEn: 'Sheraton Kota Kinabalu', mapQuery: 'Sheraton Kota Kinabalu', dates: '9/9—9/11 · 亚庇 2 晚', tags: ['2026 新酒店', '五星', '泳池', 'SPA', '屋顶酒吧'], note: '没有私人沙滩。', color: 'coral' },
  { nameZh: '亚庇凯悦尚萃酒店', nameEn: 'Hyatt Centric Kota Kinabalu', mapQuery: 'Hyatt Centric Kota Kinabalu', dates: '9/11—9/13 · 亚庇 2 晚', address: '18 Jalan Haji Saman', tags: ['加雅街', '港口', 'Api Api', 'TARP 方便'], note: '市区吃喝方便，换酒店当天先寄存行李再出门。', color: 'sun' },
]
