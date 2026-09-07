import { useState } from 'react';
import { Check, ArrowRight, Play } from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { gateDefinitions, type Batch } from '../domain/operations';

export function StartBatch() {
  const { state, demo, dispatch } = useOperations();
  const active = state.batches.some(b => b.status !== '已放行');
  return <div className="batch-launch"><button className="gold-button" disabled={active} onClick={() => dispatch({ type: 'launch', id: crypto.randomUUID(), demo })}><Play size={16} />{active ? '本批次處理中' : '發起新批次選品'}</button><span>{demo ? '示範模式 · 自動演練制度，不會實際找貨或製作素材' : '一次下令，由 GM 工作佇列依制度承接'}</span></div>;
}
export function BatchFlow({ batch }: { batch: Batch }) {
  return <section className="batch-flow ops-section"><div className="panel-heading"><h2>{batch.name}</h2><span className="batch-state">{batch.status}{batch.mode === 'demo' ? ' · 演練' : ''}</span></div>
    <div className="company-flow">{['董事長下令', 'GM 派工執行', '制度查核', 'GM 最終審核', '董事長核決'].map((name, i) => <div key={name} className={i === 0 || (i === 1 && batch.gate >= 5) || (i === 2 && batch.gate >= 7) || (i === 3 && batch.gate === 8) || (i === 4 && batch.status === '已放行') ? 'complete' : ''}><span>0{i + 1}</span><strong>{name}</strong></div>)}</div>
    <div className="batch-next"><ArrowRight size={18} /><p>{batch.status === '待接通' ? 'GM 工作佇列已建立；執行服務尚未接通，不會假稱已找貨或完成素材。' : batch.status === '待董事長核決' ? '必要控制與 GM 審核已完成，等待董事長最終核決。' : batch.status === '已放行' ? '本批次已核決。此版本不會對外發布或交易。' : `目前：${gateDefinitions[Math.min(batch.gate, 7)].name}`}</p></div>
    {batch.reason && <p className="case-feedback">退回原因：{batch.reason} · 由 GM 接手改善</p>}
    <details className="batch-details"><summary>查看制度進度與紀錄</summary><ol>{gateDefinitions.map((gate, i) => <li key={gate.name}><span>{gate.name}<small>{gate.owner}</small></span><b>{i < batch.gate ? (batch.mode === 'demo' ? '演練完成' : '完成') : i === batch.gate ? batch.status === '待接通' ? '待接通' : '處理中' : '等待前關'}</b></li>)}</ol><p className="finance-policy">財務關卡：採購成本、海外刷卡費、運費與蝦皮費用皆須驗證；淨利率至少 65%。缺資料即 BLOCK，不以零售價代替採購成本。</p><div className="batch-events">{batch.events.map((event, i) => <p key={`${i}-${event}`}>{event}</p>)}</div></details>
  </section>;
}
export function BatchDecision({ batch, actor }: { batch: Batch; actor: 'GM' | '董事長' }) {
  const { state, dispatch } = useOperations();
  const [returning, setReturning] = useState(false);
  const [reason, setReason] = useState('');
  const ready = actor === 'GM' ? batch.status === '待 GM 審核' : batch.status === '待董事長核決';
  const blocked = state.audits.some(a => a.finding && !a.resolved && state.cases.some(c => c.id === a.caseId && c.batchId === batch.id));
  if (!ready) return null;
  const decide = (result: '放行' | '退回') => dispatch({ type: actor === 'GM' ? 'batch-gm' : 'chairman', id: batch.id, result, reason: result === '退回' ? reason : '' });
  return <article className="approval-card"><div className="case-meta"><span>{actor}核決</span><span>{batch.mode === 'demo' ? '示範批次' : '批次案件'}</span></div><h2>{batch.name}</h2><p className="subtle">{actor === 'GM' ? '確認制度查核與素材完整後，上呈董事長。' : 'GM 已完成最終審核，正常案件只需這一次最終核決。'}</p>{blocked && <p className="case-feedback">有稽核缺失待改善，暫不能放行。</p>}<div className="action-row"><button className="gold-button" disabled={blocked} onClick={() => decide('放行')}><Check size={15} />{actor === 'GM' ? 'GM 放行並上呈' : '董事長放行'}</button><button className="quiet-button" onClick={() => setReturning(true)}>退回 GM 改善</button></div>{returning && <form className="inline-form" onSubmit={e => { e.preventDefault(); if (reason.trim()) decide('退回'); }}><label>退回原因<textarea autoFocus required value={reason} maxLength={300} onChange={e => setReason(e.target.value)} /></label><div className="action-row"><button className="gold-button" disabled={!reason.trim()}>確認退回</button><button className="quiet-button" type="button" onClick={() => setReturning(false)}>取消</button></div></form>}</article>;
}
