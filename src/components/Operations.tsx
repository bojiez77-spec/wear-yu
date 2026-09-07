import { Check, Film, Image, MessageCircle } from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { hasOpenFinding, progress, type WorkCase } from '../domain/operations';
import { Badge, ProductArt } from './ui';
import { products } from '../data/mock';

export function CaseCard({ item }: { item: WorkCase }) {
  const { state, demo } = useOperations();
  const done = progress(item);
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
      <div className="case-steps readonly-steps">{item.steps.map(step => <span key={step.label} className={step.done ? 'done' : ''}><Check size={14} />{step.label}</span>)}</div>
      {decision?.result === '退回' && item.stage === '已退回' && <p className="case-feedback">GM 退回：{decision.reason}</p>}
      {blocked && <p className="case-feedback">有稽核缺失待改善</p>}
      {item.stage === '待審批' && <p className="subtle">已送交 GM，等待核決</p>}
      {item.stage === '已放行' && <p className="approved-note"><Check size={15} />GM 已放行</p>}
    </div>
  </article>;
}
