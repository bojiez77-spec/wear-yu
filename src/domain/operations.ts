export type Team = '選品組' | '視覺組';
export type Stage = '進行中' | '待審批' | '已放行' | '已退回';
export type Kind = '選品款式' | '社群內容' | '穿搭短影片' | '穿搭示意圖';
export type WorkCase = {
  id: string; title: string; team: Team; kind: Kind; stage: Stage;
  steps: { label: string; done: boolean }[];
  detail: string; cadence: string; productId?: string;
};
export type Decision = { id: string; caseId: string; title: string; result: '放行' | '退回'; reason: string; time: string };
export type Audit = { id: string; caseId: string; title: string; finding: string; resolved: boolean; time: string };
export type Workspace = { cases: WorkCase[]; decisions: Decision[]; audits: Audit[] };
export const emptyWorkspace = (): Workspace => ({ cases: [], decisions: [], audits: [] });
export const stepLabels: Record<Kind, string[]> = {
  選品款式: ['挑選款式', '確認樣品', '搭配評估'],
  社群內容: ['內容構思', '視覺製作', '加入好友引導'],
  穿搭短影片: ['穿搭腳本', '拍攝剪輯', '上架前確認'],
  穿搭示意圖: ['搭配提案', '示意圖製作', '上架前確認'],
};
export const progress = (item: WorkCase) => Math.round(item.steps.filter(s => s.done).length / item.steps.length * 100);
export const hasOpenFinding = (state: Workspace, id: string) => state.audits.some(a => a.caseId === id && a.finding && !a.resolved);
export type Operation =
  | { type: 'add'; item: WorkCase }
  | { type: 'step'; id: string; index: number }
  | { type: 'submit'; id: string }
  | { type: 'decide'; id: string; result: Decision['result']; reason: string; eventId: string; time: string }
  | { type: 'audit'; id: string; finding: string; eventId: string; time: string }
  | { type: 'resolve'; id: string };
export function operationsReducer(state: Workspace, action: Operation): Workspace {
  if (action.type === 'add') return { ...state, cases: [...state.cases, action.item] };
  if (action.type === 'resolve') return { ...state, audits: state.audits.map(a => a.id === action.id ? { ...a, resolved: true } : a) };
  const item = state.cases.find(c => c.id === action.id);
  if (!item) return state;
  const replace = (next: WorkCase) => state.cases.map(c => c.id === item.id ? next : c);
  if (action.type === 'step') {
    if (!['進行中', '已退回'].includes(item.stage)) return state;
    return { ...state, cases: replace({ ...item, steps: item.steps.map((s, i) => i === action.index ? { ...s, done: !s.done } : s) }) };
  }
  if (action.type === 'submit') {
    if (!['進行中', '已退回'].includes(item.stage) || progress(item) !== 100 || hasOpenFinding(state, item.id)) return state;
    return { ...state, cases: replace({ ...item, stage: '待審批' }) };
  }
  if (action.type === 'decide') {
    if (item.stage !== '待審批' || (action.result === '退回' && !action.reason.trim()) || (action.result === '放行' && hasOpenFinding(state, item.id))) return state;
    return {
      ...state, cases: replace({ ...item, stage: action.result === '放行' ? '已放行' : '已退回' }),
      decisions: [{ id: action.eventId, caseId: item.id, title: item.title, result: action.result, reason: action.reason.trim(), time: action.time }, ...state.decisions],
    };
  }
  return { ...state, audits: [{ id: action.eventId, caseId: item.id, title: item.title, finding: action.finding.trim(), resolved: !action.finding.trim(), time: action.time }, ...state.audits] };
}
export function exampleWorkspace(): Workspace {
  const make = (id: string, title: string, kind: Kind, stage: Stage, done: number, detail: string, cadence: string, productId?: string): WorkCase => ({
    id, title, kind, team: kind === '選品款式' ? '選品組' : '視覺組', stage, detail, cadence, productId,
    steps: stepLabels[kind].map((label, i) => ({ label, done: i < done })),
  });
  return {
    cases: [
      make('c1', '霧藍襯衫 × 直筒長褲', '選品款式', '待審批', 3, '低飽和通勤款 · 寬鬆剪裁 · 秋季首波', '本週選品', 's1'),
      make('c2', '極簡肩背包', '選品款式', '進行中', 1, '日常配件 · 比較容量與肩帶比例', '下次確認樣品', 's3'),
      make('c3', '一件襯衫，三種日常', '社群內容', '進行中', 2, '吸引停留 → 留下好奇 → 邀請加入好友', '每週二、五 · 示範排程'),
      make('c4', '秋日通勤穿搭短片', '穿搭短影片', '已退回', 3, '15 秒穿搭影片 · 上架前使用', '上架前'),
      make('c5', '襯衫與長褲搭配圖', '穿搭示意圖', '已放行', 3, '兩套搭配 · 商品頁素材', '上架前'),
    ],
    decisions: [
      { id: 'd1', caseId: 'c4', title: '秋日通勤穿搭短片', result: '退回', reason: '補上全身搭配鏡頭，再送審。', time: '示範紀錄' },
      { id: 'd2', caseId: 'c5', title: '襯衫與長褲搭配圖', result: '放行', reason: '', time: '示範紀錄' },
    ],
    audits: [{ id: 'a1', caseId: 'c4', title: '秋日通勤穿搭短片', finding: '片尾缺少加入好友引導。', resolved: false, time: '示範例行查核' }],
  };
}
