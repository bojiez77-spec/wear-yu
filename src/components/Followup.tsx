import { useState } from 'react';
import { useOperations } from '../hooks/useOperations';
import type { Batch } from '../domain/operations';
import type { SupplierRecord } from '../domain/sourcing';
import { draftProduct, followupPacket, groups, initialDraft, type ProductDraft } from '../domain/followup';
import { productErrors } from '../domain/delivery';

export function FollowupSubmission({ batch }: { batch: Batch }) {
  const { dispatch } = useOperations();
  const [notice, setNotice] = useState('');
  if (batch.packet) return <p>本批商品資料已送入審核流程；請至核決中心處理。原始候選與補件紀錄保留。</p>;
  return <div className="followup-submit"><p>下一步：選品組核實供應與規格 → 視覺組核對商品圖片 → 財務計算 → GM 審核。下方可直接補件並保存；未接通共用派工服務，尚無外部接單人或執行回執。</p>
    <button className="gold-button" onClick={() => {
      try {
        followupPacket(batch.sourcingRun?.candidates || [], batch.candidateWork);
        setNotice(dispatch({ type: 'followup-submit', id: batch.id }) ? '必要欄位與財務計算通過，已送 GM 審核。尚未批准或產製 Excel。' : '送審未保存，請檢查儲存錯誤與批次狀態。');
      } catch (err) { setNotice(`尚未送審：${err instanceof Error ? err.message : '資料待補'}`); }
    }}>檢核已保存資料並送 GM</button><p role="status">{notice}</p>
  </div>;
}
export function CandidateFollowup({ batch, record }: { batch: Batch; record: SupplierRecord }) {
  const { dispatch } = useOperations();
  const saved = batch.candidateWork?.[record.id];
  const [variants, setVariants] = useState<ProductDraft[]>(saved?.variants || [initialDraft(record)]);
  const [notice, setNotice] = useState('');
  const locked = !!batch.packet || !!batch.gmApproved;
  const update = (index: number, key: string, value: string) => { setVariants(current => current.map((d, i) => i === index ? { ...d, [key]: value } : d)); setNotice('有未保存修改；送審只使用已保存資料。'); };
  return <details className="candidate-followup"><summary>處理後續補件 · {saved ? `已保存 ${saved.variants.length} 個規格` : '待補資料'}</summary>
    <p>來源名稱僅為候選參考。請填實際販售資料；成本皆用 TWD，零費用也需查核後填 0。未填的數字不視為零。官方 exact SKU 與淘寶登入不列必要條件。</p>
    {saved && <p>最近保存：{new Date(saved.savedAt).toLocaleString('zh-TW')}</p>}
    <fieldset disabled={locked} className="followup-fields">
      {variants.map((draft, index) => {
        const errors = productErrors(draftProduct(draft));
        return <details key={index} open={variants.length === 1}><summary>規格 {index + 1} · {draft.color || '顏色待補'}／{draft.size || '尺寸待補'} · {errors.length || draft.imageConfirmed !== 'true' ? '待補件' : '可送檢核'}</summary>
          {groups.map(group => <details key={group.name}><summary>{group.name}</summary><div className="followup-grid">{group.fields.map(([key, label]) => <label key={key}>{label}<textarea rows={key === 'imageUrls' || key === 'description' ? 3 : 1} value={draft[key] || ''} onChange={e => update(index, key, e.target.value)} /></label>)}</div></details>)}
          <div className="followup-grid">{[['dangerousGoods', '是否為危險物品'], ['30005', '配送 30005'], ['30015', '配送 30015'], ['30017', '配送 30017'], ['30019', '配送 30019'], ['imageConfirmed', '已人工核對圖片對應實際販售商品']].map(([key, label]) => <label key={key}>{label}<select value={draft[key] || ''} onChange={e => update(index, key, e.target.value)}><option value="">尚未核實</option><option value="true">是</option><option value="false">否</option></select></label>)}</div>
          <p>欄位檢核：{errors.length ? errors.join('；') : '欄位與財務計算符合；仍需 GM 查核證據。'}</p>
          {variants.length > 1 && <button className="quiet-button" onClick={() => { setVariants(current => current.filter((_, i) => i !== index)); setNotice('規格移除尚未保存。'); }}>移除規格 {index + 1}</button>}
        </details>;
      })}
      <button className="quiet-button" onClick={() => { setVariants(current => [...current, initialDraft(record)]); setNotice('新規格尚未保存。'); }}>新增顏色／尺寸規格</button>
      <button className="gold-button" onClick={() => setNotice(dispatch({ type: 'candidate-save', id: batch.id, candidateId: record.id, work: { variants, savedAt: new Date().toISOString() } }) ? '補件已保存；尚未送審。' : '補件未保存，請檢查儲存錯誤與批次狀態。')}>保存補件</button>
    </fieldset>
    {locked && <p>已送審的商品資料鎖定；如需更改，請使用既有部門資料補正流程，已批准商品需另建修訂批次。</p>}
    <p role="status">{notice}</p>
  </details>;
}
