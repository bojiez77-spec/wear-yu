import { SupplierLibrary, SourcingResults } from './Sourcing';
import { useState } from 'react';
import { Check, ArrowRight, Play } from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { DefectFields, BatchDelivery, BatchEvidence } from './Delivery';
import { gateDefinitions, type Batch, type DefectType } from '../domain/operations';

export function StartBatch() {
  const { demo, dispatch } = useOperations();
  return <div><div className="batch-launch"><button className="gold-button" onClick={() => dispatch({ type: 'launch', id: crypto.randomUUID(), demo, time: new Date().toISOString() })}><Play size={16} />發起新批次選品</button><span>{demo ? '示範模式 · 自動演練制度，不會實際找貨或製作素材' : '立即從已匯入的供應資料選取新候選、查重並保存結果'}</span></div><SupplierLibrary /></div>;
}
export function BatchFlow({ batch }: { batch: Batch }) {
  return <section className="batch-flow ops-section"><div className="panel-heading"><h2>{batch.name}</h2><span className="batch-state">{batch.status}{batch.mode === 'demo' ? ' · 演練' : ''}</span></div>
    <div className="company-flow">{['董事長下令', 'GM 派工執行', '制度查核', 'GM 最終審核', '社群董事長核決'].map((name, i) => <div key={name} className={i === 0 || (i === 1 && batch.gate >= 5) || (i === 2 && batch.gate >= 7) || (i === 3 && batch.gate === 8) || (i === 4 && batch.status === '已放行') ? 'complete' : ''}><span>0{i + 1}</span><strong>{name}</strong></div>)}</div>
    <div className="batch-next"><ArrowRight size={18} /><p>{batch.sourcingRun && !batch.gmApproved ? (batch.sourcingRun.candidates.length ? '候選已建立，請查看來源與缺口；採購、財務及 GM 核准尚未完成。' : '供應資料已檢查，沒有新候選；請補充來源後重試。') : batch.status === '待接通' ? '舊批次尚未執行選品，可在下方接續執行。' : batch.status === '待董事長核決' ? '選品已獲 GM 批准，可產製 Excel；社群等待董事長放行。' : batch.status === '已放行' ? batch.socialStatus === 'BLOCK' ? '社群已授權發布；外部服務未接通，發布 BLOCK。' : '選品已由 GM 批准；Excel 可交付，社群仍待內部流程。' : `目前：${gateDefinitions[Math.min(batch.gate, 7)].name}`}</p></div>
    {batch.reason && <p className="case-feedback">退回原因：{batch.reason} · 由 GM 接手改善</p>}
    <details className="batch-details"><summary>查看制度進度與紀錄</summary><ol>{gateDefinitions.map((gate, i) => <li key={gate.name}><span>{gate.name}<small>{gate.owner}</small></span><b>{i < batch.gate ? (batch.mode === 'demo' ? '演練完成' : '依送審證據複核') : i === batch.gate ? batch.status === '待接通' ? '待接通' : '處理中' : '等待前關'}</b></li>)}</ol><p className="finance-policy">財務關卡：採購成本、海外刷卡費、運費與蝦皮費用皆須驗證；淨利率至少 65%。缺資料即 BLOCK，不以零售價代替採購成本。</p><div className="batch-events">{batch.events.map((event, i) => <p key={`${i}-${event}`}>{event}</p>)}</div></details>
  <SourcingResults batch={batch} /><BatchDelivery batch={batch} /></section>;
}
export function BatchDecision({ batch, actor }: { batch: Batch; actor: 'GM' | '董事長' }) {
  const { state, dispatch } = useOperations();
  const [returning, setReturning] = useState(false);
  const [reason, setReason] = useState('');
  const [defectType, setDefectType] = useState<DefectType>('圖片／素材');
  const [department, setDepartment] = useState('視覺組');
  const ready = actor === 'GM' ? batch.status === '待 GM 審核' : batch.status === '待董事長核決';
  const blocked = state.audits.some(a => a.finding && !a.resolved && (a.caseId === batch.id || state.cases.some(c => c.id === a.caseId && c.batchId === batch.id)));
  if (!ready) return null;
  const decide = (result: '放行' | '退回') => dispatch({ type: actor === 'GM' ? 'batch-gm' : 'chairman', id: batch.id, result, defectType, department, reason: result === '退回' ? reason : '' });
  return <article className="approval-card"><div className="case-meta"><span>{actor}核決</span><span>{batch.mode === 'demo' ? '示範批次' : '批次案件'}</span></div><h2>{batch.name}</h2><p className="subtle">{actor === 'GM' ? '確認制度與資料後，批准選品 Excel 交付；社群另送董事長。' : '僅核決社群內容；放行後直接進入發布佇列，PUBLISHED 才算完成。'}</p><BatchEvidence batch={batch} />{blocked && <p className="case-feedback">有稽核缺失待改善，暫不能放行。</p>}<div className="action-row"><button className="gold-button" disabled={blocked} onClick={() => decide('放行')}><Check size={15} />{actor === 'GM' ? 'GM批准選品／送審社群' : '董事長放行'}</button><button className="quiet-button" onClick={() => setReturning(true)}>退回部門修正</button></div>{returning && <form className="inline-form" onSubmit={e => { e.preventDefault(); if (reason.trim()) decide('退回'); }}><DefectFields value={defectType} onChange={setDefectType} department={department} onDepartment={setDepartment} /><label>退回原因<textarea autoFocus required value={reason} maxLength={300} onChange={e => setReason(e.target.value)} /></label><div className="action-row"><button className="gold-button" disabled={!reason.trim()}>確認退回</button><button className="quiet-button" type="button" onClick={() => setReturning(false)}>取消</button></div></form>}</article>;
}
