import { Link } from 'react-router-dom';
import StockBadge from './StockBadge';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="shelf-tag">
      <div className="shelf-tag-media">
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </div>
      <div className="shelf-tag-body">
        <span className="shelf-tag-cat">{product.category_name || 'General'}</span>
        <span className="shelf-tag-name">{product.name}</span>
        <div className="shelf-tag-footer">
          <span className="shelf-tag-price">${product.price.toFixed(2)}</span>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
