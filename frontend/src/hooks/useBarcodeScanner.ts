import { useEffect, useRef } from 'react'

/**
 * Detects USB HID barcode scanner input anywhere on the page.
 *
 * USB wedge scanners work like a keyboard: they rapidly type every character
 * of the barcode (each keystroke arrives < ~40 ms apart) then send Enter.
 * A human typing the same characters would have gaps of 100 ms+.
 *
 * Strategy:
 *   - Buffer printable keystrokes.
 *   - If a keystroke arrives more than IDLE_MS after the previous one, discard
 *     the old buffer and start fresh (this prevents a human typing a few chars
 *     then scanning from being merged).
 *   - On Enter, if the buffer was built with SCAN_MAX_MS or less between every
 *     char AND the buffer has at least MIN_LEN characters, treat it as a scan.
 */

const SCAN_MAX_MS = 60   // max ms between chars for it to count as a scan
const IDLE_MS     = 300  // gap that resets the buffer (human pause)
const MIN_LEN     = 3    // minimum barcode length to act on

interface Options {
  /** Called with the final barcode string when a scan is detected. */
  onScan: (barcode: string) => void
  /**
   * When true the hook ignores events. Use this to suppress scanning while
   * the user is focused on a text input (e.g. the search box on Devices page).
   */
  disabled?: boolean
}

export function useBarcodeScanner({ onScan, disabled = false }: Options) {
  const bufferRef   = useRef<string>('')
  const lastTimeRef = useRef<number>(0)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return

      // Ignore events originating from text inputs/textareas/selects —
      // those fields should handle their own input without interference.
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const now = performance.now()
      const gap = now - lastTimeRef.current

      if (e.key === 'Enter') {
        const barcode = bufferRef.current
        bufferRef.current = ''
        lastTimeRef.current = 0
        if (timerRef.current) clearTimeout(timerRef.current)

        if (barcode.length >= MIN_LEN) {
          onScan(barcode)
        }
        return
      }

      // Only collect printable single characters
      if (e.key.length !== 1) return

      // If there's been a long human-sized gap, reset the buffer
      if (lastTimeRef.current !== 0 && gap > IDLE_MS) {
        bufferRef.current = ''
      }

      bufferRef.current  += e.key
      lastTimeRef.current = now

      // Auto-flush after IDLE_MS of silence (handles scanners that don't send Enter)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const barcode = bufferRef.current
        bufferRef.current = ''
        lastTimeRef.current = 0
        if (barcode.length >= MIN_LEN && gap <= SCAN_MAX_MS) {
          onScan(barcode)
        }
      }, IDLE_MS)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onScan, disabled])
}
