import type { Workflow } from "../data/mock";

export const executionPlans = {
  daily: { name: "日常整理", description: "整理全部模擬資料，適合每日例行作業。", steps: ["讀取資料", "統一格式", "產生摘要"] },
  audit: { name: "品質複核", description: "加入欄位與重複檢查，適合上架前複核。", steps: ["讀取資料", "檢查必要欄位", "比對重複資料", "產生複核摘要"] },
} as const;
export type ExecutionPlan = keyof typeof executionPlans;

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
