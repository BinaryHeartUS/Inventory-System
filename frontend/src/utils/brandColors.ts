import type { DeviceStatus } from '../types/inventory'

/**
 * BinaryHeart Brand Colors (National)
 *
 * BINARY_RED — "Binary": action CTAs, links, buttons, accents
 * HEART_BLUE — "Heart": structural UI, active states, focus rings, data
 */

export const BINARY_RED = '#FF0040';
export const BINARY_RED_DARK = '#d70036';

export const HEART_BLUE = '#193961';
export const HEART_BLUE_DARK = '#112440';

// ─── Device Status Colors ────────────────────────────────────────────────────
// Shared across StatusBadge, Dashboard, and any future status-aware UI.

export const STATUS_CONFIG: Record<DeviceStatus, { dot: string; badge: string; badgeDark: string }> = {
  'Not Started':     { dot: 'bg-slate-400',  badge: 'bg-slate-100  text-slate-500',  badgeDark: 'bg-white/10      text-slate-300'  },
  'In Progress':     { dot: 'bg-amber-500',  badge: 'bg-amber-50   text-amber-700',  badgeDark: 'bg-amber-500/25   text-amber-200'  },
  'Ready To Donate': { dot: 'bg-green-500',  badge: 'bg-green-50   text-green-700',  badgeDark: 'bg-green-500/25   text-green-200'  },
  'Donated':         { dot: 'bg-sky-500',    badge: 'bg-sky-50     text-sky-700',    badgeDark: 'bg-sky-400/30     text-sky-100'    },
  'Scrapped':        { dot: 'bg-red-400',   badge: 'bg-red-50     text-red-600',   badgeDark: 'bg-red-500/25     text-red-200'   },
  'Unknown':         { dot: 'bg-gray-300',   badge: 'bg-gray-100   text-gray-400',   badgeDark: 'bg-white/8        text-slate-400'  },
}
