# Wear-Yu Round01｜STRICT OFFICIAL RECOVERY 前置製作流程紀錄

> 目的：把 `wear_yu_Round01_AUTO_V1_4_STRICT_OFFICIAL_RECOVERY.xlsx` 形成之前的實際思路、檔案演進、控制規則與踩雷修正寫入 repo，供 Codex 後續產製 Shopee Excel 時直接遵循。
>
> 本文件為「可追溯重建紀錄」：依現存 Round01 檔案鏈、目前上傳的 V1_4 workbook 內容、Cloudinary 資產紀錄、治理/稽核檔與當時版本名稱整理。無證據的細節不得由 Codex 自行補寫。

---

## 1. 起點：先有選品，不是先做 Excel

Round01 先完成商品候選與來源資料，再把成熟資料轉成 Shopee 批量上架檔。當時核心商品為 5 件：

- WY-R01｜FREAK'S STORE 25SS 輕薄寬鬆氣球休閒褲
- WY-R02｜FREAK'S STORE 春夏棉格紋寬鬆長袖襯衫
- WY-R03｜FREAK'S STORE 25SS 抽繩寬鬆短袖襯衫
- WY-R04｜FREAK'S STORE 26SS City Boy 全棉立領短袖襯衫
- WY-R05｜FREAK'S STORE M65 洗水做舊 3WAY 寬鬆機能外套

早期來源主要來自淘寶/公開索引店家「錦衣郎 衣衣不舍」及對應公開商品索引。建立商品時先保留：商品 ID、來源店家、來源 URL、貨源價、公開銷量/訊號、商品圖、官方或可交叉驗證的款式/尺寸來源。

**重要教訓：** 淘寶標題含 `FS`、`FREAK'S STORE` 或相似關鍵字，只能當搜尋線索，不能直接視為品牌/同 SKU 證明。

---

## 2. Round01 商品資料先結構化

在進入 Shopee 官方模板前，先把商品做成可映射 Master Data。每件商品至少要整理：

- 商品 ID（WY-R01～WY-R05）
- 商品名稱
- Shopee 分類 ID
- 主商品貨號 / 規格識別碼
- 顏色、尺寸
- 商品選項貨號（SKU）
- 售價
- 庫存策略
- 材質
- 袖長
- 外套樣式（如適用）
- 產地（有證據才填）
- 季節 / 風格
- 重量、包裹長寬高
- 商品圖片 URL
- 尺寸表資產
- 備貨天數

未知值不能用猜測補齊；內部允許使用「待查證／未標示」，但正式 Shopee 必填欄位若仍缺資料，Preflight 必須 BLOCK。

---

## 3. 第一階段：Shopee 初版草稿與可上傳結構

初期先依使用者提供的 Shopee Basic Template 核心欄位建立 Round01 草稿，確認「雙規格商品」的資料展開方式：

- 一列代表一種規格組合
- 商品規格識別碼用來把多列聚合成同一商品
- 第一層規格通常為「顏色」
- 第二層規格通常為「尺寸」
- 每個規格組合有唯一商品選項貨號
- 同批 SKU 不得重複

例如 WY-R01 以 3 色 × S/M/L 展開；WY-R05 採 3 色 × FREE，避免在缺乏可靠尺寸證據時虛構 S/M/L。

對應早期版本包括：

- `wear_yu_Round01_Shopee_first_upload_v2.xlsx`
- `wear_yu_Round01_AUTO_V1_Shopee_UPLOAD_READY.xlsx`
- `wear_yu_Round01_AUTO_V1_1_Shopee_UPLOAD_READY.xlsx`

這階段的核心不是「漂亮」，而是先確認資料能完整映射到 Shopee 大量上傳邏輯。

---

## 4. 官方模板修復階段：避免自建模板破壞 Shopee 相容性

後續發現「自行重畫欄位」風險太高，流程改為 **只在 Shopee 官方 workbook 結構內填資料**，不得新增、刪除或任意重排官方工作表/欄位。

