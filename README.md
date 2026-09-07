# Wear-Yu GM Command Center

品牌營運工作台第一版 MVP，以 React、TypeScript、Vite 建立。所有營運與商品資料皆為 mock；不需要環境變數、API、資料庫或後端。

## 啟動

需求：Node.js 22 LTS 以上、pnpm 11.19.0（packageManager 已固定）。

```sh
pnpm install
pnpm dev
```

開啟終端機顯示的本機網址（預設 http://127.0.0.1:5173）。

```sh
pnpm test       # 互動流程測試
pnpm build      # TypeScript 檢查與正式版打包
pnpm preview   # 預覽 dist，預設 http://127.0.0.1:4173
```

## 範圍

- Dashboard：週／月模擬指標、營收趨勢、待辦勾選、CSV 摘要匯出、核心頁面捷徑。
- 程式：工作流程啟用／暫停、日常整理／品質複核方案切換、步驟預覽、同步模擬執行與紀錄。
- 社群：內容狀態篩選，草稿 → 待審核 → 已排程，可移回草稿；不會對外發佈。
- 選品：關鍵字搜尋、分類、價格／分數排序、收藏及空狀態。
- RWD：桌面側欄、手機收合導覽、響應式卡片及圖表。
- 外觀：側欄可切換霧天藍／深鋼藍，以及品牌工作室／專注工作台；不重置業務資料。

狀態由 App 持有，切換頁面會保留；重新整理會回復初始 mock data。日期與營運數字為固定示範情境，不代表即時業績。圖表為示意趨勢。選品圖片為本地 SVG 造型示意。此版本沒有帳號登入或真實排程。

## 架構

```text
src/
  App.tsx              頁面路由與狀態接線
  hooks/               共用營運狀態與外觀狀態
  domain/workflows.ts   執行方案與可替換的 mock 執行介面
  components/          Layout、共用 UI 元件
  data/mock.ts         型別與示範資料
  pages/               Dashboard / Programs / Social / Sourcing
  styles.css           元件結構與 RWD
  themes.css           共用色彩設定、雙主題與佈局方案
  test/                Vitest + Testing Library 互動測試
```

採 HashRouter，靜態伺服器不需額外 SPA rewrite 設定即可直接開啟或重新整理 `/#/programs`、`/#/social`、`/#/sourcing`。正式檔案輸出於 `dist/`，可放在靜態 hosting 根目錄或子目錄。

視覺依提供的 Sky Luxury HTML 素材延伸，預設為降低白色亮度的霧天藍，另提供深鋼藍；共用髮絲紋、圓角與克制金色細邊。外觀與執行方案於本次使用保留，重新整理回復預設。使用系統字體與本地 SVG，不需外部字體或圖片服務。

## Vercel

已提供 `vercel.json`：Vite、`pnpm build`、輸出 `dist`。可於登入後匯入 GitHub 的 `bojiez77-spec/wear-yu`，根目錄使用儲存庫根目錄。無需環境變數；不需新增 rewrite。此設定檔不代表已成功建立 Vercel 專案或部署。
