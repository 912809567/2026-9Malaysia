import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, ArrowUpRight, CalendarDays, Check, ChevronDown, CloudSun, Compass, ExternalLink, FileJson, Heart, Image as ImageIcon, Landmark, ListChecks, Map, RotateCcw, ShieldCheck, WalletCards, Waves, X } from 'lucide-react'
import { trip, tripStatus } from './data/trip'
import { flights } from './data/flights'
import { hotels } from './data/hotels'
import { createSabahActivityItem, itinerary, type DayPlan, type ItineraryItem, type ReservationStatus } from './data/itinerary'
import { checklistGroups } from './data/checklists'
import { durians } from './data/durians'
import { bookingItems } from './data/bookings'
import { entryPrepItems } from './data/entryPrep'
import { useLocalStorage } from './hooks/useLocalStorage'
import { MapView } from './components/MapView'
import { Discover } from './components/Discover'
import { discoverPlaces, type DiscoverPlace } from './data/discover'
import { GalleryLightbox } from './components/GalleryLightbox'
import { ResponsiveImage, resolveImageSrc } from './components/ResponsiveImage'
import { currentShortDay } from './utils/currentTripDay'
import { getNextEvent } from './utils/getNextEvent'
import { activityLabel, defaultSabahPlan, defaultSabahWeather, planSabah, sabahDates, type SabahActivity, type SabahDate, type SabahPlan, type SabahWeather } from './utils/planSabah'
import './styles.css'

type DisplayItem = ItineraryItem & { date: string; activity?: SabahActivity }
type DisplayDay = Omit<DayPlan, 'items'> & { items: DisplayItem[] }
const sabahShort: Record<SabahDate, string> = { '2026-09-10': '9/10', '2026-09-11': '9/11', '2026-09-12': '9/12' }
const weatherLabel: Record<'good' | 'okay' | 'bad', string> = { good: '☀️ 海况优秀', okay: '🌤️ 海况一般', bad: '🌧️ 不适合远海' }
const budgetFields = ['餐饮', '榴莲', 'Grab', '出海', '按摩', '购物', '其他']
const exportKeys = ['trip-itinerary-done', 'trip-sabah-weather', 'trip-sabah-plan', 'trip-sabah-plan-locked', 'trip-sea-checks', 'trip-mangrove', 'trip-mangrove-day', 'trip-checks', 'trip-budget', 'trip-mdac', 'trip-entry-prep', 'trip-bookings', 'trip-favorites', 'trip-jetty', 'trip-travel-mode']

function SectionHead({ kicker, title, note }: { kicker: string; title: string; note?: string }) {
  return <div className="section-head"><div><div className="section-kicker">{kicker}</div><h2>{title}</h2></div>{note && <div className="section-note">{note}</div>}</div>
}

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <ResponsiveImage className={className} src={src} alt={alt} />
}

function ScrollButton({ target, children }: { target: string; children: React.ReactNode }) {
  return <button className="ghost-btn small" onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })}>{children}<ArrowUpRight size={14} /></button>
}

function buildDays(plan: SabahPlan, mangrove: boolean, mangroveDay: SabahDate): DisplayDay[] {
  return itinerary.map(day => {
    if (!['9/10', '9/11', '9/12'].includes(day.date)) {
      return { ...day, items: day.items.map(item => ({ ...item, date: day.date })) }
    }
    const date = sabahDates.find(item => sabahShort[item] === day.date) as SabahDate
    let activity = plan[date]
    if (mangrove && date === mangroveDay && activity === 'rest') activity = 'mangrove'
    const items: DisplayItem[] = []
    if (date === '2026-09-11') {
      items.push({
        id: 'd11-fixed',
        date: day.date,
        time: '09:00',
        title: '亚庇喜来登酒店 → 亚庇凯悦尚萃酒店 · 行李先行',
        summary: '约09:00退房 → 全部行李Grab → 凯悦尚萃寄存 → 再去当天主活动。',
        details: ['不要默认06:30退房；以约09:00为舒适起点', '人和全部行李先到凯悦尚萃，前台寄存后再去Klias红树林 / 市区备选', '晚上回凯悦尚萃正式入住'],
        dateTime: '2026-09-11T09:00:00+08:00',
        from: '亚庇喜来登酒店',
        to: '亚庇凯悦尚萃酒店',
        transportMode: 'Grab',
        distance: '市区短途',
        duration: '约20—30分钟',
        recommendedDepartureTime: '约09:00',
        arrivalTime: '约09:30',
        buffer: '寄存行李后再开始主活动',
        reservationStatus: 'none',
        bookingChannel: 'Grab 官方 App',
        onSiteSteps: ['确认喜来登房间和行李数量', '叫Grab并核对车牌', '凯悦尚萃前台寄存全部行李并拍照留凭'],
        whatToBring: ['护照', '手机充电宝', '当天活动订单'],
        fallbackPlan: '如入住手续或交通延误，改为凯悦尚萃周边咖啡和市区休闲。',
        mapTarget: 'Hyatt Centric',
        notes: '换酒店是固定事件，但不会吞掉9/11主活动。',
      })
    }
    items.push({ ...createSabahActivityItem(date, activity), date: day.date, activity })
    if (date === '2026-09-12') {
      items.push({
        id: 'd12-sunset',
        date: day.date,
        time: '17:10',
        title: '亚庇凯悦尚萃酒店 → 丹绒亚路海滩日落',
        summary: '17:10—17:20出发，17:35—17:45抵达；约18:17日落。',
        details: ['远海日请根据返程时间决定是否赶，也可调整到其他空闲傍晚', '日落后：海鲜 → 沙巴特色榴莲 → 凯悦尚萃 → 收拾行李'],
        dateTime: '2026-09-12T17:10:00+08:00',
        from: '亚庇凯悦尚萃酒店',
        to: '丹绒亚路海滩',
        transportMode: 'Grab',
        duration: '约20—30分钟，以实时路况为准',
        recommendedDepartureTime: '17:10—17:20',
        arrivalTime: '17:35—17:45',
        buffer: '海边停车和拥堵留15分钟',
        reservationStatus: 'none',
        whatToBring: ['防蚊用品', '薄外套', '充电宝'],
        weatherRisk: '日落时间是约18:17；云层、雷雨和交通会影响观赏。',
        fallbackPlan: '天气不佳时改为亚庇海滨（KK Waterfront）或酒店附近晚餐。',
        mapTarget: 'Tanjung Aru',
        image: 'images/places/tanjung-aru/beach-view.webp',
        galleryPlaceId: 'tanjung-aru',
      })
    }
    return {
      ...day,
      title: date === '2026-09-11' ? '换酒店＋' + activityLabel(activity) : activityLabel(activity),
      intensity: date === '2026-09-11' ? '固定事件＋动态主活动' : '动态排期',
      items,
    }
  })
}

