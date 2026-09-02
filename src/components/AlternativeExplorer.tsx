import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Check, ChevronDown, ExternalLink, Heart, Image as ImageIcon, MapPin, SlidersHorizontal, X } from 'lucide-react'
import type { AlternativeAttraction, AlternativeCategory, AlternativeEnvironment } from '../data/alternatives'
import { alternativeAttractions } from '../data/alternatives'
import type { DiscoverPlace } from '../data/discover'

function SectionHead({ kicker, title, note }: { kicker: string; title: string; note?: string }) {
  return <div className="section-head"><div><div className="section-kicker">{kicker}</div><h2>{title}</h2></div>{note && <div className="section-note">{note}</div>}</div>
}

export type AlternativeFilterState = {
  city: 'all' | 'kuala-lumpur' | 'kota-kinabalu'
  category: 'all' | AlternativeCategory
  environment: 'all' | AlternativeEnvironment
  scene: 'all' | 'rainy' | 'sunny' | 'night' | 'easy' | 'half-day' | 'full-day'
  score: 'all' | 'four' | 'five'
  sort: 'recommended' | 'fit' | 'shortest' | 'rainy'
}

export const defaultAlternativeFilters: AlternativeFilterState = { city: 'all', category: 'all', environment: 'all', scene: 'all', score: 'all', sort: 'recommended' }

type Props = {
  filters: AlternativeFilterState
  setFilters: React.Dispatch<React.SetStateAction<AlternativeFilterState>>
  favorites: string[]
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>
  onOpenGallery: (place: DiscoverPlace, index?: number) => void
  onRequestAdd: (candidate: AlternativeAttraction, date: string) => void
}

const categoryLabels: Record<AlternativeCategory, string> = { landmark: '名胜地标', culture: '文化街区', religion: '宗教文化', museum: '博物馆', shopping: '商圈购物', nature: '自然生态', island: '海岛', food: '美食夜市', nightlife: '夜生活', experience: '体验', other: '其它' }
const environmentLabels: Record<AlternativeEnvironment, string> = { indoor: '室内', outdoor: '户外', mixed: '混合' }
const dates = ['9/7', '9/8', '9/9', '9/10', '9/11', '9/12', '9/13']
const availableAlternatives = alternativeAttractions.filter(item => item.images.length > 0)

function stars(score: number) { return '★'.repeat(score) + '☆'.repeat(Math.max(0, 5 - score)) }
function duration(minutes: number) { return minutes >= 60 ? `${Math.floor(minutes / 60)}小时${minutes % 60 ? `${minutes % 60}分钟` : ''}` : `${minutes}分钟` }
function cityLabel(city: AlternativeAttraction['city']) { return city === 'kuala-lumpur' ? '吉隆坡' : '亚庇' }

function Badges({ candidate }: { candidate: AlternativeAttraction }) {
  return <div className="alternative-badges"><span> {candidate.environment === 'indoor' ? '🏠 室内' : candidate.environment === 'outdoor' ? '☀️ 户外' : '🌤️ 室内＋户外'}</span>{candidate.rainyDayFit === 'excellent' && <span>🌧️ 雨天友好</span>}{candidate.rainyDayFit === 'poor' && <span>☀️ 晴天更佳</span>}{candidate.nightFriendly && <span>🌙 夜晚推荐</span>}</div>
}

