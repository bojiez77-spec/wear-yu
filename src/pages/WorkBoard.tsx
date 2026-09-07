import { useState } from 'react';
import { PageHeading } from '../components/ui';
import { CaseCard } from '../components/Operations';
import { useOperations } from '../hooks/useOperations';
import { sourceBriefs, type Team } from '../domain/operations';

export default function WorkBoard({ team }: { team: Team }) {
  const { state } = useOperations();
  const brief = sourceBriefs[team];
  const [filter, setFilter] = useState('全部');
  const cases = state.cases.filter(c => c.team === team && (filter === '全部' || c.stage === filter));
  return <>
    <PageHeading eyebrow={team === '選品組' ? 'CURATION IN PROGRESS' : 'VISUALS IN THE MAKING'} title={team === '選品組' ? '選品進度' : '視覺進度'} description={team === '選品組' ? '正在挑哪些款式，還差哪一步。' : '定期社群內容、好友引導，以及上架前穿搭素材。'} />
    <p className="work-auto-note">{brief.summary}</p>
    <details className="batch-details"><summary>查看來源與查核方式</summary><p className="subtle">由董事長發起批次，GM 依制度派工。來源規則已設定，資料擷取與製作服務仍待接通。</p>{brief.rules.map(rule => <p key={rule}>{rule}</p>)}</details>
    {team === '選品組' && <section className="approved-followups ops-section"><h2>已核准商品・獨立追蹤</h2><p className="subtle">依公司制度保留，不回候選池，也不等待新批次。</p>{["FREAK'S STORE for BEACH & FES Recycled Nylon Short Sleeve Shirt", "FREAK'S STORE Short Length Hoodie Knit"].map(name => <div className="followup-row" key={name}><strong>{name}</strong><span>核准已記錄 · 後續證據 OPEN</span><p>SKU、原圖、採購成本、庫存與上架證據待驗證；財務定價 BLOCK。</p></div>)}</section>}
    <div className="section-toolbar"><div className="filter-tabs" aria-label="作業狀態">{['全部', '進行中', '待審批', '已退回', '已放行'].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value}</button>)}</div></div>
    {cases.length ? <div className="case-grid">{cases.map(item => <CaseCard key={item.id} item={item} />)}</div> : <div className="ops-empty">{filter === '全部' ? '尚未派工。請由品牌營運中心發起新批次。' : `目前沒有${filter}的作業。`}</div>}
  </>;
}