現存演進檔可看到一系列修復：

- `OFFICIAL_TEMPLATE_v3`
- `OFFICIAL_TEMPLATE_v4_fixed`
- `OFFICIAL_TEMPLATE_v5_complete`
- `OFFICIAL_TEMPLATE_v6_leaf_category_fix`
- `OFFICIAL_TEMPLATE_v7_mass_upload_category_fix`
- `OFFICIAL_TEMPLATE_v9_safe_reupload`
- `v10_safe_reupload_with_sizechart_handoff`
- `v11_all_in_one_with_embedded_sizecharts`
- `v12_FINAL_with_Cloudinary_sizechart_URLs`

這些版本反映的核心修正方向是：

1. **官方工作表結構不可破壞。**
2. 分類必須使用真正可接受的葉節點/大量上傳分類，不可只填概念分類。
3. 官方隱藏表、分類參考表、較長備貨天數表等都要保留。
4. 模板欄位名稱、欄位順序與資料型態要尊重官方原始定義。
5. 不確定的 Shopee 條件必填欄位不能靠猜。

---

## 5. 尺寸表從「本機檔」改成 Cloudinary Secure URL

Round01 曾遇到尺寸表交付問題，因此最後確立：Shopee Excel 內不得填 sandbox 路徑、本機檔名或不可公開的附件位置。

尺寸表流程改為：

1. 視覺組產製 1200×1200 尺寸表。
2. 上傳 Cloudinary。
3. 保存 Asset ID / Public ID / Secure URL。
4. Tags / Context 保留至少：`wear_yu`、`round01`、`size_chart`、`product_id`、`asset_role=size_chart`、`platform=Shopee`。
5. Excel 僅使用公開 HTTPS Secure URL。

Round01 五件商品均建立了 Cloudinary 尺寸表：WY-R01～WY-R05。

在後期 workbook 中，39 個 SKU 列均依商品填入對應尺寸表 URL；「新版尺寸表模板 ID」欄保持空白，以避免與圖片尺寸表欄混用或衝突。

**固定原則：** 尺寸表 URL 必須是可公開的 HTTPS 圖片 URL；不能把本機檔案路徑當成 Shopee 可讀網址。

---

## 6. 14 天備貨策略寫入正式模板

當時營運採較長備貨策略，Round01 以 **14 天**為統一控制參數，並寫入官方模板對應欄位。

這不是固定永久規則，而是當時的營運策略。後續若董事長更新備貨政策，Codex 應讀最新公司制度，不可因歷史 Round01 檔案而鎖死 14 天。

---

## 7. 商品圖片與素材 QC 的歷史問題

Round01 初期多數商品只有約 3 張供應商圖片，因此後續稽核曾列為素材不足案例。

後續形成內控：

- Shopee 最多 9 張圖
- Wear-Yu 內控最低 7 張
- 目標 9 張
- 同款/同色/同版型來源要可追溯
- 未確認同 SKU 圖片不得冒充正式送審素材

因此，Round01 Excel 中既有圖片可保留作歷史成果，但 **不能把 Round01 的低圖量狀況當成未來新商品的合格標準**。

---

## 8. 分類修正是多輪返工的主要原因之一

從 `leaf_category_fix`、`mass_upload_category_fix` 等版本可確認，分類曾是主要修正點。

因此後續 Codex 產製 Excel 必須在 Preflight 先確認：

- 分類 ID 存在
- 為可上傳的適用分類
- 符合商品類型
- 該分類是否支援較長備貨天數
- 分類專屬必填屬性是否需要補值

不得只因「男裝 > 襯衫」語意看似合理，就自行產生分類 ID。

---

## 9. AUTO V1 系列：從人工填檔轉成自動映射

在官方模板逐步穩定後，開始把規則抽成 AUTO 流程。

版本演進可追溯到：

