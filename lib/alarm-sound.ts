/** Client-side alarm audio using /public/alarm.mp3 */

const ALARM_SRC = '/alarm.mp3';

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!audio) {
    audio = new Audio(ALARM_SRC);
    audio.loop = true;
    audio.preload = 'auto';
  }
  return audio;
}

export function setAlarmVolume(volumePercent: number): void {
  const el = getAudio();
  if (!el) return;
  el.volume = Math.min(1, Math.max(0, volumePercent / 100));
}

export async function startAlarmSound(volumePercent = 80): Promise<boolean> {
  const el = getAudio();
  if (!el) return false;

  setAlarmVolume(volumePercent);

  if (!el.paused && !el.ended) return true;

  try {
    el.currentTime = 0;
    await el.play();
    return true;
  } catch (error) {
    console.warn('[Alarm] Could not play sound:', error);
    return false;
  }
}

export function stopAlarmSound(): void {
  const el = getAudio();
  if (!el) return;
  el.pause();
  el.currentTime = 0;
}

export function isAlarmSoundPlaying(): boolean {
  const el = getAudio();
  return Boolean(el && !el.paused && !el.ended);
}

/** Short test burst (~3s) for settings page. */
export async function testAlarmSound(volumePercent = 80): Promise<boolean> {
  const started = await startAlarmSound(volumePercent);
  if (!started) return false;
  window.setTimeout(() => stopAlarmSound(), 3000);
  return true;
}

export function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, ' ').trim().toUpperCase();
}

export const DEMO_OVERLOAD_PLATE = 'KEA 012D';

export function isDemoOverloadVehicle(plateNumber?: string | null): boolean {
  if (!plateNumber) return false;
  return normalizePlate(plateNumber) === DEMO_OVERLOAD_PLATE;
}
