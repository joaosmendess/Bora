export const colors = {
  // Brand — the one accent color (+ tints/shades of the same hue for gradients)
  coral: '#F06840',
  'coral-light': '#F5946F',
  'coral-dark': '#C94825',

  // Neutral scale (slate, not warm)
  ink: '#0F172A',
  'text-soft': '#64748B',
  'text-muted': '#94A3B8',

  // Surfaces
  paper: '#F8FAFC',
  border: '#E2E8F0',
  'border-strong': '#CBD5E1',

  // Semantic
  'danger-bg': '#FFF1F2',
  'danger-border': '#FECDD3',

  // Status — one family, one recipe: same saturation and the same white-text
  // contrast weight as coral, only the hue rotates. Previously these were
  // independent stock Tailwind swatches (amber-600, blue-500, green-600) that
  // didn't share any relationship with each other or with coral — that's
  // what read as "disconnected." Pastel backgrounds follow the same rule
  // (same saturation/lightness recipe, hue-matched to their accent).
  'status-sonho': '#F7F1DE',
  'status-sonho-accent': '#B38B14',
  'status-embreve': '#F7E4DE',
  'status-planejando': '#DEEAF7',
  'status-planejando-accent': '#4794EB',
  'status-jafui': '#DEF7EB',
  'status-jafui-accent': '#13A85D',
} as const
