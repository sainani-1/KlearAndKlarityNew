export default function AuthShowcase({ mode = 'login' }) {
  const isRegister = mode === 'register'

  return (
    <aside className="auth-showcase" aria-hidden="true">
      <div className="auth-showcase-grid" />
      <div className="auth-orbit auth-orbit-one" />
      <div className="auth-orbit auth-orbit-two" />
      <div className="auth-orbit auth-orbit-three" />
      <div className="auth-compass">
        <span className="auth-compass-core">✦</span>
        <span className="auth-compass-label">{isRegister ? 'START HERE' : 'WELCOME BACK'}</span>
      </div>

      <div className="auth-float auth-float-one">
        <span className="auth-float-icon">↗</span>
        <span><small>PATHWAYS</small><strong>160+ options</strong></span>
      </div>
      <div className="auth-float auth-float-two">
        <span className="auth-float-icon warm">◎</span>
        <span><small>YOUR NEXT STEP</small><strong>{isRegister ? 'Build your map' : 'Keep exploring'}</strong></span>
      </div>
      <div className="auth-showcase-copy">
        <p className="auth-showcase-eyebrow">KLEAR AND KLARITY / 02</p>
        <h2>{isRegister ? 'Make the next move feel possible.' : 'Your direction is still unfolding.'}</h2>
        <p>{isRegister ? 'A calmer way to explore what comes after the class you are in.' : 'Pick up where you left off and keep turning questions into direction.'}</p>
      </div>
    </aside>
  )
}
