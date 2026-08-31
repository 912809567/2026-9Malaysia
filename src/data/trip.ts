export const trip = {
  title: 'Malaysia 2026',
  subtitle: '吉隆坡 × 亚庇',
  start: '2026-09-07',
  end: '2026-09-13',
  days: 7,
  nights: 6,
  tags: ['情侣自由行', '第一次出国', '城市＋海岛', '双出海', '榴莲', '不特种兵'],
  route: [
    { code: 'SZX', name: '深圳', tone: 'sand' },
    { code: 'KUL', name: '吉隆坡', tone: 'teal' },
    { code: 'BKI', name: '亚庇', tone: 'coral' },
    { code: 'SZX', name: '深圳', tone: 'sand' },
  ],
}

export function tripStatus(now = new Date()) {
  const start = new Date(`${trip.start}T00:00:00`)
  const end = new Date(`${trip.end}T23:59:59`)
  const diff = Math.ceil((start.getTime() - now.getTime()) / 86400000)
  if (now < start) return { label: `距离出发还有 ${diff} 天`, kind: 'before' as const }
  if (now <= end) {
    const day = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1
    return { label: `旅行 Day ${day}`, kind: 'during' as const }
  }
  return { label: '旅程已完成', kind: 'after' as const }
}
