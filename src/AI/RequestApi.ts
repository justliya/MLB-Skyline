// src/RequestApi.ts
import { post, get } from './ResponseApi';

export const startAI = async (channelId: string) =>
  post('https://stream-nodejs-ai-e5d85ed5ce6f.herokuapp.com/start-ai-agent', { channel_id: channelId });

export const stopAI = async (channelId: string) =>
  post('https://stream-nodejs-ai-e5d85ed5ce6f.herokuapp.com/stop-ai-agent', { channel_id: channelId });

export const getLastTenGames = async () =>
  get('https://get-recent-games-114778801742.us-central1.run.app/getLastTenGames');

export const replayGame = async (data: {
  gid: string;
  mode: 'casual' | 'technical';
  user_id: string;
  interval: number;
}) =>
  post('https://replay-114778801742.us-central1.run.app/game-replay', data);

export const pauseGame = async (data: {
  gid: string;
  mode: 'casual' | 'technical';
  user_id: string;
  interval: number;
}) =>
  post('https://replay-114778801742.us-central1.run.app/pause', data);

export const resumeGame = async (data: {
  gid: string;
  mode: 'casual' | 'technical';
  user_id: string;
  interval: number;
}) =>
  post('https://replay-114778801742.us-central1.run.app/resume', data);
