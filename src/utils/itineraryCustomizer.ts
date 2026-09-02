import type { DayPlan, ItineraryItem, Replaceability, SlotType } from '../data/itinerary'
import type { AlternativeAttraction } from '../data/alternatives'
import { alternativeAttractions } from '../data/alternatives'
import { estimateReplacementRoute, formatTime, parseTime, zoneForItem, cityForItem, durationMinutes } from './routeEstimator'
import { checkReplacement } from './itineraryConflictChecker'

export type OverrideAction = 'replace' | 'remove' | 'insert' | 'move'

export type ItineraryOverride = {
  date: string
  slotId: string
  action: OverrideAction
  attractionId?: string
  anchorSlotId?: string
  targetSlotId?: string
  startTime?: string
  removedTitle?: string
  createdAt?: string
}

const fixedIds = new Set(['d7-1', 'd7-2', 'd7-3', 'd9-2', 'd9-3', 'd9-4', 'd9-5', 'd11-fixed', 'd13-1'])

export function getItemSlotId(item: Pick<ItineraryItem, 'id' | 'slotId'>): string {
  if (item.slotId) return item.slotId
  if (item.id === 'd8-1') return 'central-market'
  if (item.id === 'd8-3') return 'petronas-or-pavilion'
  return item.id
}

export function getItemReplaceability(item: Pick<ItineraryItem, 'id' | 'title' | 'reservationStatus' | 'replaceability'>): Replaceability {
  if (item.replaceability) return item.replaceability
  if (fixedIds.has(item.id) || /航班|机场|换酒店|退房|行李先行|入境检查/i.test(item.title)) return 'fixed'
  if (item.reservationStatus === 'booked' && /交通|酒店/i.test(item.title)) return 'fixed'
  if (/黑风洞|环滩岛|TARP|红树林|双子塔登塔/i.test(item.title)) return 'major'
  if (/午休|泳池|海鲜|榴莲|入住/i.test(item.title)) return 'fixed'
  return 'flexible'
}

export function getItemSlotType(item: Pick<ItineraryItem, 'title' | 'duration' | 'slotType'>): SlotType {
  if (item.slotType) return item.slotType
  if (/全天|远海|红树林|环滩|TARP/i.test(item.title)) return 'full-day'
  if (/3小时|4小时|半天/i.test(item.duration ?? '')) return 'half-day'
  return 'short'
}

export function withDefaultItemMeta(item: ItineraryItem): ItineraryItem {
  const slotId = getItemSlotId(item)
  return {
    ...item,
    slotId,
    replaceability: getItemReplaceability(item),
    slotType: getItemSlotType(item),
    source: item.source ?? 'default',
    zone: item.zone ?? zoneForItem(item),
  }
}

function dateToIso(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const day = date.split('/')[1]?.padStart(2, '0') ?? '01'
  return `2026-09-${day}`
}

function formatDuration(minutes: number) {
  if (minutes >= 60 && minutes % 60 === 0) return `约${minutes / 60}小时`
  if (minutes > 60) return `约${Math.floor(minutes / 60)}小时${minutes % 60}分钟`
  return `约${minutes}分钟`
}

