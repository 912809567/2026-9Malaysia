import { AlertTriangle, ArrowLeft, Check, Clock3, Route, X } from 'lucide-react'
import type { ItineraryItem } from '../data/itinerary'
import type { AlternativeAttraction } from '../data/alternatives'
import type { ConflictReport } from '../utils/itineraryConflictChecker'

type Props = {
  current: ItineraryItem
  candidate: AlternativeAttraction
  report: ConflictReport
  onBack: () => void
  onConfirm: () => void
  onClose: () => void
}

function duration(value: string | undefined) {
  return value || '约1小时'
}

export function ReplacementPreview({ current, candidate, report, onBack, onConfirm, onClose }: Props) {
  const delta = report.route.deltaMinutes
  const deltaLabel = delta > 0 ? `增加约${delta}分钟` : delta < 0 ? `减少约${Math.abs(delta)}分钟` : '交通时间基本不变'
  const candidateStartTime = candidate.timeScope === 'full-day' ? '07:00' : current.time
  return <div className="sheet-backdrop" onClick={onClose}>
    <aside className="alternative-detail-sheet replacement-preview-sheet" role="dialog" aria-modal="true" aria-label="替换预览" onClick={event => event.stopPropagation()}>
      <button className="sheet-close" onClick={onClose} aria-label="关闭替换预览"><X size={19} /></button>
      <div className="sheet-scroll">
        <div className="section-kicker">REPLACEMENT PREVIEW · 替换预览</div>
        <h2>把「{current.title}」换成「{candidate.nameZh}」</h2>
        <p className="sheet-lead">只写入 CUSTOM 自定义层，默认推荐行程仍然保留，之后可以恢复这一项或恢复整天。</p>
        {current.replaceability === 'major' && <div className="preview-callout major"><AlertTriangle size={17} /><span>这是大型活动，替换会重新规划半天 / 全天节奏；请确认体力和天气窗口。</span></div>}
        <div className="version-compare">
          <div className="version-card default"><span className="version-label">DEFAULT · 默认</span><strong>{current.time} · {current.title}</strong><small>{duration(current.duration)}</small><span>{report.route.current.label} · 原交通约{report.route.current.minutes}分钟</span></div>
          <div className="version-arrow">→</div>
          <div className="version-card custom"><span className="version-label">CUSTOM · 调整后</span><strong>{candidateStartTime} · {candidate.nameZh}</strong><small>{duration(`约${Math.floor(candidate.durationMin / 60)}小时${candidate.durationMin % 60 ? `${candidate.durationMin % 60}分钟` : ''}`)}</small><span>{report.route.candidate.label} · 新交通约{report.route.candidate.minutes}分钟</span></div>
        </div>
        <div className="route-delta card-inset"><Route size={17} /><div><strong>{deltaLabel}</strong><span>区域：{report.route.currentZone} → {report.route.candidateZone} · {report.route.candidate.mode}</span><small>预计交通，以当天 Grab / Google Maps 为准</small></div></div>
        <div className="time-compare"><div><Clock3 size={15} /><span>预计下一项</span><strong>{report.nextTime ?? '按当天时间线重排'}</strong></div><div><span>候选适配</span><strong>{candidate.tripFitScore}/5</strong></div><div><span>营业 / 预约</span><strong>{candidate.bookingRequired ? '需要提前确认' : '通常无需预约'}</strong></div></div>
        {(report.blockers.length > 0 || report.warnings.length > 0) && <div className={'preview-messages ' + (report.blockers.length ? 'blocked' : 'warning')}>
          {report.blockers.map(message => <p className="preview-message" key={message}><AlertTriangle size={14} />{message}</p>)}
          {report.warnings.map(message => <p className="preview-message" key={message}><AlertTriangle size={14} />{message}</p>)}
        </div>}
        {report.canConfirm ? <div className="preview-ready"><Check size={16} />{report.warnings.length ? '可以确认，但请先看完上面的提醒。' : '时间、路线和固定事项检查通过。'}</div> : <div className="preview-blocked"><AlertTriangle size={16} />暂不能确认这次替换，请选择同等时间段或先恢复默认。</div>}
        <div className="preview-actions"><button className="ghost-btn small" onClick={onBack}><ArrowLeft size={14} />换一个候选</button><button className="primary-btn" disabled={!report.canConfirm} onClick={onConfirm}><Check size={15} />确认替换</button></div>
      </div>
    </aside>
  </div>
}
