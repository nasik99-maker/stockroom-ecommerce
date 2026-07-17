import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      navigate(redirectTo);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="center-form-shell">
      <div className="center-form-card">
        <div className="eyebrow">Account</div>
        <h1 style={{ fontSize: '1.7rem', marginBottom: 8 }}>Log In</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: 24 }}>
          Demo admin: admin@demo.com / admin123<br />
          Demo customer: customer@demo.com / customer123
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: '0.9rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--navy)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
