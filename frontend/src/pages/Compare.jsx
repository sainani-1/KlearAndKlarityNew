import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { clearCompare, getCareerPreferences, toggleCompare } from '../lib/careerPrefs'
import { EmptyState } from '../components/Feedback'
import { PageLoader } from '../components/Spinner'

export default function Compare() {
  const [ids, setIds] = useState(getCareerPreferences().compare)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sync = () => setIds(getCareerPreferences().compare)
    window.addEventListener('klearity:career-preferences', sync)
    return () => window.removeEventListener('klearity:career-preferences', sync)
  }, [])

  useEffect(() => {
    if (!ids.length) { setItems([]); setLoading(false); return }
    setLoading(true)
    Promise.all(ids.map((id) => api.get(`/careers/items/${id}`).then(({ data }) => data).catch(() => null)))
      .then((data) => setItems(data.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [ids])

  if (loading) return <PageLoader label="Preparing your comparison..." />

  return (
    <div className="container-page py-8">
      <header>
        <p className="section-kicker">Decision workspace</p>
        <h1>Compare careers</h1>
        <p>Put up to three pathways side by side and see what actually changes between them.</p>
      </header>
      {!items.length ? (
        <EmptyState icon="⚖️" title="Nothing to compare yet">
          Save careers from the Career Tree, then choose Compare on the ones you are considering.
          <Link to="/career-tree" className="btn-primary mt-4">Explore careers</Link>
        </EmptyState>
      ) : (
        <>
          <div className="mb-4 flex justify-end"><button type="button" onClick={clearCompare} className="btn-secondary">Clear comparison</button></div>
          <div className="compare-grid">
            {items.map((item) => {
              const detail = item.detail ?? {}
              return <article key={item.id} className="card compare-card">
                <div className="flex items-start justify-between gap-3">
                  <div><span className="badge bg-brand-50 text-brand-700">{item.className}</span><h2>{item.title}</h2></div>
                  <button type="button" onClick={() => toggleCompare(item.id)} aria-label={`Remove ${item.title}`}>×</button>
                </div>
                <p className="compare-description">{item.description}</p>
                {[['Category', item.category], ['Duration', item.duration || detail.duration], ['Stream', item.stream || detail.which_stream], ['Skills', detail.skills_required], ['Exams', detail.entrance_exams], ['Jobs', detail.jobs_available]].map(([label, value]) => value && <div key={label} className="compare-row"><span>{label}</span><strong>{value}</strong></div>)}
                <Link to={`/career-tree/${item.id}`} className="link mt-5 inline-block">Open full pathway ↗</Link>
              </article>
            })}
          </div>
        </>
      )}
    </div>
  )
}