const reservationMeta: Record<ReservationStatus, { label: string; icon: string; className: string }> = {
  must: { label: '必须提前预约', icon: '🔴', className: 'must' },
  recommended: { label: '建议提前预约', icon: '🟡', className: 'recommended' },
  none: { label: '无需预约', icon: '🟢', className: 'none' },
  booked: { label: '已在订单中', icon: '🔵', className: 'booked' },
}

function ActionBadge({ status }: { status?: ReservationStatus }) {
  if (!status) return null
  const meta = reservationMeta[status]
  return <span className={'action-badge ' + meta.className}>{meta.icon} {meta.label}</span>
}

function ActionList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return <div className="action-section"><strong>{title}</strong><ol>{items.map(item => <li key={item}>{item}</li>)}</ol></div>
}

function ActionDetail({ item, onMapFocus }: { item: DisplayItem; onMapFocus: (target: string) => void }) {
  const hasRoute = item.from || item.to || item.transportMode || item.distance || item.duration
  return <div className="event-detail action-detail">
    <div className="daily-brief"><strong>今日摘要</strong><span>{item.summary}</span></div>
    <ActionBadge status={item.reservationStatus} />
    {hasRoute && <div className="action-route">
      {item.from && <div><span>出发</span><strong>{item.from}</strong></div>}
      {item.to && <div><span>到达</span><strong>{item.to}</strong></div>}
      {item.transportMode && <div><span>交通方式</span><strong>{item.transportMode}</strong></div>}
      {item.distance && <div><span>距离</span><strong>{item.distance}</strong></div>}
      {item.duration && <div><span>时长</span><strong>{item.duration}</strong></div>}
      {item.recommendedDepartureTime && <div><span>建议出发</span><strong>{item.recommendedDepartureTime}</strong></div>}
      {item.arrivalTime && <div><span>抵达</span><strong>{item.arrivalTime}</strong></div>}
      {item.buffer && <div><span>缓冲</span><strong>{item.buffer}</strong></div>}
    </div>}
    <div className="action-copy">{item.details.map(detail => <div key={detail}>· {detail}</div>)}</div>
    {(item.reservationTiming || item.bookingChannel || item.meetingPoint || item.ticketOrFee) && <div className="action-section">
      <strong>预约 / 费用</strong>
      {item.reservationTiming && <p>{item.reservationTiming}</p>}
      {item.bookingChannel && <p>渠道：{item.bookingChannel}</p>}
      {item.meetingPoint && <p>集合：{item.meetingPoint}</p>}
      {item.ticketOrFee && <p>费用：{item.ticketOrFee}</p>}
      {item.bookingLink && <a className="action-link" href={item.bookingLink} target="_blank" rel="noreferrer">打开预订或官方页面 <ExternalLink size={12} /></a>}
    </div>}
    <ActionList title="到现场 1 · 2 · 3" items={item.onSiteSteps} />
    <ActionList title="携带物品" items={item.whatToBring} />
    {item.documents?.length ? <ActionList title="随身文件" items={item.documents} /> : null}
    {(item.dressCode || item.paymentTip || item.weatherRisk || item.lastReturnTime || item.fallbackPlan || item.notes) && <div className="action-section">
      <strong>现场提醒</strong>
      {item.dressCode && <p>着装：{item.dressCode}</p>}
      {item.paymentTip && <p>支付：{item.paymentTip}</p>}
      {item.weatherRisk && <p>天气：{item.weatherRisk}</p>}
      {item.lastReturnTime && <p>最晚返程：{item.lastReturnTime}</p>}
      {item.fallbackPlan && <p>备选方案：{item.fallbackPlan}</p>}
      {item.notes && <p>备注：{item.notes}</p>}
    </div>}
    {item.mapTarget && <button className="action-map-button" onClick={() => onMapFocus(item.mapTarget!)}><Map size={13} />查看地图 · {item.mapTarget}</button>}
    {(item.sourceName || item.verifiedAt) && <div className="action-source">
      <span>来源：{item.sourceName || '行程核验'}{item.verifiedAt ? ' · ' + item.verifiedAt : ''}</span>
      {item.sourceLink && <a href={item.sourceLink} target="_blank" rel="noreferrer">官方来源 ↗</a>}
    </div>}
  </div>
}

function NextEvent({ days }: { days: DisplayDay[] }) {
  const status = tripStatus()
  if (status.kind === 'after') return <div className="next-card complete-next"><div className="section-kicker">下一项 · NEXT</div><strong>旅程已完成</strong><span>把照片和回忆收好，下次再出发。</span></div>
  const now = new Date()
  const current = status.kind === 'before' ? days[0] : days.find(day => day.date === currentShortDay()) || days[days.length - 1]
  const event = status.kind === 'before' ? getNextEvent(days.flatMap(day => day.items.map(item => ({ ...item, date: day.date }))), now) : getNextEvent(current.items.map(item => ({ ...item, date: current.date })), now)
  if (!event) return <div className="next-card complete-next"><div className="section-kicker">下一项 · NEXT</div><strong>今日行程已完成，早点休息。</strong></div>
  const mins = Math.max(0, Math.round((new Date(event.dateTime).getTime() - now.getTime()) / 60000))
  return <div className="next-card"><div><div className="section-kicker">下一项 · NEXT</div><strong>{event.time} · {event.title}</strong><span>{status.kind === 'before' ? '下一项：' + event.date + ' ' + event.time : mins < 60 ? '还有' + mins + '分钟' : '还有' + Math.floor(mins / 60) + '小时' + mins % 60 + '分钟'}</span></div>{event.tone === 'warning' && <AlertTriangle color="var(--coral)" />}</div>
}

