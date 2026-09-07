export type Team = '選品組' | '視覺組';
export type Stage = '待接通' | '等待前關' | '進行中' | '待審批' | '已放行' | '已退回';
export type Kind = '選品款式' | '社群內容' | '穿搭短影片' | '穿搭示意圖';
export type WorkCase = {
  id: string; batchId?: string; title: string; team: Team; kind: Kind; stage: Stage;
  steps: { label: string; done: boolean }[];
  detail: string; cadence: string; productId?: string;
};
export type Decision = { id: string; caseId: string; title: string; result: '放行' | '退回'; reason: string; time: string };
export type Audit = { id: string; caseId: string; title: string; finding: string; resolved: boolean; time: string };
export type Workspace = { batches: Batch[]; cases: WorkCase[]; decisions: Decision[]; audits: Audit[] };
export const emptyWorkspace = (): Workspace => ({ batches: [], cases: [], decisions: [], audits: [] });
export const stepLabels: Record<Kind, string[]> = {
  選品款式: ['挑選款式', '確認樣品', '搭配評估'],
  社群內容: ['內容構思', '視覺製作', '加入好友引導'],
  穿搭短影片: ['穿搭腳本', '拍攝剪輯', '上架前確認'],
  穿搭示意圖: ['搭配提案', '示意圖製作', '上架前確認'],
};
export const progress = (item: WorkCase) => Math.round(item.steps.filter(s => s.done).length / item.steps.length * 100);
export const hasOpenFinding = (state: Workspace, id: string) => state.audits.some(a => a.caseId === id && a.finding && !a.resolved);
export type Operation =
  | { type: 'launch'; id: string; demo: boolean }
  | { type: 'advance'; id: string }
  | { type: 'batch-gm'; id: string; result: '放行' | '退回'; reason: string }
  | { type: 'chairman'; id: string; result: '放行' | '退回'; reason: string }
  | { type: 'add'; item: WorkCase }
  | { type: 'step'; id: string; index: number }
  | { type: 'submit'; id: string }
  | { type: 'decide'; id: string; result: Decision['result']; reason: string; eventId: string; time: string }
  | { type: 'audit'; id: string; finding: string; eventId: string; time: string }
  | { type: 'resolve'; id: string };
