export type EntryPrepItem = {
  id: string
  title: string
  copy: string
  link?: string
  linkLabel?: string
}

export const entryPrepItems: EntryPrepItem[] = [
  {
    id: 'passport',
    title: '护照有效期',
    copy: '中国普通护照建议至少还有6个月有效期；出发前再次核对签证和入境政策，以马来西亚官方最新信息为准。',
  },
  {
    id: 'offline-docs',
    title: '离线保存四类材料',
    copy: '护照、三段机票、三家酒店订单、旅行保险，分别截图并保存到手机离线文件夹。',
  },
  {
    id: 'mdac-window',
    title: 'MDAC填写时间',
    copy: '9/5起可填，推荐9/5或9/6完成；提交后截图，并在没有网络时也能打开。',
    link: 'https://imigresen-online.imi.gov.my/mdac/main',
    linkLabel: '官方 MDAC 入口',
  },
  {
    id: 'sabah-check',
    title: '沙巴单独入境检查',
    copy: '9/9抵达BKI后先办理沙巴移民检查，再取行李、找Grab；离开柜台前确认护照上的入境记录。',
  },
]
