'use client'

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { generateInviteCode } from '@/lib/inviteCode'
import type {
  Profile, Space, Destination, ChecklistItem, Comment, DestinationStatus,
  ModalType, Screen, StatusFilter, ToastMessage,
} from '@/lib/types'

interface AppState {
  user: Profile | null
  spaces: Space[]
  currentSpace: Space | null
  destinations: Destination[]
  screen: Screen
  selectedDestination: Destination | null
  categoryFilter: StatusFilter
  seasonFilter: string
  budgetMax: number
  spaceMenuOpen: boolean
  modal: ModalType
  toast: ToastMessage | null
  loading: boolean
  loadingDestinations: boolean
}

type Action =
  | { type: 'SET_USER'; payload: Profile | null }
  | { type: 'SET_SPACES'; payload: Space[] }
  | { type: 'SET_CURRENT_SPACE'; payload: Space | null }
  | { type: 'SET_DESTINATIONS'; payload: Destination[] }
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_SELECTED'; payload: Destination | null }
  | { type: 'SET_CATEGORY_FILTER'; payload: StatusFilter }
  | { type: 'SET_SEASON_FILTER'; payload: string }
  | { type: 'SET_BUDGET_MAX'; payload: number }
  | { type: 'SET_SPACE_MENU'; payload: boolean }
  | { type: 'SET_MODAL'; payload: ModalType }
  | { type: 'SET_TOAST'; payload: ToastMessage | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_DESTS'; payload: boolean }
  | { type: 'UPDATE_DESTINATION'; payload: Destination }
  | { type: 'ADD_DESTINATION'; payload: Destination }
  | { type: 'REMOVE_DESTINATION'; payload: string }

const initial: AppState = {
  user: null,
  spaces: [],
  currentSpace: null,
  destinations: [],
  screen: 'dashboard',
  selectedDestination: null,
  categoryFilter: 'todos',
  seasonFilter: 'Toda época',
  budgetMax: 25000,
  spaceMenuOpen: false,
  modal: null,
  toast: null,
  loading: true,
  loadingDestinations: false,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload }
    case 'SET_SPACES': return { ...state, spaces: action.payload }
    case 'SET_CURRENT_SPACE': return { ...state, currentSpace: action.payload }
    case 'SET_DESTINATIONS': return { ...state, destinations: action.payload }
    case 'SET_SCREEN': return { ...state, screen: action.payload }
    case 'SET_SELECTED': return { ...state, selectedDestination: action.payload }
    case 'SET_CATEGORY_FILTER': return { ...state, categoryFilter: action.payload }
    case 'SET_SEASON_FILTER': return { ...state, seasonFilter: action.payload }
    case 'SET_BUDGET_MAX': return { ...state, budgetMax: action.payload }
    case 'SET_SPACE_MENU': return { ...state, spaceMenuOpen: action.payload }
    case 'SET_MODAL': return { ...state, modal: action.payload }
    case 'SET_TOAST': return { ...state, toast: action.payload }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'SET_LOADING_DESTS': return { ...state, loadingDestinations: action.payload }
    case 'UPDATE_DESTINATION': return {
      ...state,
      destinations: state.destinations.map(d => d.id === action.payload.id ? action.payload : d),
      selectedDestination: state.selectedDestination?.id === action.payload.id ? action.payload : state.selectedDestination,
    }
    case 'ADD_DESTINATION': return { ...state, destinations: [action.payload, ...state.destinations] }
    case 'REMOVE_DESTINATION': return {
      ...state,
      destinations: state.destinations.filter(d => d.id !== action.payload),
    }
    default: return state
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>
  navigate: (screen: Screen, destination?: Destination) => void
  showToast: (message: string) => void
  loadSpaceDestinations: (spaceId: string) => Promise<void>
  addDestination: (data: Partial<Destination>) => Promise<void>
  updateDestination: (id: string, data: Partial<Destination>) => Promise<void>
  deleteDestination: (id: string) => Promise<void>
  toggleVote: (destinationId: string) => Promise<void>
  toggleChecklist: (item: ChecklistItem) => Promise<void>
  addChecklistItem: (destinationId: string, text: string) => Promise<void>
  deleteChecklistItem: (itemId: string, destinationId: string) => Promise<void>
  addComment: (destinationId: string, text: string) => Promise<void>
  addPhoto: (destinationId: string, url: string) => Promise<void>
  updateSaved: (destinationId: string, amount: number) => Promise<void>
  createSpace: (name: string, color: string) => Promise<Space | null>
  joinSpace: (codeOrLink: string) => Promise<boolean>
  switchSpace: (space: Space) => void
  deleteSpace: (spaceId: string) => Promise<boolean>
  leaveSpace: (spaceId: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)

  const navigate = useCallback((screen: Screen, destination?: Destination) => {
    if (destination) dispatch({ type: 'SET_SELECTED', payload: destination })
    dispatch({ type: 'SET_SCREEN', payload: screen })
  }, [])

  const showToast = useCallback((message: string) => {
    const id = Math.random().toString(36).slice(2)
    dispatch({ type: 'SET_TOAST', payload: { id, message } })
    setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2600)
  }, [])

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) dispatch({ type: 'SET_USER', payload: data })
  }, [])

  const loadSpaces = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('space_members')
      .select('space_id, role, spaces(*, members:space_members(*, profile:profiles(*)))')
      .eq('profile_id', userId)
    if (data && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let spaces = data.map((m: any) => m.spaces).filter(Boolean)

      // Process pending invite (saved when non-logged-in user clicked an invite link)
      const pendingCode = typeof window !== 'undefined' ? sessionStorage.getItem('pending_invite') : null
      if (pendingCode) {
        sessionStorage.removeItem('pending_invite')
        const { data: joined } = await supabase.rpc('join_space_by_code', { p_code: pendingCode })
        if (joined && !spaces.find((s: Space) => s.id === joined.id)) {
          spaces = [...spaces, joined]
        }
        if (joined) {
          dispatch({ type: 'SET_SPACES', payload: spaces })
          dispatch({ type: 'SET_CURRENT_SPACE', payload: joined })
          if (typeof window !== 'undefined') localStorage.setItem('bora_space_id', joined.id)
          await loadSpaceDestinations(joined.id)
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }
      }

      dispatch({ type: 'SET_SPACES', payload: spaces })
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('bora_space_id') : null
      const active = (savedId && spaces.find((s: Space) => s.id === savedId)) || spaces.find((s: Space) => s.is_personal) || spaces[0]
      dispatch({ type: 'SET_CURRENT_SPACE', payload: active })
      await loadSpaceDestinations(active.id)
    }
    dispatch({ type: 'SET_LOADING', payload: false })
  }, []) // eslint-disable-line

  const loadSpaceDestinations = useCallback(async (spaceId: string) => {
    dispatch({ type: 'SET_LOADING_DESTS', payload: true })
    const { data } = await supabase
      .from('destinations')
      .select(`*, votes:destination_votes(*), checklist_items(*), comments(*, author:profiles(*)), photos(*), added_by_profile:profiles!added_by(*)`)
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
    if (data) dispatch({ type: 'SET_DESTINATIONS', payload: data })
    dispatch({ type: 'SET_LOADING_DESTS', payload: false })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id)
        loadSpaces(session.user.id)
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id)
        loadSpaces(session.user.id)
      } else {
        dispatch({ type: 'SET_USER', payload: null })
        dispatch({ type: 'SET_SPACES', payload: [] })
        dispatch({ type: 'SET_CURRENT_SPACE', payload: null })
        dispatch({ type: 'SET_DESTINATIONS', payload: [] })
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile, loadSpaces])

  const addDestination = useCallback(async (data: Partial<Destination>) => {
    if (!state.currentSpace || !state.user) return
    const { data: created, error } = await supabase
      .from('destinations')
      .insert({ ...data, space_id: state.currentSpace.id, added_by: state.user.id })
      .select('*, votes:destination_votes(*), checklist_items(*), comments(*), photos(*)')
      .single()
    if (error || !created) {
      showToast('Não foi possível adicionar o destino.')
      return
    }
    dispatch({ type: 'ADD_DESTINATION', payload: { ...created, added_by_profile: state.user } })
    showToast('Destino adicionado!')
  }, [state.currentSpace, state.user, showToast])

  const updateDestination = useCallback(async (id: string, data: Partial<Destination>) => {
    const { data: updated, error } = await supabase
      .from('destinations')
      .update(data)
      .eq('id', id)
      .select('*, votes:destination_votes(*), checklist_items(*), comments(*, author:profiles(*)), photos(*), added_by_profile:profiles!added_by(*)')
      .single()
    if (error || !updated) {
      showToast('Não foi possível salvar a alteração.')
      return
    }
    dispatch({ type: 'UPDATE_DESTINATION', payload: updated })
  }, [showToast])

  const deleteDestination = useCallback(async (id: string) => {
    const { error } = await supabase.from('destinations').delete().eq('id', id)
    if (error) {
      showToast('Não foi possível excluir o destino.')
      return
    }
    dispatch({ type: 'REMOVE_DESTINATION', payload: id })
    dispatch({ type: 'SET_SCREEN', payload: 'dashboard' })
    showToast('Destino removido.')
  }, [showToast])

  const toggleVote = useCallback(async (destinationId: string) => {
    if (!state.user) return
    const dest = state.destinations.find(d => d.id === destinationId)
    if (!dest) return
    const hasVoted = dest.votes?.some(v => v.profile_id === state.user!.id)
    if (hasVoted) {
      await supabase.from('destination_votes').delete()
        .eq('destination_id', destinationId).eq('profile_id', state.user.id)
    } else {
      await supabase.from('destination_votes').insert({ destination_id: destinationId, profile_id: state.user.id })
    }
    const { data } = await supabase.from('destination_votes').select('*').eq('destination_id', destinationId)
    const updated = { ...dest, votes: data || [] }
    dispatch({ type: 'UPDATE_DESTINATION', payload: updated })
  }, [state.user, state.destinations])

  const toggleChecklist = useCallback(async (item: ChecklistItem) => {
    await supabase.from('checklist_items').update({ done: !item.done }).eq('id', item.id)
    const dest = state.destinations.find(d => d.id === item.destination_id)
    if (!dest) return
    const updatedItems = dest.checklist_items?.map(i => i.id === item.id ? { ...i, done: !i.done } : i)
    dispatch({ type: 'UPDATE_DESTINATION', payload: { ...dest, checklist_items: updatedItems } })
  }, [state.destinations])

  const addChecklistItem = useCallback(async (destinationId: string, text: string) => {
    const dest = state.destinations.find(d => d.id === destinationId)
    if (!dest) return
    const position = (dest.checklist_items?.length || 0)
    const { data } = await supabase.from('checklist_items')
      .insert({ destination_id: destinationId, text, done: false, position })
      .select().single()
    if (data) {
      dispatch({ type: 'UPDATE_DESTINATION', payload: { ...dest, checklist_items: [...(dest.checklist_items || []), data] } })
    }
  }, [state.destinations])

  const addComment = useCallback(async (destinationId: string, text: string) => {
    if (!state.user) return
    const { data } = await supabase.from('comments')
      .insert({ destination_id: destinationId, author_id: state.user.id, text })
      .select('*, author:profiles(*)').single()
    if (data) {
      const dest = state.destinations.find(d => d.id === destinationId)
      if (dest) {
        dispatch({ type: 'UPDATE_DESTINATION', payload: { ...dest, comments: [...(dest.comments || []), data] } })
      }
    }
  }, [state.user, state.destinations])

  const deleteChecklistItem = useCallback(async (itemId: string, destinationId: string) => {
    await supabase.from('checklist_items').delete().eq('id', itemId)
    const dest = state.destinations.find(d => d.id === destinationId)
    if (!dest) return
    dispatch({ type: 'UPDATE_DESTINATION', payload: { ...dest, checklist_items: dest.checklist_items?.filter(i => i.id !== itemId) } })
  }, [state.destinations])

  const addPhoto = useCallback(async (destinationId: string, url: string) => {
    if (!state.user) return
    const dest = state.destinations.find(d => d.id === destinationId)
    if (!dest) return
    const position = (dest.photos?.length || 0)
    const { data } = await supabase.from('photos')
      .insert({ destination_id: destinationId, url, position, uploaded_by: state.user.id })
      .select().single()
    if (data) {
      dispatch({ type: 'UPDATE_DESTINATION', payload: { ...dest, photos: [...(dest.photos || []), data] } })
    }
  }, [state.user, state.destinations])

  const updateSaved = useCallback(async (destinationId: string, amount: number) => {
    const dest = state.destinations.find(d => d.id === destinationId)
    if (!dest) return
    const newSaved = Math.max(0, dest.saved + amount)
    await updateDestination(destinationId, { saved: newSaved })
  }, [state.destinations, updateDestination])

  async function fetchSpaceWithMembers(spaceId: string): Promise<Space | null> {
    const { data } = await supabase
      .from('spaces')
      .select('*, members:space_members(*, profile:profiles(*))')
      .eq('id', spaceId)
      .single()
    return data ?? null
  }

  const createSpace = useCallback(async (name: string, color: string): Promise<Space | null> => {
    if (!state.user) return null
    const invite_code = generateInviteCode()
    const { data: space, error } = await supabase.from('spaces')
      .insert({ name, color, invite_code, is_personal: false, owner_id: state.user.id })
      .select().single()
    if (error || !space) {
      showToast('Não foi possível criar o grupo.')
      return null
    }
    const { error: memberError } = await supabase.from('space_members')
      .insert({ space_id: space.id, profile_id: state.user.id, role: 'dono' })
    if (memberError) {
      showToast('Não foi possível criar o grupo.')
      return null
    }
    const full = await fetchSpaceWithMembers(space.id) ?? space
    dispatch({ type: 'SET_SPACES', payload: [...state.spaces, full] })
    return full
  }, [state.user, state.spaces, showToast]) // eslint-disable-line

  const joinSpace = useCallback(async (codeOrLink: string): Promise<boolean> => {
    if (!state.user) return false
    const code = codeOrLink.trim().split('/').pop() || codeOrLink.trim()
    const { data: space, error } = await supabase.rpc('join_space_by_code', { p_code: code })
    if (error || !space) return false
    const full = await fetchSpaceWithMembers(space.id) ?? space
    dispatch({ type: 'SET_SPACES', payload: [...state.spaces, full] })
    switchSpace(full)
    return true
  }, [state.user, state.spaces]) // eslint-disable-line

  const switchSpace = useCallback((space: Space) => {
    if (typeof window !== 'undefined') localStorage.setItem('bora_space_id', space.id)
    dispatch({ type: 'SET_CURRENT_SPACE', payload: space })
    dispatch({ type: 'SET_SPACE_MENU', payload: false })
    loadSpaceDestinations(space.id)
  }, [loadSpaceDestinations])

  const deleteSpace = useCallback(async (spaceId: string): Promise<boolean> => {
    const { error } = await supabase.from('spaces').delete().eq('id', spaceId)
    if (error) { showToast('Não foi possível excluir o grupo.'); return false }
    const remaining = state.spaces.filter(s => s.id !== spaceId)
    dispatch({ type: 'SET_SPACES', payload: remaining })
    const fallback = remaining.find(s => s.is_personal) || remaining[0] || null
    dispatch({ type: 'SET_CURRENT_SPACE', payload: fallback })
    if (typeof window !== 'undefined') localStorage.setItem('bora_space_id', fallback?.id || '')
    if (fallback) await loadSpaceDestinations(fallback.id)
    else dispatch({ type: 'SET_DESTINATIONS', payload: [] })
    return true
  }, [state.spaces, showToast, loadSpaceDestinations])

  const leaveSpace = useCallback(async (spaceId: string): Promise<boolean> => {
    if (!state.user) return false
    const { error } = await supabase.from('space_members')
      .delete().eq('space_id', spaceId).eq('profile_id', state.user.id)
    if (error) { showToast('Não foi possível sair do grupo.'); return false }
    const remaining = state.spaces.filter(s => s.id !== spaceId)
    dispatch({ type: 'SET_SPACES', payload: remaining })
    const fallback = remaining.find(s => s.is_personal) || remaining[0] || null
    dispatch({ type: 'SET_CURRENT_SPACE', payload: fallback })
    if (typeof window !== 'undefined') localStorage.setItem('bora_space_id', fallback?.id || '')
    if (fallback) await loadSpaceDestinations(fallback.id)
    else dispatch({ type: 'SET_DESTINATIONS', payload: [] })
    return true
  }, [state.user, state.spaces, showToast, loadSpaceDestinations])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AppContext.Provider value={{
      ...state,
      dispatch,
      navigate,
      showToast,
      loadSpaceDestinations,
      addDestination,
      updateDestination,
      deleteDestination,
      toggleVote,
      toggleChecklist,
      addChecklistItem,
      deleteChecklistItem,
      addComment,
      addPhoto,
      updateSaved,
      createSpace,
      joinSpace,
      switchSpace,
      deleteSpace,
      leaveSpace,
      signOut,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
