// Agentation (L7, Thomas, 2 November): click an element or select text, write a note, copy markdown
// with the selector to paste to Claude. Preview builds only: Base renders it when PUBLIC_NOTES=1,
// so production ships no React at all.
import { Agentation } from 'agentation'

export default function Notes() {
  return <Agentation />
}
