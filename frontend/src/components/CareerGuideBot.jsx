import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

const STARTERS = ['I like computers and problem solving', 'I enjoy biology and helping people', 'I am creative and like design']
const STOP_WORDS = new Set('i am a an the and or like love enjoy interested in want to after with for me my into to of'.split(' '))
const GROUPS = {
  tech: ['computer', 'coding', 'program', 'software', 'technology', 'math', 'data', 'web', 'app', 'robot', 'cyber'],
  creative: ['design', 'drawing', 'art', 'creative', 'fashion', 'media', 'writing', 'film', 'photo'],
  business: ['business', 'commerce', 'finance', 'account', 'management', 'marketing', 'entrepreneur'],
  health: ['biology', 'doctor', 'medical', 'health', 'medicine', 'nurse', 'helping'],
  science: ['science', 'research', 'physics', 'chemistry', 'laboratory', 'lab'],
  people: ['law', 'justice', 'society', 'people', 'government', 'civil', 'teaching'],
  practical: ['machine', 'repair', 'build', 'practical', 'electric', 'mechanic', 'hands', 'trade'],
}

function termsFor(message) {
  const words = message.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word && !STOP_WORDS.has(word))
  const expanded = [...words]
  Object.values(GROUPS).forEach((terms) => {
    if (terms.some((term) => words.some((word) => word.includes(term) || term.includes(word)))) expanded.push(...terms)
  })
  return expanded
}

function suggest(items, message) {
  const terms = termsFor(message)
  return items
    .map((item) => {
      const haystack = `${item.title} ${item.description ?? ''} ${item.category ?? ''} ${item.className ?? ''}`.toLowerCase()
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? (item.title.toLowerCase().includes(term) ? 4 : 1) : 0), 0)
      return { item, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 3)
    .map(({ item }) => item)
}

export default function CareerGuideBot() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [items, setItems] = useState(null)
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Tell me what you enjoy and I’ll suggest a few career paths from our library.' },
  ])

  const loadItems = async () => {
    if (items) return items
    setBusy(true)
    try {
      const { data } = await api.get('/public/career-items')
      setItems(data)
      return data
    } catch {
      setMessages((current) => [...current, { from: 'bot', text: 'I could not reach the career library right now. Please try again in a moment.' }])
      return []
    } finally {
      setBusy(false)
    }
  }

  const send = async (preset = null) => {
    const text = (preset ?? message).trim()
    if (!text || busy) return
    setMessage('')
    setMessages((current) => [...current, { from: 'user', text }])
    const library = await loadItems()
    const matches = suggest(library, text)
    if (!matches.length) {
      setMessages((current) => [...current, { from: 'bot', text: 'Tell me a little more — for example, “I like computers”, “I enjoy biology”, or “I want a practical course”.' }])
      return
    }
    const hasClass = /\b(class\s*(10|11|12)|10th|inter|diploma|undergraduate|ug|postgraduate|pg)\b/i.test(text)
    const followUp = hasClass ? '' : ' Tell me your current class too and I can narrow these down to options you can reach next.'
    setMessages((current) => [...current, { from: 'bot', matches, text: `I matched these to the interests in your message.${followUp}` }])
  }

  const latest = useMemo(() => messages.slice(-5), [messages])

  return (
    <div className={`career-bot ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="career-bot-panel" aria-label="Career Guide chat">
          <div className="career-bot-head">
            <div className="career-bot-avatar">✦</div>
            <div>
              <strong>Career Guide</strong>
              <span>Grounded in your career library</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close career guide">×</button>
          </div>

          <div className="career-bot-messages">
            {latest.map((entry, index) => (
              <div key={`${entry.text}-${index}`} className={`career-bot-message ${entry.from}`}>
                <p>{entry.text}</p>
                {entry.matches && (
                  <div className="career-bot-results">
                    {entry.matches.map((item) => (
                      <Link key={item.id} to={`/career-tree/${item.id}`} onClick={() => setOpen(false)}>
                        <span>{item.className}</span>
                        <strong>{item.title}</strong>
                        <small>Explore pathway ↗</small>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!items && messages.length === 1 && (
              <div className="career-bot-starters">
                {STARTERS.map((starter) => <button type="button" key={starter} onClick={() => send(starter)}>{starter}</button>)}
              </div>
            )}
          </div>

          <form className="career-bot-form" onSubmit={(event) => { event.preventDefault(); send() }}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={busy ? 'Finding matches...' : 'What do you enjoy?'} aria-label="Ask Career Guide" />
            <button type="submit" disabled={busy || !message.trim()} aria-label="Send message">↑</button>
          </form>
        </section>
      )}
      <button type="button" className="career-bot-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="career-bot-trigger-icon">✦</span>
        <span>{open ? 'Close guide' : 'Ask Career Guide'}</span>
      </button>
    </div>
  )
}