- `AUTO_V1_Shopee_UPLOAD_READY`
- `AUTO_V1_1_Shopee_UPLOAD_READY`
- `AUTO_V1_2_CUSTOM_ATTR_TEST`
- `AUTO_V1_3_USE_NUMBERS_TEMPLATE`
- `AUTO_V1_4_STRICT_OFFICIAL_RECOVERY`

AUTO 的目的不是建立另一套自製 Excel，而是：

**把已驗證的 Wear-Yu Master Data，自動寫入「正確的 Shopee 官方 workbook」。**

### V1_2：Custom Attribute 測試

此階段嘗試處理分類專屬屬性/自訂屬性映射。歷史教訓是：若沒有官方欄位與來源值證據，不能為了讓檔案看起來完整而填假資料。

### V1_3：Use Numbers Template

此階段切換/測試另一個模板基底（從檔名可追溯為 Numbers template 路線），主要目的仍是找出能保持官方結構又可正確寫入資料的方式。

### V1_4：STRICT OFFICIAL RECOVERY

V1_4 最終採取「嚴格官方模板恢復」原則：

- 重新以官方 workbook 結構為母版
- 不延續會破壞官方格式的自建欄位
- 保留官方工作表與隱藏工作表
- 將已驗證 Round01 資料重新寫回官方欄位
- 對不確定欄位保持空白/阻擋，不以猜值填滿

目前 V1_4 workbook 的工作表結構為：

- `功能說明`
- `上傳模板`
- `參考範例`
- `較長備貨天數範圍`
- `尺寸表模板列表`
- `HiddenShopBrand`
- `HiddenTax`

這個結構本身就是「STRICT OFFICIAL RECOVERY」的重要驗證結果。

---

## 10. V1_4 實際資料成果

V1_4 目前承載 Round01 五件商品，共展開約 39 個規格/SKU 列。

可確認的歷史售價為：

- WY-R01：NT$1,390
- WY-R02：NT$1,290
- WY-R03：NT$1,190
- WY-R04：NT$1,090
- WY-R05：NT$2,390

這些是 **Round01 歷史價格**，不是未來商品的定價規則。現在所有新商品必須依最新 Finance Gate：實際採購成本＋海外刷卡/支付費＋跨境/集運運費＋實際 Shopee 費用後，淨利率至少 65%。成本未驗證即 BLOCK。

V1_4 也保留：

- 雙規格結構
- 唯一 SKU
- 商品圖 URL
- Cloudinary 尺寸表 URL
- 商品重量/包裹尺寸
- 物流開關
- 14 天備貨

---

## 11. 為什麼叫 STRICT OFFICIAL RECOVERY

「STRICT」代表：

1. 不再用「看起來像 Shopee」的自建模板冒充官方模板。
2. 不任意刪改官方欄位或工作表。
3. 不用猜測補分類、屬性、品牌、尺寸、材質。
4. 不把本機圖片/尺寸表路徑放進 Excel。
5. 不把 Excel 下載視為 Shopee 已上架。

「OFFICIAL RECOVERY」代表：

- 先恢復官方 workbook 原貌，再把已驗證資料注入，而不是從錯誤版本繼續疊加修補。

這個原則後續必須沿用。

---

## 12. 現行 Codex 應如何復用這段歷史

Codex 看到 Round01/V1_4 時，不應直接複製歷史商品資料，而應複製 **流程與控制方法**：

### A. 選品成熟後再產 Excel
GM 批准商品批次後，才進正式 Excel 產製。

### B. 產製前 Preflight
至少確認：

- 精確 SKU / 供應商規格
- 實際來源 URL
- 同 SKU 正式圖片
- 顏色/尺寸/庫存
- 必要商品屬性
- 採購成本
- 海外支付費
- 運費
- Shopee 實際費率
- Finance Gate >=65%
- 圖片數量與 URL 格式
- 尺寸表 URL
- Shopee 分類與條件必填欄位

