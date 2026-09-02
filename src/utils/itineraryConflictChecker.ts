import type { ItineraryItem, Replaceability, SlotType } from '../data/itinerary'
import type { AlternativeAttraction } from '../data/alternatives'
import { endTime, estimateReplacementRoute, formatTime, parseTime, type ReplacementRoute } from './routeEstimator'

export type ConflictSeverity = 'none' | 'warning' | 'blocked'

export type ConflictReport = {
  canConfirm: boolean
  severity: ConflictSeverity
  blockers: string[]
  warnings: string[]
  route: ReplacementRoute
  nextTime?: string
}

export type ReplacementContext = {
  date: string
  current: ItineraryItem
  candidate: AlternativeAttraction
  previous?: ItineraryItem
  next?: ItineraryItem
  existingItems?: ItineraryItem[]
  weather?: 'good' | 'okay' | 'bad'
}

function fallbackReplaceability(item: Pick<ItineraryItem, 'id' | 'title' | 'reservationStatus'>): Replaceability {
  if (['d7-1', 'd7-2', 'd7-3', 'd9-2', 'd9-3', 'd9-4', 'd9-5', 'd11-fixed', 'd13-1'].includes(item.id)) return 'fixed'
  if (item.reservationStatus === 'booked' && /航班|机场|换酒店|退房|行李/i.test(item.title)) return 'fixed'
  if (/环滩|TARP|红树林|黑风洞|双子塔登塔/i.test(item.title)) return 'major'
  return 'flexible'
}

function fallbackSlotType(item: Pick<ItineraryItem, 'slotType' | 'duration' | 'title'>): SlotType {
  if (item.slotType) return item.slotType
  if (/全天|远海|红树林|环滩|TARP/i.test(item.title)) return 'full-day'
  const duration = item.duration ?? ''
  if (/3小时|4小时|半天/i.test(duration)) return 'half-day'
  return 'short'
}

function slotCanFit(current: SlotType, candidate: AlternativeAttraction): boolean {
  return candidate.compatibleSlotTypes.some(slot => slot === current || (current === 'half-day' && slot === 'short'))
}

function weatherWarning(candidate: AlternativeAttraction, weather?: ReplacementContext['weather']): string | undefined {
  if (!weather) return undefined
  if (weather === 'bad' && candidate.rainyDayFit === 'poor') return '当天海况 / 天气偏差，纯户外项目不适合直接替换；建议先选室内或混合场所。'
  if (weather === 'bad' && candidate.rainyDayFit === 'excellent') return '雨天友好：室内项目可以作为当天的稳妥 Plan B。'
  return undefined
}

function similarityWarning(candidate: AlternativeAttraction, existingItems: ItineraryItem[] = []): string | undefined {
  const text = existingItems.map(item => item.title).join(' ')
  if (candidate.id === 'kl-tower' && /双子塔|Petronas/i.test(text)) return '已有双子塔登塔；两个项目都以城市高空观景为主，体验存在一定重复。'
  if (['sepanggar-island', 'north-borneo-sunset-cruise'].includes(candidate.id) && /环滩|TARP|海岛|日落/i.test(text)) return '当天已经有海岛或日落主题，新增水上体验会压缩休息时间，建议只保留一个主体验。'
  if (candidate.timeScope === 'full-day' && /环滩|TARP|红树林/i.test(text)) return '已有完整海岛 / 红树林窗口；高地全天线会占用另一个完整天气窗口。'
  return undefined
}

