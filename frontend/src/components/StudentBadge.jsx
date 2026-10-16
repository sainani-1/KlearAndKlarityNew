const BADGES = {
  KLEARITY_STAR: { label: 'Klearity Star', icon: '✦', tone: 'blue' },
  CAREER_EXPLORER: { label: 'Career Explorer', icon: '⌁', tone: 'violet' },
  COMMUNITY_HELPER: { label: 'Community Helper', icon: '♥', tone: 'emerald' },
  RISING_MIND: { label: 'Rising Mind', icon: '★', tone: 'amber' },
}

export const BADGE_OPTIONS = Object.entries(BADGES).map(([value, badge]) => ({ value, ...badge }))

export function badgeDetails(badgeKey) {
  return BADGES[badgeKey] ?? null
}

export default function StudentBadge({ badgeKey, compact = false }) {
  const badge = badgeDetails(badgeKey)
  if (!badge) return null

  return (
    <span
      className={`student-badge student-badge-${badge.tone} ${compact ? 'student-badge-compact' : ''}`}
      title={badge.label}
      aria-label={`${badge.label} badge`}
    >
      <span className="student-badge-medal" aria-hidden="true">
        <span>{badge.icon}</span>
      </span>
      {!compact && <span>{badge.label}</span>}
    </span>
  )
}
