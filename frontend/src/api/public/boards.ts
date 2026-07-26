import { GET } from '../client'

interface PublicRecord {
  playerName: string
  score: number
}

export async function getPublicBoard(id: string): Promise<PublicRecord[]> {
  return await GET(`/public/boards/${id}`)
}
