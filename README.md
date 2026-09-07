# Wear-Yu GM Command Center

以作業進度、上呈審批與稽核改善為核心的前端 MVP。正式網址：https://wear-yu.vercel.app

## 工作方式

董事長在總覽一鍵「發起新批次選品」，由制度建立 GM 與各組工作佇列；不再人工新增選品／視覺工作。

五階段為董事長下令、GM 派工執行、制度查核、GM 最終審核、董事長核決。八個必要控制節點依序推進，未成熟不提前上呈，退回由 GM 接手改善。各組頁面查看款式／素材及進度，審批頁查看 GM 審核與核決紀錄，稽核頁追蹤缺失。

**目前僅前端：一般批次會如實標示待接通執行服務，不會實際找貨或製作素材。** 「查看示範」提供隔離的自動流程演練，七關演練後停在 GM 審核，GM 放行後才交董事長核決。示範結果不代表真實查核通過。

資料於本次瀏覽保留，重新整理清除。沒有資料庫、跨組同步、Shopee API 或背景製作服務。已移除業績指標，外觀設定與程式工具收在次要入口。

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

本輪成果與驗證見 [董事長批次改版](docs/batch-update/README.md)。
