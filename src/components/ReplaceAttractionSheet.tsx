import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, ExternalLink, Image as ImageIcon, MapPin, X } from 'lucide-react'
import type { ItineraryItem } from '../data/itinerary'
import type { AlternativeAttraction } from '../data/alternatives'
import { alternativeToDiscoverPlace } from '../data/alternatives'
import { getItemSlotId, replacementCandidates, type ItineraryOverride } from '../utils/itineraryCustomizer'
import type { ConflictReport } from '../utils/itineraryConflictChecker'
import { ResponsiveImage } from './ResponsiveImage'
import { ReplacementPreview } from './ReplacementPreview'
import type { DiscoverPlace } from '../data/discover'

type Props = {
  date: string
  current: ItineraryItem
  items: ItineraryItem[]
  weather?: 'good' | 'okay' | 'bad'
  onClose: () => void
  onOpenGallery: (place: DiscoverPlace, index?: number) => void
  onConfirm: (override: ItineraryOverride) => void
}

function stars(score: number) { return '★'.repeat(score) + '☆'.repeat(Math.max(0, 5 - score)) }
function duration(minutes: number) { return minutes >= 60 ? `${Math.floor(minutes / 60)}小时${minutes % 60 ? `${minutes % 60}分钟` : ''}` : `${minutes}分钟` }
function environment(candidate: AlternativeAttraction) { return candidate.environment === 'indoor' ? '🏠 室内' : candidate.environment === 'outdoor' ? '☀️ 户外' : '🌤️ 室内＋户外' }
function routeClass(report: ConflictReport) { return report.route.quality }

function CandidateRow({ candidate, report, detail, onDetail, onGallery, onPreview }: { candidate: AlternativeAttraction; report: ConflictReport; detail: boolean; onDetail: () => void; onGallery: () => void; onPreview: () => void }) {
  const delta = report.route.deltaMinutes
  return <article className={'replacement-candidate ' + routeClass(report) + (detail ? ' expanded' : '')}>
    <div className="replacement-candidate-image"><button onClick={onGallery} aria-label={`查看${candidate.nameZh}真实图片`}><ResponsiveImage src={candidate.images[0]?.src ?? ''} alt={candidate.images[0]?.alt ?? candidate.nameZh} /></button><span className="replacement-image-count"><ImageIcon size={12} />{candidate.images.length}</span></div>
    <div className="replacement-candidate-copy"><div className="replacement-candidate-head"><div><h3>{candidate.nameZh}</h3><div className="entity-english">{candidate.nameEn}</div></div><span className="replacement-route-label">{report.route.candidate.label}</span></div><div className="replacement-score-row"><span>景点 {stars(candidate.attractionScore)}</span><span className="fit-score">本次 {stars(candidate.tripFitScore)}</span></div><div className="alternative-badges"><span>{environment(candidate)}</span>{candidate.rainyDayFit === 'excellent' && <span>🌧️ 雨天友好</span>}{candidate.rainyDayFit === 'poor' && <span>☀️ 晴天更佳</span>}{candidate.nightFriendly && <span>🌙 夜晚推荐</span>}</div><div className="replacement-meta"><span>约{duration(candidate.durationMin)}</span><span>{delta > 0 ? `预计增加交通${delta}分钟` : delta < 0 ? `预计减少交通${Math.abs(delta)}分钟` : '交通时间基本不变'}</span></div><p>{candidate.recommendationReasons[0]}</p>{detail && <div className="replacement-expanded"><h4>为什么去</h4>{candidate.recommendationReasons.map(reason => <span key={reason}>＋ {reason}</span>)}<h4>为什么不去</h4>{candidate.drawbacks.map(reason => <span key={reason}>－ {reason}</span>)}<div className="replacement-fact"><span>开放</span>{candidate.openingHours ?? '以官方页面实时信息为准'}</div><div className="replacement-fact"><span>预约</span>{candidate.bookingRequired ? candidate.bookingRecommendation ?? '需要提前确认' : '通常无需预约'}</div><a href={candidate.sourceUrl} target="_blank" rel="noreferrer">官方页面 <ExternalLink size={12} /></a></div>}<div className="replacement-actions"><button className="ghost-btn small" onClick={onDetail}>{detail ? '收起详情' : '查看详情'}</button><button className="primary-btn small" onClick={onPreview}><ArrowRight size={13} />预览替换</button></div>{report.blockers.length > 0 && <div className="replacement-blocker"><AlertTriangle size={13} />{report.blockers[0]}</div>}</div>
  </article>
}

export function ReplaceAttractionSheet({ date, current, items, weather, onClose, onOpenGallery, onConfirm }: Props) {
  const candidates = replacementCandidates(current, items, weather, date)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ candidate: AlternativeAttraction; report: ConflictReport } | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (preview) return <ReplacementPreview current={current} candidate={preview.candidate} report={preview.report} onBack={() => setPreview(null)} onClose={onClose} onConfirm={() => onConfirm({ date, slotId: getItemSlotId(current), action: 'replace', attractionId: preview.candidate.id })} />
  return <div className="sheet-backdrop" onClick={onClose}>
    <aside className="alternative-detail-sheet replace-sheet" role="dialog" aria-modal="true" aria-label={`替换${current.title}`} onClick={event => event.stopPropagation()}>
      <button className="sheet-close" onClick={onClose} aria-label="关闭替换列表"><X size={19} /></button>
      <div className="sheet-scroll">
        <div className="section-kicker">ADJUST · 行程调整</div>
        <h2>替换「{current.title}」</h2>
        <p className="sheet-lead">候选按当前时间、前后地点、路线、时长、天气和重复体验排序。这里只展示适合这个槽位的选择。</p>
        {current.replaceability === 'major' && <div className="preview-callout major"><AlertTriangle size={17} /><span>这是大型活动，替换它会重新规划半天 / 全天行程。</span></div>}
        {current.replaceability === 'fixed' ? <div className="preview-blocked"><AlertTriangle size={16} />🔒 固定事项不能替换：航班、机场、换酒店、已确认交通和固定返程动线会被保留。</div> : candidates.length ? <div className="replacement-list">{candidates.map(({ candidate, report }) => <CandidateRow key={candidate.id} candidate={candidate} report={report} detail={detailId === candidate.id} onDetail={() => setDetailId(detailId === candidate.id ? null : candidate.id)} onGallery={() => onOpenGallery(alternativeToDiscoverPlace(candidate), 0)} onPreview={() => setPreview({ candidate, report })} />)}</div> : <div className="empty-state card">暂时没有与这个槽位匹配的候选。建议回到“自选景点”按城市或时间段筛选。</div>}
        <div className="replace-sheet-note"><MapPin size={14} />路线是区域＋距离静态估算，预计交通以当天 Grab / Google Maps 为准。</div>
      </div>
    </aside>
  </div>
}
