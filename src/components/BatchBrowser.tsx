import { useId, useState, type ReactNode } from 'react';
import type { Batch } from '../domain/operations';

const pageSize = 5;
export function BatchBrowser({ batches, children, searchText }: {
  batches: Batch[]; children: (batch: Batch) => ReactNode; searchText?: (batch: Batch) => string;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('全部');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null | undefined>();
  const panelId = useId();
  const matching = batches.slice().reverse().filter(b => {
    const matchesStatus = status === '全部' || (status === '未完成' ? b.status !== '已放行' : status === '待核決' ? ['待 GM 審核', '待董事長核決'].includes(b.status) : b.status === '已放行');
    const haystack = `${b.name} ${b.id} ${b.status} ${b.sourcingRun?.candidates.map(c => `${c.title} ${c.supplier}`).join(' ') || ''} ${searchText?.(b) || ''}`.toLocaleLowerCase();
    return matchesStatus && haystack.includes(query.trim().toLocaleLowerCase());
  });
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = matching.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const selected = selectedId === undefined ? visible[0] : visible.find(b => b.id === selectedId);
  const changePage = (next: number) => { setPage(next); setSelectedId(null); };
  return <section className="batch-browser" aria-label="批次管理">
    <div className="panel-heading"><h2>批次管理</h2><span>{batches.length} 個批次 · 最新在前</span></div>
    <div className="batch-browser-tools">
      <label>搜尋批次<input type="search" placeholder="批次名稱、商品或店家" value={query} onChange={e => { setQuery(e.target.value); setPage(0); setSelectedId(null); }} /></label>
      <label>批次狀態<select value={status} onChange={e => { setStatus(e.target.value); setPage(0); setSelectedId(null); }}>{['全部', '未完成', '待核決', '已放行'].map(s => <option key={s}>{s}</option>)}</select></label>
    </div>
    <p className="subtle">每頁最多 5 個批次；點選一個查看作業與交付內容。</p>
    <div className="batch-browser-list">{visible.map(b => <button type="button" key={b.id} className={`batch-browser-row ${selected?.id === b.id ? 'selected' : ''}`} aria-expanded={selected?.id === b.id} aria-controls={panelId} onClick={() => setSelectedId(selected?.id === b.id ? null : b.id)}>
      <span><strong>{b.name}</strong><small>{b.sourcingRun ? `候選 ${b.sourcingRun.candidates.length} 筆` : '選品尚未執行'}{b.mode === 'demo' ? ' · 示範' : ''}</small></span>
      <span>{b.status}</span><span className="batch-browser-toggle">{selected?.id === b.id ? '收合 −' : '查看 ＋'}</span>
    </button>)}</div>
    {!visible.length && <p role="status" className="ops-empty">{batches.length ? '沒有符合條件的批次。請調整搜尋或狀態。' : '尚無批次，發起選品後會顯示在這裡。'}</p>}
    <nav className="batch-pagination" aria-label="批次分頁"><button className="quiet-button" disabled={currentPage === 0} onClick={() => changePage(currentPage - 1)}>上一頁</button><span aria-live="polite">第 {currentPage + 1} / {pageCount} 頁 · {matching.length} 筆</span><button className="quiet-button" disabled={currentPage + 1 >= pageCount} onClick={() => changePage(currentPage + 1)}>下一頁</button></nav>
    <div id={panelId}>{selected && <div className="batch-browser-detail" key={selected.id}>{children(selected)}</div>}</div>
  </section>;
}
