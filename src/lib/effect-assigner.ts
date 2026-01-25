import { ImageEffectId } from '@/types';

const EFFECT_SEQUENCE: ImageEffectId[] = [
  'kenburns',
  'zoom-in',
  'pan-left',
  'zoom-out',
  'pan-right',
  'pulse',
];

export function getAutoEffect(sceneNumber: number): ImageEffectId {
  const index = (sceneNumber - 1) % EFFECT_SEQUENCE.length;
  return EFFECT_SEQUENCE[index];
}

export function getRandomEffect(): ImageEffectId {
  const randomIndex = Math.floor(Math.random() * EFFECT_SEQUENCE.length);
  return EFFECT_SEQUENCE[randomIndex];
}
