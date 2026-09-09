# Wear-Yu Operating Recovery Mode — 2026-09-09

Chairman approved and GM activated at 2026-09-09 18:18 Asia/Taipei. This recovery mode supersedes any older operating wording that would allow one technical dependency to stop unrelated executable work.

## 1. Engineering P0 staged acceptance
Engineering recovery is split into independently executable stages:
- P0-A: actual code commit;
- P0-B: build/test evidence;
- P0-C: deployment/runtime verification when the deployment channel is available.

A blocked deployment/runtime channel must not prevent P0-A or P0-B. Policy-only commits do not satisfy P0-A.

## 2. Social continuity / manual fallback
Automation is preferred, but it is not the right to operate. If the social publication API/media-delivery path remains blocked for 30 minutes, switch to manual platform publication. Only an actual provider PUBLISHED receipt, post/reel ID or platform URL counts as publication completion. Draft, scheduled and PENDING states are not completion.

## 3. Three-level sourcing gate
### L1 — Candidate
Requires a traceable source and actual sellable-item images. Taobao LOGIN PASS and official FREAK'S STORE exact-SKU evidence are not prerequisites for L1.

### L2 — Procurement verified
Requires L1 plus verified acquisition cost and verified colors/sizes/current supply or equivalent sellable variants.

### L3 — Listing ready
Requires L2 plus non-fabricated required Shopee listing fields, complete landed/selling costs and Finance net margin >=65%. L3 authorizes GM-controlled Shopee Excel generation under existing policy; actual Shopee listing remains separate and requires listing receipt.

A/B remain approved active cases and do not return to the candidate pool. Exact-item search is limited to two working cycles before switching that sourcing effort to a commercially suitable alternative following the approved design direction while preserving the original sourcing exception. New L1 candidate work continues in parallel.

## 4. Audit CAPA mode
Audit stops counting repeated narrative comments as progress. A repeated defect is tracked as one CAPA with: owner, root cause, corrective action, preventive action, checkpoint/deadline, evidence and closure state. Repeated missed checkpoints escalate the CAPA rather than creating a new definition of the same defect.

Evidence-only closure remains mandatory. Acceptable evidence includes code commit, build/test, deployment/runtime evidence, provider PUBLISHED receipt, supplier evidence, Finance PASS and Excel/listing receipt as applicable.

## 5. Recovery scoreboard
GM reports the operating truth using four hard outputs:
- Engineering: new code commit + build/test;
- Social: PUBLISHED reel/post + provider receipt;
- Approved sourcing A/B: at least one advances to L2;
- New sourcing: L1 candidates continue independently of A/B blockers.

Blocked dependencies must be reported immediately, but must not be used to stop unrelated executable work.
