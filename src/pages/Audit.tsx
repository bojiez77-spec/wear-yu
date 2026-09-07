import { DefectFields, CapaForm } from '../components/Delivery';
import type { DefectType } from '../domain/operations';
import { useState } from 'react';
import { PageHeading, Badge } from '../components/ui';
import { useOperations } from '../hooks/useOperations';

export default function AuditPage() {
  const { state, dispatch } = useOperations();
  const [caseId, setCaseId] = useState('');
  const [finding, setFinding] = useState('');
  const [result, setResult] = useState('無缺失');
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [defectType, setDefectType] = useState<DefectType>('圖片／素材');
  const [department, setDepartment] = useState('視覺組');
  const unresolved = state.audits.filter(a => a.finding && !a.resolved).length;
  return <>
    <PageHeading eyebrow="AUDIT & IMPROVEMENT" title="稽核查核" description="定期確認案件，讓缺失有追蹤、改善有結果。" />
    <div className="audit-summary"><div><span>待改善</span><strong>{unresolved}</strong></div><div><span>已查核</span><strong>{state.audits.length}</strong></div><button className="gold-button" disabled={!state.cases.length} aria-expanded={open} onClick={() => { setOpen(!open); setCaseId(state.cases[0]?.id ?? ''); }}>新增查核</button></div>
    {open && <form className="inline-form" onSubmit={e => {
      e.preventDefault(); if (!caseId || (result === '有缺失' && !finding.trim())) return;
      dispatch({ type: 'audit', id: caseId, defectType, department, finding: result === '有缺失' ? finding : '', eventId: crypto.randomUUID(), time: new Date().toLocaleString('zh-TW', { hour12: false }) });
      setOpen(false); setFinding(''); setNotice('查核已記錄。');
    }}><label>查核案件<select value={caseId} onChange={e => setCaseId(e.target.value)}>{state.cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><div className="filter-tabs">{['無缺失', '有缺失'].map(value => <button type="button" key={value} aria-pressed={result === value} className={result === value ? 'active' : ''} onClick={() => setResult(value)}>{value}</button>)}</div>{result === '有缺失' && <DefectFields value={defectType} onChange={setDefectType} department={department} onDepartment={setDepartment} />}{result === '有缺失' && <label>缺失說明<textarea required maxLength={300} value={finding} onChange={e => setFinding(e.target.value)} /></label>}<div className="action-row"><button className="gold-button" type="submit">記錄查核</button><button className="quiet-button" type="button" onClick={() => setOpen(false)}>取消</button></div></form>}
    <p role="status" className="notice">{notice}</p>
    {state.audits.length ? <section className="ops-section">{state.audits.map(a => <article className="audit-row" key={a.id}><div><div className="case-meta"><span>{a.time}</span><Badge tone={a.resolved ? 'green' : 'gold'}>{!a.finding ? '無缺失' : a.resolved ? '已改善' : '待改善'}</Badge></div><h2>{a.title}</h2><p>{a.finding || '本次查核未發現缺失。'}</p></div>{a.capa && <CapaForm audit={a} />}{a.finding && !a.resolved && !a.capa && <button className="gold-button" onClick={() => { dispatch({ type: 'resolve', id: a.id }); setNotice('已確認改善，原始缺失紀錄保留。'); }}>確認已改善</button>}</article>)}</section> : <div className="ops-empty">尚無查核紀錄。建立作業後即可進行查核。</div>}
  </>;
}
