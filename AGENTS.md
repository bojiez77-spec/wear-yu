# Wear-Yu Company Operating Rules

## 1. Governance and authority
- Chairman (董事長) is the final decision-maker for major approvals and final release decisions.
- General Manager (GM / 總經理) owns execution after the Chairman gives a goal or approval. Do not repeatedly ask the Chairman to say "執行".
- Departments execute within existing authorization and report upward through GM.
- Audit (稽核部) independently checks evidence, exceptions, repeated defects, and closure.
- Information/Engineering (資訊部) owns technical integration, reliability, deployment, monitoring, and immediate technical incident reporting.

## 2. Definition of done: evidence only
Never report planning, assignment, "in progress", PENDING, or intent as completed work.
Completion must be supported by observable evidence appropriate to the task, such as:
- source code actually changed;
- Git commit SHA;
- build/test result;
- deployment result;
- runnable URL or executable output;
- social provider status = PUBLISHED;
- verified SKU/source/product image/inventory data;
- actual listing/publish status.
If there is no real result during a reporting period, explicitly classify it as zero progress.

## 3. Priority and parallel execution
Three permanent operating lines run in parallel:
1. Program / Engineering (highest priority, P0)
2. Social
3. Product sourcing
If one line is blocked, continue every executable task on the other lines while also removing the original blocker.
Do not stop the whole operation because one dependency is unavailable.

## 4. Program / Engineering rules — P0
- Program development is the highest priority.
- GitHub is the source of truth for code delivery.
- Count only actual code, commits, build/test evidence, deployments, or runnable results.
- If a repository contains only initialization content, say so explicitly.
- After changing code, run the repository's real verification commands (build/test/typecheck/lint when available and applicable).
- Never claim a deployment succeeded until an actual deployment status and accessible URL are verified.
- Codex -> GitHub -> deployment -> browser/runtime verification is the preferred delivery chain.
- Preserve working functionality while improving UI/UX; do not rewrite stable functionality without a concrete reason.
- Mobile and desktop responsiveness must be checked for user-facing changes.

## 5. Technical incident notification
Information/Engineering must report an operationally relevant technical abnormality immediately when discovered, including:
- occurrence time;
- affected scope;
- preliminary cause;
- current remediation;
- next checkpoint.
Examples include missed scheduled jobs/reports, GitHub/Codex/system connection failures, API errors, data-fetch failures, deployment failures, build/test failures, authentication/permission failures, and runtime outages.
Failure to proactively report a discovered incident is an Information Department defect and must be tracked by Audit.
Do not hide a failed command or silently downgrade it to "still working".

## 6. Social operating rules
- Instagram and Threads publication is complete only when the actual provider state is PUBLISHED.
- PENDING is never completion.
- Report publication status, scheduling status, available performance metrics, and abnormalities using actual platform evidence.
- If analytics are unavailable or empty, state that clearly; never invent reach, likes, views, engagement, or conversions.
- Current approved visual direction: vertical full canvas; three horizontal bands (top/middle/bottom); authentic everyday photography; low-AI appearance; restrained, premium lifestyle presentation.
- The Chairman has already selected the three three-band brand-image posts. Do not reopen that selection unless instructed.

## 7. Product sourcing operating rules
Two Chairman-approved products are active execution cases and must continue in parallel:
A. FREAK'S STORE for BEACH & FES Recycled Nylon Short Sleeve Shirt
B. FREAK'S STORE Short Length Hoodie Knit — Chairman approved on 2026-09-07.

Rules:
- A and B must never return to the candidate pool and must not wait for a batch of three products.
- Continue new-candidate sourcing while completing approved-product data. Approved-product follow-up must not stop the sourcing pipeline.
- For each active product verify, where applicable: actual source, exact SKU/product code, exact-SKU official/product images, acquisition cost, Wear-Yu pricing, colors, sizes, inventory, listing assets/data, and actual listing status.
- Missing fields must be explicitly reported.
- Product approval packages must include exact product images. Never present a similar/reference image as the official approval image when the exact SKU has not been confirmed.
- If a Chairman-approved product is not followed through, classify responsibility explicitly as "選貨組缺失" and place it under Audit tracking.
- Do not fabricate supplier cost. Official retail price is not automatically Wear-Yu acquisition cost.
- Do not force candidates merely to reach a target count. Quality and verification override quota filling.
- Product names containing "FS" may indicate FREAK'S STORE and should be actively checked, but brand identity must still be verified.
- Current sourcing focus is primarily Taobao suppliers unless a newer Chairman instruction changes the sourcing channel.

## 8. Finance / final pricing gate
Finance (財務部) owns the final pricing Gate after the actual clothing acquisition cost has been verified.

For every product, calculate the complete landed/selling cost using verified inputs:
- actual Taobao / supplier clothing purchase cost;
- Taobao overseas credit-card/payment handling fee;
- international/cross-border shipping, consolidation, and applicable freight cost;
- Shopee transaction/service/commission fees applicable to the sale.

Current pricing policy:
- The final selling price must produce a net profit margin of at least 65% after the above costs are included.
- 65% is the current minimum threshold, not a permanent ceiling or fixed lifetime target.
- As operating expenses increase (for example advertising, labor, warehousing, packaging, returns, tax, or other recurring overhead), Finance must reassess and may recommend increasing the required minimum margin.
- Do not lower the 65% minimum without a newer Chairman instruction.

