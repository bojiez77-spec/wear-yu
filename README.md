# Wear-Yu GM Command Center

以作業進度、上呈審批與稽核改善為核心的前端 MVP。正式網址：https://wear-yu.vercel.app

## 工作方式

- **總覽**：待審批、退回改善、稽核缺失，以及各組進度與最近核決。
- **選品**：建立款式作業、追蹤樣品與搭配評估、上呈 GM。
- **視覺**：定期社群內容、加入好友引導、上架前穿搭短影片與示意圖進度。
- **審批**：GM 放行／退回，退回需填原因，紀錄與原作業同步。
- **稽核**：記錄有無缺失、確認改善；未改善缺失會阻擋上呈與放行。
- 外觀切換與原有 mock 程式方案收在「顯示與工具」。

預設沒有案件；只有按「查看示範」才載入獨立的示範工作區，切換回本次工作不會混入示範紀錄。已移除營業額、訂單量、新增顧客、營收曲線與業績匯出。

**本版本為前端暫存：重新整理會清除本次工作，不提供登入、跨裝置／跨組同步、實際排程發佈或媒體生成上傳。** 視覺素材尚無檔案時明示空狀態；款式圖是 SVG 示意。沒有 Shopee API、資料庫或後端。

## 啟動與驗證

需求：Node.js 22 以上、pnpm 11.19.0。

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

Vercel 使用 `pnpm build`，靜態輸出 `dist`；HashRouter 不需路由 rewrite。

## 架構

- `src/domain/operations.ts`：案件、審批、稽核資料與純函式狀態轉換。
- `src/hooks/useOperations.tsx`：分離本次工作／示範案件，集中跨頁狀態。
- `src/pages/`：總覽、工作組看板、GM 審批、稽核及次要程式工具。
- `src/components/Operations.tsx`：作業卡與按需開啟的簡單表單。
- `src/themes.css`、`src/operations.css`：雙色調、佈局及作業介面 RWD。

本輪成果與驗證見 [作業監控改版](docs/operations-update/README.md)。
