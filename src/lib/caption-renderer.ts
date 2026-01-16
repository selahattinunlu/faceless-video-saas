import { CaptionStyleConfig, CaptionStyleId, CaptionPosition } from '@/types';
import { getCaptionStyle } from './caption-styles';
import { WordTiming, estimateWordTimings, getCurrentWordIndex } from './word-timing';

export interface CaptionRenderOptions {
  text: string;
  styleId: CaptionStyleId;
  position: CaptionPosition;
  canvasWidth: number;
  canvasHeight: number;
  durationMs?: number;
  elapsedMs?: number;
}

interface WordChunk {
  words: string[];
  startIndex: number;
  startTime: number;
  endTime: number;
}

export class CaptionRenderer {
  private ctx: CanvasRenderingContext2D;
  private style: CaptionStyleConfig;
  private wordTimings: WordTiming[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.style = getCaptionStyle('classic');
  }

  /**
   * Sets up the renderer for a new caption with optional animation.
   */
  setup(text: string, styleId: CaptionStyleId, durationMs?: number): void {
    this.style = getCaptionStyle(styleId);

    if (this.style.supportsAnimation && durationMs) {
      this.wordTimings = estimateWordTimings(text, durationMs);
    } else {
      this.wordTimings = [];
    }
  }

  /**
   * Renders a static caption (no animation).
   */
  renderStatic(options: CaptionRenderOptions): void {
    const { text, styleId, position, canvasWidth, canvasHeight } = options;
    this.style = getCaptionStyle(styleId);

    const lines = this.wrapText(text, canvasWidth - 40);
    const lineHeight = this.style.textStyle.fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;
    const captionY = this.getCaptionY(position, canvasHeight, totalHeight);

    // Draw background
    if (this.style.backgroundStyle.enabled) {
      this.drawBackground(canvasWidth, captionY, totalHeight, position);
    }

    // Draw text
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.applyTextStyle();

    lines.forEach((line, i) => {
      const y = captionY - totalHeight / 2 + i * lineHeight + lineHeight / 2;
      this.drawText(line, canvasWidth / 2, y);
    });
  }

  /**
   * Renders an animated caption with karaoke effect - shows only 2 words at a time.
   */
  renderAnimated(options: CaptionRenderOptions): void {
    const { text, styleId, position, canvasWidth, canvasHeight, durationMs, elapsedMs } = options;

    if (!durationMs || elapsedMs === undefined) {
      this.renderStatic(options);
      return;
    }

    this.style = getCaptionStyle(styleId);

    if (!this.style.supportsAnimation) {
      this.renderStatic(options);
      return;
    }

    // Setup word timings if not already done
    if (this.wordTimings.length === 0) {
      this.wordTimings = estimateWordTimings(text, durationMs);
    }

    const wordsPerChunk = this.style.animationStyle?.wordsPerChunk || 2;
    const chunks = this.createWordChunks(wordsPerChunk);
    const currentChunk = this.getCurrentChunk(chunks, elapsedMs);

    if (!currentChunk) {
      return;
    }

    const currentWordIndex = getCurrentWordIndex(this.wordTimings, elapsedMs);
    const chunkText = currentChunk.words.join(' ');

    // Calculate dimensions
    this.applyTextStyle();
    const lineHeight = this.style.textStyle.fontSize * 1.3;
    const totalHeight = lineHeight;
    const captionY = this.getCaptionY(position, canvasHeight, totalHeight);

    // Draw background for chunk
    if (this.style.backgroundStyle.enabled) {
      this.drawChunkBackground(chunkText, canvasWidth, captionY);
    }

    // Draw words with individual highlighting
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const words = currentChunk.words;
    const totalWidth = this.ctx.measureText(chunkText).width;
    let x = (canvasWidth - totalWidth) / 2;

    words.forEach((word, i) => {
      const globalIndex = currentChunk.startIndex + i;
      const isHighlighted = globalIndex <= currentWordIndex;
      const wordWidth = this.ctx.measureText(word).width;
      const spaceWidth = this.ctx.measureText(' ').width;

      if (isHighlighted && this.style.textStyle.highlightColor) {
        this.applyTextStyle(true);
      } else {
        this.applyTextStyle(false);
      }

      this.drawText(word, x + wordWidth / 2, captionY, isHighlighted);

      x += wordWidth + spaceWidth;
    });
  }