Standard calculation:
- Complete cost = purchase cost + overseas card/payment fee + freight + Shopee fees.
- Net profit = final selling price - complete cost.
- Net profit margin = net profit / final selling price.
- Finance Gate PASS requires net profit margin >= 65% using verified cost inputs.

Because Shopee fees may be calculated as a percentage of selling price rather than a fixed cost, Finance must solve the pricing equation using the actual applicable fee structure instead of blindly adding a guessed fixed fee.

Finance reporting for each final-price decision must show:
1. purchase cost;
2. overseas card/payment fee;
3. freight;
4. Shopee fees and fee basis/rate;
5. complete cost;
6. proposed/final selling price;
7. net profit amount;
8. net profit margin;
9. PASS or BLOCK.

If the actual supplier purchase cost or another required cost input has not been verified, the Finance Gate is BLOCK and no value may be presented as a final selling price. Official Japanese retail price, reference price, or competitor price must never be substituted for actual Wear-Yu acquisition cost.

This Finance Gate applies to approved products A and B and all future candidates/products.

## 9. Chairman-facing reporting standard
Chairman reports should contain only:
- actual completed results;
- major abnormalities;
- matters requiring a Chairman decision;
- immediate next action/checkpoint.
Do not fill Chairman reports with internal planning, role assignment, or production-in-progress language.
If no Chairman decision is required, state that and continue execution under existing authority.

## 10. Audit rules
Audit verifies evidence rather than accepting department self-declaration.
- PASS requires verifiable evidence.
- OPEN means required evidence or remediation remains incomplete.
- Repeated defects require root-cause analysis and CAPA tracking.
- A blocked dependency does not excuse inactivity on unrelated executable work.
- Do not close integration work until the end-to-end result is verified.
- Audit must verify Finance pricing evidence before accepting a final price as compliant.
For deployment/integration closure, require at minimum:
1. successful build/deployment evidence;
2. actual accessible deployment URL;
3. basic browser/runtime verification of critical UI and interactions.

## 11. Wear-Yu software product direction
The application is an internal Wear-Yu GM / Executive Operations Command Center.
Keep the dashboard focused on operational truth and rapid executive review.
Preferred information hierarchy:
- Program / Engineering status first;
- Social status second;
- Product sourcing status third;
- explicit PASS / OPEN / BLOCK / zero-progress states;
- evidence and timestamps over narrative claims;
- Chairman decision items only when genuinely required.

## 12. Codex execution behavior
Before modifying the repository:
1. Read this AGENTS.md and the current repository state.
2. Inspect existing implementation before proposing replacement architecture.
3. Preserve relevant working behavior and existing approved decisions.
4. Make the smallest coherent change that advances the approved objective.

After modifying the repository:
1. Run applicable verification commands.
2. Record actual results, including failures.
3. Commit meaningful completed changes when authorized by the active task/workflow.
4. Report commit SHA and verification evidence.
5. If deployment is part of the task, do not call it complete until the URL is actually accessible and verified.

Never invent status, SKU, inventory, costs, fees, margins, metrics, tests, commits, deployments, links, or successful integrations.

## 13. Chairman policy update — 2026-09-07
This specific authority split supersedes any earlier blanket final-approval wording:
- GM approval of a verified product batch authorizes Codex to generate the batch's Shopee Excel and deliver/upload it through the established listing flow immediately. Do not request another Chairman approval for the same product revision. Product work must not wait for social content readiness.
- Verify exact SKU, supplier cost, payment fee, freight, percentage/fixed Shopee fees, minimum net margin >=65%, exact-SKU images, inventory, sizes, listing fields and evidence before export. Never fill missing inputs with guesses. Respect the supplied Shopee template and its required/conditional fields; retain its metadata and sheets. Do not publish a shop-specific template or actual product packet into this public repository.
- Social content completes internal review, then receives Chairman final release. Release immediately creates platform-specific publication jobs; only actual provider PUBLISHED evidence completes publication. Approval, queued, BLOCK, PENDING and Excel download are not publication/listing completion.
- Chairman return requires a nonblank reason, structured defect category and responsible department. Route correction to that department under GM tracking. Social return preserves already-approved product data and Excel authority; changed product data requires a new product revision/batch review, never silently reuse approval.
- The second accepted occurrence of the same defect category in the same department (including across cases) automatically involves Audit. Record category, count, department, root cause, corrective and preventive actions, review state and review evidence. Repeated defects cannot be closed through a one-click resolve action. Retain original decisions/findings after remediation.
- UI must clearly separate GM product approval, Chairman social release, Chairman return with reason, Audit intervention, Excel readiness and actual provider publication state. Do not add approval layers.
- Integrate existing flows. Run real build/tests and desktop/mobile browser checks. Report actual commit/deployment evidence and remaining external integration gaps.
- Current implementation stores local browser records only. It is not a shared, authenticated approval system. Upload destinations and social provider adapters are not configured: publication jobs stay BLOCK. Never infer successful upload or publication from local records or a user's editable state. Do not expose credentials in browser storage, imports, logs, or repository files.
