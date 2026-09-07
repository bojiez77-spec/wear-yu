import { describe, expect, it } from 'vitest';
import { emptyWorkspace, operationsReducer as reduce } from '../domain/operations';
const launch = (demo = true) => reduce(emptyWorkspace(), { type: 'launch', id: 'b1', demo });
function mature() { let state = launch(); for (let i = 0; i < 7; i++) state = reduce(state, { type: 'advance', id: 'b1' }); return state; }
describe('batch company policy', () => {
  it('does not simulate execution in actual mode or launch concurrent duplicates', () => {
    const state = launch(false);
    expect(reduce(state, { type: 'advance', id: 'b1' })).toBe(state);
    expect(reduce(state, { type: 'launch', id: 'b2', demo: false })).toBe(state);
    expect(state.cases).toHaveLength(4);
    expect(state.cases.every(c => c.steps.every(s => !s.done))).toBe(true);
  });
  it('enforces prior gates and the GM then chairman approval order', () => {
    let state = launch();
    state = reduce(state, { type: 'advance', id: 'b1' });
    expect(state.cases.filter(c => c.kind === '穿搭短影片' || c.kind === '穿搭示意圖').every(c => c.steps.every(s => !s.done))).toBe(true);
    expect(reduce(state, { type: 'chairman', id: 'b1', result: '放行', reason: '' })).toBe(state);
    state = mature(); expect(state.batches[0].status).toBe('待 GM 審核');
    expect(reduce(state, { type: 'advance', id: 'b1' })).toBe(state);
    state = reduce(state, { type: 'batch-gm', id: 'b1', result: '放行', reason: '' });
    expect(state.batches[0].status).toBe('待董事長核決');
    state = reduce(state, { type: 'chairman', id: 'b1', result: '放行', reason: '' });
    expect(state.batches[0].status).toBe('已放行');
    expect(reduce(state, { type: 'launch', id: 'b2', demo: true }).batches).toHaveLength(2);
    expect(reduce(state, { type: 'chairman', id: 'b1', result: '放行', reason: '' })).toBe(state);
  });
  it('requires a return reason and returns ownership to GM for revalidation', () => {
    let state = reduce(mature(), { type: 'batch-gm', id: 'b1', result: '放行', reason: '' });
    expect(reduce(state, { type: 'chairman', id: 'b1', result: '退回', reason: ' ' })).toBe(state);
    state = reduce(state, { type: 'chairman', id: 'b1', result: '退回', reason: '補正影片' });
    expect(state.batches[0].status).toBe('GM 改善中'); expect(state.batches[0].gate).toBe(4);
    expect(state.decisions[0].reason).toBe('補正影片');
    for (let i = 0; i < 3; i++) state = reduce(state, { type: 'advance', id: 'b1' });
    expect(state.batches[0].status).toBe('待 GM 審核');
  });
  it('blocks final approval on unresolved audit findings', () => {
    let state = mature();
    state = reduce(state, { type: 'audit', id: 'b1-video', finding: '素材缺漏', eventId: 'issue', time: 'test' });
    expect(reduce(state, { type: 'batch-gm', id: 'b1', result: '放行', reason: '' })).toBe(state);
    state = reduce(state, { type: 'resolve', id: 'issue' });
    expect(reduce(state, { type: 'batch-gm', id: 'b1', result: '放行', reason: '' }).batches[0].status).toBe('待董事長核決');
  });
});
