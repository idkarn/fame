import type { Board } from './boards'
import { DELETE, GET, POST } from './client'

export interface Game {
  id: string
  ownerId: string
  displayName: string
  gameUrl?: string
  projectName: string
  boards: Board[]
}

export async function getAllGames(): Promise<Game[]> {
  return await GET('/games/')
}

export async function getGame(id: string): Promise<Game> {
  return await GET(`/games/${id}`)
}

export async function getPublicGame(
  id: string,
): Promise<Omit<Game, 'ownerId' | 'projectName'>> {
  return await GET(`/public/games/${id}`)
}

export async function createGame(projectName: string): Promise<Game> {
  return await POST('/games/', {
    projectName: projectName,
  })
}

export async function deleteGame(id: string): Promise<string> {
  return await DELETE<string>(`/games/${id}`)
}