export function createAlternativeItineraryItem(date: string, slotId: string, candidate: AlternativeAttraction, current: ItineraryItem, previous?: ItineraryItem, next?: ItineraryItem): ItineraryItem {
  const route = estimateReplacementRoute(current, candidate, previous, next)
  const start = parseTime(current.time)
  const arrival = start + route.candidate.minutes
  const dateTime = `${dateToIso(date)}T${formatTime(start)}:00+08:00`
  const from = previous?.to ?? current.from ?? '上一项行程地点'
  const mode = route.candidate.mode
  return {
    id: `${date}-${slotId}-custom-${candidate.id}`,
    slotId,
    source: 'custom',
    alternativeId: candidate.id,
    time: formatTime(start),
    title: candidate.nameZh,
    summary: candidate.shortDescription,
    details: [candidate.description, `区域：${candidate.area} · 预计游览${formatDuration(candidate.durationMin)}`, `路线估算：${route.candidate.note}`, ...candidate.recommendationReasons.map(reason => `为什么去：${reason}`)],
    dateTime,
    tone: candidate.physicalLoad === 'high' ? 'warning' : '',
    image: candidate.images[0]?.src,
    galleryPlaceId: `alternative:${candidate.id}`,
    from,
    to: candidate.nameZh,
    transportMode: mode,
    distance: `约${route.candidate.distanceKm}km（静态估算）`,
    duration: formatDuration(candidate.durationMin),
    recommendedDepartureTime: `${formatTime(Math.max(0, start - route.candidate.minutes))} 左右从上一项出发`,
    arrivalTime: formatTime(arrival),
    buffer: candidate.bookingRequired ? '预约 / 报到需额外预留 20—30 分钟' : '保留约 15 分钟找路和补水缓冲',
    reservationStatus: candidate.bookingRequired ? 'must' : 'none',
    reservationTiming: candidate.bookingRequired ? candidate.bookingRecommendation : undefined,
    bookingChannel: candidate.bookingRequired ? '候选景点官方页面 / 运营商' : undefined,
    bookingLink: candidate.bookingRequired ? candidate.sourceUrl : undefined,
    ticketOrFee: '门票 / 费用以官方页面或现场实时信息为准',
    whatToBring: ['手机充电宝', candidate.environment === 'outdoor' || candidate.environment === 'mixed' ? '防晒与饮用水' : '轻便衣物'],
    dressCode: candidate.category === 'religion' ? '进入宗教场所按现场要求遮肩、过膝并脱鞋。' : undefined,
    weatherRisk: candidate.rainyDayFit === 'poor' ? '纯户外项目，雷雨或大雨时执行室内 / 酒店 Plan B。' : candidate.rainyDayFit === 'excellent' ? '雨天友好，但仍以官方开放状态为准。' : '天气变化时按现场开放和交通情况调整。',
    fallbackPlan: '若关闭、预约失败或体力不足，回到同区域室内休息 / 咖啡，不强行补景点。',
    onSiteSteps: ['打开官方订单或景点页面，确认当天开放', '到入口 / 集合点核对预约、人数和入场规则', '完成游览后按下一项时间和路线继续行程'],
    notes: `${candidate.recommendationReasons[0] ?? '按候选景点资料安排'}；路线为区域＋距离静态估算，当天以 Grab / Google Maps 为准。`,
    verifiedAt: candidate.verifiedAt,
    sourceName: candidate.sourceName,
    sourceLink: candidate.sourceUrl,
    mapTarget: candidate.mapQuery,
    replaceability: 'flexible',
    slotType: candidate.timeScope,
    zone: candidate.area,
    routeMinutes: route.candidate.minutes,
    nextRouteMinutes: route.next.minutes,
    environment: candidate.environment,
    sunExposure: candidate.sunExposure,
  }
}

export function recalculateItineraryItems(items: ItineraryItem[]): ItineraryItem[] {
  let previousEnd = 0
  return items.map((item, index) => {
    const originalStart = parseTime(item.time)
    const isFixed = getItemReplaceability(item) === 'fixed'
    const start = index === 0 || isFixed ? originalStart : Math.max(originalStart, previousEnd)
    const shifted = start !== originalStart
    const nextItem = shifted
      ? { ...item, time: formatTime(start), dateTime: item.dateTime.replace(/T\d{2}:\d{2}/, `T${formatTime(start)}`), recommendedDepartureTime: item.recommendedDepartureTime ? `${formatTime(Math.max(0, start - 15))} 左右` : item.recommendedDepartureTime }
      : item
    previousEnd = start + durationMinutes(item) + (item.nextRouteMinutes ?? 0)
    return nextItem
  })
}

