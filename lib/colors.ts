/**
 * Single source of truth for the Bora color palette.
 * tailwind.config.ts extends its theme from this file, and components
 * import `colors` directly for inline styles that can't use Tailwind classes.
 */
export const colors = {
  coral: '#E8714C',
  'coral-light': '#E8924C',
  golden: '#E8B23C',
  'golden-text': '#D99A1F',
  teal: '#2FA39A',
  green: '#7FA86B',
  blue: '#5B96E8',
  purple: '#A882D4',
  pink: '#E8708A',

  ink: '#2B2622',
  'text-soft': '#8A8178',
  'text-muted': '#B0917A',
  'text-faint': '#C8B8A8',

  paper: '#FBF7EF',
  dot: '#E6DCC9',
  border: '#EFE6D7',
  'border-alt': '#EBE1D2',
  'border-muted': '#D4C4B0',
  'input-bg': '#FBF9F4',
  'tab-bg': '#F1E9DC',

  'danger-bg': '#FFF4F2',
  'danger-border': '#FCCBC0',

  'status-sonho': '#FBF0D6',
  'status-embreve': '#FBE3DA',
  'status-planejando': '#D9F0ED',
  'status-jafui': '#E6EFDF',
} as const
