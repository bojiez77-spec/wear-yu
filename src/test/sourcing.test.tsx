import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { parseSupplierRecords } from '../domain/sourcing';
import { emptyWorkspace, operationsReducer as reduce } from '../domain/operations';

const records = [{ id: 'fixture', title: '測試短袖', supplier: '測試店家', evidenceFile: 'test.png', evidencePosition: '上排右', observedAt: '2026-09-08', evidenceImage: 'data:image/png;base64,aGVsbG8=', historicalPrice: '歷史資料 77.42 CNY' }];
describe('real supplier pool execution', () => {
  it('validates evidence and rejects missing, executable, duplicate and unsafe sources', () => {
    expect(parseSupplierRecords(JSON.stringify({ records }))).toEqual(records);
    for (const patch of [{ evidenceImage: '' }, { evidenceImage: 'data:image/svg+xml;base64,aGVsbG8=' }, { sourceUrl: 'javascript:alert(1)' }, { observedAt: 'yesterday' }, { supplier: '' }]) expect(() => parseSupplierRecords(JSON.stringify({ records: [{ ...records[0], ...patch }] }))).toThrow();
    expect(() => parseSupplierRecords(JSON.stringify({ records: [...records, ...records] }))).toThrow();
  });
  it('runs actual selection, blocks repeated output and preserves unverified finance/approval', () => {
    let state = reduce(emptyWorkspace(), { type: 'supplier-import', records });
    state = reduce(state, { type: 'launch', id: 'one', demo: false, time: '2026-09-09T01:00:00Z' });
    expect(state.batches[0].sourcingRun?.candidates).toEqual(records);
    expect(state.batches[0].packet).toBeUndefined();
    expect(reduce(state, { type: 'batch-gm', id: 'one', result: '放行', reason: '' })).toBe(state);
    expect(reduce(state, { type: 'source-run', id: 'one', time: '2026-09-09T02:00:00Z' })).toBe(state);
    state = reduce(state, { type: 'launch', id: 'two', demo: false });
    expect(state.batches[1].sourcingRun).toMatchObject({ status: 'EMPTY', duplicates: 1, candidates: [] });
    // Duplicate source under a new ID is not a new candidate.
    expect(reduce(state, { type: 'supplier-import', records: [{ ...records[0], id: 'other' }] }).supplierPool).toHaveLength(1);
    state = reduce(state, { type: 'supplier-import', records: [{ ...records[0], id: 'new', evidencePosition: '下排左' }] });
    state = reduce(state, { type: 'source-run', id: 'two', time: '2026-09-09T03:00:00Z' });
    expect(state.batches[1].sourcingRun?.candidates.map(r => r.id)).toEqual(['new']);
  });
  it('imports through UI, launches, displays evidence, persists and reports zero on another batch', async () => {
    const user = userEvent.setup();
    const app = render(<MemoryRouter><App /></MemoryRouter>);
    await user.click(screen.getByText('供應資料庫 · 0 筆'));
    const file = new File([JSON.stringify({ records })], 'suppliers.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => JSON.stringify({ records }) });
    await user.upload(screen.getByLabelText('匯入供應資料檔'), file);
    expect(await screen.findByText('供應資料庫 · 1 筆')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '發起新批次選品' }));
    expect(screen.getByRole('heading', { name: '測試短袖' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '產製／下載上架 Excel' })).toBeDisabled();
    app.unmount();
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '測試短袖' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '發起新批次選品' }));
    expect(screen.getByText(/現有商品已處理/)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: '測試短袖' })).toHaveLength(1);
  });
});