  /**
   * Renders caption based on style's animation support.
   */
  render(options: CaptionRenderOptions): void {
    const style = getCaptionStyle(options.styleId);

    if (style.supportsAnimation && options.durationMs && options.elapsedMs !== undefined) {
      this.renderAnimated(options);
    } else {
      this.renderStatic(options);
    }
  }

  private getCaptionY(position: CaptionPosition, canvasHeight: number, textHeight: number): number {
    if (position === 'center') {
      return canvasHeight / 2;
    }
    // bottom
    return canvasHeight - 100;
  }

  private createWordChunks(wordsPerChunk: number): WordChunk[] {
    const chunks: WordChunk[] = [];

    for (let i = 0; i < this.wordTimings.length; i += wordsPerChunk) {
      const chunkTimings = this.wordTimings.slice(i, i + wordsPerChunk);
      chunks.push({
        words: chunkTimings.map(t => t.word),
        startIndex: i,
        startTime: chunkTimings[0].startTime,
        endTime: chunkTimings[chunkTimings.length - 1].endTime,
      });
    }

    return chunks;
  }

  private getCurrentChunk(chunks: WordChunk[], elapsedMs: number): WordChunk | null {
    for (let i = chunks.length - 1; i >= 0; i--) {
      if (elapsedMs >= chunks[i].startTime) {
        return chunks[i];
      }
    }
    return chunks[0] || null;
  }

  private wrapText(text: string, maxWidth: number): string[] {
    this.applyTextStyle();
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private drawBackground(canvasWidth: number, captionY: number, textHeight: number, position: CaptionPosition): void {
    const { backgroundStyle } = this.style;
    const padding = backgroundStyle.padding;
    const bgHeight = textHeight + padding * 2;
    const bgY = captionY - textHeight / 2 - padding;

    this.ctx.fillStyle = backgroundStyle.color;

    if (backgroundStyle.borderRadius > 0) {
      this.roundRect(
        0,
        bgY,
        canvasWidth,
        bgHeight,
        backgroundStyle.borderRadius
      );
    } else {
      this.ctx.fillRect(0, bgY, canvasWidth, bgHeight);
    }
  }

  private drawChunkBackground(chunkText: string, canvasWidth: number, captionY: number): void {
    const { backgroundStyle, textStyle } = this.style;
    const padding = backgroundStyle.padding;

    this.applyTextStyle();
    const textWidth = this.ctx.measureText(chunkText).width;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textStyle.fontSize + padding * 2;
    const bgX = (canvasWidth - bgWidth) / 2;
    const bgY = captionY - bgHeight / 2;

    this.ctx.fillStyle = backgroundStyle.color;

    if (backgroundStyle.borderRadius > 0) {
      this.roundRect(bgX, bgY, bgWidth, bgHeight, backgroundStyle.borderRadius);
    } else {
      this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    }
  }

  private applyTextStyle(highlight: boolean = false): void {
    const { textStyle } = this.style;

    this.ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px ${textStyle.fontFamily}`;
    this.ctx.fillStyle = highlight && textStyle.highlightColor
      ? textStyle.highlightColor
      : textStyle.color;

    // Apply shadow
    if (textStyle.shadowColor) {
      this.ctx.shadowColor = highlight && this.style.id === 'neon'
        ? (textStyle.highlightColor || textStyle.shadowColor)
        : textStyle.shadowColor;
      this.ctx.shadowBlur = textStyle.shadowBlur || 0;
      this.ctx.shadowOffsetX = textStyle.shadowOffsetX || 0;
      this.ctx.shadowOffsetY = textStyle.shadowOffsetY || 0;
    } else {
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
    }
  }

  private drawText(text: string, x: number, y: number, highlight: boolean = false): void {
    const { textStyle } = this.style;

    // Draw stroke if defined
    if (textStyle.strokeColor && textStyle.strokeWidth) {
      this.ctx.strokeStyle = textStyle.strokeColor;
      this.ctx.lineWidth = textStyle.strokeWidth;
      this.ctx.lineJoin = 'round';
      this.ctx.strokeText(text, x, y);
    }

    this.ctx.fillText(text, x, y);
  }

  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

/**
 * Helper function to create and render caption in one call.
 */
export function renderCaption(
  ctx: CanvasRenderingContext2D,
  options: CaptionRenderOptions
): void {
  const renderer = new CaptionRenderer(ctx);
  renderer.render(options);
}