function Hero({ days, travelMode, setTravelMode }: { days: DisplayDay[]; travelMode: boolean; setTravelMode: (value: boolean) => void }) {
  const status = tripStatus()
  return <><header className="hero" style={{ backgroundImage: 'linear-gradient(115deg,rgba(6,69,72,.96) 5%,rgba(13,104,109,.83) 48%,rgba(13,104,109,.28)), url(' + resolveImageSrc('images/places/petronas/night-01.webp') + ')' }}><div className="hero-content"><div className="eyebrow"><Compass size={15} /> 2026 · MALAYSIA / 马来西亚旅行攻略</div><h1>{trip.title}<br /><em>{trip.subtitle}</em></h1><p>深圳—吉隆坡—亚庇 · 09.07—09.13 · {trip.days}天{trip.nights}晚</p><div className="hero-bottom"><div className="status-pill"><CalendarDays size={15} />{status.label}</div><div className="route-line">{trip.route.map((stop, i) => <span key={stop.code + '-' + i} style={{ display: 'contents' }}><span className="route-dot" /><span>{stop.code}</span>{i < trip.route.length - 1 && <span className="route-sep" />}</span>)}</div></div><label className="travel-toggle"><input type="checkbox" checked={travelMode} onChange={event => setTravelMode(event.target.checked)} /><span>旅行模式</span><small>{travelMode ? '已开启 · 只保留现场信息' : '开启后简化页面'}</small></label></div></header><NextEvent days={days} /></>
}

function EntryPrep() {
  const [checks, setChecks] = useLocalStorage<Record<string, boolean>>('trip-entry-prep', {})
  const [mdac, setMdac] = useLocalStorage('trip-mdac', false)
  const completed = entryPrepItems.filter(item => checks[item.id]).length + (mdac ? 1 : 0)
  const total = entryPrepItems.length + 1
  return <section className="section" id="entry-prep"><SectionHead kicker="00 · DEPARTURE PREP / 出发准备" title="中国大陆游客 · 入境准备" note="把入境材料离线放好，9/7落地时只按动线执行。政策和开放时间以官方最新页面为准。" /><div className="entry-prep-grid"><div className="card entry-prep-card"><div className="entry-progress"><strong>{completed}/{total}</strong><span>出发前准备完成</span></div><div className="entry-list">{entryPrepItems.map(item => <label className="list-check" key={item.id}><input type="checkbox" checked={Boolean(checks[item.id])} onChange={() => setChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))} /><span><strong>{item.title}</strong><small>{item.copy}</small>{item.link && <a href={item.link} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}>{item.linkLabel} <ExternalLink size={11} /></a>}</span></label>)}<label className="list-check"><input type="checkbox" checked={mdac} onChange={event => setMdac(event.target.checked)} /><span><strong>马来西亚数字入境卡（MDAC）已提交</strong><small>Malaysia Digital Arrival Card · MDAC。9/5起可填，推荐9/5或9/6完成；提交后截图、PDF、纸质各备一份。</small><a href="https://imigresen-online.imi.gov.my/mdac/main" target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}>前往官方 MDAC 入口 <ExternalLink size={11} /></a></span></label></div></div><div className="card entry-note-card"><ShieldCheck size={22} color="var(--teal)" /><h3>9/9 沙巴入境提示</h3><p>从KUL T2飞抵BKI后，先寻找“Immigration / 入境检查”指示牌，再取行李、确认护照记录，最后叫Grab去亚庇喜来登酒店。</p><div className="entry-mini"><span>护照</span><span>三段机票</span><span>三家酒店</span><span>保险</span></div><div className="airport-terms"><strong>机场现场词</strong><div><span><b>Immigration</b>入境检查</span><span><b>Baggage Claim</b>行李提取</span><span><b>Departures</b>出发</span><span><b>Arrivals</b>到达</span><span><b>Gate</b>登机口</span><span><b>Check-in</b>值机</span><span><b>Bag Drop</b>行李托运</span><span><b>Customs</b>海关</span><span><b>Grab Pick-up Point</b>Grab上车点</span></div></div><div className="micro">以马来西亚移民局最新政策为准</div></div></div></section>
}

