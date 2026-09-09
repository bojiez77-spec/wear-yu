import type { Workflow } from "../data/mock";

export const executionPlans = {
  daily: { name: "日常整理", description: "整理全部模擬資料，適合每日例行作業。", steps: ["讀取資料", "統一格式", "產生摘要"] },
  audit: { name: "品質複核", description: "加入欄位與重複檢查，適合上架前複核。", steps: ["讀取資料", "檢查必要欄位", "比對重複資料", "產生複核摘要"] },
} as const;
export type ExecutionPlan = keyof typeof executionPlans;

export type SourcingLevel = "L1_CANDIDATE" | "L2_PROCUREMENT" | "L3_LISTING_READY";
export type SourcingEvidence = {
  traceableSource: boolean;
  actualItemImages: boolean;
  purchaseCostVerified: boolean;
  variantsVerified: boolean;
  requiredShopeeFieldsVerified: boolean;
  financeMargin?: number;
};

// Emergency operating model approved by the Chairman on 2026-09-09.
// Taobao login and an official FREAK'S STORE exact SKU are enrichment evidence,
// never prerequisites for forming a candidate.
export function sourcingLevel(evidence: SourcingEvidence): SourcingLevel | "BLOCK" {
  if (!evidence.traceableSource || !evidence.actualItemImages) return "BLOCK";
  if (!evidence.purchaseCostVerified || !evidence.variantsVerified) return "L1_CANDIDATE";
  if (!evidence.requiredShopeeFieldsVerified || evidence.financeMargin === undefined || evidence.financeMargin < 0.65) return "L2_PROCUREMENT";
  return "L3_LISTING_READY";
}

export type SocialDeliveryMode = "AUTOMATION" | "MANUAL_FALLBACK";
export function socialDeliveryMode(apiBlockedMinutes: number): SocialDeliveryMode {
  return Number.isFinite(apiBlockedMinutes) && apiBlockedMinutes >= 30 ? "MANUAL_FALLBACK" : "AUTOMATION";
}

export const recoveryControls = {
  program: ["code commit", "build/test", "runtime when available"],
  sourcing: ["L1 candidate", "L2 procurement", "L3 listing ready"],
  socialFallbackMinutes: 30,
  financeMinimumMargin: 0.65,
} as const;

// A deterministic mock adapter. A future adapter can implement the same result contract.
export function executeMockWorkflow(workflow: Workflow, plan: ExecutionPlan, time: string) {
  if (workflow.status !== "ready") return null;
  const selected = executionPlans[plan];
  return {
    lastRun: `本次 ${time}`,
    log: `${time}  ${workflow.name}完成 · ${workflow.records} 筆模擬資料 · ${selected.name} · ${selected.steps.length} 個步驟`,
    message: `${workflow.name}：模擬執行完成。${selected.name}，${selected.steps.length} 個步驟已完成。`,
  };
}
