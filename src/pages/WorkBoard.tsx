import { BatchBrowser } from '../components/BatchBrowser';
import { SupplierLibrary, SourcingResults } from '../components/Sourcing';
import { useState } from 'react';
import { PageHeading } from '../components/ui';
import { CaseCard } from '../components/Operations';
import { useOperations } from '../hooks/useOperations';
import { sourceBriefs, type Team } from '../domain/operations';

export default function WorkBoard({ team }: { team: Team }) {
  const { state, demo } = useOperations();
  const brief = sourceBriefs[team];
  const [filter, setFilter] = useState('全部');
  return <>
    <PageHeading eyebrow={team === '選品組' ? 'CURATION IN PROGRESS' : 'VISUALS IN THE MAKING'} title={team === '選品組' ? '選品進度' : '視覺進度'} description={team === '選品組' ? '正在挑哪些款式，還差哪一步。' : '定期社群內容、好友引導，以及上架前穿搭素材。'} />
    <p className="work-auto-note">{brief.summary}</p>
    <details className="batch-details"><summary>查看來源與查核方式</summary><p className="subtle">由董事長發起批次，GM 依制度派工。候選可先記錄現有可追溯資料，無需等待淘寶登入；匯出前另核對完整資料與財務。</p>{brief.rules.map(rule => <p key={rule}>{rule}</p>)}</details>
    {team === '選品組' && <details className="approved-followups ops-section"><summary>已核准商品 A/B · 獨立追蹤</summary><p className="subtle">依公司制度保留，不回候選池，也不等待新批次。</p>{["FREAK'S STORE for BEACH & FES Recycled Nylon Short Sleeve Shirt", "FREAK'S STORE Short Length Hoodie Knit"].map(name => <div className="followup-row" key={name}><strong>{name}</strong><span>核准已記錄 · 後續證據 OPEN</span><p>實際商品圖片、採購成本、規格庫存與上架證據待驗證；財務定價 BLOCK。官方 SKU 與淘寶登入不是阻擋原因。精確找款最多兩工作週期，之後轉同方向可採購替代貨源，保留原案例外。</p></div>)}</details>}
    {team === '選品組' && <SupplierLibrary />}
    <BatchBrowser key={`${team}-${demo}-${state.batches.at(-1)?.id}`} batches={state.batches} searchText={b => state.cases.filter(c => c.batchId === b.id && c.team === team).map(c => c.title).join(' ')}>{batch => {
      const cases = state.cases.filter(c => c.batchId === batch.id && c.team === team && (filter === '全部' || c.stage === filter));
      return <>
        {team === '選品組' && <SourcingResults batch={batch} />}
        <div className="section-toolbar"><div className="filter-tabs" aria-label="作業狀態">{['全部', '待接通', '進行中', '待審批', '已退回', '已放行'].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value}</button>)}</div></div>
        {cases.length ? <div className="case-grid">{cases.map(item => <CaseCard key={item.id} item={item} />)}</div> : <p className="ops-empty">此批次沒有符合條件的作業。</p>}
      </>;
    }}</BatchBrowser>
  </>;
}