function Overview() {
  return <section className="section" id="overview"><SectionHead kicker="01 · OVERVIEW / 总览" title="先看一眼全程" note="城市与海岛的节奏，留出午休和天气弹性，不做特种兵。" /><div className="overview-grid"><div className="card route-card">{trip.route.map((stop, i) => <span className="route-stop" key={stop.code + i}><strong>{stop.code}</strong><span>{stop.name}</span>{(i === 1 || i === 2) && <small style={{ display: 'block', color: 'var(--teal)', marginTop: 8 }}>{i === 1 ? '2晚' : '4晚'}</small>}</span>)}</div><div className="card trip-structure-card"><div className="metric-label">7天 · 6晚</div><div className="structure-stops"><div><strong>吉隆坡</strong><span>Kuala Lumpur · 2晚</span></div><div className="structure-divider" aria-hidden="true">→</div><div><strong>亚庇</strong><span>Kota Kinabalu · 4晚</span></div></div><div className="tag-list">{trip.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div></div></div></section>
}

function Itinerary({ days, selected, setSelected, done, setDone, onToday, onOpenGallery, onMapFocus }: { days: DisplayDay[]; selected: number; setSelected: (value: number) => void; done: Record<string, boolean>; setDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; onToday: () => void; onOpenGallery: (placeId: string) => void; onMapFocus: (target: string) => void }) {
  const [open, setOpen] = useState<string | null>('d7-1')
  const day = days[selected]
  return <section className="section" id="itinerary"><SectionHead kicker="02 · ITINERARY / 行程" title="每天只看今天" note="每个节点都压缩成现场行动卡：怎么走、要不要预约、到场做什么、下雨怎么办。" /><div className="date-tabs"><button className="today-btn" onClick={onToday}>📍 今天</button>{days.map((item, i) => <button className={'date-tab ' + (selected === i ? 'active' : '')} onClick={() => setSelected(i)} key={item.date}><strong>{item.date}</strong><span>{item.weekday}</span></button>)}</div><div className="itinerary-layout"><div className="card"><div className="day-heading"><h3>{day.title}</h3><span className="intensity">{day.intensity}</span></div><div className="timeline">{day.items.map(item => { const isOpen = open === item.id; const isDone = Boolean(done[item.id]); return <div className={'timeline-item ' + (item.tone || '')} key={item.id}><div className="timeline-main"><div className="time">{item.time}</div><div className={'event ' + (isOpen ? 'open' : '')}><button type="button" onClick={() => setOpen(isOpen ? null : item.id)} aria-expanded={isOpen}><div className="event-title"><span>{item.title}</span><ChevronDown size={16} /></div><div className="summary">{item.summary}</div></button>{isOpen && <><div className="event-detail action-detail"><div className="daily-brief"><strong>今日摘要</strong><span>{item.summary}</span></div><ActionBadge status={item.reservationStatus} />{(item.from || item.to || item.transportMode || item.distance || item.duration) && <div className="action-route">{item.from && <div><span>出发</span><strong>{item.from}</strong></div>}{item.to && <div><span>到达</span><strong>{item.to}</strong></div>}{item.transportMode && <div><span>交通方式</span><strong>{item.transportMode}</strong></div>}{item.distance && <div><span>距离</span><strong>{item.distance}</strong></div>}{item.duration && <div><span>时长</span><strong>{item.duration}</strong></div>}{item.recommendedDepartureTime && <div><span>建议出发</span><strong>{item.recommendedDepartureTime}</strong></div>}{item.arrivalTime && <div><span>抵达</span><strong>{item.arrivalTime}</strong></div>}{item.buffer && <div><span>缓冲</span><strong>{item.buffer}</strong></div>}</div>}<div className="action-copy">{item.details.map(detail => <div key={detail}>· {detail}</div>)}</div>{(item.reservationTiming || item.bookingChannel || item.meetingPoint || item.ticketOrFee) && <div className="action-section"><strong>预约 / 费用</strong>{item.reservationTiming && <p>{item.reservationTiming}</p>}{item.bookingChannel && <p>渠道：{item.bookingChannel}</p>}{item.meetingPoint && <p>集合：{item.meetingPoint}</p>}{item.ticketOrFee && <p>费用：{item.ticketOrFee}</p>}{item.bookingLink && <a className="action-link" href={item.bookingLink} target="_blank" rel="noreferrer">打开预订或官方页面 <ExternalLink size={12} /></a>}</div>}<ActionList title="到现场 1 · 2 · 3" items={item.onSiteSteps} /><ActionList title="携带物品" items={item.whatToBring} />{item.documents?.length ? <ActionList title="随身文件" items={item.documents} /> : null}{(item.dressCode || item.paymentTip || item.weatherRisk || item.lastReturnTime || item.fallbackPlan || item.notes) && <div className="action-section"><strong>现场提醒</strong>{item.dressCode && <p>着装：{item.dressCode}</p>}{item.paymentTip && <p>支付：{item.paymentTip}</p>}{item.weatherRisk && <p>天气：{item.weatherRisk}</p>}{item.lastReturnTime && <p>最晚返程：{item.lastReturnTime}</p>}{item.fallbackPlan && <p>备选方案：{item.fallbackPlan}</p>}{item.notes && <p>备注：{item.notes}</p>}</div>}{item.mapTarget && <button className="action-map-button" onClick={event => { event.stopPropagation(); onMapFocus(item.mapTarget!) }}><Map size={13} />查看地图 · {item.mapTarget}</button>}{(item.sourceName || item.verifiedAt) && <div className="action-source"><span>来源：{item.sourceName || '行程核验'}{item.verifiedAt ? ' · ' + item.verifiedAt : ''}</span>{item.sourceLink && <a href={item.sourceLink} target="_blank" rel="noreferrer">官方来源 ↗</a>}</div>}</div>{item.image && <div className="timeline-media">{item.galleryPlaceId ? <button className="timeline-image-button" onClick={event => { event.stopPropagation(); onOpenGallery(item.galleryPlaceId!) }} aria-label={'打开' + item.title + '相册'}><ImageWithFallback className="timeline-thumb" src={item.image} alt={item.title} /></button> : <ImageWithFallback className="timeline-thumb" src={item.image} alt={item.title} />}</div>}</>}</div><button type="button" className={'complete-btn ' + (isDone ? 'done' : '')} onClick={() => setDone(prev => ({ ...prev, [item.id]: !isDone }))}>{isDone ? <Check size={14} /> : '完成'}</button></div></div> })}</div></div><FlightMini /></div></section>
}

function FlightMini() {
  return <div className="flight-list">{flights.map((flight, index) => <FlightCard flight={flight} key={flight.date} highlight={index === 2} />)}</div>
}

function FlightCard({ flight, highlight }: { flight: typeof flights[number]; highlight?: boolean }) {
  const [open, setOpen] = useState(false)
return <div className={'card flight-card ' + (highlight ? 'highlight-flight' : '')}><div className="flight-top"><div className="flight-main"><div className="micro">{flight.date} · {flight.route}</div><div className="flight-route"><div className="airport-stop"><strong>{flight.from.code}</strong><span>{flight.from.nameZh}</span></div><span>→</span><div className="airport-stop"><strong>{flight.to.code}</strong><span>{flight.to.nameZh}</span></div></div><div className="flight-times"><strong>{flight.depart}</strong><span className="flight-line" /><strong>{flight.arrive}</strong></div></div><div className="flight-note">{flight.note}<br /><button className="ghost-btn small" onClick={() => setOpen(!open)}>{open ? '收起详情' : '展开详情'} <ChevronDown size={13} /></button></div></div>{open && <div className="expand-area"><div className="airport-english-grid"><span>{flight.from.nameEn}</span><span>{flight.to.nameEn}</span></div>{flight.details.map(detail => <div className="detail-row" key={detail}>{detail}</div>)}</div>}</div>
}

function Hotels() {
return <section className="section" id="hotels"><SectionHead kicker="03 · HOTELS / 酒店" title="三段落脚点" note="市区酒店优先安排走路可达的吃喝，换酒店日把行李作为唯一固定事件。" /><div className="hotel-grid">{hotels.map((hotel, i) => <div className={'card hotel-card ' + hotel.color} key={hotel.mapQuery}><div className="dates">{hotel.dates}</div><h3>{hotel.nameZh}</h3><div className="entity-english">{hotel.nameEn}</div>{hotel.address && <div className="hotel-address"><span>地址</span>{hotel.address}</div>}<div className="tag-list">{hotel.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><div className="hotel-note">{hotel.note}</div><a className="ghost-btn small" style={{ marginTop: 13, textDecoration: 'none' }} href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(hotel.mapQuery)} target="_blank" rel="noreferrer">打开Google Maps <ExternalLink size={13} /></a>{i === 2 && <div className="hotel-alert"><strong>9/11固定换酒店</strong><br />亚庇喜来登酒店退房 → 全部行李Grab → 亚庇凯悦尚萃酒店寄存</div>}</div>)}</div></section>
}

function Planner({ weather, setWeather, plan, setPlan, locked, setLocked }: { weather: SabahWeather; setWeather: React.Dispatch<React.SetStateAction<SabahWeather>>; plan: SabahPlan; setPlan: React.Dispatch<React.SetStateAction<SabahPlan>>; locked: boolean; setLocked: React.Dispatch<React.SetStateAction<boolean>> }) {
  const preview = useMemo(() => planSabah(weather), [weather])
  const allBad = sabahDates.every(day => weather[day] === 'bad')
  const updateWeather = (day: SabahDate, value: 'good' | 'okay' | 'bad') => { const next = { ...weather, [day]: value }; setWeather(next); if (!locked) setPlan(planSabah(next)) }
  return <section className="section" id="planner"><SectionHead kicker="04 · WEATHER / 海况排期" title="亚庇出海排期助手" note="最早的“海况优秀”优先给环滩岛；9/11换酒店是固定事件，但不再占用整天。" /><div className="planner"><div className="card"><div className="weather-grid">{sabahDates.map(day => <div className="weather-day" key={day}><strong>{sabahShort[day]}</strong><select className="weather-select" value={weather[day]} onChange={event => updateWeather(day, event.target.value as 'good' | 'okay' | 'bad')} disabled={locked}>{Object.entries(weatherLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>)}</div><div className="weather-option"><span className="micro">{locked ? '当前方案已锁定，天气选择仅作预览' : '选择天气后会实时更新当前方案'}</span><div className="planner-actions"><button className="ghost-btn small" onClick={() => { setWeather(defaultSabahWeather); setPlan(planSabah(defaultSabahWeather)); setLocked(false) }}><RotateCcw size={13} />恢复默认</button>{locked ? <button className="ghost-btn small" onClick={() => { setPlan(preview); setLocked(false) }}>重新按天气规划</button> : <button className="primary-btn small" onClick={() => { setPlan(preview); setLocked(true) }}>锁定此方案</button>}</div></div></div><div className="recommend"><div className="section-kicker">{locked ? '方案已锁定 · LOCKED' : '实时推荐 · LIVE'}</div><h3>{locked ? '当前执行方案' : '根据当前选择，推荐：'}</h3>{sabahDates.map(day => <div className="recommend-row" key={day}><strong>{sabahShort[day]}</strong><span>{day === '2026-09-11' && <b>换酒店＋</b>}{activityLabel(locked ? plan[day] : preview[day])}</span></div>)}{allBad && <div className="no-go">海况不佳，不强行远海。建议市区、酒店、按摩、海鲜、榴莲，根据运营商通知决定是否参加TARP。</div>}</div></div></section>
}

function BookingCenter() {
  const [done, setDone] = useLocalStorage<Record<string, boolean>>('trip-bookings', {})
  const completed = bookingItems.filter(item => done[item.id]).length
  return <section className="section" id="bookings"><SectionHead kicker="05 · BOOKINGS / 订票" title="订票中心" note="先处理有明确时间窗的项目；打开链接后把订单号和确认消息离线保存。" /><div className="booking-grid">{bookingItems.map(item => <div className={'card booking-card ' + (done[item.id] ? 'booking-done' : '')} key={item.id}><div className="booking-top"><span className={'booking-status ' + item.status}>{item.status === 'must' ? '必须' : item.status === 'recommended' ? '建议' : '核对'}</span><label className="toggle"><input type="checkbox" checked={Boolean(done[item.id])} onChange={() => setDone(prev => ({ ...prev, [item.id]: !prev[item.id] }))} />{done[item.id] ? '已完成' : '标记完成'}</label></div><h3>{item.title}</h3><div className="micro">{item.timing}</div><p>{item.note}</p><div className="booking-channel">渠道：{item.channel}</div>{item.fee && <div className="booking-fee">费用：{item.fee}</div>}<a className="primary-btn small" href={item.link} target="_blank" rel="noreferrer">打开链接 <ExternalLink size={13} /></a></div>)}</div><div className="booking-summary"><Check size={15} /> 已完成 {completed}/{bookingItems.length} 项 · 订单确认后仍需按前一晚消息核对接送和海况</div></section>
}

function SeaModules({ plan, weather, setPlan, mangrove, setMangrove, mangroveDay, setMangroveDay }: { plan: SabahPlan; weather: SabahWeather; setPlan: React.Dispatch<React.SetStateAction<SabahPlan>>; mangrove: boolean; setMangrove: React.Dispatch<React.SetStateAction<boolean>>; mangroveDay: SabahDate; setMangroveDay: React.Dispatch<React.SetStateAction<SabahDate>> }) {
  const [seaDone, setSeaDone] = useLocalStorage<Record<string, boolean>>('trip-sea-checks', {})
  const [islands, setIslands] = useState<'two' | 'three'>('two')
  const [now, setNow] = useState(new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60000); return () => window.clearInterval(timer) }, [])
  const items = ['是否正常出海', '酒店接送时间', '集合地点', '码头', '天气取消政策', '是否支持改期', '是否提供浮潜装备', '是否包含午餐']
  const mengalumDay = sabahDates.find(day => plan[day] === 'mengalum')
  const tarpDay = sabahDates.find(day => plan[day] === 'tarp')
  const sunset = new Date('2026-09-12T18:17:00+08:00')
  const diff = sunset.getTime() - now.getTime()
  const sunsetText = diff <= 0 ? '今日太阳已落山' : '距离日落 ' + Math.floor(diff / 3600000) + '小时 ' + Math.floor((diff % 3600000) / 60000) + '分'
  const toggleMangrove = (checked: boolean) => { setMangrove(checked); if (checked) { if (plan[mangroveDay] === 'rest' || plan[mangroveDay] === 'city') setPlan(prev => ({ ...prev, [mangroveDay]: 'mangrove' })) } else setPlan(planSabah(weather)) }
  return <section className="section" id="sea"><SectionHead kicker="06 · ISLANDS / 海岛" title="两天海岛安排" note="环滩与TARP读取当前排期；丹绒亚路日落独立计算，不再和TARP日期绑定。" /><div className="special-grid"><div className="special-card ocean"><div className="special-title"><div><h3>环滩岛</h3><div className="entity-english">Mengalum Island</div><p>{mengalumDay ? '当前排在' + sabahShort[mengalumDay] + '：远海、高天气敏感，优先抢好天气。' : '当前没有安排环滩岛：三天都不适合远海时不要强行远海。'}</p></div><Waves color="var(--teal)" /></div><div className="check-list">{items.map(item => <label className="check-item" key={item}><input type="checkbox" checked={Boolean(seaDone[item])} onChange={() => setSeaDone(prev => ({ ...prev, [item]: !prev[item] }))} />{item}</label>)}</div></div><div className="special-card sunset"><div className="special-title"><div><h3>东姑阿都拉曼海洋公园</h3><div className="entity-english">Tunku Abdul Rahman Park · TARP</div><p>{tarpDay ? '当前排在' + sabahShort[tarpDay] + '：沙比岛＋马努干岛，近海、轻松、天气容错高。' : '当前没有安排TARP；可在锁定前按天气重新规划。'}</p></div><span className="status-pill" style={{ color: 'var(--ink)', borderColor: 'var(--line)', background: '#fff8e8' }}>{sunsetText}</span></div><div className="island-compare">{(['two', 'three'] as const).map(type => <button className="island" style={{ border: islands === type ? '2px solid var(--sun)' : '1px solid transparent', textAlign: 'left' }} key={type} onClick={() => setIslands(type)}><strong>{type === 'two' ? '两岛 · 默认推荐' : '三岛 · 对比'}</strong><span>{type === 'two' ? '少换一次船 · 更多浮潜时间 · 更多沙滩时间 · 更轻松' : '行程更满 · 等待更多 · 适合体力充足且海况稳定'}</span></button>)}</div><div className="mangrove-control"><label className="toggle"><input type="checkbox" checked={mangrove} onChange={event => toggleMangrove(event.target.checked)} />红树林？</label><select value={mangroveDay} onChange={event => { const next = event.target.value as SabahDate; setMangroveDay(next); if (mangrove) setPlan(prev => { const nextPlan = { ...prev }; sabahDates.forEach(day => { if (nextPlan[day] === 'mangrove') nextPlan[day] = 'rest' }); if (nextPlan[next] === 'rest' || nextPlan[next] === 'city') nextPlan[next] = 'mangrove'; return nextPlan }) }}><option value="2026-09-10">加入9/10</option><option value="2026-09-11">加入9/11</option><option value="2026-09-12">加入9/12</option></select></div>{mangrove && <div className="event-detail" style={{ marginTop: 10 }}>Klias红树林约100km，通常约13:30接 → 看长鼻猴 → 晚餐 → 萤火虫 → 约21:00—21:30返回。<br /><strong>可舍弃项，不与TARP或环滩安排在同一天。</strong></div>}<div className="sunset-note">9/12丹绒亚路海滩：17:35—17:45抵达，约18:17日落。若9/12是环滩日，请根据回程时间决定是否赶。</div></div></div></section>
}

function Checklist() {
  const [checks, setChecks] = useLocalStorage<Record<string, boolean>>('trip-checks', {})
  const total = checklistGroups.reduce((sum, group) => sum + group.items.length, 0)
  const completed = Object.values(checks).filter(Boolean).length
  const reset = () => { if (window.confirm('确定重置所有行前清单吗？')) setChecks({}) }
  return <section className="section" id="checklist"><SectionHead kicker="07 · CHECKLIST / 清单" title="行前准备进度" note="证件、支付、手机、出海、电子、药物和2026特殊项，一次收好。" /><div className="card progress-card"><div className="progress-value">{Math.round(completed / total * 100)}%</div><div className="progress-track"><div className="progress-fill" style={{ width: completed / total * 100 + '%' }} /></div><button className="ghost-btn small" onClick={reset}><RotateCcw size={13} />全部重置</button></div><div className="check-layout">{checklistGroups.map(group => <div className="card check-group" key={group.id}><h3><span>{group.icon}</span>{group.label}</h3><div className="check-group-list">{group.items.map(item => { const key = group.id + ':' + item; return <label className="list-check" key={key}><input type="checkbox" checked={Boolean(checks[key])} onChange={() => setChecks(prev => ({ ...prev, [key]: !prev[key] }))} />{item}</label> })}</div></div>)}</div></section>
}

function Budget() {
  const [spend, setSpend] = useLocalStorage<Record<string, number>>('trip-budget', {})
  const total = Object.values(spend).reduce((a, b) => a + (Number(b) || 0), 0)
  return <section className="section" id="budget"><SectionHead kicker="08 · BUDGET / 预算" title="现场预算速查" note="酒店已支付不计入现场预算；金额按RM记录，现场花费随手记。" /><div className="budget-layout"><div className="card budget-hero"><h3>现场已记录</h3><div className="budget-amount">RM {total.toLocaleString()}</div><p>人均RM {Math.round(total / 2).toLocaleString()} · 建议舒适档RM 3000—3500</p><div className="budget-form">{budgetFields.map(field => <label key={field}>{field}<input inputMode="decimal" type="number" min="0" value={spend[field] ?? ''} onChange={event => setSpend(prev => ({ ...prev, [field]: Number(event.target.value) || 0 }))} placeholder="0" /></label>)}</div><button className="ghost-btn small" style={{ marginTop: 16, color: '#fff', borderColor: 'rgba(255,255,255,.25)', background: 'transparent' }} onClick={() => { if (window.confirm('确定清空预算记录吗？')) setSpend({}) }}><X size={13} />清空预算记录</button></div><div className="card"><div className="micro">支付速查 · PAYMENT GUIDE</div><div className="payment-table"><div><span>酒店押金</span><strong>招行Visa</strong></div><div><span>商场 / 正规餐厅</span><strong>Visa / 支付宝微信</strong></div><div><span>Grab</span><strong>招行Visa</strong></div><div><span>夜市 / 榴莲</span><strong>现金优先</strong></div><div><span>主卡失败</span><strong>ZA Visa</strong></div></div><div className="event-detail" style={{ marginTop: 19 }}>刷卡永远选择 <strong>MYR</strong>。不要选CNY / HKD，避免DCC动态货币转换。</div><div className="budget-tiers"><div className="tier"><span>节制舒服</span><strong>RM 2500</strong></div><div className="tier"><span>正常舒适</span><strong>RM 3000—3500</strong></div><div className="tier"><span>吃喝比较爽</span><strong>RM 4000+</strong></div></div></div></div></section>
}

function QuickModules({ jetty, setJetty, focusTarget }: { jetty: { name: string; url: string }; setJetty: React.Dispatch<React.SetStateAction<{ name: string; url: string }>>; focusTarget?: string }) {
  const [jettyDraft, setJettyDraft] = useState(jetty)
  const fileRef = useRef<HTMLInputElement>(null)
  const exportState = () => { const data = Object.fromEntries(exportKeys.map(key => [key, localStorage.getItem(key)])); const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'malaysia-trip-2026-state.json'; link.click(); URL.revokeObjectURL(url) }
  const importState = (file: File) => { const reader = new FileReader(); reader.onload = () => { try { const payload = JSON.parse(String(reader.result)); if (!payload.data || !window.confirm('导入会覆盖这台设备上的旅行状态，确定继续吗？')) return; Object.entries(payload.data as Record<string, string | null>).forEach(([key, value]) => { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value) }); window.location.reload() } catch { window.alert('文件格式不正确，请选择网站导出的JSON。') } }; reader.readAsText(file) }
  useEffect(() => { const handler = () => exportState(); window.addEventListener('open-export', handler); return () => window.removeEventListener('open-export', handler) }, [])
  return <section className="section" id="quick"><SectionHead kicker="09 · TOOLS / 工具" title="旅行现场工具箱" note="把最容易临时查找的内容放在一起，点开就能用。" /><div className="tool-grid"><a className="card tool-card" href="https://www.google.com/maps" target="_blank" rel="noreferrer"><div className="tool-icon"><Map size={18} /></div><h3>地图导航</h3><p>Leaflet＋OpenStreetMap标记全程地点，Google Maps负责导航。</p></a><div className="card tool-card"><div className="tool-icon"><WalletCards size={18} /></div><h3>支付速查</h3><p>酒店押金Visa；商场Visa / 支付宝；夜市现金；榴莲现金优先。</p></div><a className="card tool-card" href="https://www.met.gov.my/" target="_blank" rel="noreferrer"><div className="tool-icon"><CloudSun size={18} /></div><h3>天气＆烟霾</h3><p>关注雷暴、风浪、Rough Seas、烟霾。查看METMalaysia / myCuaca。</p></a><div className="card tool-card"><div className="tool-icon">🍈</div><h3>榴莲攻略</h3><p>西马经典名品，沙巴隐藏角色；购买前确认RM/kg。</p></div></div><div className="card jetty-editor"><div><div className="micro">实际码头 · MY JETTY</div><h3>我的实际出海码头</h3><p>实际集合码头请以订单确认页为准。保存名称和Google Maps URL后，地图下方会出现快捷导航。</p></div><div className="jetty-form"><input value={jettyDraft.name} onChange={event => setJettyDraft(prev => ({ ...prev, name: event.target.value }))} placeholder="例如 South Jetty" /><input value={jettyDraft.url} onChange={event => setJettyDraft(prev => ({ ...prev, url: event.target.value }))} placeholder="Google Maps URL" /><button className="primary-btn small" onClick={() => setJetty(jettyDraft)}>保存集合点</button></div></div><div className="card" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}><MapView jetty={jetty} focusTarget={focusTarget} /></div><div className="card state-transfer"><div><div className="micro">同行状态 · TRAVEL STATE</div><h3>同行状态导入导出</h3><p>导出清单、排期、天气、收藏、预算、订票与MDAC状态，发给同行人后可在另一台设备导入。</p></div><div className="state-actions"><button className="primary-btn small" onClick={exportState}><FileJson size={14} />导出旅行状态</button><button className="ghost-btn small" onClick={() => fileRef.current?.click()}>导入JSON</button><input ref={fileRef} type="file" accept="application/json" hidden onChange={event => { const file = event.target.files?.[0]; if (file) importState(file) }} /></div></div></section>
}

