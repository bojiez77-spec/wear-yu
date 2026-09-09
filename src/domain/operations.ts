import { selectCandidates, recordKey, type SupplierRecord, type SourcingRun } from './sourcing';
import { parsePacket, type DeliveryPacket } from './delivery';
import { followupPacket, type CandidateWork } from './followup';
export type Team = '選品組' | '視覺組';
export type Stage = '待接通' | '等待前關' | '進行中' | '待審批' | '已放行' | '已退回';
export type Kind = '選品款式' | '社群內容' | '穿搭短影片' | '穿搭示意圖';
export type WorkCase = {
  id: string; batchId?: string; title: string; team: Team; kind: Kind; stage: Stage;
  steps: { label: string; done: boolean }[];
  detail: string; cadence: string; productId?: string;
};
export type Decision = { id: string; caseId: string; title: string; result: '放行' | '退回'; reason: string; time: string; defectType?: DefectType; department?: string };
export const defectTypes = ['SKU／商品資料', '成本／財務', '圖片／素材', '文案／社群', '流程／系統'] as const;
export type DefectType = typeof defectTypes[number];
export type Capa = { defectType: DefectType; count: number; department: string; rootCause: string; corrective: string; preventive: string; review: '待調查' | '待複查' | 'PASS' | 'FAIL'; evidence: string };
export type Audit = { id: string; caseId: string; title: string; finding: string; resolved: boolean; time: string; capa?: Capa };
export type Workspace = { supplierPool?: SupplierRecord[]; batches: Batch[]; cases: WorkCase[]; decisions: Decision[]; audits: Audit[] };
export const emptyWorkspace = (): Workspace => ({ batches: [], cases: [], decisions: [], audits: [] });
export const stepLabels: Record<Kind, string[]> = {
  選品款式: ['優質店家與可追溯來源找款', '商品與來源核實', '搭配評估'],
  社群內容: ['熱門樣式與文案查核', '品牌原創製作', '加入好友引導'],
  穿搭短影片: ['熱門穿搭參考', '原創拍攝剪輯', '商品一致性確認'],
  穿搭示意圖: ['熱門搭配參考', '品牌示意圖製作', '商品一致性確認'],
};
export const sourceBriefs: Record<Team, { summary: string; rules: string[] }> = {
  選品組: {
    summary: '優質店家優先 · 可追溯來源持續選品',
    rules: ['淘寶登入是優先資料管道，並非啟動或 Excel 必要條件；受阻時使用董事長店家截圖、既有供應資料及公開索引建立候選，缺口明確保留。', '官方品牌 SKU／商品頁／正品驗證僅供參考；Excel 仍需實際販售商品對應圖片、可追溯來源、必填規格庫存與完整成本後淨利率至少 65%。'],
  },
  視覺組: {
    summary: '近期熱門穿搭與文案 → Wear-Yu 原創內容',
    rules: ['優先查核近 7 天的穿搭與文案；樣本不足再看近 30 天，清楚標示期間與受眾。', '參考 Instagram、Threads、小紅書公開內容與 TikTok Creative Center；保留原文連結、發佈日期、查核時間及可見互動數據。', '只在同平台、同期間、同類型的已查核樣本中比較熱度；缺數據即待查核，不宣稱全網最高。', '提取開場、構圖與穿搭思路，重寫品牌文案並製作原創素材；保留已核准三段式品牌形象，商品素材須符合實際款式。'],
  },
};
export const progress = (item: WorkCase) => Math.round(item.steps.filter(s => s.done).length / item.steps.length * 100);
export const hasOpenFinding = (state: Workspace, id: string) => state.audits.some(a => a.caseId === id && a.finding && !a.resolved);
export type Operation =
  | { type: 'launch'; id: string; demo: boolean; time?: string }
  | { type: 'supplier-import'; records: SupplierRecord[] }
  | { type: 'source-run'; id: string; time: string }
  | { type: 'candidate-save'; id: string; candidateId: string; work: CandidateWork }
  | { type: 'followup-submit'; id: string }
  | { type: 'packet'; id: string; text: string }
  | { type: 'excel'; id: string; filename: string }
  | { type: 'capa'; id: string; rootCause: string; corrective: string; preventive: string; review: Capa['review']; evidence: string }
  | { type: 'advance'; id: string }
  | { type: 'batch-gm'; id: string; result: '放行' | '退回'; reason: string; defectType?: DefectType; department?: string }
  | { type: 'chairman'; id: string; result: '放行' | '退回'; reason: string; defectType?: DefectType; department?: string }
  | { type: 'add'; item: WorkCase }
  | { type: 'step'; id: string; index: number }
  | { type: 'submit'; id: string }
  | { type: 'decide'; id: string; result: Decision['result']; reason: string; defectType?: DefectType; department?: string; eventId: string; time: string }
  | { type: 'audit'; id: string; finding: string; defectType?: DefectType; department?: string; eventId: string; time: string }
  | { type: 'resolve'; id: string };