function AlternativeCard({ candidate, favorite, onFavorite, onOpenDetail, onOpenGallery }: { candidate: AlternativeAttraction; favorite: boolean; onFavorite: () => void; onOpenDetail: () => void; onOpenGallery: () => void }) {
  const image = candidate.images[0]
  return <article className="card alternative-card">
    <div className="alternative-picture-wrap"><button className="alternative-picture" onClick={onOpenGallery} aria-label={`打开${candidate.nameZh}相册`}>{image ? <img src={image.src} alt={image.alt} loading="lazy" /> : <span className="discover-placeholder"><ImageIcon size={22} />{candidate.nameZh}</span>}<span className="picture-open">查看相册</span><span className="picture-count">▧ {candidate.images.length}</span></button><button className={'bookmark alternative-bookmark ' + (favorite ? 'saved' : '')} onClick={onFavorite} aria-label={favorite ? '取消收藏' : '收藏候选'}>{favorite ? <Heart size={16} fill="currentColor" /> : <Bookmark size={16} />}</button></div>
    <div className="alternative-copy"><div className="alternative-card-top"><span className="alternative-city">{cityLabel(candidate.city)} · {candidate.area}</span><span className="alternative-duration">约{duration(candidate.durationMin)}</span></div><h3>{candidate.nameZh}</h3><div className="entity-english">{candidate.nameEn}</div><div className="score-pair"><span><small>景点推荐度</small><strong>{stars(candidate.attractionScore)}</strong></span><span><small>本次行程适配</small><strong className="fit-score">{stars(candidate.tripFitScore)}</strong></span></div><Badges candidate={candidate} /><p className="alternative-reason">{candidate.recommendationReasons[0]}</p><div className="alternative-card-actions"><button className="primary-btn small" onClick={onOpenDetail}>查看详情 <ChevronDown size={13} /></button><button className="ghost-btn small" onClick={onOpenGallery}>照片 <ImageIcon size={13} /></button></div></div>
  </article>
}

function Detail({ candidate, favorites, setFavorites, onClose, onOpenGallery, onRequestAdd }: { candidate: AlternativeAttraction; favorites: string[]; setFavorites: React.Dispatch<React.SetStateAction<string[]>>; onClose: () => void; onOpenGallery: (place: DiscoverPlace, index?: number) => void; onRequestAdd: (candidate: AlternativeAttraction, date: string) => void }) {
  const [date, setDate] = useState('9/8')
  const favorite = favorites.includes(candidate.id)
  const place: DiscoverPlace = { id: `alternative-${candidate.id}`, category: candidate.city === 'kuala-lumpur' ? '吉隆坡' : candidate.timeScope === 'full-day' || candidate.category === 'island' ? '海岛与活动' : '亚庇城市', title: candidate.nameZh, english: candidate.nameEn, positioning: candidate.shortDescription, tags: [], intro: candidate.description, images: candidate.images, placeName: candidate.mapQuery }
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return <div className="sheet-backdrop" onClick={onClose}><aside className="alternative-detail-sheet" role="dialog" aria-modal="true" aria-label={`${candidate.nameZh}详情`} onClick={event => event.stopPropagation()}><button className="sheet-close" onClick={onClose} aria-label="关闭详情"><X size={19} /></button><div className="sheet-scroll"><div className="detail-hero-image"><button onClick={() => onOpenGallery(place, 0)} aria-label={`查看${candidate.nameZh}真实图片`}><img src={candidate.images[0]?.src} alt={candidate.images[0]?.alt ?? candidate.nameZh} /></button><span>{candidate.images.length} 张本地实景图 · 点击打开统一相册</span></div><div className="detail-heading"><div className="section-kicker">{cityLabel(candidate.city)} · ALTERNATIVE</div><h2>{candidate.nameZh}</h2><div className="entity-english">{candidate.nameEn}</div><button className={'detail-favorite ' + (favorite ? 'saved' : '')} onClick={() => setFavorites(prev => prev.includes(candidate.id) ? prev.filter(id => id !== candidate.id) : [...prev, candidate.id])}>{favorite ? <Heart size={15} fill="currentColor" /> : <Bookmark size={15} />} {favorite ? '已收藏到我的候选' : '收藏到我的候选'}</button></div><div className="detail-score-grid"><div><small>景点本身推荐度</small><strong>{stars(candidate.attractionScore)}</strong><span>{candidate.attractionScore >= 4 ? '值得专门安排' : '有兴趣再安排'}</span></div><div><small>对本次行程适配度</small><strong className="fit-score">{stars(candidate.tripFitScore)}</strong><span>{candidate.tripFitScore >= 4 ? '适合这趟 7 天 6 晚' : '需要牺牲其它时间'}</span></div></div><Badges candidate={candidate} /><div className="detail-copy"><h3>为什么去</h3>{candidate.recommendationReasons.map(reason => <p key={reason}>＋ {reason}</p>)}<h3>为什么不去</h3>{candidate.drawbacks.map(reason => <p key={reason}>－ {reason}</p>)}<h3>执行信息</h3><div className="detail-facts"><span><b>游玩时间</b>{duration(candidate.durationMin)}（最少{duration(candidate.minimumDurationMin)}）</span><span><b>建议时段</b>{candidate.recommendedTime === 'morning' ? '上午' : candidate.recommendedTime === 'afternoon' ? '下午' : candidate.recommendedTime === 'evening' ? '傍晚' : candidate.recommendedTime === 'night' ? '晚上' : '全天弹性'}</span><span><b>营业 / 开放</b>{candidate.openingHours ?? '以官方页面实时信息为准'}</span><span><b>预约</b>{candidate.bookingRequired ? candidate.bookingRecommendation ?? '需要提前确认' : '通常无需预约，但仍以官方公告为准'}</span><span><b>区域</b>{candidate.area} · {candidate.mapQuery}</span><span><b>体力 / 日晒</b>{candidate.physicalLoad === 'low' ? '轻松' : candidate.physicalLoad === 'medium' ? '适中' : '较高'} · {candidate.sunExposure === 'low' ? '低' : candidate.sunExposure === 'medium' ? '中' : '高'}</span></div><h3>适合替换谁</h3><p>{candidate.replacementTargets.join(' · ')}</p></div><div className="detail-source"><span>来源：{candidate.sourceName} · 核验 {candidate.verifiedAt}</span><a href={candidate.sourceUrl} target="_blank" rel="noreferrer">官方页面 <ExternalLink size={12} /></a></div><div className="detail-add"><div><strong>找一个舒服的时间</strong><small>如果没有合理空位，系统会提示替换而不是强塞。</small></div><div className="detail-add-row"><select value={date} onChange={event => setDate(event.target.value)}>{dates.map(item => <option key={item}>{item}</option>)}</select><button className="primary-btn small" onClick={() => onRequestAdd(candidate, date)}><Check size={14} />分析并加入</button></div></div><a className="detail-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(candidate.mapQuery)}`} target="_blank" rel="noreferrer"><MapPin size={14} />用官方英文名打开 Google Maps</a></div></aside></div>
}

