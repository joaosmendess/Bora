import { supabase } from './supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function uploadImage(file: File, folder = 'covers'): Promise<string | null> {
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    console.error('Upload rejeitado: tipo de arquivo não permitido', file.type)
    return null
  }
  if (file.size > MAX_FILE_SIZE) {
    console.error('Upload rejeitado: arquivo maior que 5MB')
    return null
  }

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('destination-photos')
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage.from('destination-photos').getPublicUrl(path)
  return data.publicUrl
}
