
import { GoogleGenAI, Modality } from "@google/genai";
import { Job, JobCategory, VoiceSearchFilters } from "../types";

const LANGUAGE_LOCALE: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  bn: "bn-IN",
  pa: "pa-IN",
  ml: "ml-IN",
  or: "or-IN",
  as: "as-IN",
  ur: "ur-IN",
  ne: "ne-IN",
  ks: "ur-IN", 
  sd: "ur-IN"  
};

// State for active AI audio
let activeAudioSource: AudioBufferSourceNode | null = null;
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (activeAudioSource) {
    activeAudioSource.stop();
    activeAudioSource = null;
  }
}

/**
 * Encodes a Uint8Array to base64
 */
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string to Uint8Array
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data from the API into an AudioBuffer
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Uses Gemini Flash to generate a natural, localized script for a job announcement.
 */
export async function getJobReadoutText(job: Job, langName: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Create a very natural sounding job announcement for a voice readout in ${langName}.
      This is for a blue-collar worker discovery app called NearbyKaam.
      
      Job Details:
      - Role: ${job.jobRole || job.title}
      - Employer: ${job.employerName}
      - Location: ${job.location.address}
      - Salary: ${job.salaryAmount} per ${job.salaryType}
      - Expiry: ${job.expiryDays} days remaining
      
      Requirements:
      1. Use the target language ${langName} naturally.
      2. Keep it under 25 words.
      3. Start with something friendly like "New job found!"
      4. Explicitly state: "The role is ${job.jobRole || job.title} at ${job.employerName} in ${job.location.address}."
      5. Explicitly state the salary: "The salary is ${job.salaryAmount} per ${job.salaryType}."
      6. Explicitly state the expiry: "This job expires in ${job.expiryDays} days."
      7. Output ONLY the localized spoken text, nothing else.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    return response.text.trim() || `${job.title} at ${job.employerName}`;
  } catch (error) {
    console.error("Failed to generate script", error);
    return `${job.title} at ${job.employerName}. Salary ${job.salaryAmount}. Expires in ${job.expiryDays} days.`;
  }
}

/**
 * Integrated speak function that uses Gemini TTS for premium quality,
 * falling back to browser speechSynthesis for offline/errors.
 */
export async function speakText(text: string, langCode: string = 'en'): Promise<void> {
  stopSpeaking();
  
  if (localStorage.getItem('nearbykaam_mute') === 'true') return;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is great for clear announcements
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1
      );

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      return new Promise((resolve) => {
        source.onended = () => {
          activeAudioSource = null;
          resolve();
        };
        activeAudioSource = source;
        source.start();
      });
    }
  } catch (err) {
    console.error("Gemini TTS failed, falling back to browser TTS", err);
    // Fallback to basic browser TTS
    return new Promise((resolve) => {
      const locale = LANGUAGE_LOCALE[langCode] || "en-IN";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.9;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }
}

export async function parseJobSearch(query: string, langName: string = 'English'): Promise<VoiceSearchFilters> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `User Query: "${query}"` }] }],
      config: {
        systemInstruction: `The user query is in ${langName}. Extract job intent for NearbyKaam.
      Categories: HOTEL, SHOP, GARAGE, DELIVERY, CONSTRUCTION, HOUSE_HELP, SECURITY, OTHER.
      Return JSON with category, keyword, and a short intentSummary in ${langName}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: { type: 'OBJECT' } as any,
          properties: {
            category: { type: 'STRING' },
            keyword: { type: 'STRING' },
            intentSummary: { type: 'STRING' }
          },
          required: ["intentSummary"]
        }
      } as any,
    });
    const data = JSON.parse(response.text || "{}");
    return {
      category: data.category as JobCategory || undefined,
      keyword: data.keyword || undefined,
      intentSummary: data.intentSummary || "Searching..."
    };
  } catch (error) {
    return { intentSummary: "Searching..." };
  }
}
