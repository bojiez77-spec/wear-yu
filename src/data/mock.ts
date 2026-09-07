export type Workflow = {
  id: string;
  name: string;
  description: string;
  status: "ready" | "paused";
  lastRun: string;
  records: number;
};
export const initialWorkflows: Workflow[] = [
  {
    id: "w1",
    name: "商品資料整理",
    description: "統一商品名稱、分類與價格格式",
    status: "ready",
    lastRun: "09/07 09:30",
    records: 128,
  },
  {
    id: "w2",
    name: "社群內容排程檢查",
    description: "檢查本週貼文素材與排程完整度",
    status: "ready",
    lastRun: "09/07 08:00",
    records: 12,
  },
  {
    id: "w3",
    name: "選品週報彙整",
    description: "彙整候選商品與評估分數",
    status: "paused",
    lastRun: "09/04 18:00",
    records: 24,
  },
];
export type Product = {
  id: string;
  name: string;
  category: "上衣" | "下身" | "配件";
  code: string;
  price: number;
  margin: number;
  score: number;
  color: string;
  kind: "shirt" | "pants" | "bag";
};
export const products: Product[] = [
  {
    id: "s1",
    name: "霧藍落肩襯衫",
    category: "上衣",
    code: "WY-AW-001",
    price: 1280,
    margin: 58,
    score: 94,
    color: "#7791a3",
    kind: "shirt",
  },
  {
    id: "s2",
    name: "垂墜直筒長褲",
    category: "下身",
    code: "WY-AW-002",
    price: 1680,
    margin: 54,
    score: 91,
    color: "#9c9a8e",
    kind: "pants",
  },
  {
    id: "s3",
    name: "極簡肩背包",
    category: "配件",
    code: "WY-AW-003",
    price: 1980,
    margin: 62,
    score: 89,
    color: "#877668",
    kind: "bag",
  },
  {
    id: "s4",
    name: "奶油白寬版襯衫",
    category: "上衣",
    code: "WY-AW-004",
    price: 1380,
    margin: 56,
    score: 92,
    color: "#b6b0a1",
    kind: "shirt",
  },
];
