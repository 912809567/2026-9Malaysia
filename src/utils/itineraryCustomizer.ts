import type { DayPlan, ItineraryItem, Replaceability, SlotType } from '../data/itinerary'
import type { AlternativeAttraction } from '../data/alternatives'
import { alternativeAttractions } from '../data/alternatives'
import { estimateReplacementRoute, formatTime, parseTime, zoneForItem, cityForItem, durationMinutes } from './routeEstimator'
import { estimateTravel, type TravelCity, type TravelEstimate } from '../data/travelZones'
import { checkInsertion, checkReplacement, getOutdoorBlocks } from './itineraryConflictChecker'

export type OverrideAction = 'replace' | 'remove' | 'insert' | 'move'

export type ItineraryOverride = {
  date: string
  slotId: string
  action: OverrideAction
  attractionId?: string
  anchorSlotId?: string
  /** 首项之前插入时使用；有 anchorSlotId 时表示插在 anchor 之后。 */
  beforeSlotId?: string
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
  const replaceability = getItemReplaceability(item)
  const itemKind = item.itemKind ?? (replaceability === 'fixed' && /航班|机场|入境|换酒店|退房/i.test(item.title) ? 'fixed-event' : /→|出发|返回|取行李/i.test(item.title) ? 'transport' : 'activity')
  return {
    ...item,
    slotId,
    replaceability,
    itemKind,
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
  // 活动 Timeline 时间统一表示抵达景点并开始游览；前往交通单独放在建议出发字段。
  const activityStart = parseTime(current.time)
  const dateTime = dateToIso(date) + 'T' + formatTime(activityStart) + ':00+08:00'
  const from = previous?.to ?? current.from ?? '上一项行程地点'
  const mode = route.candidate.mode
  return {
    id: date + '-' + slotId + '-custom-' + candidate.id,
    slotId,
    source: 'custom',
    alternativeId: candidate.id,
    itemKind: 'activity',
    time: formatTime(activityStart),
    title: candidate.nameZh,
    summary: candidate.shortDescription,
    details: [candidate.description, '区域：' + candidate.area + ' · 预计游览' + formatDuration(candidate.durationMin), 'Timeline时间 = ' + formatTime(activityStart) + ' 抵达并开始游览', '路线估算：' + route.candidate.note, ...candidate.recommendationReasons.map(reason => '为什么去：' + reason)],
    dateTime,
    tone: candidate.physicalLoad === 'high' ? 'warning' : '',
    image: candidate.images[0]?.src,
    galleryPlaceId: 'alternative:' + candidate.id,
    from,
    to: candidate.nameZh,
    transportMode: mode,
    distance: '约' + route.candidate.distanceKm + 'km（静态估算）',
    duration: formatDuration(candidate.durationMin),
    recommendedDepartureTime: formatTime(Math.max(0, activityStart - route.candidate.minutes)) + ' 左右从上一项出发',
    arrivalTime: formatTime(activityStart) + ' 抵达并开始游览',
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
    notes: (candidate.recommendationReasons[0] ?? '按候选景点资料安排') + '；路线为区域＋距离静态估算，当天以 Grab / Google Maps 为准。',
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
      ? {
          ...item,
          time: formatTime(start),
          dateTime: item.dateTime.replace(/T\d{2}:\d{2}/, 'T' + formatTime(start)),
          recommendedDepartureTime: item.itemKind === 'activity' && item.routeMinutes !== undefined
            ? formatTime(Math.max(0, start - item.routeMinutes)) + ' 左右从上一项出发'
            : item.recommendedDepartureTime ? formatTime(Math.max(0, start - 15)) + ' 左右' : item.recommendedDepartureTime,
          arrivalTime: item.itemKind === 'activity' ? formatTime(start) + ' 抵达并开始游览' : item.arrivalTime,
        }
      : item
    // previousEnd follows the same convention used by inserted custom items:
    // activity start + visit + outgoing route/buffer; fixed events retain their slot.
    previousEnd = start + durationMinutes(nextItem) + (nextItem.nextRouteMinutes ?? 0)
    return nextItem
  })
}
export type InsertionGap = {
  startTime: string
  endTime: string
  nextTime?: string
  anchorSlotId?: string
  beforeSlotId?: string
  score: number
  routeQuality: TravelEstimate['quality']
  routeToCandidate: TravelEstimate
  routeToNext?: TravelEstimate
  reasons: string[]
  report: ReturnType<typeof checkInsertion>
}

