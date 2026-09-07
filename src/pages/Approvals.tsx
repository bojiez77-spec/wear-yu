import { useState } from 'react';
import { Check, Undo2 } from 'lucide-react';
import { PageHeading, Badge } from '../components/ui';
import { useOperations } from '../hooks/useOperations';
import { hasOpenFinding } from '../domain/operations';

export default function Approvals() {
  const { state, dispatch } = useOperations();
  const [returnId, setReturnId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [filter, setFilter] = useState('全部');
  const [notice, setNotice] = useState('');
  const decide = (id: string, result: '放行' | '退回') => {
    dispatch({ type: 'decide', id, result, reason: result === '退回' ? reason : '', eventId: crypto.randomUUID(), time: new Date().toLocaleString('zh-TW', { hour12: false }) });
    setNotice(`案件已${result}，核決紀錄已更新。`); setReturnId(null); setReason('');
  };
  const pending = state.cases.filter(c => c.stage === '待審批');
  return <>
    <PageHeading eyebrow="GENERAL MANAGER" title="GM 審批" description="只處理已上呈案件，放行與退回都有紀錄。" />
    <div className="section-toolbar"><h2>等待核決</h2><Badge tone="gold">{pending.length} 件</Badge></div>
    {pending.length ? pending.map(c => <article className="approval-card" key={c.id}>
      <div className="case-meta"><span>{c.team} · {c.kind}</span><Badge>待審批</Badge></div><h2>{c.title}</h2><p className="subtle">{c.detail}</p><p className="cadence">{c.cadence}</p>
      <div className="approval-steps">{c.steps.map(s => <span key={s.label}><Check size={14} />{s.label}</span>)}</div>
      {hasOpenFinding(state, c.id) && <p className="case-feedback">稽核缺失尚未改善，暫不能放行。</p>}
      <div className="action-row"><button className="gold-button" disabled={hasOpenFinding(state, c.id)} onClick={() => decide(c.id, '放行')}><Check size={15} />放行</button><button className="quiet-button" onClick={() => { setReturnId(c.id); setReason(''); }}><Undo2 size={15} />退回</button></div>
      {returnId === c.id && <form className="inline-form" onSubmit={e => { e.preventDefault(); if (reason.trim()) decide(c.id, '退回'); }}><label>退回原因<textarea autoFocus required maxLength={300} value={reason} onChange={e => setReason(e.target.value)} placeholder="請寫明需要補正的內容" /></label><div className="action-row"><button className="gold-button" type="submit" disabled={!reason.trim()}>確認退回</button><button className="quiet-button" type="button" onClick={() => setReturnId(null)}>取消</button></div></form>}
    </article>) : <div className="ops-empty">目前沒有等待核決的案件。</div>}
    <p role="status" className="notice">{notice}</p>
    <div className="section-toolbar"><h2>核決紀錄</h2><div className="filter-tabs">{['全部', '放行', '退回'].map(value => <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div></div>
    <section className="ops-section">{state.decisions.filter(d => filter === '全部' || d.result === filter).map(d => <div className="decision-row" key={d.id}><span className={`decision-result ${d.result === '放行' ? 'pass' : ''}`}>{d.result}</span><div><strong>{d.title}</strong><p>{d.reason || '已核准進入下一步'}</p></div><small>{d.time}</small></div>)}{!state.decisions.some(d => filter === '全部' || d.result === filter) && <p className="empty-copy">尚無符合的核決紀錄</p>}</section>
  </>;
}
