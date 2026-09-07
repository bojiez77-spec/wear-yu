import { useState } from "react";
import { Bookmark, Search, SlidersHorizontal, Star } from "lucide-react";
import { currency, products } from "../data/mock";
import { Badge, EmptyState, PageHeading, ProductArt } from "../components/ui";

export default function Sourcing({
  saved,
  toggleSaved,
}: {
  saved: string[];
  toggleSaved: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部商品");
  const [onlySaved, setOnlySaved] = useState(false);
  const [sort, setSort] = useState("score");
  const filtered = products
    .filter(
      (product) =>
        (category === "全部商品" || product.category === category) &&
        (!onlySaved || saved.includes(product.id)) &&
        `${product.name} ${product.code}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => (sort === "score" ? b.score - a.score : a.price - b.price));
  return (
    <>
      <PageHeading
        eyebrow="GOOD TASTE, GREAT POTENTIAL"
        title="選品企劃"
        description="從喜歡到值得，發現與品牌契合的下一件好物。"
        action={
          <button
            className={onlySaved ? "gold-button selected-save" : "gold-button"}
            aria-pressed={onlySaved}
            onClick={() => setOnlySaved(!onlySaved)}
          >
            <Bookmark size={15} fill={onlySaved ? "currentColor" : "none"} />
            收藏清單 <span>{saved.length}</span>
          </button>
        }
      />
      <section className="collection-banner">
        <div>
          <p className="eyebrow">THE AUTUMN COLLECTION / 2026</p>
          <h2>
            <span>質感日常，</span>
            <span>從細節開始。</span>
          </h2>
          <p>低飽和色系 · 舒適剪裁 · 經得起時間的選擇</p>
        </div>
        <span className="collection-number">
          01<span>CURATED EDIT</span>
        </span>
      </section>
      <div className="sourcing-tools">
        <label className="search-input">
          <Search size={17} />
          <input
            type="search"
            placeholder="搜尋商品名稱或編號…"
            aria-label="搜尋商品"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="sort-control">
          <SlidersHorizontal size={15} />
          <select
            aria-label="商品排序"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="score">推薦分數優先</option>
            <option value="price">價格由低到高</option>
          </select>
        </label>
      </div>
      <div className="section-toolbar">
        <div className="filter-tabs" aria-label="商品分類">
          {["全部商品", "上衣", "下身", "配件"].map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="subtle" role="status">
          {onlySaved ? "收藏" : "候選"} · {filtered.length} 件商品
        </span>
      </div>
      <div className="product-grid">
        {filtered.map((product) => (
          <article className="panel product-card" key={product.id}>
            <div className="product-image">
              <ProductArt product={product} />
              <Badge tone="gold">
                <Star size={12} />
                {product.score}
              </Badge>
              <button
                className={`bookmark-button ${saved.includes(product.id) ? "is-saved" : ""}`}
                aria-label={`${saved.includes(product.id) ? "取消收藏" : "收藏"}${product.name}`}
                aria-pressed={saved.includes(product.id)}
                onClick={() => toggleSaved(product.id)}
              >
                <Bookmark
                  size={17}
                  fill={saved.includes(product.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <div className="product-body">
              <small>
                {product.code} <span>／ {product.category}</span>
              </small>
              <h2>{product.name}</h2>
              <div className="product-price">
                <strong>{currency(product.price)}</strong>
                <span>
                  預估毛利 <b>{product.margin}%</b>
                </span>
              </div>
              <div className="product-foot">
                <span
                  className="swatch"
                  style={{ background: product.color }}
                />
                <span>秋季企劃</span>
                <span>評估中</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <EmptyState action={
          <button className="gold-button" onClick={() => {
            setQuery("");
            setCategory("全部商品");
            setOnlySaved(false);
          }}>清除篩選，瀏覽全部商品</button>
        }>沒有符合條件的商品，試試其他關鍵字或分類。</EmptyState>
      )}
      <p className="page-note">
        商品、售價、毛利與分數皆為模擬資料。收藏於本次使用保留。
      </p>
    </>
  );
}
