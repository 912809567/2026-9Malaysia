import type { ItineraryItem } from '../data/itinerary'
import type { AlternativeAttraction } from '../data/alternatives'
import { estimateTravel, type TravelCity, type TravelEstimate, type TravelZone } from '../data/travelZones'

export type ReplacementRoute = {
  city: TravelCity
  origin: TravelZone
  currentZone: TravelZone
  candidateZone: TravelZone
  current: TravelEstimate
  candidate: TravelEstimate
  next: TravelEstimate
  deltaMinutes: number
  quality: TravelEstimate['quality']
}

export function parseTime(value: string | undefined): number {
  if (!value) return 0
  const match = value.match(/(\d{1,2}):(\d{2})/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0
}

export function formatTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.round(totalMinutes))
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

export function durationMinutes(item: Pick<ItineraryItem, 'duration' | 'slotType'>): number {
  if (item.slotType === 'full-day') return 480
  const duration = item.duration ?? ''
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*小时/)
  const minuteMatch = duration.match(/(\d+)\s*分钟/)
  if (hourMatch) return Math.round(Number(hourMatch[1]) * 60 + Number(minuteMatch?.[1] ?? 0))
  const match = duration.match(/(\d+(?:\.\d+)?)/)
  if (!match) return item.slotType === 'half-day' ? 120 : 60
  const value = Number(match[1])
  return value < 8 && !duration.includes('分钟') ? Math.round(value * 60) : Math.round(value)
}

export function cityForItem(item: Pick<ItineraryItem, 'title' | 'mapTarget' | 'zone'>): TravelCity {
  const text = `${item.title ?? ''} ${item.mapTarget ?? ''} ${item.zone ?? ''}`
  return /亚庇|沙巴|BKI|Kota Kinabalu|Tanjung|Klias|TARP|Manukan|Sapi|Kundasang|Klias|Waterfront|Gaya/i.test(text) ? 'kota-kinabalu' : 'kuala-lumpur'
}

const zoneHints: Array<[RegExp, TravelZone]> = [
  [/Batu|黑风洞/i, 'Batu Caves'],
  [/Kundasang|Kinabalu Park|Desa Dairy|神山|昆达山/i, 'Kundasang'],
  [/Klias|红树林/i, 'Klias'],
  [/Sepanggar|Tun Mustapha|UMS|Menara/i, 'Sepanggar'],
  [/Tanjung Aru|丹绒亚路|Double Six/i, 'Tanjung Aru'],
  [/Offshore|Sunset Cruise|巡航|码头|海岛|Island|TARP|Mengalum|Manukan|Sapi/i, 'Offshore'],
  [/Likas|City Mosque|城市清真寺|湿地|Wetlands/i, 'Likas'],
  [/Waterfront|Filipino|Handicraft|海滨|手工艺/i, 'Waterfront'],
  [/Gaya|Api Api|Sheraton|Hyatt Centric|亚庇市区/i, 'Gaya / City Centre'],
  [/Bukit Bintang|Pavilion|TRX|Jalan Alor|阿罗街/i, 'Bukit Bintang'],
  [/KLCC|Petronas|双子塔|Aquaria|Petrosains|Saloma/i, 'KLCC'],
  [/Bangsar|Thean Hou|Brickfields|小印度/i, 'Brickfields'],
  [/Batu Caves|黑风洞/i, 'Batu Caves'],
  [/Bank Negara|National Museum|Islamic Arts|Masjid Negara|Perdana|湖滨|独立广场|Central Market|Petaling|Kwai|Sultan|Old Town|老城/i, 'Old Town'],
  [/KL Tower|吉隆坡塔|Bukit Nanas|Forest Eco/i, 'Bukit Nanas'],
]

export function zoneForItem(item: Pick<ItineraryItem, 'title' | 'mapTarget' | 'zone'>): TravelZone {
  if (item.zone && zoneHints.some(([, zone]) => zone === item.zone)) return item.zone as TravelZone
  const text = `${item.title ?? ''} ${item.mapTarget ?? ''}`
  return zoneHints.find(([pattern]) => pattern.test(text))?.[1] ?? (cityForItem(item) === 'kuala-lumpur' ? 'Old Town' : 'Gaya / City Centre')
}

export function originZoneForReplacement(item: Pick<ItineraryItem, 'id' | 'title' | 'mapTarget' | 'zone'>, previous?: Pick<ItineraryItem, 'title' | 'mapTarget' | 'zone'>): TravelZone {
  if (previous) return zoneForItem(previous)
  if (item.id === 'd8-1' || item.id.includes('sabah-main')) return item.id.includes('sabah-main') ? 'Gaya / City Centre' : 'Old Town'
  if (item.id === 'd8-3') return 'Bukit Bintang'
  return zoneForItem(item)
}

export function estimateReplacementRoute(item: ItineraryItem, candidate: AlternativeAttraction, previous?: ItineraryItem, next?: ItineraryItem): ReplacementRoute {
  const city = candidate.city
  const origin = originZoneForReplacement(item, previous)
  const currentZone = zoneForItem(item)
  const candidateZone = candidate.area
  const current = estimateTravel(city, origin, currentZone)
  const replacement = estimateTravel(city, origin, candidateZone)
  const nextEstimate = next ? estimateTravel(city, candidateZone, zoneForItem(next)) : replacement
  return {
    city,
    origin,
    currentZone,
    candidateZone,
    current,
    candidate: replacement,
    next: nextEstimate,
    deltaMinutes: replacement.minutes - current.minutes,
    quality: replacement.quality,
  }
}

export function endTime(item: ItineraryItem): number {
  return parseTime(item.time) + durationMinutes(item) + (item.routeMinutes ?? 0)
}