const cityStartZone: Record<TravelCity, 'KLCC' | 'Gaya / City Centre'> = {
  'kuala-lumpur': 'KLCC',
  'kota-kinabalu': 'Gaya / City Centre',
}

function gapItemEnd(item: ItineraryItem) {
  return parseTime(item.time) + durationMinutes(item) + (item.nextRouteMinutes ?? 0)
}

export function cityForInsertionGap(previous?: ItineraryItem, next?: ItineraryItem): TravelCity {
  if (previous && next) {
    const previousCity = cityForItem(previous)
    const nextCity = cityForItem(next)
    // The gap before a cross-city transport belongs to the city being left.
    return previousCity === nextCity ? previousCity : previousCity
  }
  if (previous) return cityForItem(previous)
  if (next) return cityForItem(next)
  return 'kuala-lumpur'
}

function preferredGapStart(candidate: AlternativeAttraction) {
  if (candidate.timeScope === 'full-day' || candidate.recommendedTime === 'morning') return 8 * 60
  if (candidate.recommendedTime === 'afternoon') return 14 * 60
  if (candidate.recommendedTime === 'evening') return 17 * 60
  if (candidate.recommendedTime === 'night') return 19 * 60
  return 12 * 60
}

function qualityRank(quality: TravelEstimate['quality']) {
  return quality === 'green' ? 3 : quality === 'yellow' ? 2 : 1
}

function isRecommendedTime(candidate: AlternativeAttraction, start: number) {
  const hour = start / 60
  if (candidate.recommendedTime === 'any') return true
  if (candidate.recommendedTime === 'morning') return hour >= 7 && hour < 12
  if (candidate.recommendedTime === 'afternoon') return hour >= 12 && hour < 17
  if (candidate.recommendedTime === 'evening') return hour >= 16 && hour < 20
  return hour >= 18
}

function insertionSimilarityPenalty(candidate: AlternativeAttraction, items: ItineraryItem[]) {
  const text = items.map(item => item.title).join(' ')
  if (candidate.id === 'kl-tower' && /双子塔|Petronas/i.test(text)) return 18
  if (['sepanggar-island', 'north-borneo-sunset-cruise'].includes(candidate.id) && /环滩|TARP|海岛|日落/i.test(text)) return 18
  if (candidate.timeScope === 'full-day' && /环滩|TARP|红树林/i.test(text)) return 24
  return 0
}

