import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import { Alert } from '../components/Feedback'
import { categoryColorClass, pluralize, timeAgo } from '../lib/utils'
import { useAuth } from '../lib/auth'
import StudentBadge from '../components/StudentBadge'

function PublicationCard({ post }) {
  return (
    <article className="card-hover p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ring-1 ${categoryColorClass(post.categoryColor)}`}>{post.categoryName}</span>
        <span className="text-xs text-slate-500">{timeAgo(post.createdAt)}</span>
      </div>
      <h3 className="mt-2.5 text-base font-bold text-slate-900">{post.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{post.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span>💬 {pluralize(post.replyCount ?? 0, 'reply', 'replies')}</span>
        <span>♥ {post.likeCount ?? 0}</span>
        <Link to={`/discussion/${post.id}`} className="font-semibold text-brand-700 hover:underline">Open discussion →</Link>
      </div>
    </article>
  )
}

export default function PublicProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/public/users/${id}`)
      .then(({ data: next }) => setData(next))
      .catch((e) => setError(e.response?.data?.message || 'Could not load account.'))
  }, [id])

  const follow = async () => {
    const { data: next } = await api.post(`/public/users/${id}/follow`)
    setData({ ...data, ...next })
  }

  if (error) return <div className="container-page py-10"><Alert tone="error">{error}</Alert></div>
  if (!data) return <div className="container-page py-10">Loading account...</div>
  if (!data.publicAccount) return <div className="container-page py-10"><Alert tone="info" title="Private account">{data.message}</Alert></div>

  return (
    <div className="container-page py-8">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-xl font-bold text-white">{data.firstName?.[0]}</div>
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">{data.name}<StudentBadge badgeKey={data.badgeKey} />{data.emailVerified && <span className="verified-badge" title="Verified account">✓</span>}</h1>
            <p className="text-sm text-slate-500">{data.followerCount} followers</p>
          </div>
          {String(user?.id) !== String(data.id) && <button className="btn-primary ml-auto" onClick={follow}>{data.following ? 'Unfollow' : 'Follow'}</button>}
        </div>
      </div>
      <div className="mt-8 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Discussions by {data.firstName}</h2>
          <p className="mt-1 text-sm text-slate-500">Open a topic to read the full discussion.</p>
        </div>
        <span className="text-sm text-slate-500">{data.publications?.length ?? 0} posts</span>
      </div>
      {data.publications?.length ? (
        <div className="mt-4 space-y-3">{data.publications.map((post) => <PublicationCard key={post.id} post={post} />)}</div>
      ) : <div className="card mt-4 p-6 text-sm text-slate-500">No public discussions yet.</div>}
    </div>
  )
}
