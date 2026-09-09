import { useState } from 'react';
import { BatchBrowser } from '../components/BatchBrowser';
import { PageHeading } from '../components/ui';
import { BatchDecision } from '../components/BatchFlow';
import { useOperations } from '../hooks/useOperations';

export default function Approvals() {
  const { state } = useOperations();
  const pending = state.batches.filter(b => ['待 GM 審核', '待董事長核決'].includes(b.status));
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(state.decisions.length / 10));
  const currentPage = Math.min(page, pages - 1);
  return <><PageHeading eyebrow="GENERAL MANAGER" title="GM 最終審核" description="GM 批准選品即可交付 Excel；僅社群內容送董事長最終核決。" />
    {!!pending.length && <BatchBrowser batches={pending}>{batch => <BatchDecision batch={batch} actor={batch.status === '待董事長核決' ? '董事長' : 'GM'} />}</BatchBrowser>}
    {!pending.length && <div className="ops-empty">尚無成熟批次；一般補件與退回由 GM 工作佇列處理。</div>}
    <div className="section-toolbar"><h2>核決紀錄</h2></div><section className="ops-section">{state.decisions.slice(currentPage * 10, (currentPage + 1) * 10).map(d => <div className="decision-row" key={d.id}><span className={`decision-result ${d.result === '放行' ? 'pass' : ''}`}>{d.result}</span><div><strong>{d.title}</strong><p>{d.reason || '已核准進入下一步'}</p></div><small>{d.time}</small></div>)}{!state.decisions.length && <p className="empty-copy">尚無核決紀錄</p>}</section>
    {pages > 1 && <nav className="batch-pagination" aria-label="核決紀錄分頁"><button className="quiet-button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>較新紀錄</button><span>第 {currentPage + 1} / {pages} 頁</span><button className="quiet-button" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>較舊紀錄</button></nav>}
  </>;
}
