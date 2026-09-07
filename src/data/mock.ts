export type Task = {
  id: string;
  title: string;
  category: string;
  due: string;
  done: boolean;
};
export const initialTasks: Task[] = [
  {
    id: "t1",
    title: "確認秋季新品首波選品",
    category: "選品",
    due: "今日 14:00",
    done: false,
  },
  {
    id: "t2",
    title: "審核 Instagram 形象貼文",
    category: "社群",
    due: "今日 16:30",
    done: false,
  },
  {
    id: "t3",
    title: "檢查商品資料整理流程",
    category: "程式",
    due: "今日 18:00",
    done: false,
  },
  {
    id: "t4",
    title: "完成本週品牌內容方向",
    category: "社群",
    due: "今日 10:00",
    done: true,
  },
];
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
export type Post = {
  id: string;
  channel: "Instagram" | "Threads";
  title: string;
  format: string;
  date: string;
  status: "待審核" | "已排程" | "草稿";
  theme: string;
};
export const initialPosts: Post[] = [
  {
    id: "p1",
    channel: "Instagram",
    title: "把日常，穿成自己的風格。",
    format: "輪播貼文 · 4 張",
    date: "09/08 · 20:00",
    status: "待審核",
    theme: "THE EVERYDAY EDIT",
  },
  {
    id: "p2",
    channel: "Threads",
    title: "你最在意一件襯衫的哪個細節？",
    format: "文字貼文",
    date: "09/09 · 12:00",
    status: "草稿",
    theme: "A LITTLE CONVERSATION",
  },
  {
    id: "p3",
    channel: "Instagram",
    title: "秋日的第一層，剛剛好的溫度。",
    format: "Reels · 15 秒",
    date: "09/10 · 20:00",
    status: "已排程",
    theme: "A SOFTER SEASON",
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
export const performance = {
  week: {
    label: "本週",
    revenue: 86420,
    orders: 67,
    customers: 42,
    chart: [7400, 10820, 9050, 13400, 11900, 15850, 18000],
    labels: ["09/01", "09/02", "09/03", "09/04", "09/05", "09/06", "09/07"],
  },
  month: {
    label: "本月",
    revenue: 328640,
    orders: 256,
    customers: 168,
    chart: [22000, 38000, 31000, 52000, 46000, 64000, 75640],
    labels: ["01–04", "05–08", "09–12", "13–16", "17–20", "21–25", "26–30"],
  },
};
export const currency = (value: number) =>
  `NT$ ${value.toLocaleString("en-US")}`;
