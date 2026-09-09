import { useState } from 'react';
import { useOperations } from '../hooks/useOperations';
import { parseSupplierRecords } from '../domain/sourcing';
import type { Batch } from '../domain/operations';

export function SupplierLibrary() {
  const { state, demo, dispatch } = useOperations();
  const [message, setMessage] = useState('');
  if (demo) return null;
  return <details className="batch-details"><summary>供應資料庫 · {state.supplierPool?.length || 0} 筆</summary>
    <p>匯入含來源截圖的供應資料檔後，發起批次即會選取尚未處理的商品並查重。資料只保存於此瀏覽器，可下載備份；不會上傳至公開網站。這個流程使用既有資料，尚未接通即時網路找貨。</p>
    <label>匯入供應資料檔<input aria-label="匯入供應資料檔" type="file" accept=".json,application/json" onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
      try {
        if (file.size > 3_500_000) throw new Error('檔案超過 3.5 MB，請分批匯入。');
        const records = parseSupplierRecords(await file.text());
        if (!dispatch({ type: 'supplier-import', records })) { setMessage('匯入未保存，請查看儲存錯誤。'); return; }
        setMessage(`已讀取 ${records.length} 筆；相同識別碼或來源位置保留既有資料，不重複新增。`);
      } catch (err) { setMessage(err instanceof Error ? err.message : '來源匯入失敗'); }
    }} /></label>
    {!!state.supplierPool?.length && <button className="quiet-button" onClick={() => download({ records: state.supplierPool }, 'wear-yu-supplier-backup.json')}>下載供應資料備份</button>}
    <p role="status">{message}</p>
  </details>;
}
function download(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function SourcingResults({ batch }: { batch: Batch }) {
  const { demo, dispatch } = useOperations();
  if (demo || batch.mode !== 'live') return null;
  const run = batch.sourcingRun;
  return <section className="sourcing-results" aria-label={`${batch.name}選品結果`}>
    <h3>{batch.name} · 選品執行結果</h3>
    {!run ? <p>舊批次尚未執行供應資料選取，可立即接續。</p> : <>
      <p>{new Date(run.time).toLocaleString('zh-TW')} · 已檢查 {run.scanned} 筆 · 已處理／重複 {run.duplicates} 筆 · 新候選 {run.candidates.length} 筆</p>
      {run.status === 'EMPTY' && <p role="status">{run.scanned ? '現有商品已處理，這次沒有新候選。請補充供應資料，再執行本批次。' : '尚無可讀取的供應商品。請先匯入供應資料，再執行本批次。'}</p>}
      {!!run.candidates.length && <><p>來源候選已建立，採購與財務待核實。來源日期與本次執行時間分開記錄。</p><button className="quiet-button" onClick={() => download(run, `${batch.id}-candidates.json`)}>下載候選與證據</button><div className="sourcing-candidates">{run.candidates.map(r => <article className="sourcing-candidate" key={r.id}>
        <h4>{r.title}</h4><p>{r.supplier} · {r.id}</p>
        <details><summary>查看來源圖片</summary><img loading="lazy" src={r.evidenceImage} alt={`${r.title}來源截圖；商品位於${r.evidencePosition}`} /></details>
        <p>來源：{r.evidenceFile} · {r.evidencePosition} · {r.observedAt}</p>
        {r.sourceUrl && <a href={r.sourceUrl} target="_blank" rel="noreferrer">開啟來源</a>}
        {r.historicalPrice && <p>歷史顯示價：{r.historicalPrice}；不是已驗證採購成本。</p>}
        <p>待補：當期採購成本、完整規格／庫存、付款費、運費、蝦皮費用、正式上架欄位及圖片。Finance BLOCK；尚未送 GM 核准或產製 Excel。</p>
      </article>)}</div></>}
    </>}
    {(!run || run.status === 'EMPTY') && <button className="gold-button" onClick={() => dispatch({ type: 'source-run', id: batch.id, time: new Date().toISOString() })}>執行本批次選品</button>}
  </section>;
}
