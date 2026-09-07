import { describe, expect, it } from 'vitest';
import { exampleWorkspace, operationsReducer } from '../domain/operations';

describe('approval invariants', () => {
  it('rejects incomplete submissions and duplicate approvals', () => {
    const initial = exampleWorkspace();
    expect(operationsReducer(initial, { type: 'submit', id: 'c2' })).toBe(initial);
    const action = { type: 'decide', id: 'c1', result: '放行', reason: '', eventId: 'new', time: 'now' } as const;
    const approved = operationsReducer(initial, action);
    expect(approved.decisions).toHaveLength(3);
    expect(operationsReducer(approved, action)).toBe(approved);
  });
  it('prevents approval when a new audit finding exists and requires a return reason', () => {
    const initial = exampleWorkspace();
    const audited = operationsReducer(initial, { type: 'audit', id: 'c1', finding: '尺寸未核對', eventId: 'new', time: 'now' });
    expect(operationsReducer(audited, { type: 'decide', id: 'c1', result: '放行', reason: '', eventId: 'd', time: 'now' })).toBe(audited);
    expect(operationsReducer(initial, { type: 'decide', id: 'c1', result: '退回', reason: '  ', eventId: 'd', time: 'now' })).toBe(initial);
  });
});
