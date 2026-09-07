import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Code2,
  MessageCircle,
  ShoppingBag,
  Users,
} from "lucide-react";
import { currency, performance, type Task } from "../data/mock";
import { Badge, PageHeading, StatCard } from "../components/ui";

export default function Dashboard({
  tasks,
  toggleTask,
}: {
  tasks: Task[];
  toggleTask: (id: string) => void;
}) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [notice, setNotice] = useState("");
  const data = performance[period];
  const completed = tasks.filter((task) => task.done).length;
  const chartMax = Math.ceil(Math.max(...data.chart) / 20000) * 20000;
  const chartY = (value: number) => 180 - (value / chartMax) * 160;
  const points = data.chart
    .map((value, index) => `${index * 100},${chartY(value)}`)
    .join(" ");
  function exportReport() {
    const csv =
      "\uFEFF指標,期間,模擬數值\n" +
      [
        ["營業額", data.label, data.revenue],
        ["訂單", data.label, data.orders],
        ["新客", data.label, data.customers],
      ]
        .map((row) => row.join(","))
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wear-yu-${period}-mock.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("模擬營運摘要已匯出。");
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR BRAND, AT A GLANCE"
        title="營運總覽"
        description="掌握品牌脈動，讓每一個決策更從容。"
        action={
          <button className="gold-button" onClick={exportReport}>
            <ArrowDownToLine size={16} />
            匯出摘要
          </button>
        }
      />
      <section className="welcome-panel">
        <div>
          <div className="welcome-kicker">
            <span className="short-rule" /> THE ART OF RUNNING A BRAND
          </div>
          <h2>
            <span>專注品味，</span>
            <span>其餘井然有序。</span>
          </h2>
          <p>程式、社群、選品。你的品牌日常，在這裡串起。</p>
          <Link className="text-link" to="/sourcing">
            探索本季選品 <ArrowRight size={15} />
          </Link>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="edition-label">THE STUDIO JOURNAL</span>
          <span className="art-wordmark">wear.yu</span>
          <span className="art-label">AUTUMN 2026 — VOL. 01</span>
        </div>
      </section>
      <div className="section-toolbar">
        <h2>
          品牌表現 <small>Performance</small>
        </h2>
        <div className="period-controls">
          <span className="date-range">
            <CalendarDays size={14} />
            {period === "week" ? "2026.09.01 — 09.07" : "2026.09.01 — 09.30"}
          </span>
          <div className="segmented" aria-label="統計期間">
            {(["week", "month"] as const).map((value) => (
              <button
                key={value}
                aria-pressed={period === value}
                className={period === value ? "selected" : ""}
                onClick={() => setPeriod(value)}
              >
                {performance[value].label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          label={`${data.label}營業額`}
          value={currency(data.revenue)}
          change="12.8%"
          icon={<CircleDollarSign size={18} />}
        />
        <StatCard
          label="訂單數量"
          value={String(data.orders)}
          change="8.1%"
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="新增顧客"
          value={String(data.customers)}
          change="16.7%"
          icon={<Users size={18} />}
        />
        <StatCard
          label="任務完成"
          value={`${completed} / ${tasks.length}`}
          change={`${Math.round((completed / tasks.length) * 100)}%`}
          note="今日進度"
          icon={<Check size={18} />}
        />
      </div>
      <div className="dashboard-middle">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <h2>
              營收趨勢 <small>Revenue overview</small>
            </h2>
            <span className="chart-legend">
              <i />
              營業額
            </span>
          </div>
          <div className="chart-summary">
            <strong>{currency(data.revenue)}</strong>
            <Badge tone="green">
              <ArrowUpRight size={12} />
              12.8%
            </Badge>
            <span className="subtle">{data.label}累計 · 模擬</span>
          </div>
          <div className="chart-layout">
            <div className="chart-axis">
              {[1, 0.75, 0.5, 0.25, 0].map((fraction, index) => (
                <span key={fraction}>
                  {index === 0 ? "NT$ " : ""}
                  {(chartMax * fraction) / 1000}k
                </span>
              ))}
            </div>
            <div className="chart-body">
              <svg
                viewBox="0 0 600 190"
                preserveAspectRatio="none"
                role="img"
                aria-label={`${data.label}模擬營收趨勢`}
              >
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="var(--blue)" stopOpacity=".22" />
                    <stop offset="1" stopColor="var(--blue)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[20, 60, 100, 140, 180].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="600"
                    y1={y}
                    y2={y}
                    className="grid-line"
                  />
                ))}
                <polygon
                  points={`0,180 ${points} 600,180`}
                  fill="url(#chartFill)"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="var(--blue)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
                {data.chart.map((value, index) => (
                  <circle
                    key={index}
                    cx={index * 100}
                    cy={chartY(value)}
                    r="3.5"
                    fill="var(--blue)"
                  />
                ))}
              </svg>
              <div className="chart-labels">
                {data.labels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="panel task-panel">
          <div className="panel-heading">
            <h2>
              今日待辦 <small>Priorities</small>
            </h2>
            <Badge tone="gold">{tasks.length - completed} 項待完成</Badge>
          </div>
          <div className="tasks">
            {tasks.map((task) => (
              <label
                className={`task ${task.done ? "done" : ""}`}
                key={task.id}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <div>
                  <span className="task-title">{task.title}</span>
                  <small>
                    <span>{task.category}</span>
                    <span>·</span>
                    {task.due}
                  </small>
                </div>
              </label>
            ))}
          </div>
          <div className="task-progress">
            <span>每一小步，都是品牌的前進。</span>
            <strong>
              {completed}/{tasks.length}
            </strong>
          </div>
        </section>
      </div>
      <div className="section-toolbar">
        <h2>
          核心工作台 <small>Your command modules</small>
        </h2>
        <span className="subtle desktop-only">各就其位，協同前進</span>
      </div>
      <div className="modules-grid">
        {[
          {
            path: "/programs",
            icon: Code2,
            title: "程式管理",
            en: "PROGRAMS",
            desc: "把重複的日常，交給有序的流程。",
            status: "3 個工作流程",
          },
          {
            path: "/social",
            icon: MessageCircle,
            title: "社群經營",
            en: "SOCIAL",
            desc: "從靈感到發佈，持續說好品牌故事。",
            status: "3 則內容企劃",
          },
          {
            path: "/sourcing",
            icon: ShoppingBag,
            title: "選品企劃",
            en: "SOURCING",
            desc: "以眼光挑選，為每一件好物留位。",
            status: "4 件候選商品",
          },
        ].map(({ path, icon: Icon, title, en, desc, status }) => (
          <Link className="module-card panel" key={path} to={path}>
            <div className="module-top">
              <span className="module-icon">
                <Icon size={22} />
              </span>
              <ArrowUpRight size={18} />
            </div>
            <p className="eyebrow">{en}</p>
            <h3>{title}</h3>
            <p>{desc}</p>
            <div className="module-bottom">
              <span>
                <i className="live-dot" />
                {status}
              </span>
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
      <p role="status" className="notice">
        {notice}
      </p>
    </>
  );
}
