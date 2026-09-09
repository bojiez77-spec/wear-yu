import { validUrl } from './delivery';

export type SupplierRecord = {
  id: string; title: string; supplier: string; evidenceFile: string;
  evidencePosition: string; evidenceImage: string; observedAt: string;
  sourceUrl?: string; historicalPrice?: string;
};
export type SourcingRun = {
  time: string; scanned: number; duplicates: number;
  status: 'CANDIDATES' | 'EMPTY'; candidates: SupplierRecord[];
};
const text = (v: unknown, max = 200) => typeof v === 'string' && !!v.trim() && v.length <= max;
export function parseSupplierRecords(raw: string): SupplierRecord[] {
  if (raw.length > 3_500_000) throw new Error('來源檔案過大，請分批匯入（每次 3.5 MB 以下）。');
  const value = JSON.parse(raw);
  if (!value || !Array.isArray(value.records) || !value.records.length || value.records.length > 50) throw new Error('請使用含商品與來源圖片的供應資料檔，每次 1–50 筆。');
  const records: SupplierRecord[] = value.records.map((r: SupplierRecord, i: number) => {
    if (!r || !['id', 'title', 'supplier', 'evidenceFile', 'evidencePosition'].every(k => text(r[k as keyof SupplierRecord])) || !text(r.observedAt, 60) || !Number.isFinite(Date.parse(r.observedAt))) throw new Error(`第 ${i + 1} 筆缺商品名稱、店家、圖片位置或來源日期。`);
    // Keep source evidence private in this browser. No remote image fetch or executable SVG.
    if (typeof r.evidenceImage !== 'string' || r.evidenceImage.length > 1_500_000 || !/^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(r.evidenceImage)) throw new Error(`第 ${i + 1} 筆缺可讀取的 JPEG／PNG 來源圖片。`);
    if (r.sourceUrl !== undefined && !validUrl(r.sourceUrl)) throw new Error(`第 ${i + 1} 筆來源連結格式錯誤。`);
    if (r.historicalPrice !== undefined && !text(r.historicalPrice)) throw new Error(`第 ${i + 1} 筆歷史標價格式錯誤。`);
    return { id: r.id.trim(), title: r.title.trim(), supplier: r.supplier.trim(), evidenceFile: r.evidenceFile.trim(), evidencePosition: r.evidencePosition.trim(), evidenceImage: r.evidenceImage, observedAt: r.observedAt, ...(r.sourceUrl ? { sourceUrl: r.sourceUrl } : {}), ...(r.historicalPrice ? { historicalPrice: r.historicalPrice } : {}) };
  });
  if (new Set(records.map(recordKey)).size !== records.length || new Set(records.map(r => r.id)).size !== records.length) throw new Error('檔案有重複商品或來源位置，請先移除重複資料。');
  return records;
}
export const recordKey = (r: SupplierRecord) => r.sourceUrl || `${r.supplier}\u0000${r.evidenceFile}\u0000${r.evidencePosition}`;
export function selectCandidates(pool: SupplierRecord[], used: SupplierRecord[], time: string): SourcingRun {
  const keys = new Set(used.map(recordKey));
  const ids = new Set(used.map(r => r.id));
  const candidates: SupplierRecord[] = [];
  let duplicates = 0;
  for (const r of pool) {
    if (keys.has(recordKey(r)) || ids.has(r.id)) { duplicates++; continue; }
    keys.add(recordKey(r)); ids.add(r.id); candidates.push({ ...r });
  }
  // Imported records are supplier candidates, never verified procurement or listing packets.
  return { time, scanned: pool.length, duplicates, candidates, status: candidates.length ? 'CANDIDATES' : 'EMPTY' };
}
