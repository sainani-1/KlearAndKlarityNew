import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Adds reveal-on-scroll behavior to the direct content blocks of each route. */
export default function ScrollReveal() {
  const location = useLocation()

  useEffect(() => {
    let observer
    const frame = requestAnimationFrame(() => {
      const nodes = Array.from(document.querySelectorAll('main > *'))
      nodes.forEach((node, index) => {
        node.classList.add('scroll-reveal')
        node.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`)
      })

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px' },
      )

      nodes.forEach((node) => observer.observe(node))
    })

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [location.pathname])

  return null
}
