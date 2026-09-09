import { parsePacket, type DeliveryPacket } from './delivery';
import type { SupplierRecord } from './sourcing';

// Strings preserve unknown numbers as blank instead of silently converting them to zero.
export type ProductDraft = Record<string, string>;
export type CandidateWork = { variants: ProductDraft[]; savedAt: string };
export const initialDraft = (record: SupplierRecord): ProductDraft => ({ title: record.title, sourceUrl: record.sourceUrl || '', minimumMargin: '65' });
export const groups = [
  { name: '選品組 · 商品與供應核實', fields: [['sku', '主商品編號'], ['variantSku', '規格編號'], ['title', '上架商品名稱（10–60 字）'], ['sourceUrl', '實際供應來源網址'], ['color', '顏色'], ['size', '尺寸'], ['inventory', '已核實庫存'], ['description', '商品說明']] },
  { name: '視覺組 · 實際商品圖片', fields: [['imageUrls', '實際販售商品圖片網址（每行一張）'], ['sizeChartUrl', '尺寸表網址']] },
  { name: '財務部 · 完整成本與售價', fields: [['purchaseCost', '已核實採購成本（TWD）'], ['cardFee', '付款手續費（TWD）'], ['freight', '運費（TWD）'], ['shopeeFixedFee', '蝦皮固定費（TWD）'], ['shopeeRate', '蝦皮費率（%）'], ['price', '擬定售價（TWD 整數）'], ['minimumMargin', '最低淨利率（%，至少 65）']] },
  { name: '選品組 · 蝦皮必填與驗證證據', fields: [['category', '蝦皮分類編號'], ['weightKg', '包裹重量（kg）'], ['lengthCm', '包裹長（cm）'], ['widthCm', '包裹寬（cm）'], ['heightCm', '包裹高（cm）'], ['verifiedBy', '實際查核人'], ['verifiedAt', '實際查核時間（含時區）'], ['evidenceUrl', '成本、規格與圖片查核證據網址']] },
] as const;
export function draftProduct(d: ProductDraft): Record<string, unknown> {
  const number = (key: string) => d[key]?.trim() ? Number(d[key]) : null;
  const bool = (key: string) => d[key] === 'true' ? true : d[key] === 'false' ? false : undefined;
  return {
    ...Object.fromEntries(['sku', 'variantSku', 'title', 'sourceUrl', 'color', 'size', 'description', 'verifiedBy', 'verifiedAt', 'evidenceUrl'].map(k => [k, d[k]?.trim() || ''])),
    ...Object.fromEntries(['inventory', 'purchaseCost', 'cardFee', 'freight', 'shopeeFixedFee', 'price'].map(k => [k, number(k)])),
    shopeeRate: number('shopeeRate') === null ? null : number('shopeeRate')! / 100,
    minimumMargin: number('minimumMargin') === null ? null : number('minimumMargin')! / 100,
    imageUrls: (d.imageUrls || '').split('\n').map(s => s.trim()).filter(Boolean),
    shopee: { category: d.category || '', sizeChartUrl: d.sizeChartUrl || '', weightKg: number('weightKg'), lengthCm: number('lengthCm'), widthCm: number('widthCm'), heightCm: number('heightCm'), dangerousGoods: bool('dangerousGoods'), shipping: Object.fromEntries(['30005', '30015', '30017', '30019'].map(k => [k, bool(k)])) },
  };
}
export function followupPacket(records: SupplierRecord[], work: Record<string, CandidateWork> = {}): DeliveryPacket {
  if (!records.length) throw new Error('尚無候選');
  const products = records.flatMap(r => {
    const variants = work[r.id]?.variants;
    if (!variants?.length) throw new Error(`${r.title}：尚未保存補件資料`);
    if (variants.some(d => d.imageConfirmed !== 'true')) throw new Error(`${r.title}：尚未確認圖片對應實際販售商品`);
    return variants.map(draftProduct);
  });
  return parsePacket(JSON.stringify({ products }));
}