function baseReducer(state: Workspace, action: Operation): Workspace {
  if (action.type === 'supplier-import') {
    const pool = [...(state.supplierPool || [])];
    for (const record of action.records) if (!pool.some(r => r.id === record.id || recordKey(r) === recordKey(record))) pool.push(record);
    return { ...state, supplierPool: pool };
  }
  if (action.type === 'source-run') return runSourcing(state, action.id, action.time);
  if (action.type === 'candidate-save' || action.type === 'followup-submit') {
    const batch = state.batches.find(b => b.id === action.id);
    if (!batch || batch.mode !== 'live' || batch.gmApproved || batch.packet) return state;
    if (action.type === 'candidate-save') {
      if (!batch.sourcingRun?.candidates.some(r => r.id === action.candidateId) || !action.work.variants.length || !Number.isFinite(Date.parse(action.work.savedAt))) return state;
      return { ...state, batches: state.batches.map(b => b.id === batch.id ? { ...b, candidateWork: { ...b.candidateWork, [action.candidateId]: action.work } } : b) };
    }
    try {
      const packet = followupPacket(batch.sourcingRun?.candidates || [], batch.candidateWork);
      return baseReducer(state, { type: 'packet', id: batch.id, text: JSON.stringify(packet) });
    } catch { return state; }
  }
  if (action.type === 'capa') {
    if (!action.rootCause.trim() || !action.corrective.trim() || !action.preventive.trim() || (action.review === 'PASS' && !action.evidence.trim())) return state;
    return { ...state, audits: state.audits.map(a => a.id === action.id && a.capa ? { ...a, resolved: action.review === 'PASS', capa: { ...a.capa, rootCause: action.rootCause.trim(), corrective: action.corrective.trim(), preventive: action.preventive.trim(), review: action.review, evidence: action.evidence.trim() } } : a) };
  }
  if (action.type === 'packet' || action.type === 'excel') {
    const batch = state.batches.find(b => b.id === action.id);
    if (!batch || batch.mode !== 'live') return state;
    if (action.type === 'excel') {
      if (!batch.gmApproved || !batch.packet || batch.listingStatus === 'BLOCK' || !action.filename.trim() || state.audits.some(a => !a.resolved && (a.caseId === batch.id || state.cases.some(c => c.id === a.caseId && c.batchId === batch.id)))) return state;
      return { ...state, batches: state.batches.map(b => b.id === batch.id ? { ...b, listingStatus: 'EXCEL_READY', events: [...b.events, `Excel 已產製供下載：${action.filename}；尚無上傳回執`] } : b) };
    }
    if (batch.gmApproved && batch.packet?.social && batch.socialStatus !== 'RETURNED') return state;
    try {
      const packet = parsePacket(action.text);
      // Social corrections cannot alter a product revision already approved by GM.
      if (batch.gmApproved && JSON.stringify(packet.products) !== JSON.stringify(batch.packet?.products)) return state;
      return { ...state, batches: state.batches.map(b => b.id === batch.id ? { ...b, packet, gate: batch.gmApproved ? 8 : 7, status: batch.gmApproved ? (packet.social ? '待董事長核決' : '已放行') : '待 GM 審核', socialStatus: packet.social ? 'REVIEW' : undefined, events: [...b.events, '已匯入部門驗證資料；財務計算 PASS'] } : b), cases: state.cases.map(c => c.batchId === batch.id && (c.kind === '社群內容' ? !!packet.social : c.kind === '選品款式' && !batch.gmApproved) ? { ...c, stage: '待審批', steps: c.steps.map(s => ({ ...s, done: true })) } : c) };
    } catch { return state; }
  }
  if (action.type === 'launch') {
    if (!action.id.trim() || state.batches.some(b => b.id === action.id)) return state;
    const next = createBatch(action.id, state.batches.length + 1, action.demo);
    const launched = { ...state, batches: [...state.batches, next.batch], cases: [...state.cases, ...next.cases] };
    return action.demo ? launched : runSourcing(launched, action.id, action.time || new Date().toISOString());
  }
  if (action.type === 'advance' || action.type === 'batch-gm' || action.type === 'chairman') {
    const batch = state.batches.find(b => b.id === action.id);
    if (!batch) return state;
    const blocked = state.audits.some(a => !a.resolved && a.finding && (a.caseId === batch.id || state.cases.some(c => c.id === a.caseId && c.batchId === batch.id)));
    if (action.type === 'advance') {
      if (batch.mode === 'demo' && batch.gmApproved && batch.socialStatus === 'RETURNED' && !blocked) return { ...state, batches: state.batches.map(b => b.id === batch.id ? { ...b, gate: 8, status: '待董事長核決', socialStatus: 'REVIEW' } : b) };
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
    if (action.type === 'batch-gm' && action.result === '放行' && batch.mode === 'live' && !batch.packet) return state;
    if (action.type === 'batch-gm' && batch.status !== '待 GM 審核') return state;
    if (action.type === 'chairman' && (batch.status !== '待董事長核決' || batch.gate !== 8)) return state;
    const actor = action.type === 'chairman' ? '董事長' : 'GM';
    const next: Batch = action.result === '退回'
      ? { ...batch, socialStatus: 'RETURNED', status: 'GM 改善中', gate: action.type === 'chairman' ? 7 : 4, reason: action.reason.trim(), events: [...batch.events, `${actor}退回：${action.reason.trim()}`, `${action.department || '視覺組'}接手補正，由 GM 追蹤` ] }
      : { ...batch, gmApproved: true, listingStatus: batch.listingStatus || (batch.mode === 'demo' ? 'BLOCK' : 'READY'), socialStatus: action.type === 'chairman' ? 'BLOCK' : batch.packet?.social || batch.mode === 'demo' ? 'REVIEW' : undefined, publishJobs: action.type === 'chairman' && batch.mode === 'live' && batch.packet?.social ? batch.packet.social.platforms.map(platform => ({ id: `${batch.id}-${platform}-${batch.events.length}`, platform, status: 'BLOCK', reason: '發布服務未接通', payload: batch.packet!.social! })) : batch.publishJobs, status: action.type === 'chairman' || (batch.mode === 'live' && !batch.packet?.social) ? '已放行' : '待董事長核決', gate: 8, reason: '', events: [...batch.events, `${actor}放行${batch.mode === 'demo' ? '（演練）' : ''}`] };
    return { ...state, batches: state.batches.map(b => b.id === batch.id ? next : b), cases: state.cases.map(c => c.batchId === batch.id && (batch.mode === 'demo' || c.kind === '社群內容' || c.kind === '選品款式') ? { ...c, stage: action.result === '退回' ? (action.type === 'chairman' && c.kind !== '社群內容' ? c.stage : '已退回') : c.kind === '社群內容' && action.type === 'batch-gm' ? (batch.packet?.social || batch.mode === 'demo' ? '待審批' : c.stage) : '已放行' } : c), decisions: [{ id: `${batch.id}-${batch.events.length}`, caseId: batch.id, title: `${batch.name}｜${actor}核決`, defectType: action.defectType, department: action.department, result: action.result, reason: action.reason.trim(), time: batch.mode === 'demo' ? '演練紀錄' : new Date().toLocaleString('zh-TW') }, ...state.decisions] };
  }
  if (action.type === 'add') return { ...state, cases: [...state.cases, action.item] };
  if (action.type === 'resolve') return { ...state, audits: state.audits.map(a => a.id === action.id && !a.capa ? { ...a, resolved: true } : a) };
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
    if (item.batchId) return state; // A case-level decision must not bypass batch authority.

    if (item.stage !== '待審批' || (action.result === '退回' && !action.reason.trim()) || (action.result === '放行' && hasOpenFinding(state, item.id))) return state;
    return {
      ...state, cases: replace({ ...item, stage: action.result === '放行' ? '已放行' : '已退回' }),
      decisions: [{ id: action.eventId, caseId: item.id, title: item.title, defectType: action.defectType, department: action.department, result: action.result, reason: action.reason.trim(), time: action.time }, ...state.decisions],
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
export type Batch = { candidateWork?: Record<string, CandidateWork>; sourcingRun?: SourcingRun; id: string; name: string; mode: 'live' | 'demo'; gate: number; status: '待接通' | '執行中' | '待 GM 審核' | '待董事長核決' | '已放行' | 'GM 改善中'; reason: string; events: string[]; packet?: DeliveryPacket; gmApproved?: boolean; listingStatus?: 'READY' | 'EXCEL_READY' | 'BLOCK'; publishJobs?: { id: string; platform: 'instagram' | 'threads'; status: 'BLOCK'; reason: string; payload: NonNullable<DeliveryPacket['social']> }[]; socialStatus?: 'REVIEW' | 'RETURNED' | 'BLOCK' | 'PENDING' | 'PUBLISHED' };
export function createBatch(id: string, number: number, demo: boolean): { batch: Batch; cases: WorkCase[] } {
  const name = `第 ${String(number).padStart(2, '0')} 批次`;
  const definitions: { suffix: string; kind: Kind; title: string; detail: string }[] = [
    { suffix: 's', kind: '選品款式', title: '可追溯來源候選搜尋', detail: '優質店家、既有供應資料及公開索引找貨、查重與來源核實；符合氣候，至少一件短袖，不硬湊候選。' },
    { suffix: 'social', kind: '社群內容', title: '社群與好友引導', detail: '參考近期熱門樣式與文案，轉成品牌原創內容，吸引停留與加入好友。' },
    { suffix: 'video', kind: '穿搭短影片', title: '上架前穿搭短影片', detail: '候選成熟後，參考熱門穿搭節奏，原創製作符合實際商品的短片。' },
    { suffix: 'image', kind: '穿搭示意圖', title: '搭配圖與尺寸表', detail: '參考熱門搭配呈現，依實際商品製作示意圖與尺寸資料。' },
  ];
  return {
    batch: { id, name, mode: demo ? 'demo' : 'live', gate: 0, status: demo ? '執行中' : '待接通', reason: '', events: [`董事長發起${name}`, '已建立本機作業紀錄；尚無外部接單回執', demo ? '示範引擎開始演練' : '開始讀取本機供應資料；製作與發布服務另待接通'] },
    cases: definitions.map(d => ({ id: `${id}-${d.suffix}`, batchId: id, title: `${name}｜${d.title}`, team: d.kind === '選品款式' ? '選品組' : '視覺組', kind: d.kind, stage: !demo ? '待接通' : d.kind === '選品款式' || d.kind === '社群內容' ? '進行中' : '等待前關', steps: stepLabels[d.kind].map(label => ({ label, done: false })), detail: d.detail, cadence: d.kind === '社群內容' ? '定期發佈規劃' : '依批次制度推進' })),
  };
}

// Count structured categories across cases in the same department; each accepted event counts once.
export function operationsReducer(state: Workspace, action: Operation): Workspace {
  if ('eventId' in action && (state.decisions.some(d => d.id === action.eventId) || state.audits.some(a => a.id === action.eventId || a.id === `finding-${action.eventId}`))) return state;
  const isReturn = (action.type === 'chairman' || action.type === 'batch-gm' || action.type === 'decide') && action.result === '退回';
  const isFinding = action.type === 'audit' && !!action.finding.trim();
  if ((isReturn || isFinding) && (!action.defectType || !defectTypes.includes(action.defectType) || !action.department?.trim())) return state;
  const next = baseReducer(state, action);
  if (next === state || !(isReturn || isFinding)) return next;
  const defectType = action.defectType!; const department = action.department!.trim();
  const count = next.decisions.filter(d => d.result === '退回' && d.defectType === defectType && d.department === department).length
    + next.audits.filter(a => a.capa?.defectType === defectType && a.capa.department === department && a.id.startsWith('finding-')).length + (isFinding ? 1 : 0);
  const caseId = action.id;
  const finding = action.type === 'audit' ? action.finding : action.reason;
  const eventKey = isFinding ? `finding-${action.eventId}` : `return-${next.decisions[0].id}`;
  const capa: Capa = { defectType, department, count, rootCause: '', corrective: '', preventive: '', review: '待調查', evidence: '' };
  // Every finding is tracked, and the second occurrence automatically starts CAPA.
  if (isFinding) {
    return { ...next, audits: next.audits.map(a => a.id === action.eventId ? { ...a, id: eventKey, capa } : a) };
  }
  if (count < 2) return next;
  return { ...next, audits: [{ id: eventKey, caseId, title: `稽核介入：${defectType}（第 ${count} 次）`, finding, time: new Date().toISOString(), resolved: false, capa }, ...next.audits] };
}

function runSourcing(state: Workspace, id: string, time: string): Workspace {
  const batch = state.batches.find(b => b.id === id);
  if (!batch || batch.mode !== 'live' || batch.gmApproved || batch.packet || batch.sourcingRun?.status === 'CANDIDATES' || !Number.isFinite(Date.parse(time))) return state;
  const used = state.batches.filter(b => b.id !== id && b.mode === 'live').flatMap(b => b.sourcingRun?.candidates || []);
  const run = selectCandidates(state.supplierPool || [], used, time);
  return { ...state, batches: state.batches.map(b => b.id === id ? { ...b, sourcingRun: run, gate: 0, status: run.candidates.length ? '執行中' : '待接通', events: [...b.events, `${time} 供應資料選取：檢查 ${run.scanned}，重複 ${run.duplicates}，新候選 ${run.candidates.length}；未完成採購／財務核實`] } : b), cases: state.cases.map(c => c.batchId === id && c.kind === '選品款式' ? { ...c, stage: run.candidates.length ? '進行中' : '待接通', detail: `供應資料已檢查 ${run.scanned} 筆；新候選 ${run.candidates.length} 筆。完整資料與財務待核實。`, steps: c.steps.map((step, i) => ({ ...step, done: i === 0 && run.candidates.length > 0 })) } : c) };
}
