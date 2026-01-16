export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  index: number;
}

/**
 * Estimates word timings based on duration and word count.
 * Uses syllable-based weighting for more natural timing.
 */
export function estimateWordTimings(
  text: string,
  durationMs: number
): WordTiming[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];

  // Estimate syllables per word for weighting
  const syllableCounts = words.map(countSyllables);
  const totalSyllables = syllableCounts.reduce((a, b) => a + b, 0);

  const timings: WordTiming[] = [];
  let currentTime = 0;

  words.forEach((word, index) => {
    const weight = syllableCounts[index] / totalSyllables;
    const wordDuration = durationMs * weight;

    timings.push({
      word,
      startTime: currentTime,
      endTime: currentTime + wordDuration,
      index,
    });

    currentTime += wordDuration;
  });

  return timings;
}

/**
 * Simple syllable counter for English words.
 * Uses vowel counting with adjustments for common patterns.
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 2) return 1;

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent 'e'
  if (word.endsWith('e') && !word.endsWith('le')) {
    count = Math.max(1, count - 1);
  }

  // Common suffixes that don't add syllables
  if (word.endsWith('ed') && !word.endsWith('ted') && !word.endsWith('ded')) {
    count = Math.max(1, count - 1);
  }

  return Math.max(1, count);
}

/**
 * Gets the current word index based on elapsed time.
 */
export function getCurrentWordIndex(
  timings: WordTiming[],
  elapsedMs: number
): number {
  for (let i = timings.length - 1; i >= 0; i--) {
    if (elapsedMs >= timings[i].startTime) {
      return i;
    }
  }
  return 0;
}

/**
 * Gets word timing progress (0-1) for smooth transitions.
 */
export function getWordProgress(
  timing: WordTiming,
  elapsedMs: number
): number {
  if (elapsedMs <= timing.startTime) return 0;
  if (elapsedMs >= timing.endTime) return 1;

  return (elapsedMs - timing.startTime) / (timing.endTime - timing.startTime);
}
