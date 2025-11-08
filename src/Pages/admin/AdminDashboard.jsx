import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    const isAdmin = localStorage.getItem('timi_admin_auth') === '1';
    if (!isAdmin) navigate('/admin-timi');
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load from table: data_user (underscore)
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, error: qErr } = await supabase
          .from('data_user')
          .select('email,name,prename,phone,gender,role,interests,terms,created_at,updated_at')
          .range(from, to);
        if (qErr) throw qErr;
        setUsers(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, pageSize]);

  const signOut = () => {
    localStorage.removeItem('timi_admin_auth');
    localStorage.removeItem('timi_admin_id');
    localStorage.removeItem('timi_admin_name');
    navigate('/admin-timi');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/">
            <img 
              src="/logotimi.png" 
              alt="Timipay Logo" 
              style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
            />
          </Link>
          <div style={{ fontWeight: 700 }}>Admin Dashboard</div>
        </div>
        <button onClick={signOut} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fff' }}>Sign out</button>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        {error && (
          <div style={{ marginBottom: 12, padding: 10, border: '1px solid #fecaca', background: '#fee2e2', color: '#7f1d1d', borderRadius: 8 }}>{error}</div>
        )}
        {loading ? (
          <div>Loading users…</div>
        ) : (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1.5fr 1fr 2fr 1fr 2fr 2fr', gap: 0, borderBottom: '1px solid #e5e7eb', background: '#f3f4f6', padding: '8px 12px', fontWeight: 600, fontSize: 14 }}>
              <div>Email</div>
              <div>Name</div>
              <div>Prename</div>
              <div>Phone</div>
              <div>Gender</div>
              <div>Role</div>
              <div>Interests</div>
              <div>Terms</div>
              <div>Created</div>
              <div>Updated</div>
            </div>
            {users.map((u, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1.5fr 1fr 2fr 1fr 2fr 2fr', gap: 0, borderTop: '1px solid #e5e7eb', padding: '8px 12px', fontSize: 14 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email || '-'}</div>
                <div>{u.name || '-'}</div>
                <div>{u.prename || '-'}</div>
                <div>{u.phone || '-'}</div>
                <div>{u.gender || '-'}</div>
                <div>{u.role || '-'}</div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{Array.isArray(u.interests) ? u.interests.join(', ') : '-'}</div>
                <div>{u.terms ? 'Yes' : 'No'}</div>
                <div>{u.created_at ? new Date(u.created_at).toLocaleString() : '-'}</div>
                <div>{u.updated_at ? new Date(u.updated_at).toLocaleString() : '-'}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fff' }}>Prev</button>
          <span style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fff' }}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