export function checkReplacement(context: ReplacementContext): ConflictReport {
  const { date, current, candidate, previous, next, existingItems = [], weather } = context
  const blockers: string[] = []
  const warnings: string[] = []
  const replaceability = current.replaceability ?? fallbackReplaceability(current)
  const currentSlot = fallbackSlotType(current)
  const route = estimateReplacementRoute(current, candidate, previous, next)

  if (replaceability === 'fixed') blockers.push('这是固定事项，航班、机场、酒店切换或已确认交通不能替换。')
  if (date === '9/13') blockers.push('9/13 是 09:20 国际航班返程日，早晨不安排新增景点。')
  if (!slotCanFit(currentSlot, candidate)) blockers.push(`${candidate.timeScope === 'full-day' ? '全天' : candidate.timeScope === 'half-day' ? '半日' : '短时'}项目与当前${currentSlot === 'full-day' ? '全天' : currentSlot === 'half-day' ? '半日' : '短时'}槽位不匹配，请选择同等时间段。`)
  if (candidate.timeScope === 'full-day' && currentSlot !== 'full-day') blockers.push('全天项目不能塞进当前小时级 / 半日槽位；请替换完整游玩日或大型活动。')
  if (candidate.timeScope === 'half-day' && currentSlot === 'short') blockers.push('半日项目不能塞进当前短时槽位；请换同等半日项目。')
  const currentIsFullDay = currentSlot === 'full-day'
  const fullDaySwap = currentIsFullDay && candidate.timeScope === 'full-day'
  if (route.quality === 'red') {
    if (fullDaySwap) warnings.push(`这是全天换全天：${route.next.note} 请把它当作独立天气窗口，不能与另一项全天活动同日硬拼。`)
    else blockers.push(route.next.note)
  }

  const candidateStart = parseTime(current.time)
  const candidateEnd = candidateStart + candidate.durationMin + route.next.minutes
  if (next && next.replaceability === 'fixed' && candidateEnd > parseTime(next.time)) {
    blockers.push(`会压到下一固定事项（${next.time} ${next.title}）；至少需要保留固定节点前的交通与办理缓冲。`)
  }
  if (next && next.replaceability !== 'fixed' && candidateEnd > parseTime(next.time)) {
    warnings.push(`预计下一项将从 ${next.time} 顺延至 ${formatTime(candidateEnd)}，后续普通事项会一起重排。`)
  }
  if (candidate.bookingRequired) warnings.push(candidate.bookingRecommendation ?? '这个候选需要提前确认预约、场次和取消政策。')
  if (candidate.openingHours) warnings.push(`营业时间：${candidate.openingHours}`)
  if (candidate.recommendedTime !== 'any' && candidate.recommendedTime !== 'morning' && candidateStart < 12 * 60) warnings.push('候选更适合下午 / 晚上，当前槽位较早，请确认营业与光线条件。')
  if (candidate.physicalLoad === 'high') warnings.push('体力负荷较高；当前旅行偏好是不特种兵，建议减少同日其他户外段。')
  if (candidate.sunExposure === 'high') warnings.push('户外暴晒较强，建议补水、防晒，并避免连续叠加 3 小时以上户外活动。')
  const weatherNote = weatherWarning(candidate, weather)
  if (weatherNote) warnings.push(weatherNote)
  const duplicateNote = similarityWarning(candidate, existingItems)
  if (duplicateNote) warnings.push(duplicateNote)

  return {
    canConfirm: blockers.length === 0,
    severity: blockers.length ? 'blocked' : warnings.length ? 'warning' : 'none',
    blockers,
    warnings,
    route,
    nextTime: next ? formatTime(candidateEnd) : undefined,
  }
}

export type InsertContext = {
  date: string
  startTime: string
  durationMin: number
  slotType: SlotType
  nextFixedTime?: string
  routeMinutes?: number
}

export function checkInsertion(context: InsertContext) {
  const blockers: string[] = []
  const warnings: string[] = []
  const start = parseTime(context.startTime)
  const end = start + context.durationMin + (context.routeMinutes ?? 0)
  if (context.date === '9/13') blockers.push('返程日 09:20 国际航班前不允许增加景点。')
  if (context.durationMin >= 360 && context.slotType !== 'full-day') blockers.push('全天项目只能放入完整游玩日或全天槽位。')
  if (context.nextFixedTime && end > parseTime(context.nextFixedTime)) blockers.push(`会错过下一固定事项（${context.nextFixedTime}）；当前日期没有舒服的可用时间。`)
  if (context.date === '9/9' && end > 14 * 60 + 30) blockers.push('9/9 16:30 KUL → BKI 航班前，至少保留 2 小时机场办理缓冲。')
  if (end - start > 180) warnings.push('单个活动超过 3 小时，请确认补水、遮阴和中途休息。')
  return { canConfirm: blockers.length === 0, blockers, warnings, endTime: formatTime(end) }
}

export type DayLoadAssessment = {
  hours: number
  label: '舒服' | '偏满' | '不建议'
  warnings: string[]
}

export function assessDayLoad(items: ItineraryItem[]): DayLoadAssessment {
  const sorted = [...items].sort((a, b) => parseTime(a.time) - parseTime(b.time))
  const activeMinutes = sorted.reduce((sum, item) => sum + Math.max(0, endTime(item) - parseTime(item.time)), 0)
  const hours = Math.round(activeMinutes / 60 * 10) / 10
  const warnings: string[] = []
  if (hours > 9) warnings.push('当天有效游玩＋交通超过 9 小时，不建议。')
  else if (hours > 7) warnings.push('当天有效游玩＋交通约 7—9 小时，偏满。')
  const outdoor = sorted.filter(item => item.sunExposure === 'high' || item.environment === 'outdoor')
  const outdoorMinutes = outdoor.reduce((sum, item) => sum + Math.max(0, endTime(item) - parseTime(item.time)), 0)
  if (outdoorMinutes > 180) warnings.push('连续户外时间较长，建议插入商场、咖啡或酒店午休。')
  return { hours, label: hours > 9 ? '不建议' : hours > 7 ? '偏满' : '舒服', warnings }
}
