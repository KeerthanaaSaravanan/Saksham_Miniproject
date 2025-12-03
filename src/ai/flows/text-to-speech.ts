'use server';
/**
 * @fileOverview A flow for converting text to speech with different voice profiles.
 * 
 * - textToSpeech - A function that converts text to speech.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const TextToSpeechInputSchema = z.object({
    text: z.string().describe("The text to be converted to speech."),
    profile: z.enum(['normal', 'slow_sld', 'fast']).optional().default('normal').describe("The voice profile to use."),
});

const TextToSpeechOutputSchema = z.object({
    media: z.string().describe("The base64 encoded audio data with data URI."),
});

export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}

const textToSpeechFlow = ai.defineFlow(
    {
      name: 'textToSpeechFlow',
      inputSchema: TextToSpeechInputSchema,
      outputSchema: TextToSpeechOutputSchema,
    },
    async (input) => {
      let promptText = input.text;
      let rate = "100%";
      let pitch = "0st";
      
      // Sanitize text for SSML
      const sanitizedText = input.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      switch (input.profile) {
          case 'slow_sld':
              promptText = `<speak><prosody rate="85%"><p><s>${sanitizedText.replace(/\./g, '.</s><s><break time="500ms"/>')}</s></p></prosody></speak>`;
              break;
          case 'fast':
              promptText = `<speak><prosody rate="115%"><p><s>${sanitizedText}</s></p></prosody></speak>`;
              break;
          case 'normal':
          default:
              promptText = `<speak><p><s>${sanitizedText}</s></p></speak>`;
              break;
      }
        
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: promptText,
      });

      if (!media) {
        throw new Error('no media returned');
      }
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      return {
        media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
      };
    }
);

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return textToSpeechFlow(input);
}
