import { describe, expect, it } from "vitest";
import { executeMockWorkflow, socialDeliveryMode, sourcingLevel } from "../domain/workflows";
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

describe("operational recovery controls", () => {
  const base = {
    traceableSource: true,
    actualItemImages: true,
    purchaseCostVerified: false,
    variantsVerified: false,
    requiredShopeeFieldsVerified: false,
  };

  it("allows a traceable product into L1 without Taobao login or official exact-SKU evidence", () => {
    expect(sourcingLevel(base)).toBe("L1_CANDIDATE");
  });

  it("moves verified procurement to L2 until listing and finance evidence is complete", () => {
    expect(sourcingLevel({ ...base, purchaseCostVerified: true, variantsVerified: true, financeMargin: 0.64 })).toBe("L2_PROCUREMENT");
  });

  it("requires verified Shopee fields and at least 65% margin for L3", () => {
    expect(sourcingLevel({ ...base, purchaseCostVerified: true, variantsVerified: true, requiredShopeeFieldsVerified: true, financeMargin: 0.65 })).toBe("L3_LISTING_READY");
  });

  it("blocks candidates that lack a traceable source or actual-item images", () => {
    expect(sourcingLevel({ ...base, actualItemImages: false })).toBe("BLOCK");
  });

  it("switches social publishing to manual fallback after 30 minutes of API blockage", () => {
    expect(socialDeliveryMode(29)).toBe("AUTOMATION");
    expect(socialDeliveryMode(30)).toBe("MANUAL_FALLBACK");
  });
});