export function applyItineraryOverrides(days: DayPlan[], overrides: ItineraryOverride[], candidates: Record<string, AlternativeAttraction>): DayPlan[] {
  return days.map(day => {
    const dayOverrides = overrides.filter(override => override.date === day.date)
    if (!dayOverrides.length) return { ...day, items: day.items.map(withDefaultItemMeta) }
    let items = day.items.map(withDefaultItemMeta)
    dayOverrides.forEach(override => {
      const index = items.findIndex(item => getItemSlotId(item) === override.slotId || item.id === override.slotId)
      const candidate = override.attractionId ? candidates[override.attractionId] : undefined
      if (override.action === 'replace' && candidate && index >= 0) {
        items[index] = createAlternativeItineraryItem(day.date, override.slotId, candidate, items[index], items[index - 1], items[index + 1])
      }
      if (override.action === 'remove' && index >= 0 && getItemReplaceability(items[index]) !== 'fixed') items.splice(index, 1)
      if (override.action === 'insert' && candidate) {
        const anchorIndex = override.anchorSlotId ? items.findIndex(item => getItemSlotId(item) === override.anchorSlotId || item.id === override.anchorSlotId) : index
        const insertAt = anchorIndex >= 0 ? anchorIndex + 1 : items.length
        const anchor = items[Math.max(0, insertAt - 1)] ?? items[0]
        const insertContext = override.startTime && anchor ? { ...anchor, time: override.startTime } : anchor
        items.splice(insertAt, 0, createAlternativeItineraryItem(day.date, override.slotId, candidate, insertContext, items[insertAt - 1], items[insertAt]))
      }
    })
    dayOverrides.filter(override => override.action === 'move').forEach(override => {
      const sourceIndex = items.findIndex(item => getItemSlotId(item) === override.slotId || item.id === override.slotId)
      const targetIndex = override.targetSlotId ? items.findIndex(item => getItemSlotId(item) === override.targetSlotId || item.id === override.targetSlotId) : -1
      if (sourceIndex < 0 || targetIndex < 0 || getItemReplaceability(items[sourceIndex]) === 'fixed' || getItemReplaceability(items[targetIndex]) === 'fixed') return
      const [moved] = items.splice(sourceIndex, 1)
      items.splice(Math.max(0, targetIndex), 0, moved)
    })
    return { ...day, items: recalculateItineraryItems(items) }
  })
}

export function upsertOverride(overrides: ItineraryOverride[], next: ItineraryOverride): ItineraryOverride[] {
  const sameSlot = (item: ItineraryOverride) => item.date === next.date && item.slotId === next.slotId
  const filtered = overrides.filter(item => {
    if (!sameSlot(item)) return true
    // Replacement/removal and reordering are independent dimensions of the
    // custom layer, so updating one must not erase the other.
    return next.action === 'move' ? item.action !== 'move' : item.action === 'move'
  })
  return [...filtered, { ...next, createdAt: next.createdAt ?? new Date().toISOString() }]
}

export function restoreSlot(overrides: ItineraryOverride[], date: string, slotId: string) {
  return overrides.filter(item => !(item.date === date && item.slotId === slotId))
}

export function restoreDay(overrides: ItineraryOverride[], date: string) {
  return overrides.filter(item => item.date !== date)
}

export type ReplacementCandidate = {
  candidate: AlternativeAttraction
  report: ReturnType<typeof checkReplacement>
}

export function replacementCandidates(item: ItineraryItem, items: ItineraryItem[], weather?: 'good' | 'okay' | 'bad', date = ''): ReplacementCandidate[] {
  const currentSlot = getItemSlotId(item)
  const currentSlotType = getItemSlotType(item)
  const city = cityForItem(item)
  const previous = items[items.findIndex(entry => entry.id === item.id) - 1]
  const next = items[items.findIndex(entry => entry.id === item.id) + 1]
  return alternativeAttractions
    .filter(candidate => candidate.city === city)
    .filter(candidate => candidate.id !== item.alternativeId)
    .filter(candidate => candidate.images.length > 0)
    .filter(candidate => {
      const targetMatch = candidate.replacementTargets.some(target => target === currentSlot || target === item.id || (target === 'sabah-main' && currentSlot.startsWith('sabah-main')) || item.title.includes(target))
      const slotMatch = candidate.compatibleSlotTypes.some(slot => slot === currentSlotType || (currentSlotType === 'half-day' && slot === 'short'))
      return slotMatch && (targetMatch || item.source === 'custom')
    })
    .map(candidate => ({ candidate, report: checkReplacement({ date, current: item, candidate, previous, next, existingItems: items, weather }) }))
    .sort((a, b) => {
      const rank = (entry: ReplacementCandidate) => (entry.report.canConfirm ? 100 : 0) + (entry.report.route.quality === 'green' ? 20 : entry.report.route.quality === 'yellow' ? 10 : 0) + entry.candidate.tripFitScore * 5 + entry.candidate.attractionScore
      return rank(b) - rank(a)
    })
}
