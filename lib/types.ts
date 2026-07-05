import { colors } from './colors'

export type Screen = 'dashboard' | 'add' | 'detail' | 'map' | 'agenda' | 'goals' | 'group'
export type Tab = 'lista' | 'agenda' | 'mapa' | 'metas'
export type StatusFilter = 'todos' | 'sonho' | 'embreve' | 'planejando' | 'jafui'
export type DestinationStatus = 'sonho' | 'embreve' | 'planejando' | 'jafui'
export type ModalType = 'create-group' | 'join-group' | null

export interface Profile {
  id: string
  name: string
  avatar_color: string
  email: string
}

export interface Space {
  id: string
  name: string
  color: string
  invite_code: string
  is_personal: boolean
  owner_id: string
  created_at: string
  members?: SpaceMember[]
}

export interface SpaceMember {
  space_id: string
  profile_id: string
  role: 'dono' | 'membro'
  profile?: Profile
}

export interface Destination {
  id: string
  space_id: string
  name: string
  country: string
  status: DestinationStatus
  cost: number
  saved: number
  season: string
  target_date: string | null
  date_label: string | null
  rating: number
  memory: string | null
  notes: string | null
  cover_photo: string | null
  lat: number | null
  lng: number | null
  added_by: string
  created_at: string
  votes?: DestinationVote[]
  checklist_items?: ChecklistItem[]
  comments?: Comment[]
  photos?: Photo[]
  added_by_profile?: Profile
}

export interface DestinationVote {
  destination_id: string
  profile_id: string
}

export interface ChecklistItem {
  id: string
  destination_id: string
  text: string
  done: boolean
  position: number
}

export interface Comment {
  id: string
  destination_id: string
  author_id: string
  text: string
  created_at: string
  author?: Profile
}

export interface Photo {
  id: string
  destination_id: string
  url: string
  position: number
  uploaded_by: string
}

export interface ToastMessage {
  id: string
  message: string
}

export const STATUS_COLORS: Record<DestinationStatus, string> = {
  sonho:      colors['status-sonho-accent'],
  embreve:    colors.coral,
  planejando: colors['status-planejando-accent'],
  jafui:      colors['status-jafui-accent'],
}

export const STATUS_BG: Record<DestinationStatus, string> = {
  sonho: colors['status-sonho'],
  embreve: colors['status-embreve'],
  planejando: colors['status-planejando'],
  jafui: colors['status-jafui'],
}

export const STATUS_LABELS: Record<DestinationStatus, string> = {
  sonho: 'Sonho',
  embreve: 'Em breve',
  planejando: 'Planejando',
  jafui: 'Já fui',
}

export const SEASONS = ['Toda época', 'Verão', 'Outono', 'Inverno', 'Primavera']

export type ItineraryCategory = 'transporte' | 'hospedagem' | 'alimentacao' | 'atracao' | 'compras' | 'destaque' | 'outros'

export interface ItineraryDay {
  id: string
  destination_id: string
  position: number
  label: string
}

export interface ItineraryItem {
  id: string
  day_id: string
  destination_id: string
  position: number
  time: string | null
  title: string
  category: ItineraryCategory
}

export const COVER_GRADIENTS = [
  'linear-gradient(135deg, #F06840, #E84A2A)',
  'linear-gradient(135deg, #3B82F6, #6366F1)',
  'linear-gradient(135deg, #10B981, #0EA5E9)',
  'linear-gradient(135deg, #8B5CF6, #EC4899)',
  'linear-gradient(135deg, #F59E0B, #F06840)',
  'linear-gradient(135deg, #0F172A, #334155)',
]
