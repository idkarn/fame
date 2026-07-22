import { DELETE, GET } from './client'

export interface Record {
  boardId: string
  playerId: string
  playerName: string
  score: number
  submittedAt: string
  rank: string
}

export async function getRecord(
  boardId: string,
  playerId: string,
): Promise<Record[]> {
  return await GET(`/boards/${boardId}/records/${playerId}`)
}

export async function deleteRecord(
  boardId: string,
  playerId: string,
): Promise<string> {
  return await DELETE(`/boards/${boardId}/records/${playerId}`)
}
