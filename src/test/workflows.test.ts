import { describe, expect, it } from "vitest";
import { executeMockWorkflow } from "../domain/workflows";
import { initialWorkflows } from "../data/mock";

describe("mock execution adapter", () => {
  it("rejects paused work even if called outside the button", () => {
    expect(executeMockWorkflow(initialWorkflows[2], "audit", "12:00:00")).toBeNull();
  });
  it("reports the selected plan without mutating the workflow", () => {
    const workflow = { ...initialWorkflows[0] };
    expect(executeMockWorkflow(workflow, "daily", "12:00:00")?.log).toContain("日常整理 · 3 個步驟");
    expect(executeMockWorkflow(workflow, "audit", "12:00:00")?.log).toContain("品質複核 · 4 個步驟");
    expect(workflow).toEqual(initialWorkflows[0]);
  });
});