缺任何正式必填資訊則 BLOCK。

### C. 官方模板優先
永遠使用當期 Shopee 官方 Basic Template/已核准正式模板，不要自行重造欄位結構。

### D. 寫值，不改架構
Codex 的任務是把 Master Data 映射到官方模板，而不是重新設計官方 Excel。

### E. 匯出後驗證
至少檢查：

- 工作表名稱/數量未被破壞
- 必填欄位存在
- SKU 唯一
- 顏色/尺寸組合無重複
- 圖片 URL 為公開 HTTP/HTTPS JPG/JPEG/PNG
- 尺寸表 URL 正確
- 沒有 sandbox / localhost / 本機檔名
- 價格/庫存/重量/尺寸為正確資料型態
- 公式錯誤掃描
- 原模板隱藏/參考工作表仍存在

### F. Excel 完成 ≠ 上架完成
GM 核准＋Codex 產生可上傳 Excel，只能認列「Excel Ready」。人工上傳 Shopee Seller Centre 並取得實際刊登/上架證據後，才可認列「Listed / Published」。

---

## 13. 不得重犯的 Round01 錯誤

- 不得把相似商品圖片當同 SKU 圖片。
- 不得因商品名稱有 FS 就直接認定 FREAK'S STORE。
- 不得猜尺寸、材質、產地、功能宣稱。
- 不得用日本官方售價代替淘寶採購成本。
- 不得自建一份「看似官方」Excel 取代 Shopee 官方模板。
- 不得因模板欄位太多就刪除官方工作表/隱藏資料。
- 不得將本機尺寸表檔名當公開 URL。
- 不得將 Excel 已下載/已產製回報成 Shopee 已上架。
- 不得為了湊商品數量降低來源與同 SKU 證據標準。

---

## 14. 與目前公司制度的關係

本文件記錄歷史製作方法；若與 `AGENTS.md` 最新董事長政策衝突，以 `AGENTS.md` 最新指令為準。

尤其現在已更新：

- 財務 Gate：完整成本後淨利率 >=65%
- GM 批准選品批次後 Codex 可直接產製 Shopee Excel
- Shopee Excel 由人員人工上傳，不要求 Shopee API
- 社群則由董事長最終放行，PUBLISHED 才算完成
- 重複缺失須升級稽核/CAPA
- 淘寶優質店家池優先選品，但仍要逐商品驗證 供應商商品識別 / 實際販售圖片 / 成本 / 庫存（不要求官方品牌 SKU）

---

## 15. Codex 執行指令摘要

當 Codex 需要產生新的 Shopee 批次 Excel 時：

1. 先讀 `AGENTS.md`。
2. 再讀本文件。
3. 找到當期官方 Shopee 模板，不從空白 workbook 重建。
4. 讀 GM 已批准批次的 Master Data。
5. 執行 Preflight；缺值就 BLOCK，不猜。
6. 通過 Finance Gate 後才寫最終售價。
7. 使用 實際販售商品對應圖片與可公開 HTTPS URL。
8. 尺寸表優先使用 Cloudinary Secure URL。
9. 只改資料區，不破壞官方工作表、隱藏表、欄位順序與格式。
10. 匯出後做結構、必填欄、SKU、URL、資料型態與錯誤掃描。
11. 回報 `Excel Ready`，等待人工 Shopee 上傳回執；不得假稱已上架。

這是 Round01 `AUTO_V1_4_STRICT_OFFICIAL_RECOVERY` 應保留下來的核心價值。

2026-09-09 澄清：本文的 SKU 是內部／供應商商品與規格識別，不是官方 FREAK’S STORE exact SKU。官方商品頁、正品驗證與淘寶 LOGIN PASS 均非選品啟動或 Excel 必要 Gate。候選可先保存可追溯來源與缺口，資料齊備後才經 Finance、GM 與官方模板輸出。
