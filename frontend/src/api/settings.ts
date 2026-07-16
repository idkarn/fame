import { GET, PATCH } from './client'

export interface ISettings {
  displayName: string
  gameUrl: string
  projectName: string
  token: string
}

interface ISettingsConfig extends Partial<Omit<ISettings, 'token'>> {}

export async function getSettings(gameId: string): Promise<ISettings> {
  return await GET(`/settings/${gameId}`)
}

export async function setSettings(
  gameId: string,
  newSettings: ISettingsConfig,
) {
  return await PATCH(`/settings/${gameId}`, newSettings)
}