export function findBestInsertionGaps(items: ItineraryItem[], candidate: AlternativeAttraction, date: string, weather?: 'good' | 'okay' | 'bad'): InsertionGap[] {
  if (date === '9/13') return []
  // 9/9 航班后虽已进入亚庇，但入境、取行李、进城和入住没有舒服的正式景点空档。
  if (date === '9/9' && candidate.city === 'kota-kinabalu') return []
  const sorted = [...items].sort((a, b) => parseTime(a.time) - parseTime(b.time))
  const results: InsertionGap[] = []
  for (let gapIndex = -1; gapIndex < sorted.length; gapIndex += 1) {
    const previous = gapIndex >= 0 ? sorted[gapIndex] : undefined
    const next = gapIndex + 1 < sorted.length ? sorted[gapIndex + 1] : undefined
    // A gap between two cities is the flight / intercity transfer itself, not
    // free time. Never place a candidate inside that boundary.
    if (previous && next && cityForItem(previous) !== cityForItem(next)) continue
    const city = cityForInsertionGap(previous, next)
    if (candidate.city !== city) continue
    const origin = previous ? zoneForItem(previous) : cityStartZone[city]
    const routeToCandidate = estimateTravel(city, origin, candidate.area)
    const routeToNext = next ? estimateTravel(city, candidate.area, zoneForItem(next)) : estimateTravel(city, candidate.area, candidate.area)
    const buffer = candidate.bookingRequired ? 25 : 15
    const earliest = (previous ? gapItemEnd(previous) : 7 * 60) + routeToCandidate.minutes
    const latest = (next ? parseTime(next.time) : 21 * 60 + 30) - routeToNext.minutes - buffer - candidate.durationMin
    if (latest < earliest) continue
    const preferred = preferredGapStart(candidate)
    const start = Math.min(Math.max(earliest, preferred), latest)
    const nextFixed = sorted.slice(Math.max(0, gapIndex + 1)).find(item => getItemReplaceability(item) === 'fixed')
    const report = checkInsertion({
      date,
      startTime: formatTime(start),
      durationMin: candidate.durationMin,
      slotType: candidate.timeScope,
      nextFixedTime: nextFixed?.time,
      routeMinutes: routeToNext.minutes + buffer,
      candidate,
    })
    if (!report.canConfirm) continue
    const quality = qualityRank(routeToCandidate.quality) <= qualityRank(routeToNext.quality) ? routeToCandidate.quality : routeToNext.quality
    if (quality === 'red') continue
    const temporary = {
      id: 'insertion-candidate',
      time: formatTime(start),
      title: candidate.nameZh,
      summary: candidate.shortDescription,
      details: [],
      dateTime: dateToIso(date) + 'T' + formatTime(start) + ':00+08:00',
      duration: formatDuration(candidate.durationMin),
      environment: candidate.environment,
      sunExposure: candidate.sunExposure,
    } as ItineraryItem
    const dayMinutes = sorted.reduce((sum, item) => sum + durationMinutes(item) + (item.routeMinutes ?? 0), 0) + candidate.durationMin + routeToCandidate.minutes + routeToNext.minutes
    const outdoorMinutes = Math.max(...getOutdoorBlocks([...sorted, temporary]).map(block => block.minutes), 0)
    let score = candidate.tripFitScore * 10 + candidate.attractionScore * 3
    score += isRecommendedTime(candidate, start) ? 30 : -8
    score += quality === 'green' ? 24 : 9
    score -= routeToCandidate.minutes + routeToNext.minutes
    score -= dayMinutes > 540 ? 38 : dayMinutes > 420 ? 14 : 0
    score -= outdoorMinutes > 180 ? 24 : 0
    score -= insertionSimilarityPenalty(candidate, sorted)
    if (nextFixed && parseTime(nextFixed.time) - start < 90) score -= 20
    if (weather === 'bad') score += candidate.rainyDayFit === 'excellent' ? 18 : candidate.rainyDayFit === 'poor' ? -24 : 0
    const reasons = [
      isRecommendedTime(candidate, start) ? '符合建议时段' : '虽然不是首选时段，但仍能完整放下',
      quality === 'green' ? '与前后地点顺接' : '路线可安排，但需要额外交通缓冲',
      dayMinutes <= 420 ? '当天总量仍在舒服范围' : dayMinutes <= 540 ? '当天会偏满，请不要再增加项目' : '当天总量偏高',
    ]
    if (outdoorMinutes > 180) reasons.push('会拉长连续户外区间')
    if (insertionSimilarityPenalty(candidate, sorted)) reasons.push('与当天已有体验存在重复')
    results.push({
      startTime: formatTime(start),
      endTime: formatTime(start + candidate.durationMin),
      nextTime: next?.time,
      anchorSlotId: previous ? getItemSlotId(previous) : undefined,
      beforeSlotId: previous ? undefined : next ? getItemSlotId(next) : undefined,
      score,
      routeQuality: quality,
      routeToCandidate,
      routeToNext: next ? routeToNext : undefined,
      reasons,
      report,
    })
  }
  return results.sort((a, b) => b.score - a.score)
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
        const beforeIndex = override.beforeSlotId ? items.findIndex(item => getItemSlotId(item) === override.beforeSlotId || item.id === override.beforeSlotId) : -1
        const anchorIndex = override.anchorSlotId ? items.findIndex(item => getItemSlotId(item) === override.anchorSlotId || item.id === override.anchorSlotId) : -1
        const insertAt = beforeIndex >= 0 ? beforeIndex : anchorIndex >= 0 ? anchorIndex + 1 : items.length
        const previous = items[insertAt - 1]
        const next = items[insertAt]
        const context = previous ?? next ?? items[0]
        const insertContext = override.startTime && context ? { ...context, time: override.startTime } : context
        if (insertContext) items.splice(insertAt, 0, createAlternativeItineraryItem(day.date, override.slotId, candidate, insertContext, previous, next))
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
