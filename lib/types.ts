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
  sonho: '#E8B23C',
  embreve: '#E8714C',
  planejando: '#2FA39A',
  jafui: '#7FA86B',
}

export const STATUS_BG: Record<DestinationStatus, string> = {
  sonho: '#FBF0D6',
  embreve: '#FBE3DA',
  planejando: '#D9F0ED',
  jafui: '#E6EFDF',
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
  'linear-gradient(135deg, #E8714C, #E8924C)',
  'linear-gradient(135deg, #2FA39A, #7FA86B)',
  'linear-gradient(135deg, #E8B23C, #E8714C)',
  'linear-gradient(135deg, #2B2622, #8A8178)',
  'linear-gradient(135deg, #7FA86B, #2FA39A)',
  'linear-gradient(135deg, #E8924C, #E8B23C)',
]
