export type ChecklistGroup = { id: string; label: string; icon: string; items: string[] }
export const checklistGroups: ChecklistGroup[] = [
  { id: 'documents', label: '证件', icon: '▣', items: ['护照', '护照资料页照片', 'MDAC', '三段机票', '三家酒店订单', '保险', '出海订单'] },
  { id: 'payment', label: '支付', icon: '◈', items: ['招行全币种 Visa', 'ZA Visa', '支付宝', '微信', 'RM600—1000', '两张卡分开放'] },
  { id: 'phone', label: '手机', icon: '⌁', items: ['Grab', 'Google Maps', 'Google Translate', 'WhatsApp', 'myCuaca', 'eSIM', '中国手机号短信'] },
  { id: 'ocean', label: '出海', icon: '◒', items: ['泳衣', '水母服', 'SPF50+', '墨镜', '帽子', '防水手机袋', '干湿分离袋', '洞洞鞋 / 沙滩鞋', '晕船药', '驱蚊液'] },
  { id: 'electronic', label: '电子', icon: '⌁', items: ['Type G 转换插头', '充电器', '数据线', '充电宝', '耳机'] },
  { id: 'medicine', label: '药物', icon: '+', items: ['肠胃药', '止泻药', '退烧止痛', '抗过敏', '创可贴', '长期药'] },
  { id: 'special', label: '2026 特殊', icon: '✦', items: ['KN95 / N95', '查看烟霾', '查看海况', '确定环滩日期'] },
]
