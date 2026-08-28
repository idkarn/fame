import { GET } from './client'

export interface DailyMetric {
  date: string
  total: number
}

export async function getDailyPlayers(boardId: string): Promise<DailyMetric[]> {
  return await GET(`/boards/${boardId}/stats/daily-players`)
}
