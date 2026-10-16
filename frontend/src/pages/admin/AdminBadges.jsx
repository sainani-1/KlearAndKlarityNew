import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Alert, EmptyState } from '../../components/Feedback'
import { PageLoader, ButtonSpinner } from '../../components/Spinner'
import StudentBadge, { BADGE_OPTIONS } from '../../components/StudentBadge'

export default function AdminBadges() {
  const [students, setStudents] = useState(null)
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const load = () => {
    setError('')
    api.get('/admin/registrations', { params: { role: 'STUDENT' } })
      .then(({ data }) => setStudents(data))
      .catch((err) => setError(err.response?.data?.message ?? 'Could not load students.'))
  }

  useEffect(() => { load() }, [])

  const assign = async (student, badgeKey) => {
    setSaving(student.id)
    setError('')
    try {
      const { data } = await api.patch(`/admin/registrations/${student.id}/badge`, { badgeKey })
      setStudents((current) => current.map((item) => item.id === student.id ? data : item))
      setToast(badgeKey ? `${student.firstName} received a badge.` : 'Badge removed.')
      window.setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not update the badge.')
    } finally {
      setSaving(null)
    }
  }

  if (!students && !error) return <PageLoader label="Loading badge members..." />

  return (
    <div className="space-y-5">
      <header>
        <p className="section-kicker">Recognition</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Student badges</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Celebrate students who explore careers, help the community, or make a positive contribution.
          Their badge appears on their profile and beside their name in discussions.
        </p>
      </header>

      {toast && <Alert tone="success">{toast}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      {!students?.length ? (
        <EmptyState icon="🏅" title="No students found">Student accounts will appear here after registration.</EmptyState>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Current badge</th>
                <th className="px-4 py-3 font-semibold">Give a badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{student.fullName}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </td>
                  <td className="px-4 py-4"><StudentBadge badgeKey={student.badgeKey} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={student.badgeKey ?? ''}
                        onChange={(event) => assign(student, event.target.value || null)}
                        disabled={saving === student.id}
                        className="input max-w-xs py-2"
                        aria-label={`Badge for ${student.fullName}`}
                      >
                        <option value="">No badge</option>
                        {BADGE_OPTIONS.map((badge) => <option key={badge.value} value={badge.value}>{badge.label}</option>)}
                      </select>
                      {saving === student.id && <ButtonSpinner label="Saving..." />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
