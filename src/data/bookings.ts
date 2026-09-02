export type BookingItem = {
  id: string
  title: string
  timing: string
  status: 'must' | 'recommended' | 'check'
  channel: string
  link: string
  note: string
  fee?: string
}

export const bookingItems: BookingItem[] = [
  {
    id: 'mdac',
    title: '马来西亚数字入境卡（MDAC）',
    timing: '9/5或9/6完成',
    status: 'must',
    channel: '马来西亚移民局官方',
    link: 'https://imigresen-online.imi.gov.my/mdac/main',
    note: '提交后截图、PDF、纸质各备一份；官方政策以最新页面为准。',
  },
  {
    id: 'petronas',
    title: '吉隆坡双子塔',
    timing: '9/8登塔前至少15分钟 Check-in / 入场确认',
    status: 'must',
    channel: 'PETRONAS官方售票',
    link: 'https://eticket.petronastwintowers.com/',
    note: '按预约时段入场；没有合适时段就执行柏威年广场（Pavilion）备选方案。',
    fee: '价格以官方售票页实时显示为准',
  },
  {
    id: 'mengalum',
    title: '环滩岛',
    timing: '至少提前2—3天订，前一晚确认',
    status: 'must',
    channel: '运营商订单 / Klook搜索',
    link: 'https://www.klook.com/zh-CN/search/?query=Mengalum%20Island',
    note: '最终接送时间、码头、取消 / 改期和午餐以运营商前一晚确认消息为准。',
  },
  {
    id: 'klias',
    title: 'Klias红树林',
    timing: '提前1—3天订，前一晚确认',
    status: 'recommended',
    channel: '运营商订单 / Klook搜索',
    link: 'https://www.klook.com/zh-CN/search/?query=Klias%20Mangrove',
    note: '约13:30接，约21:00—21:30返回；可舍弃，不与TARP同一天。',
  },
  {
    id: 'tarp',
    title: '东姑阿都拉曼海洋公园 TARP · 沙比岛＋马努干岛',
    timing: '提前1天确认船班和海况',
    status: 'recommended',
    channel: '南码头（South Jetty）现场 / Sabah Parks',
    link: 'https://www.sabahparks.org.my/',
    note: '2026临时码头：南码头（South Jetty, Kota Kinabalu Port）；最晚返程船约16:00。',
    fee: '成人船票约RM58/人；保护区费RM25/人/天；2026-09-01核验，现场以官方为准',
  },
]
