export type VerifiedProduct = {
  sku: string; variantSku: string; shopee: { category: string; weightKg: number; lengthCm: number; widthCm: number; heightCm: number; sizeChartUrl: string; dangerousGoods: boolean; shipping: Record<'30005' | '30015' | '30017' | '30019', boolean> }; title: string; sourceUrl: string; imageUrls: string[];
  color: string; size: string; inventory: number; description: string;
  purchaseCost: number; cardFee: number; freight: number; shopeeFixedFee: number;
  shopeeRate: number; price: number; minimumMargin: number;
  verifiedBy: string; verifiedAt: string; evidenceUrl: string;
};
export type SocialContent = { text: string; mediaUrls: string[]; platforms: ('instagram' | 'threads')[]; reviewedBy: string; evidenceUrl: string };
export type DeliveryPacket = { products: VerifiedProduct[]; social?: SocialContent };
export const validUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
};
const nonempty = (value: unknown) => typeof value === 'string' && !!value.trim();
export function finance(product: VerifiedProduct) {
  const shopeeFee = product.shopeeFixedFee + product.price * product.shopeeRate;
  const cost = product.purchaseCost + product.cardFee + product.freight + shopeeFee;
  return { shopeeFee, cost, profit: product.price - cost, margin: (product.price - cost) / product.price };
}
export function productErrors(value: unknown): string[] {
  if (!value || typeof value !== 'object') return ['商品資料缺漏'];
  const p = value as VerifiedProduct; const errors: string[] = [];
  for (const key of ['sku', 'variantSku', 'title', 'color', 'size', 'description', 'verifiedBy'] as const) if (!nonempty(p[key])) errors.push(`${key} 未驗證`);
  if (!validUrl(p.sourceUrl) || !validUrl(p.evidenceUrl)) errors.push('來源與驗證證據需為 HTTPS 網址');
  if (!Array.isArray(p.imageUrls) || !p.imageUrls.length || !p.imageUrls.every(validUrl)) errors.push('缺 exact-SKU 圖片');
  if (!nonempty(p.verifiedAt) || !Number.isFinite(Date.parse(p.verifiedAt))) errors.push('缺驗證時間');
  if (!Number.isInteger(p.inventory) || p.inventory < 0) errors.push('庫存未驗證');
  const costs = ['purchaseCost', 'cardFee', 'freight', 'shopeeFixedFee', 'shopeeRate', 'price', 'minimumMargin'] as const;
  if (costs.some(key => typeof p[key] !== 'number' || !Number.isFinite(p[key]) || p[key] < 0) || p.purchaseCost <= 0 || p.price <= 0 || p.shopeeRate >= 1 || p.minimumMargin < .65 || p.minimumMargin >= 1) errors.push('財務必要成本／費率未驗證');
  else if (finance(p).margin + Number.EPSILON < p.minimumMargin) errors.push('財務 Gate BLOCK：淨利率未達門檻');
  const shop = p.shopee;
  if (!shop || !nonempty(shop.category) || !validUrl(shop.sizeChartUrl) || typeof shop.dangerousGoods !== 'boolean' || !shop.shipping || ['30005', '30015', '30017', '30019'].some(k => typeof shop.shipping[k as keyof typeof shop.shipping] !== 'boolean') || !Object.values(shop.shipping).some(v => v === true)) errors.push('蝦皮分類／尺寸表／危險物品／配送資料缺漏');
  if (!shop || [shop.weightKg, shop.lengthCm, shop.widthCm, shop.heightCm].some(n => typeof n !== 'number' || !Number.isFinite(n) || n <= 0 || n > 1000000)) errors.push('蝦皮重量／包裹尺寸未驗證');
  if (!Number.isInteger(p.price) || p.price > 499999 || p.inventory > 10000000 || (typeof p.title === 'string' && (p.title.length < 10 || p.title.length > 60)) || (typeof p.description === 'string' && (p.description.length < 3 || p.description.length > 3000)) || p.sku?.length > 100 || p.variantSku?.length >= 100 || p.color?.length > 20 || p.size?.length > 20 || p.imageUrls?.length > 9) errors.push('不符合蝦皮欄位長度／數值限制');
  return errors;
}
export function socialErrors(value: unknown): string[] {
  if (!value || typeof value !== 'object') return ['社群資料缺漏'];
  const s = value as SocialContent;
  return nonempty(s.text) && nonempty(s.reviewedBy) && validUrl(s.evidenceUrl) && Array.isArray(s.mediaUrls) && s.mediaUrls.length > 0 && s.mediaUrls.every(validUrl) && Array.isArray(s.platforms) && s.platforms.length > 0 && new Set(s.platforms).size === s.platforms.length && s.platforms.every(p => ['instagram', 'threads'].includes(p)) ? [] : ['社群文案、素材、平台與內部審核證據缺漏'];
}
export function parsePacket(text: string): DeliveryPacket {
  const packet = JSON.parse(text) as DeliveryPacket;
  if (!packet || !Array.isArray(packet.products) || !packet.products.length) throw new Error('缺已驗證商品');
  const errors = packet.products.flatMap((p, i) => productErrors(p).map(e => `第 ${i + 1} 項：${e}`));
  const variants = packet.products.map(p => `${p.sku}\u0000${p.color}\u0000${p.size}`);
  if (new Set(variants).size !== variants.length || new Set(packet.products.map(p => p.variantSku)).size !== variants.length) errors.push('重複 SKU／顏色／尺寸');
  for (const sku of new Set(packet.products.map(p => p.sku))) {
    const group = packet.products.filter(p => p.sku === sku);
    if (Math.max(...group.map(p => p.price)) > Math.min(...group.map(p => p.price)) * 5) errors.push('同商品規格價格不可超過 5 倍');
    if (group.some(p => p.title !== group[0].title || p.description !== group[0].description || p.shopee?.category !== group[0].shopee?.category)) errors.push('同主商品資料不一致');
  }
  if (packet.social !== undefined) errors.push(...socialErrors(packet.social));
  if (errors.length) throw new Error(errors.join('；'));
  return packet;
}
// Fill only row 7 onward in the supplied Shopee template. All other ZIP entries,
// including metadata, hidden sheets, styles, validations and instructions stay intact.
export async function listingWorkbook(products: VerifiedProduct[], template: ArrayBuffer) {
  parsePacket(JSON.stringify({ products }));
  if (products.length > 1001) throw new Error('超過範本 1001 列限制');
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(template);
  const path = 'xl/worksheets/sheet2.xml';
  const xml = await zip.file(path)?.async('string');
  const strings = await zip.file('xl/sharedStrings.xml')?.async('string');
  const workbook = await zip.file('xl/workbook.xml')?.async('string');
  const relationships = await zip.file('xl/_rels/workbook.xml.rels')?.async('string');
  if (!xml || !strings || !workbook?.includes('name="上傳模板"') || !relationships) throw new Error('非指定蝦皮基本範本');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const shared = new DOMParser().parseFromString(strings, 'application/xml');
  const sharedValues = Array.from(shared.getElementsByTagName('si')).map(si => si.textContent || '');
  const rows = Array.from(document.getElementsByTagName('row'));
  const expected: Record<string, string> = { A1: 'ps_category', B1: 'ps_product_name', C1: 'ps_product_description', E1: 'ps_sku_parent_short', G1: 'et_title_variation_integration_no', M1: 'ps_price', N1: 'ps_stock', O1: 'ps_sku_short', Q1: 'et_title_size_chart', S1: 'ps_item_cover_image', AB1: 'ps_weight', AF1: 'channel_id.30005', AG1: 'channel_id.30015', AH1: 'channel_id.30017', AI1: 'channel_id.30019' };
  for (const [ref, key] of Object.entries(expected)) {
    const cell = Array.from(document.getElementsByTagName('c')).find(c => c.getAttribute('r') === ref);
    const value = cell?.getAttribute('t') === 's' ? sharedValues[Number(cell.textContent)] : cell?.textContent;
    if (value?.split('|')[0] !== key) throw new Error(`蝦皮範本欄位不符：${ref}`);
  }
  if (rows.some(r => Number(r.getAttribute('r')) >= 7 && Array.from(r.getElementsByTagName('c')).some(c => c.textContent))) throw new Error('請使用空白範本，避免覆寫既有商品');
  const escape = (v: string) => v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const col = (n: number): string => n < 26 ? String.fromCharCode(65 + n) : col(Math.floor(n / 26) - 1) + col(n % 26);
  const data = products.map((p, i) => {
    const shop = p.shopee;
    const values: (string | number)[] = [shop.category, p.title, p.description, '', p.sku, shop.dangerousGoods ? 'Yes' : 'No', p.sku, '顏色', p.color, p.imageUrls[0], '尺寸', p.size, p.price, p.inventory, p.variantSku, '', shop.sizeChartUrl, '', ...Array.from({ length: 9 }, (_, j) => p.imageUrls[j] || ''), shop.weightKg, shop.lengthCm, shop.widthCm, shop.heightCm, ...(['30005', '30015', '30017', '30019'] as const).map(k => shop.shipping[k] ? '開啟' : '關閉'), '', ''];
    return `<row r="${i + 7}">${values.map((v, j) => typeof v === 'number' ? `<c r="${col(j)}${i + 7}"><v>${v}</v></c>` : `<c r="${col(j)}${i + 7}" t="inlineStr"><is><t xml:space="preserve">${escape(v)}</t></is></c>`).join('')}</row>`;
  }).join('');
  const filled = xml.replace(/<row\b[^>]*r="(?:[7-9]|[1-9][0-9]+)"[^>]*>[\s\S]*?<\/row>/g, '').replace('</sheetData>', `${data}</sheetData>`).replace(/<dimension\b[^>]*\/?>(?:<\/dimension>)?/, `<dimension ref="A1:AK${products.length + 6}"/>`);
  zip.file(path, filled);
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}
