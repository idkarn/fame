import { GET } from '../client'
import type { Game } from '../games'

export async function getPublicGame(
  id: string,
): Promise<Omit<Game, 'ownerId' | 'projectName'>> {
  return await GET(`/public/games/${id}`)
}
