export default function StockBadge({ stock }) {
  if (stock <= 0) return <span className="tag tag-rust">Out of stock</span>;
  if (stock <= 5) return <span className="tag tag-amber">Low stock · {stock} left</span>;
  return <span className="tag tag-forest">In stock</span>;
}
