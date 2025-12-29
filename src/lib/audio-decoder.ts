// Helper to decode Base64
function atobUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM data from Gemini TTS into an AudioBuffer
export async function decodeGeminiAudio(
  base64Data: string,
  audioContext: AudioContext,
  sampleRate: number = 24000 // Gemini TTS default
): Promise<AudioBuffer> {
  const pcmData = atobUint8Array(base64Data);
  
  // Gemini returns 16-bit PCM. We need to convert it to Float32 [-1.0, 1.0]
  const int16Data = new Int16Array(pcmData.buffer);
  const float32Data = new Float32Array(int16Data.length);
  
  for (let i = 0; i < int16Data.length; i++) {
    // Normalize Int16 to Float32
    float32Data[i] = int16Data[i] / 32768.0;
  }

  const buffer = audioContext.createBuffer(1, float32Data.length, sampleRate);
  buffer.getChannelData(0).set(float32Data);
  
  return buffer;
}
