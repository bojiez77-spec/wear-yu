# GM product delivery and Chairman social release

GM approval now authorizes the verified product revision's Excel export immediately. Social review is independent: the Chairman can release or return social content without revoking an approved product revision. Release creates one blocked publication job per target platform, with the exact approved payload. No provider is connected, so no PUBLISHED claim is possible.

Returns require a reason, structured category and responsible department. The second occurrence in the same department/category creates an Audit CAPA, including occurrences across cases. Remediation requires root cause, correction, prevention, review state and evidence to close. Records persist in this browser; demo state is separate and cannot export.

## Verified packet contract

The dashboard accepts a JSON packet with `products` and optional `social`. All monetary values are verified TWD amounts. A product contains:

- `sku` (parent), `variantSku` (unique variant), `title`, `description`, `color`, `size`, integer `inventory`, exact-SKU `imageUrls`, `sourceUrl`.
- `purchaseCost`, `cardFee`, `freight`, `shopeeFixedFee`, `shopeeRate`, integer `price`, `minimumMargin` (>=0.65).
- `verifiedBy`, ISO `verifiedAt`, `evidenceUrl`. These reference department evidence; field validation cannot independently prove its truth. GM must review the evidence.
- `shopee`: `category`, `weightKg`, `lengthCm`, `widthCm`, `heightCm`, `sizeChartUrl`, boolean `dangerousGoods`, and `shipping` with explicit booleans for `30005`, `30015`, `30017`, `30019`. At least one shipping method must be enabled.

Social contains `text`, `mediaUrls`, unique `platforms` (`instagram`, `threads`), `reviewedBy`, and `evidenceUrl`.

## Shopee template

Use the user-supplied `Shopee_mass_upload_2026-09-06_basic_template.xlsx` in the dashboard's template picker. It stays on the user's device and is not committed to this public repository. The exporter validates the known column identifiers, fills the upload sheet from row 7, and preserves every other ZIP entry byte-for-byte. Existing populated templates are rejected to prevent overwriting prior products. Text is emitted as Excel inline strings, never formulas. The source template contains a nonstandard pane setting; it is preserved rather than reconstructed.

The supplied sheet supports the four named delivery channels and has no per-category attributes. Category-specific requirements, image suitability, shipping eligibility and all supplier evidence still need department verification. Product-only packets do not wait for social; social corrections cannot alter GM-approved products. A changed approved product needs a new revision/batch.

## Operational limits

- No authenticated shared backend, durable server queue or roles exist in the current application. Browser storage is local convenience, not tamper-proof audit evidence.
- No Shopee upload endpoint/account or social publication adapter is configured. Excel is generated for download; platform jobs remain BLOCK. There is no upload receipt or actual listing/publication proof.
- Production integration needs authenticated server-side role checks, immutable approved revisions, shared persistence, provider credentials held only server-side, idempotent uploads and polling/webhooks tied to approved revision + platform job IDs. PUBLISHED requires all requested platforms' actual provider evidence, not an approval or pending response.
- Do not put live packets, account-specific templates or secrets in this public repository.

## Verification

`pnpm build` and `pnpm test` run actual TypeScript/Vite and Vitest checks. With the original template locally available, also run `SHOPEE_TEMPLATE_PATH=/absolute/path/to/template.xlsx pnpm test`; the additional test verifies preserved ZIP contents and actual mapped values. Test fixtures are explicitly synthetic and must never be listed or published.