export function operationsReducer(state: Workspace, action: Operation): Workspace {
  if (action.type === 'launch') {
    if (state.batches.some(b => b.status !== '已放行')) return state;
    const next = createBatch(action.id, state.batches.length + 1, action.demo);
    return { ...state, batches: [...state.batches, next.batch], cases: [...state.cases, ...next.cases] };
  }
  if (action.type === 'advance' || action.type === 'batch-gm' || action.type === 'chairman') {
    const batch = state.batches.find(b => b.id === action.id);
    if (!batch) return state;
    const blocked = state.audits.some(a => !a.resolved && a.finding && state.cases.some(c => c.id === a.caseId && c.batchId === batch.id));
    if (action.type === 'advance') {
      if (batch.mode !== 'demo' || !['執行中', 'GM 改善中'].includes(batch.status) || blocked || batch.gate >= 7) return state;
      const gate = batch.gate + 1;
      const next: Batch = { ...batch, gate, status: gate === 7 ? '待 GM 審核' : '執行中', events: [...batch.events, `${gateDefinitions[batch.gate].name}：演練完成`] };
      return { ...state, batches: state.batches.map(b => b.id === batch.id ? next : b), cases: state.cases.map(c => {
        if (c.batchId !== batch.id) return c;
        const done = c.team === '選品組' || c.kind === '社群內容' ? Math.min(3, gate) : gate >= 5 ? 3 : gate >= 4 ? 1 : 0;
        return { ...c, stage: gate === 7 ? '待審批' : c.team === '視覺組' && c.kind !== '社群內容' && gate < 4 ? '等待前關' : '進行中', steps: c.steps.map((step, i) => ({ ...step, done: i < done })), ...(c.team === '選品組' && gate >= 1 ? { title: `${batch.name}｜短袖襯衫候選（演練）`, productId: 's4' } : {}) };
      }), audits: gate === 7 ? [{ id: `${batch.id}-preflight-${batch.events.length}`, caseId: `${batch.id}-video`, title: `${batch.name}制度查核（演練）`, finding: '', resolved: true, time: '示範引擎 · 非真實查核' }, ...state.audits] : state.audits };
    }
    if (blocked && action.result === '放行') return state;
    if (action.result === '退回' && !action.reason.trim()) return state;
    if (action.type === 'batch-gm' && batch.status !== '待 GM 審核') return state;
    if (action.type === 'chairman' && (batch.status !== '待董事長核決' || batch.gate !== 8)) return state;
    const actor = action.type === 'chairman' ? '董事長' : 'GM';
    const next: Batch = action.result === '退回'
      ? { ...batch, status: 'GM 改善中', gate: 4, reason: action.reason.trim(), events: [...batch.events, `${actor}退回：${action.reason.trim()}`, 'GM 接手補正，重新進行視覺及後續控制'] }
      : { ...batch, status: action.type === 'chairman' ? '已放行' : '待董事長核決', gate: 8, reason: '', events: [...batch.events, `${actor}放行${batch.mode === 'demo' ? '（演練）' : ''}`] };
    return { ...state, batches: state.batches.map(b => b.id === batch.id ? next : b), cases: state.cases.map(c => c.batchId === batch.id ? { ...c, stage: action.result === '退回' ? '已退回' : '已放行' } : c), decisions: [{ id: `${batch.id}-${batch.events.length}`, caseId: batch.id, title: `${batch.name}｜${actor}核決`, result: action.result, reason: action.reason.trim(), time: batch.mode === 'demo' ? '演練紀錄' : new Date().toLocaleString('zh-TW') }, ...state.decisions] };
  }
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
    batches: [],
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

export const gateDefinitions = [
  { name: '候選建立', owner: '選品組' },
  { name: '商品查重', owner: '選品組／稽核' },
  { name: '氣候與短袖條件', owner: '選品組' },
  { name: '財務定價・淨利率 ≥65%', owner: '財務組' },
  { name: '圖片・尺寸表・短片', owner: '視覺組' },
  { name: '資安檢查', owner: '資安部' },
  { name: '必要稽核', owner: '稽核組' },
  { name: 'GM 最終審核', owner: '總經理' },
] as const;
export type Batch = { id: string; name: string; mode: 'live' | 'demo'; gate: number; status: '待接通' | '執行中' | '待 GM 審核' | '待董事長核決' | '已放行' | 'GM 改善中'; reason: string; events: string[] };
export function createBatch(id: string, number: number, demo: boolean): { batch: Batch; cases: WorkCase[] } {
  const name = `第 ${String(number).padStart(2, '0')} 批次`;
  const definitions: { suffix: string; kind: Kind; title: string; detail: string }[] = [
    { suffix: 's', kind: '選品款式', title: '候選款式搜尋', detail: '查重、氣候適配，至少一件短袖；不硬湊候選。' },
    { suffix: 'social', kind: '社群內容', title: '社群與好友引導', detail: '定期內容規劃，吸引停留並引導加入好友。' },
    { suffix: 'video', kind: '穿搭短影片', title: '上架前穿搭短影片', detail: '候選成熟後，由 GM 派交視覺組。' },
    { suffix: 'image', kind: '穿搭示意圖', title: '搭配圖與尺寸表', detail: '候選成熟後，製作搭配示意及尺寸資料。' },
  ];
  return {
    batch: { id, name, mode: demo ? 'demo' : 'live', gate: 0, status: demo ? '執行中' : '待接通', reason: '', events: [`董事長發起${name}`, 'GM 已建立制度工作佇列', demo ? '示範引擎開始演練' : '待接通找貨與製作執行服務，尚未實際執行'] },
    cases: definitions.map(d => ({ id: `${id}-${d.suffix}`, batchId: id, title: `${name}｜${d.title}`, team: d.kind === '選品款式' ? '選品組' : '視覺組', kind: d.kind, stage: !demo ? '待接通' : d.kind === '選品款式' || d.kind === '社群內容' ? '進行中' : '等待前關', steps: stepLabels[d.kind].map(label => ({ label, done: false })), detail: d.detail, cadence: d.kind === '社群內容' ? '定期發佈規劃' : '依批次制度推進' })),
  };
}
