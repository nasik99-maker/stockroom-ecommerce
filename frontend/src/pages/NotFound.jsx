import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-shell container empty-state">
      <div className="eyebrow">404</div>
      <h1>Shelf empty</h1>
      <p>There's nothing filed under this address.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Stockroom</Link>
    </div>
  );
}