function Safety() {
  return <section className="section" id="safety"><SectionHead kicker="13 · REMINDERS / 提醒" title="旅行提醒卡" note="不制造恐慌，只记住几个让旅程更舒服的小动作。" /><div className="card safety"><div className="safety-list">{['人多区域注意手机钱包', '手机不要长期靠马路一侧举着', 'Grab使用官方APP', '夜间避免偏僻小巷', '出海穿救生衣，海况不好不强行出海', '猴子区域不要拿食物逗猴', '海鲜购买前确认价格', '榴莲称重前确认RM/kg', '信用卡不要离开视线', '遇罚款要求“Official ticket / receipt（正式票据）”'].map(item => <p key={item}>{item}</p>)}</div></div></section>
}

function App() {
  const [weather, setWeather] = useLocalStorage<SabahWeather>('trip-sabah-weather', defaultSabahWeather)
  const [plan, setPlan] = useLocalStorage<SabahPlan>('trip-sabah-plan', defaultSabahPlan)
  const [locked, setLocked] = useLocalStorage('trip-sabah-plan-locked', false)
  const [mangrove, setMangrove] = useLocalStorage('trip-mangrove', false)
  const [mangroveDay, setMangroveDay] = useLocalStorage<SabahDate>('trip-mangrove-day', '2026-09-11')
  const [jetty, setJetty] = useLocalStorage('trip-jetty', { name: '', url: '' })
  const [travelMode, setTravelMode] = useLocalStorage('trip-travel-mode', false)
  const [mapFocus, setMapFocus] = useState<string | undefined>()
  const days = useMemo(() => buildDays(plan, mangrove, mangroveDay), [plan, mangrove, mangroveDay])
  const today = currentShortDay()
  const initial = itinerary.findIndex(day => day.date === today)
  const [selected, setSelected] = useState(initial >= 0 ? initial : 0)
  const [done, setDone] = useLocalStorage<Record<string, boolean>>('trip-itinerary-done', {})
  const [gallery, setGallery] = useState<{ place: DiscoverPlace; index: number } | null>(null)
  const [active, setActive] = useState('overview')
  const nav = [{ id: 'overview', label: '首页', icon: Compass }, { id: 'itinerary', label: '行程', icon: CalendarDays }, { id: 'checklist', label: '清单', icon: ListChecks }, { id: 'budget', label: '预算', icon: WalletCards }, { id: 'quick', label: '更多', icon: Landmark }]
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-15% 0px -65% 0px', threshold: [0, .25, .5] })
    ;['entry-prep', 'overview', 'itinerary', 'checklist', 'budget', 'quick', 'safety'].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element) })
    return () => observer.disconnect()
  }, [])
  const go = (id: string) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }
  const goToDay = (day: string) => { const index = days.findIndex(item => item.date === day); if (index >= 0) setSelected(index); go('itinerary') }
  const openGallery = (placeId: string, index = 0) => { const place = discoverPlaces.find(item => item.id === placeId); if (place) setGallery({ place, index }) }
  const onToday = () => goToDay(today)
  const onMapFocus = (target: string) => { setMapFocus(target); go('quick') }
  const resetTripData = () => { if (!window.confirm('确定重置所有旅行数据吗？这会清除完成状态、排期、预算、收藏、集合点、订票、入境和MDAC状态。')) return; exportKeys.forEach(key => localStorage.removeItem(key)); window.location.reload() }
  return <div className={'app ' + (travelMode ? 'travel-mode' : '')}><div className="container"><div className="topbar"><div className="brand"><div className="brand-mark">✦</div><div>双人旅行攻略 <span>TRAVEL DOSSIER</span></div></div><div className="top-actions"><ScrollButton target="entry-prep">入境准备</ScrollButton><button className="icon-btn" title="查看提醒" onClick={() => go('safety')}><ShieldCheck size={17} /></button><button className="ghost-btn small" onClick={resetTripData}><RotateCcw size={13} />重置数据</button></div></div><Hero days={days} travelMode={travelMode} setTravelMode={setTravelMode} /><EntryPrep /><Overview /><Itinerary days={days} selected={selected} setSelected={setSelected} done={done} setDone={setDone} onToday={onToday} onOpenGallery={openGallery} onMapFocus={onMapFocus} /><Hotels /><Planner weather={weather} setWeather={setWeather} plan={plan} setPlan={setPlan} locked={locked} setLocked={setLocked} /><BookingCenter /><SeaModules plan={plan} weather={weather} setPlan={setPlan} mangrove={mangrove} setMangrove={setMangrove} mangroveDay={mangroveDay} setMangroveDay={setMangroveDay} /><Checklist /><Budget /><QuickModules jetty={jetty} setJetty={setJetty} focusTarget={mapFocus} /><Discover plan={plan} mangrove={mangrove} mangroveDay={mangroveDay} onOpenDay={goToDay} onOpenGallery={(place, index = 0) => setGallery({ place, index })} /><Safety /><footer className="footer">马来西亚 2026 · 深圳—吉隆坡—亚庇<br />图片均已本地化并保留可追溯来源；天气、海况、航班请在出发前再次确认。<br /><button className="text-link" onClick={() => { const event = new CustomEvent('open-export'); window.dispatchEvent(event) }}><FileJson size={12} />导出同行状态</button></footer></div>{gallery && <GalleryLightbox place={gallery.place} initialIndex={gallery.index} onClose={() => setGallery(null)} />}<nav className="bottom-nav" aria-label="主导航">{nav.map(({ id, label, icon: Icon }) => <button className={active === id ? 'active' : ''} key={id} onClick={() => go(id)}><Icon size={17} />{label}</button>)}</nav></div>
}

type TripWindow = Window & { __malaysiaTripRoot?: ReturnType<typeof createRoot> }
const tripWindow = window as TripWindow
const root = tripWindow.__malaysiaTripRoot ?? createRoot(document.getElementById('root')!)
tripWindow.__malaysiaTripRoot = root
root.render(<App />)