export function AlternativeExplorer({ filters, setFilters, favorites, setFavorites, onOpenGallery, onRequestAdd }: Props) {
  const [tab, setTab] = useState<'kuala-lumpur' | 'kota-kinabalu' | 'favorites'>('kuala-lumpur')
  const [detail, setDetail] = useState<AlternativeAttraction | null>(null)
  const all = useMemo(() => availableAlternatives.filter(item => tab === 'favorites' ? favorites.includes(item.id) : item.city === tab), [favorites, tab])
  const filtered = useMemo(() => all.filter(item => {
    if (filters.city !== 'all' && item.city !== filters.city) return false
    if (filters.category !== 'all' && item.category !== filters.category) return false
    if (filters.environment !== 'all' && item.environment !== filters.environment) return false
    if (filters.score === 'five' && item.attractionScore < 5) return false
    if (filters.score === 'four' && item.attractionScore < 4) return false
    if (filters.scene === 'rainy' && item.rainyDayFit !== 'excellent') return false
    if (filters.scene === 'sunny' && item.rainyDayFit === 'excellent') return false
    if (filters.scene === 'night' && !item.nightFriendly) return false
    if (filters.scene === 'easy' && item.physicalLoad !== 'low') return false
    if (filters.scene === 'half-day' && item.timeScope !== 'half-day') return false
    if (filters.scene === 'full-day' && item.timeScope !== 'full-day') return false
    return true
  }).sort((a, b) => filters.sort === 'fit' ? b.tripFitScore - a.tripFitScore : filters.sort === 'shortest' ? a.durationMin - b.durationMin : filters.sort === 'rainy' ? (b.rainyDayFit === 'excellent' ? 1 : 0) - (a.rainyDayFit === 'excellent' ? 1 : 0) : (b.attractionScore + b.tripFitScore) - (a.attractionScore + a.tripFitScore)), [all, filters])
  const toggleFavorite = (id: string) => setFavorites(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  return <section className="section" id="alternatives"><SectionHead kicker="11 · EXPLORE / ALTERNATIVES" title="自选景点" note="不是继续塞景点，而是在默认推荐之外，找一个更符合兴趣、天气和路线的替换答案。" /><div className="alternative-intro card"><div><div className="micro">DEFAULT + CUSTOM</div><h3>默认行程永远保留</h3><p>这里的选择只写入自定义层；每个候选都同时说明“为什么去”和“为什么不去”。</p></div><SlidersHorizontal size={24} color="var(--teal)" /></div><div className="alternative-tabs" role="tablist"><button className={tab === 'kuala-lumpur' ? 'active' : ''} onClick={() => { setTab('kuala-lumpur'); setFilters(prev => ({ ...prev, city: 'kuala-lumpur' })) }}>吉隆坡 <span>{availableAlternatives.filter(item => item.city === 'kuala-lumpur').length}</span></button><button className={tab === 'kota-kinabalu' ? 'active' : ''} onClick={() => { setTab('kota-kinabalu'); setFilters(prev => ({ ...prev, city: 'kota-kinabalu' })) }}>亚庇 <span>{availableAlternatives.filter(item => item.city === 'kota-kinabalu').length}</span></button><button className={tab === 'favorites' ? 'active' : ''} onClick={() => { setTab('favorites'); setFilters(prev => ({ ...prev, city: 'all' })) }}><Heart size={14} />我的候选 <span>{availableAlternatives.filter(item => favorites.includes(item.id)).length}</span></button></div><div className="alternative-filters"><select value={filters.category} onChange={event => setFilters(prev => ({ ...prev, category: event.target.value as AlternativeFilterState['category'] }))}><option value="all">全部类型</option>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select value={filters.environment} onChange={event => setFilters(prev => ({ ...prev, environment: event.target.value as AlternativeFilterState['environment'] }))}><option value="all">室内 / 户外 / 混合</option>{Object.entries(environmentLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select value={filters.scene} onChange={event => setFilters(prev => ({ ...prev, scene: event.target.value as AlternativeFilterState['scene'] }))}><option value="all">全部场景</option><option value="rainy">🌧️ 雨天</option><option value="sunny">☀️ 晴天</option><option value="night">🌙 晚上</option><option value="easy">轻松</option><option value="half-day">半天</option><option value="full-day">全天</option></select><select value={filters.score} onChange={event => setFilters(prev => ({ ...prev, score: event.target.value as AlternativeFilterState['score'] }))}><option value="all">全部推荐度</option><option value="five">★★★★★</option><option value="four">★★★★以上</option></select><select value={filters.sort} onChange={event => setFilters(prev => ({ ...prev, sort: event.target.value as AlternativeFilterState['sort'] }))}><option value="recommended">最推荐</option><option value="fit">最适合本次行程</option><option value="shortest">游玩时间最短</option><option value="rainy">雨天最适合</option></select></div>{filtered.length ? <div className="alternative-grid">{filtered.map(candidate => <AlternativeCard key={candidate.id} candidate={candidate} favorite={favorites.includes(candidate.id)} onFavorite={() => toggleFavorite(candidate.id)} onOpenDetail={() => setDetail(candidate)} onOpenGallery={() => onOpenGallery({ id: `alternative-${candidate.id}`, category: candidate.city === 'kuala-lumpur' ? '吉隆坡' : candidate.timeScope === 'full-day' || candidate.category === 'island' ? '海岛与活动' : '亚庇城市', title: candidate.nameZh, english: candidate.nameEn, positioning: candidate.shortDescription, tags: [], intro: candidate.description, images: candidate.images, placeName: candidate.mapQuery }, 0)} />)}</div> : <div className="card empty-state">当前筛选下没有候选；建议放宽场景或推荐度筛选。</div>}<div className="alternative-footnote">交通为区域＋距离静态估算，预计交通以当天 Grab / Google Maps 为准；候选图片全部为本地 Wikimedia Commons 实景与许可记录。</div>{detail && <Detail candidate={detail} favorites={favorites} setFavorites={setFavorites} onClose={() => setDetail(null)} onOpenGallery={onOpenGallery} onRequestAdd={(candidate, date) => onRequestAdd(candidate, date)} />}</section>
}
