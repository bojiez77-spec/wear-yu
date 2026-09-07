import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { finance, listingWorkbook, parsePacket, productErrors, type DeliveryPacket } from '../domain/delivery';
import { emptyWorkspace, operationsReducer as reduce } from '../domain/operations';
export const packet: DeliveryPacket = {
  products: [{ sku: 'TEST-ONLY', variantSku: 'TEST-BLUE-M', shopee: { category: '測試分類', weightKg: .2, lengthCm: 20, widthCm: 15, heightCm: 3, sizeChartUrl: 'https://example.com/chart', dangerousGoods: false, shipping: { '30005': true, '30015': false, '30017': false, '30019': false } }, title: '蝦皮整合測試資料不可上架', sourceUrl: 'https://example.com/source', imageUrls: ['https://example.com/image'], color: 'blue', size: 'M', inventory: 2, description: '=1+1', purchaseCost: 100, cardFee: 3, freight: 20, shopeeFixedFee: 2, shopeeRate: .1, price: 500, minimumMargin: .65, verifiedBy: '測試財務', verifiedAt: '2026-09-07T00:00:00Z', evidenceUrl: 'https://example.com/evidence' }],
  social: { text: '測試文案', mediaUrls: ['https://example.com/social'], platforms: ['instagram', 'threads'], reviewedBy: '測試視覺', evidenceUrl: 'https://example.com/review' },
};
function ready() { return reduce(reduce(emptyWorkspace(), { type: 'launch', id: 'live', demo: false }), { type: 'packet', id: 'live', text: JSON.stringify(packet) }); }
const approve = { type: 'batch-gm', id: 'live', result: '放行', reason: '' } as const;
const release = { type: 'chairman', id: 'live', result: '放行', reason: '' } as const;
const reject = { type: 'chairman', id: 'live', result: '退回', reason: '文案需要修正', defectType: '文案／社群', department: '視覺組' } as const;
describe('verified delivery and split authority', () => {
  it('calculates percentage fees and enforces 65% inclusive without treating fees as fixed', () => {
    expect(finance(packet.products[0])).toEqual({ shopeeFee: 52, cost: 175, profit: 325, margin: .65 });
    expect(productErrors(packet.products[0])).toEqual([]);
    for (const patch of [{ price: 499 }, { minimumMargin: .64 }, { freight: undefined }, { cardFee: NaN }, { imageUrls: [] }, { purchaseCost: 0 }, { shopeeRate: 1 }, { inventory: -1 }]) expect(productErrors({ ...packet.products[0], ...patch }).length).toBeGreaterThan(0);
    expect(() => parsePacket(JSON.stringify({ ...packet, products: [packet.products[0], packet.products[0]] }))).toThrow('重複');
  });
  it('blocks missing data, chairman-before-GM, and exports-before-GM', () => {
    const initial = reduce(emptyWorkspace(), { type: 'launch', id: 'live', demo: false });
    expect(reduce(initial, { type: 'packet', id: 'live', text: '{}' })).toBe(initial);
    expect(reduce(initial, approve)).toBe(initial);
    const state = ready();
    expect(reduce(state, release)).toBe(state);
    expect(reduce(state, { type: 'excel', id: 'live', filename: 'listing.xlsx' })).toBe(state);
  });
  it('allows Excel immediately after GM while social awaits chairman; preserves products on social return', () => {
    let state = reduce(ready(), approve);
    expect(state.batches[0].listingStatus).toBe('READY');
    expect(state.batches[0].socialStatus).toBe('REVIEW');
    expect(state.cases.find(c => c.kind === '社群內容')?.stage).toBe('待審批');
    state = reduce(state, { type: 'excel', id: 'live', filename: 'listing.xlsx' });
    expect(state.batches[0].listingStatus).toBe('EXCEL_READY');
    state = reduce(state, reject);
    expect(state.batches[0].gmApproved).toBe(true);
    expect(state.batches[0].listingStatus).toBe('EXCEL_READY');
    expect(state.cases.find(c => c.kind === '選品款式')?.stage).toBe('已放行');
    const changed = structuredClone(packet); changed.products[0].price = 600;
    expect(reduce(state, { type: 'packet', id: 'live', text: JSON.stringify(changed) })).toBe(state);
    state = reduce(state, { type: 'packet', id: 'live', text: JSON.stringify(packet) });
    expect(state.batches[0].status).toBe('待董事長核決');
    state = reduce(state, release);
    expect(state.batches[0].socialStatus).toBe('BLOCK'); // no actual provider response
    expect(reduce(state, release)).toBe(state);
  });
  it('requires reason/category/department and escalates repeated defects with CAPA evidence', () => {
    let state = reduce(ready(), approve);
    expect(reduce(state, { ...reject, reason: ' ' })).toBe(state);
    expect(reduce(state, { ...reject, defectType: undefined })).toBe(state);
    state = reduce(state, reject);
    expect(state.audits).toHaveLength(0);
    expect(reduce(state, reject)).toBe(state);
    state = reduce(state, { type: 'packet', id: 'live', text: JSON.stringify(packet) });
    state = reduce(state, reject);
    expect(state.audits[0].capa?.count).toBe(2);
    state = reduce(state, { type: 'packet', id: 'live', text: JSON.stringify(packet) });
    expect(reduce(state, release)).toBe(state);
    expect(reduce(state, { type: 'resolve', id: state.audits[0].id }).audits[0].resolved).toBe(false);
    const capa = { type: 'capa', id: state.audits[0].id, rootCause: '缺少複核', corrective: '修訂', preventive: '加入檢查', review: 'PASS', evidence: '' } as const;
    expect(reduce(state, capa)).toBe(state);
    state = reduce(state, { ...capa, evidence: '複查人及證據' });
    expect(state.audits[0].resolved).toBe(true);
    expect(reduce(state, release).batches[0].socialStatus).toBe('BLOCK');
  });
  it('creates a real xlsx with verified values and treats formula-looking text as text', async () => {
    const template = await fixtureTemplate();
    const buffer = await listingWorkbook(packet.products, template);
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file('xl/worksheets/sheet2.xml')!.async('string');
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const cell = (ref: string) => Array.from(doc.getElementsByTagName('c')).find(c => c.getAttribute('r') === ref);
    expect(cell('M7')?.textContent).toBe('500');
    expect(cell('C7')?.getAttribute('t')).toBe('inlineStr');
    expect(cell('C7')?.textContent).toBe('=1+1');
    expect(cell('S7')?.textContent).toBe(packet.products[0].imageUrls[0]);
    expect(cell('AF7')?.textContent).toBe('開啟');
    expect(cell('AG7')?.textContent).toBe('關閉');
    expect(await zip.file('xl/styles.xml')!.async('string')).toBe('preserve-original-styles');
    await expect(listingWorkbook([{ ...packet.products[0], freight: -1 }], template)).rejects.toThrow('成本');
  });
  it('does not make social readiness a prerequisite for GM product approval', () => {
    const initial = reduce(emptyWorkspace(), { type: 'launch', id: 'live', demo: false });
    let state = reduce(initial, { type: 'packet', id: 'live', text: JSON.stringify({ products: packet.products }) });
    state = reduce(state, approve);
    expect(state.batches[0].gmApproved).toBe(true);
    expect(state.batches[0].listingStatus).toBe('READY');
    state = reduce(state, { type: 'packet', id: 'live', text: JSON.stringify(packet) });
    expect(state.batches[0].status).toBe('待董事長核決');
  });
});
export async function fixtureTemplate() {
  const zip = new JSZip();
  const headers: Record<string, string> = { A1: 'ps_category', B1: 'ps_product_name', C1: 'ps_product_description', E1: 'ps_sku_parent_short', G1: 'et_title_variation_integration_no', M1: 'ps_price', N1: 'ps_stock', O1: 'ps_sku_short', Q1: 'et_title_size_chart', S1: 'ps_item_cover_image', AB1: 'ps_weight', AF1: 'channel_id.30005', AG1: 'channel_id.30015', AH1: 'channel_id.30017', AI1: 'channel_id.30019' };
  zip.file('xl/worksheets/sheet2.xml', `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:AK6"/><sheetData><row r="1">${Object.entries(headers).map(([ref, key]) => `<c r="${ref}" t="inlineStr"><is><t>${key}|0|0</t></is></c>`).join('')}</row></sheetData></worksheet>`);
  zip.file('xl/sharedStrings.xml', '<sst/>');
  zip.file('xl/workbook.xml', '<workbook><sheet name="上傳模板"/></workbook>');
  zip.file('xl/_rels/workbook.xml.rels', '<Relationships/>');
  zip.file('xl/styles.xml', 'preserve-original-styles');
  return zip.generateAsync({ type: 'arraybuffer' });
}

it.runIf(!!process.env.SHOPEE_TEMPLATE_PATH)('preserves every original template ZIP entry except the filled upload sheet', async () => {
  const { readFile } = await import('node:fs/promises');
  const bytes = await readFile(process.env.SHOPEE_TEMPLATE_PATH!);
  const template = Uint8Array.from(bytes).buffer;
  const output = await listingWorkbook(packet.products, template);
  const original = await JSZip.loadAsync(template); const result = await JSZip.loadAsync(output);
  for (const name of Object.keys(original.files)) {
    if (original.files[name].dir || name === 'xl/worksheets/sheet2.xml') continue;
    expect(await result.file(name)!.async('uint8array')).toEqual(await original.file(name)!.async('uint8array'));
  }
  const xml = await result.file('xl/worksheets/sheet2.xml')!.async('string');
  expect(xml).toContain('r="M7"><v>500</v>');
  expect(xml).toContain('TEST-BLUE-M');
});
