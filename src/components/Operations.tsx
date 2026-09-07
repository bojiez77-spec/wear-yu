import { useState } from 'react';
import { Check, ArrowUpRight, Film, Image, MessageCircle, Plus } from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { hasOpenFinding, progress, stepLabels, type Kind, type Team, type WorkCase } from '../domain/operations';
import { Badge, ProductArt } from './ui';
import { products } from '../data/mock';

export function CaseCard({ item }: { item: WorkCase }) {
  const { state, dispatch, demo } = useOperations();
  const done = progress(item);
  const editable = item.stage === '進行中' || item.stage === '已退回';
  const blocked = hasOpenFinding(state, item.id);
  const decision = state.decisions.find(d => d.caseId === item.id);
  const product = products.find(p => p.id === item.productId);
  const Icon = item.kind === '穿搭短影片' ? Film : item.kind === '穿搭示意圖' ? Image : MessageCircle;
  return <article className="case-card">
    {product ? <div className="case-art"><ProductArt product={product} /><span>款式示意 · 非實拍</span></div> : <div className="case-art asset-placeholder"><Icon size={30} /><span>{item.kind} · 尚無素材檔案</span></div>}
    <div className="case-body">
      <div className="case-meta"><span>{item.kind}</span><Badge tone={item.stage === '已放行' ? 'green' : item.stage === '已退回' ? 'gold' : 'blue'}>{item.stage}</Badge></div>
      <h2>{item.title}</h2><p className="subtle">{item.detail || '尚未補充款式或內容說明'}</p>
      <p className="cadence">{item.cadence || '尚未安排時程'}{demo ? ' · 示範' : ''}</p>
      <div className="case-progress"><progress max="100" value={done} aria-label={`${item.title}進度`} /><span>{done}%</span></div>
      <div className="case-steps">{item.steps.map((step, index) => <label key={step.label}><input type="checkbox" checked={step.done} disabled={!editable} onChange={() => dispatch({ type: 'step', id: item.id, index })} /><span>{step.label}</span></label>)}</div>
      {decision?.result === '退回' && item.stage === '已退回' && <p className="case-feedback">GM 退回：{decision.reason}</p>}
      {blocked && <p className="case-feedback">有稽核缺失待改善</p>}
      {editable && <button className="gold-button" disabled={done < 100 || blocked} onClick={() => dispatch({ type: 'submit', id: item.id })}><ArrowUpRight size={15} />{item.stage === '已退回' ? '重新上呈' : '上呈 GM'}</button>}
      {item.stage === '待審批' && <p className="subtle">已送交 GM，等待核決</p>}
      {item.stage === '已放行' && <p className="approved-note"><Check size={15} />GM 已放行</p>}
    </div>
  </article>;
}
export function NewCase({ team }: { team: Team }) {
  const { dispatch } = useOperations();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [cadence, setCadence] = useState('');
  const [kind, setKind] = useState<Kind>(team === '選品組' ? '選品款式' : '社群內容');
  return <div className="new-case">
    <button className="gold-button" aria-expanded={open} onClick={() => setOpen(!open)}><Plus size={15} />新增作業</button>
    {open && <form className="inline-form" onSubmit={event => {
      event.preventDefault(); if (!title.trim()) return;
      dispatch({ type: 'add', item: { id: crypto.randomUUID(), title: title.trim(), detail: detail.trim(), cadence: cadence.trim(), kind, team, stage: '進行中', steps: stepLabels[kind].map(label => ({ label, done: false })) } });
      setOpen(false); setTitle(''); setDetail(''); setCadence('');
    }}>
      <label>作業名稱<input autoFocus required maxLength={80} value={title} onChange={e => setTitle(e.target.value)} placeholder={team === '選品組' ? '例如：霧藍襯衫與長褲' : '例如：週五穿搭短片'} /></label>
      {team === '視覺組' && <label>素材類型<select value={kind} onChange={e => setKind(e.target.value as Kind)}>{(['社群內容', '穿搭短影片', '穿搭示意圖'] as Kind[]).map(k => <option key={k}>{k}</option>)}</select></label>}
      <label>{team === '選品組' ? '款式重點' : '內容重點'}<input maxLength={150} value={detail} onChange={e => setDetail(e.target.value)} placeholder="選填" /></label>
      <label>安排時間<input maxLength={60} value={cadence} onChange={e => setCadence(e.target.value)} placeholder="例如：每週五／上架前" /></label>
      <div className="action-row"><button className="gold-button" type="submit">建立</button><button className="quiet-button" type="button" onClick={() => setOpen(false)}>取消</button></div>
    </form>}
  </div>;
}
