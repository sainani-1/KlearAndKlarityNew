import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Alert, EmptyState } from '../../components/Feedback'
import { PageLoader } from '../../components/Spinner'
import { ROLE_OPTIONS, formatDate } from '../../lib/utils'

export default function AdminFollowers() {
  const [rows, setRows] = useState(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const params = {}
    if (search.trim()) params.search = search.trim()
    if (role !== 'ALL') params.role = role
    api.get('/admin/followers', { params })
      .then(({ data }) => { if (!cancelled) { setRows(data); setError('') } })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message ?? 'Could not load followers.') })
    return () => { cancelled = true }
  }, [search, role])

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Followers</h2>
        <p className="mt-1 text-sm text-slate-600">Accounts ranked from highest to lowest follower count.</p>
      </header>

      {error && <Alert tone="error">{error}</Alert>}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="followers-search" className="label">Search</label>
          <input id="followers-search" className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or contact number" />
        </div>
        <div className="sm:w-48">
          <label htmlFor="followers-role" className="label">Role</label>
          <select id="followers-role" className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ALL">All roles</option>
            {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>

      {!rows ? <PageLoader label="Loading followers..." /> : rows.length === 0 ? (
        <EmptyState icon="⭐" title="No accounts match this filter">Try another search or role.</EmptyState>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Followers</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-bold text-slate-500">#{index + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={`/users/${row.id}`} className="font-semibold text-brand-700 hover:underline">{row.fullName}</Link>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.role}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{row.followerCount ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
