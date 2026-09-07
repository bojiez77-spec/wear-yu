import type { ReactNode } from "react";
import { ArrowUpRight, Search, Shirt, ShoppingBag } from "lucide-react";
import type { Product } from "../data/mock";

export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "gold" | "muted";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtle">{description}</p>
      </div>
      {action}
    </header>
  );
}
export function StatCard({
  label,
  value,
  change,
  icon,
  note = "較上期",
}: {
  label: string;
  value: string;
  change: string;
  icon: ReactNode;
  note?: string;
}) {
  return (
    <article className="stat-card panel">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <div className="stat-bottom">
        <span>
          <ArrowUpRight size={13} />
          {change}
        </span>
        <small>{note}</small>
      </div>
    </article>
  );
}
export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <Search size={26} aria-hidden="true" />
      <p>{children}</p>
      {action}
    </div>
  );
}
export function ProductArt({ product }: { product: Product }) {
  return (
    <div
      className="product-art"
      style={{ "--product-color": product.color } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="art-ring" />
      {product.kind === "pants" ? (
        <svg viewBox="0 0 140 160" className="garment">
          <path d="M38 12h64l11 133-34 3-9-89-9 89-34-3z" />
          <path
            className="seam"
            d="M38 24h64M70 14v43M42 26l-3 18M98 26l3 18"
          />
        </svg>
      ) : product.kind === "bag" ? (
        <ShoppingBag className="garment bag" strokeWidth={0.8} />
      ) : (
        <Shirt className="garment" strokeWidth={0.8} />
      )}
      <span className="art-caption">WEAR-YU / AUTUMN 26</span>
    </div>
  );
}
