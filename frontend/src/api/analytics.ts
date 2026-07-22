import { GET } from './client'
import type { Record } from './records'

export async function getRanking(
  boardId: string,
): Promise<Omit<Record, 'boardId' | 'rank'>[]> {
  return await GET(`/boards/${boardId}/analytics/top`)
}
