const KEY = 'klearity_career_preferences'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{"saved":[],"compare":[]}')
  } catch {
    return { saved: [], compare: [] }
  }
}

function write(value) {
  localStorage.setItem(KEY, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('klearity:career-preferences'))
  return value
}

export function getCareerPreferences() { return read() }
export function toggleSaved(id) {
  const state = read()
  state.saved = state.saved.includes(id) ? state.saved.filter((value) => value !== id) : [...state.saved, id]
  return write(state)
}
export function toggleCompare(id) {
  const state = read()
  if (!state.compare.includes(id) && state.compare.length >= 3) return state
  state.compare = state.compare.includes(id) ? state.compare.filter((value) => value !== id) : [...state.compare, id]
  return write(state)
}
export function clearCompare() { return write({ ...read(), compare: [] }) }
