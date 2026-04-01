import * as FileSystem from 'expo-file-system';
import { ANTHROPIC_API_KEY, CLAUDE_MODEL } from '../constants';

const ANALYSIS_PROMPT = `You are an expert podiatrist and orthotic specialist analyzing a foot photograph for custom mold creation and modular spacer placement in a modular footwear system.

Analyze this foot image carefully and return ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:

{
  "measurements": {
    "estimatedLength": <number in mm>,
    "estimatedWidth": <number in mm at ball of foot>,
    "archType": "<Flat|Low|Neutral|High|Very High>",
    "heelWidth": <number in mm>,
    "toeSpread": "<Narrow|Normal|Wide>",
    "footShape": "<Egyptian|Greek|Roman|Germanic|Celtic>"
  },
  "pressureZones": {
    "heelPressure": "<Low|Moderate|High>",
    "ballPressure": "<Low|Moderate|High>",
    "archPressure": "<Low|Moderate|High>",
    "toePressure": "<Low|Moderate|High>"
  },
  "conditions": [<list visible conditions as strings e.g. "Mild Pronation", "Wide Forefoot" — or empty array>],
  "spacerPlacements": [
    {
      "zone": "<zone name>",
      "priority": "<Essential|Recommended|Optional>",
      "position": "<where to place the spacer>",
      "purpose": "<what this spacer corrects or supports>",
      "spacerType": "<e.g. Metatarsal pad, Arch cookie, Heel cup, Toe spreader, Lateral wedge>"
    }
  ],
  "moldNotes": "<2-3 sentences of mold casting notes for this specific foot>",
  "overallAssessment": "<1-2 sentence summary of foot health and key needs>",
  "confidenceLevel": "<Low|Medium|High>",
  "imagingNotes": "<any image quality issues affecting analysis, or 'Image quality acceptable'>"
}

Be realistic and thorough. If image quality is poor, still provide best-guess data but set confidenceLevel to Low.`;

/**
 * Convert a local image URI to base64
 */
export async function uriToBase64(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

/**
 * Send foot image to Claude Vision for analysis
 * @param {string} base64Image - base64 encoded JPEG image
 * @param {string} footSide - 'Left' or 'Right'
 * @returns {Promise<Object>} Analysis result object
 */
export async function analyzeFootImage(base64Image, footSide) {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    throw new Error('Please add your Anthropic API key in src/constants/index.js');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `This is the ${footSide} foot. ${ANALYSIS_PROMPT}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content.map((b) => b.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
