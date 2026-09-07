import { useState } from "react";
import {
  CalendarDays,
  Check,
  Instagram,
  MessageCircle,
  Send,
} from "lucide-react";
import { Badge, EmptyState, PageHeading } from "../components/ui";
import type { Post } from "../data/mock";

export default function Social({
  posts,
  setPosts,
}: {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}) {
  const [filter, setFilter] = useState("全部內容");
  const [message, setMessage] = useState("");
  const filtered = posts.filter(
    (post) => filter === "全部內容" || post.status === filter,
  );
  function update(post: Post) {
    const status =
      post.status === "草稿"
        ? "待審核"
        : post.status === "待審核"
          ? "已排程"
          : "草稿";
    setPosts((current) =>
      current.map((item) => (item.id === post.id ? { ...item, status } : item)),
    );
    setMessage(`「${post.title}」已更新為${status}（模擬）。`);
  }
  return (
    <>
      <PageHeading
        eyebrow="TELL YOUR BRAND STORY"
        title="社群經營"
        description="讓每一則內容，都成為品牌與人之間的連結。"
        action={
          <span className="date-chip">
            <CalendarDays size={15} />
            2026 年 9 月 · 內容企劃
          </span>
        }
      />
      <div className="social-summary">
        <div>
          <strong>{posts.length}</strong>
          <span>本週內容</span>
        </div>
        <div>
          <strong>{posts.filter((p) => p.status === "待審核").length}</strong>
          <span>等待審核</span>
        </div>
        <div>
          <strong>{posts.filter((p) => p.status === "已排程").length}</strong>
          <span>準備發佈</span>
        </div>
        <p>
          CONSISTENCY BUILDS CONNECTION.
          <br />
          <span>穩定表達，慢慢累積。</span>
        </p>
      </div>
      <div className="section-toolbar">
        <div className="filter-tabs" aria-label="內容狀態">
          {["全部內容", "草稿", "待審核", "已排程"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="subtle">{filtered.length} 則內容</span>
      </div>
      <div
        className={`post-grid ${filter === "全部內容" ? "post-grid-editorial" : ""}`}
      >
        {filtered.map((post, index) => (
          <article className="panel post-card" key={post.id}>
            <div className={`post-art post-art-${post.id}`}>
              <span className="post-brand">WEAR-YU</span>
              <div className="post-art-lines" />
              <div className="post-art-title">
                {post.theme.split(" ").slice(0, -1).join(" ")}
                <em>{post.theme.split(" ").at(-1)}.</em>
              </div>
              <span className="post-art-bottom">
                THE AUTUMN JOURNAL <span>0{index + 1}</span>
              </span>
            </div>
            <div className="post-body">
              <div className="post-meta">
                <span>
                  {post.channel === "Instagram" ? (
                    <Instagram size={15} />
                  ) : (
                    <MessageCircle size={15} />
                  )}
                  {post.channel}
                </span>
                <Badge
                  tone={
                    post.status === "已排程"
                      ? "green"
                      : post.status === "待審核"
                        ? "gold"
                        : "muted"
                  }
                >
                  {post.status}
                </Badge>
              </div>
              <h2>{post.title}</h2>
              <p className="subtle">{post.format}</p>
              <div className="post-schedule">
                <CalendarDays size={14} />
                {post.date}
              </div>
              <button
                className={
                  post.status === "已排程"
                    ? "quiet-button full-width"
                    : "gold-button full-width"
                }
                onClick={() => update(post)}
              >
                {post.status === "草稿" ? (
                  <Send size={14} />
                ) : (
                  <Check size={14} />
                )}
                {post.status === "草稿"
                  ? "送出審核"
                  : post.status === "待審核"
                    ? "核准排程"
                    : "移回草稿"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <EmptyState>目前沒有「{filter}」內容。</EmptyState>
      )}
      <p className="page-note">
        展示模式：狀態變更僅於本次使用保留，不會發佈至社群平台。
      </p>
      <p role="status" className="notice">
        {message}
      </p>
    </>
  );
}
