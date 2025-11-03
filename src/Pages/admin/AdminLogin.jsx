import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

function AdminLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // name or email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already authenticated (stored flag), redirect
  useEffect(() => {
    const isAdmin = localStorage.getItem('timi_admin_auth') === '1';
    if (isAdmin) navigate('/admin-timi/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Fetch from table `admins`: columns expected: id, name, email, password, created_at
      const { data, error: qErr } = await supabase
        .from('admins')
        .select('*')
        .or(`name.eq.${identifier},email.eq.${identifier}`)
        .maybeSingle();
      if (qErr) throw qErr;
      if (!data) throw new Error('Admin not found');

      // Simple password check (expects exact match). Replace with hashing comparison if you store hashes.
      if (String(data.password) !== String(password)) {
        throw new Error('Invalid credentials');
      }

      localStorage.setItem('timi_admin_auth', '1');
      localStorage.setItem('timi_admin_id', data.id);
      localStorage.setItem('timi_admin_name', data.name || data.email);
      navigate('/admin-timi/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: 16 }}>
      <div style={{ width: 380, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, marginBottom: 6 }}>Admin Login</h2>
        <div style={{ color: '#6b7280', marginBottom: 12, fontSize: 14 }}>Access the Timipay admin dashboard</div>
        {error && (
          <div style={{ marginBottom: 12, padding: 10, border: '1px solid #fecaca', background: '#fee2e2', color: '#7f1d1d', borderRadius: 8 }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Name or Email</label>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="admin-name or admin@email.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;


