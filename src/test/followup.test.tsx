import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { emptyWorkspace, operationsReducer as reduce } from '../domain/operations';
import { draftProduct, followupPacket, type ProductDraft } from '../domain/followup';

const record = { id: 'test', title: '測試候選不可用於真實上架', supplier: '測試店', evidenceFile: 'test.png', evidencePosition: '左', observedAt: '2026-09-09', evidenceImage: 'data:image/png;base64,aGVsbG8=' };
const draft: ProductDraft = { sku: 'TEST', variantSku: 'TEST-M', title: record.title, sourceUrl: 'https://example.com/source', color: 'blue', size: 'M', inventory: '2', description: '測試說明', imageUrls: 'https://example.com/image', sizeChartUrl: 'https://example.com/chart', purchaseCost: '100', cardFee: '3', freight: '20', shopeeFixedFee: '2', shopeeRate: '10', price: '500', minimumMargin: '65', category: '測試分類', weightKg: '.2', lengthCm: '20', widthCm: '15', heightCm: '3', verifiedBy: '測試查核人', verifiedAt: '2026-09-09T00:00:00+08:00', evidenceUrl: 'https://example.com/evidence', dangerousGoods: 'false', '30005': 'true', '30015': 'false', '30017': 'false', '30019': 'false', imageConfirmed: 'true' };
const work = (d = draft) => ({ variants: [d], savedAt: '2026-09-09T00:00:00Z' });
const start = () => reduce(reduce(emptyWorkspace(), { type: 'supplier-import', records: [record] }), { type: 'launch', id: 'test', demo: false });
it('does not turn blank cost into zero or accept unconfirmed images, missing candidates or low margin', () => {
  expect(draftProduct({ ...draft, cardFee: '' }).cardFee).toBeNull();
  const patches: ProductDraft[] = [{ cardFee: '' }, { imageConfirmed: '' }, { price: '499' }, { inventory: '' }, { '30015': '' }];
  for (const patch of patches) expect(() => followupPacket([record], { test: work({ ...draft, ...patch }) })).toThrow();
  expect(() => followupPacket([record, { ...record, id: 'other' }], { test: work() })).toThrow('尚未保存');
  expect(followupPacket([record], { test: work() }).products[0].shopeeRate).toBe(.1);
});
it('saves incomplete work, validates all variants before GM, and preserves the approved revision', () => {
  let state = start();
  state = reduce(state, { type: 'candidate-save', id: 'test', candidateId: 'test', work: work({ title: record.title }) });
  expect(reduce(state, { type: 'followup-submit', id: 'test' })).toBe(state);
  state = reduce(state, { type: 'candidate-save', id: 'test', candidateId: 'test', work: work() });
  state = reduce(state, { type: 'followup-submit', id: 'test' });
  expect(state.batches[0].status).toBe('待 GM 審核');
  expect(state.batches[0].gmApproved).toBeUndefined();
  state = reduce(state, { type: 'batch-gm', id: 'test', result: '放行', reason: '' });
  expect(state.batches[0].listingStatus).toBe('READY');
  expect(reduce(state, { type: 'candidate-save', id: 'test', candidateId: 'test', work: work({ ...draft, price: '600' }) })).toBe(state);
});
it('submits saved follow-up data through UI and never claims Excel without GM approval', async () => {
  const state = reduce(start(), { type: 'candidate-save', id: 'test', candidateId: 'test', work: work() });
  localStorage.setItem('wear-yu-operations-v2', JSON.stringify(state));
  render(<MemoryRouter><App /></MemoryRouter>);
  await userEvent.click(screen.getByRole('button', { name: '檢核已保存資料並送 GM' }));
  expect(screen.getByText(/本批商品資料已送入審核流程/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '產製／下載上架 Excel' })).toBeDisabled();
  expect(JSON.parse(localStorage.getItem('wear-yu-operations-v2')!).batches[0].status).toBe('待 GM 審核');
});
