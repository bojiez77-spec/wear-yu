import { useState } from 'react';
import { useOperations } from '../hooks/useOperations';
import { type Batch, defectTypes, type DefectType } from '../domain/operations';
import { finance, listingWorkbook, parsePacket } from '../domain/delivery';

export function DefectFields({ value, onChange, department, onDepartment }: { value: DefectType; onChange: (v: DefectType) => void; department: string; onDepartment: (v: string) => void }) {
  return <><label>缺失類型<select value={value} onChange={e => onChange(e.target.value as DefectType)}>{defectTypes.map(t => <option key={t}>{t}</option>)}</select></label><label>責任部門<select value={department} onChange={e => onDepartment(e.target.value)}>{['選品組', '視覺組', '財務部', '資訊部', 'GM'].map(t => <option key={t}>{t}</option>)}</select></label></>;
}
export function BatchDelivery({ batch }: { batch: Batch }) {
  const { state, dispatch } = useOperations();
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [template, setTemplate] = useState<ArrayBuffer | null>(null);
  const blocked = state.audits.some(a => !a.resolved && (a.caseId === batch.id || state.cases.some(c => c.id === a.caseId && c.batchId === batch.id)));
  async function download() {
    if (!template || !batch.packet || !batch.gmApproved || batch.mode !== 'live' || blocked || busy) return;
    setBusy(true);
    try {
      const buffer = await listingWorkbook(batch.packet.products, template);
      const url = URL.createObjectURL(new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a'); const filename = `wear-yu-${batch.id}.xlsx`;
      link.href = url; link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      dispatch({ type: 'excel', id: batch.id, filename });
      setNotice('Excel 已產製並提供下載；請人工上傳蝦皮賣家中心，尚未上架。');
    } catch (e) { setNotice(`BLOCK：${e instanceof Error ? e.message : 'Excel 產製失敗'}`); }
    finally { setBusy(false); }
  }
  return <section className="ops-section"><h2>交付與發布</h2><p>選品：{batch.gmApproved ? 'GM批准' : '待 GM批准'} · {batch.listingStatus || 'BLOCK：必要資料待驗證'}</p>
    <p>社群：{batch.socialStatus === 'BLOCK' ? '董事長已放行 · BLOCK：發布服務未接通' : batch.socialStatus === 'RETURNED' ? '董事長／GM退回 · 待部門修正' : batch.socialStatus || '內部流程中'} · 僅平台 PUBLISHED 算完成</p>
    {batch.mode === 'live' && (!batch.gmApproved || !batch.packet?.social || batch.socialStatus === 'RETURNED') && <label>匯入部門驗證資料（JSON）<input type="file" accept=".json,application/json" onChange={async e => {
      const file = e.target.files?.[0]; if (!file) return;
      try { const text = await file.text(); const packet = parsePacket(text); if (batch.gmApproved && JSON.stringify(packet.products) !== JSON.stringify(batch.packet?.products)) throw new Error('社群補正不可更動 GM 已批准商品'); if (!dispatch({ type: 'packet', id: batch.id, text })) throw new Error('資料未保存，請檢查儲存錯誤與批次狀態'); setNotice('必要欄位及財務計算通過；驗證證據由審核人確認。'); }
      catch (error) { setNotice(`BLOCK：${error instanceof Error ? error.message : '資料格式錯誤'}`); }
    }} /></label>}
    <label>蝦皮空白上架範本<input type="file" accept=".xlsx" onChange={async e => { try { const file = e.target.files?.[0]; setTemplate(file ? await file.arrayBuffer() : null); } catch { setNotice("BLOCK：範本讀取失敗"); } }} /></label><button className="gold-button" disabled={!template || !batch.gmApproved || !batch.packet || batch.mode === 'demo' || blocked || busy} onClick={download}>{busy ? '產製中' : '產製／下載上架 Excel'}</button>
    <p className="subtle">依您提供的蝦皮基本範本填入第 7 列起；下載後由人員上傳蝦皮賣家中心。演練資料不可匯出為正式上架檔。</p>
    <BatchEvidence batch={batch} />
    {batch.publishJobs?.map(job => <p key={job.id}>{job.platform} · 發布佇列 {job.id} · {job.status}：{job.reason}</p>)}<p role="status">{notice}</p></section>;
}

export function CapaForm({ audit }: { audit: import('../domain/operations').Audit }) {
  const { dispatch } = useOperations();
  const [rootCause, setRootCause] = useState(audit.capa?.rootCause || '');
  const [corrective, setCorrective] = useState(audit.capa?.corrective || '');
  const [preventive, setPreventive] = useState(audit.capa?.preventive || '');
  const [evidence, setEvidence] = useState(audit.capa?.evidence || '');
  const [review, setReview] = useState<'待複查' | 'PASS' | 'FAIL'>('待複查');
  if (!audit.capa) return null;
  return <div><p>稽核介入 · {audit.capa.defectType} · 累計 {audit.capa.count} 次 · 責任部門：{audit.capa.department} · 複查：{audit.capa.review}</p>
    <form className="inline-form" onSubmit={e => { e.preventDefault(); dispatch({ type: 'capa', id: audit.id, rootCause, corrective, preventive, review, evidence }); }}>
      <label>根本原因<textarea required value={rootCause} onChange={e => setRootCause(e.target.value)} /></label>
      <label>改善措施<textarea required value={corrective} onChange={e => setCorrective(e.target.value)} /></label>
      <label>預防再發措施<textarea required value={preventive} onChange={e => setPreventive(e.target.value)} /></label>
      <label>複查狀態<select value={review} onChange={e => setReview(e.target.value as typeof review)}><option>待複查</option><option>FAIL</option><option>PASS</option></select></label>
      <label>複查證據／查核人<textarea required={review === 'PASS'} value={evidence} onChange={e => setEvidence(e.target.value)} /></label>
      <button className="gold-button" disabled={!rootCause.trim() || !corrective.trim() || !preventive.trim() || (review === 'PASS' && !evidence.trim())}>儲存 CAPA 複查</button>
    </form></div>;
}

export function BatchEvidence({ batch }: { batch: Batch }) {
  if (!batch.packet) return null;
  return <details className="delivery-evidence"><summary>核對商品、財務與社群證據</summary>{batch.packet.products.map(p => {
    const f = finance(p);
    return <div key={p.variantSku}><h3>{p.sku} · {p.title} · {p.color}／{p.size}</h3><p>採購 {p.purchaseCost} → 刷卡 {p.cardFee} → 運費 {p.freight} → 蝦皮 {f.shopeeFee.toFixed(2)}（固定 {p.shopeeFixedFee}＋售價 {(p.shopeeRate * 100).toFixed(2)}%）</p><p>總成本 {f.cost.toFixed(2)} · 售價 {p.price} · 淨利 {f.profit.toFixed(2)} · 淨利率 {(f.margin * 100).toFixed(2)}% · PASS</p><p>驗證：{p.verifiedBy} · {p.verifiedAt} · <a href={p.evidenceUrl} target="_blank" rel="noreferrer">驗證證據</a></p>{p.imageUrls.map((url, i) => <p key={url}><a href={url} target="_blank" rel="noreferrer">SKU 圖片 {i + 1}</a></p>)}</div>;
  })}{batch.packet.social && <div><h3>社群送審內容</h3><p>{batch.packet.social.text}</p><p>{batch.packet.social.platforms.join('、')} · {batch.packet.social.reviewedBy}</p>{batch.packet.social.mediaUrls.map(url => <p key={url}><a href={url} target="_blank" rel="noreferrer">社群素材</a></p>)}<a href={batch.packet.social.evidenceUrl} target="_blank" rel="noreferrer">內部審核證據</a></div>}</details>;
}
