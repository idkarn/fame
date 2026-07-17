import { DELETE, GET, PATCH, POST } from './client'

export interface Board {
  id: string
  gameId: string
  name: string
}

export async function getBoard(id: string): Promise<Board> {
  return await GET(`/boards/${id}`)
}

export async function createBoard(
  gameId: string,
  name: string,
): Promise<Board> {
  return await POST('/boards/', {
    gameId,
    name,
  })
}

interface BoardConfig {
  name: string
}
export async function updateBoard(
  id: string,
  newBoard: BoardConfig,
): Promise<string> {
  return await PATCH(`/boards/${id}`, newBoard)
}

export async function deleteBoard(id: string): Promise<string> {
  return await DELETE(`/boards/${id}`)
}
