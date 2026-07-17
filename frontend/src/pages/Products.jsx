import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    client.get('/products/categories').then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { search, category, sort, page, limit: 12 };
    client
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParam('search', searchInput);
  }

  return (
    <div className="page-shell">
      <div className="container">
        <div className="eyebrow">Catalog</div>
        <h1 style={{ fontSize: '2.2rem' }}>Full Inventory</h1>

        <div className="filter-bar">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: 8, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-sm">Search</button>
          </form>

          <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">All Departments</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {loading ? (
          <p style={{ marginTop: 40 }}>Loading products…</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products match your search</h3>
            <p>Try clearing filters or searching a different term.</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParam('page', String(page - 1))}
                >
                  ← Prev
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === page ? 'active' : ''}
                    onClick={() => updateParam('page', String(p))}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => updateParam('page', String(page + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
