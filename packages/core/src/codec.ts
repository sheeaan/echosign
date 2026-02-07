import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SemanticFields, SemanticCode, DecodedAlert } from './types.js';
import { AlertType } from './types.js';

/** Map 2-char type codes to AlertType enum values */
const TYPE_MAP: Record<string, number> = {
  SO: AlertType.SOS,
  MD: AlertType.Medical,
  FI: AlertType.Fire,
  FL: AlertType.Flood,
  EQ: AlertType.Earthquake,
  IN: AlertType.Infra,
  EV: AlertType.Evacuation,
  AC: AlertType.AllClear,
  SC: AlertType.Supply,
  RC: AlertType.Rescue,
  TS: AlertType.Flood, // tsunami → flood category
};

/** Reverse map AlertType enum values to 2-char codes */
const REVERSE_TYPE_MAP: Record<number, string> = {};
for (const [code, val] of Object.entries(TYPE_MAP)) {
  if (!(val in REVERSE_TYPE_MAP)) {
    REVERSE_TYPE_MAP[val] = code;
  }
}

/** Alert type to human-readable name */
const ALERT_NAMES: Record<number, string> = {
  [AlertType.SOS]: 'SOS',
  [AlertType.Medical]: 'Medical Emergency',
  [AlertType.Fire]: 'Fire',
  [AlertType.Flood]: 'Flood',
  [AlertType.Earthquake]: 'Earthquake',
  [AlertType.Infra]: 'Infrastructure Collapse',
  [AlertType.Evacuation]: 'Evacuation',
  [AlertType.AllClear]: 'All Clear',
  [AlertType.Supply]: 'Supply Request',
  [AlertType.Rescue]: 'Rescue',
};

/** CRC-16/CCITT-FALSE */
export function crc16(data: Uint8Array): number {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc;
}

/** Pack SemanticFields into a 24-byte binary code */
export function packFields(fields: SemanticFields): Uint8Array {
  const code = new Uint8Array(24);

  // Byte 0: type → AlertType enum lookup
  code[0] = TYPE_MAP[fields.type] ?? AlertType.SOS;

  // Byte 1: severity
  code[1] = Math.min(9, Math.max(1, fields.severity));

  // Bytes 2-4: latitude as uint24 BE (real_lat * 10000 + 900000)
  const latInt = Math.round(fields.lat * 10000) + 900000;
  code[2] = (latInt >> 16) & 0xFF;
  code[3] = (latInt >> 8) & 0xFF;
  code[4] = latInt & 0xFF;

  // Bytes 5-7: longitude as uint24 BE (real_lon * 10000 + 1800000)
  const lonInt = Math.round(fields.lon * 10000) + 1800000;
  code[5] = (lonInt >> 16) & 0xFF;
  code[6] = (lonInt >> 8) & 0xFF;
  code[7] = lonInt & 0xFF;

  // Byte 8: population (log2 scale upper nibble)
  const popLog = fields.pop > 0 ? Math.min(15, Math.ceil(Math.log2(fields.pop))) : 0;
  code[8] = (popLog & 0x0F) << 4;

  // Bytes 9-16: msg (8 ASCII chars)
  for (let i = 0; i < 8; i++) {
    code[9 + i] = i < fields.msg.length ? fields.msg.charCodeAt(i) : 0;
  }

  // Bytes 17-18: CRC-16 of bytes 0-16
  const crc = crc16(code.slice(0, 17));
  code[17] = (crc >> 8) & 0xFF;
  code[18] = crc & 0xFF;

  // Bytes 19-23: reserved (zeroed)
  return code;
}

/** Unpack a 24-byte code into SemanticFields */
export function unpackFields(code: Uint8Array): SemanticFields {
  const typeVal = code[0];
  const type = REVERSE_TYPE_MAP[typeVal] ?? 'SO';
  const severity = code[1];

  const latInt = (code[2] << 16) | (code[3] << 8) | code[4];
  const lat = (latInt - 900000) / 10000;

  const lonInt = (code[5] << 16) | (code[6] << 8) | code[7];
  const lon = (lonInt - 1800000) / 10000;

  const popLog = (code[8] >> 4) & 0x0F;
  const pop = popLog > 0 ? Math.pow(2, popLog) : 0;

  let msg = '';
  for (let i = 9; i < 17; i++) {
    if (code[i] !== 0) msg += String.fromCharCode(code[i]);
  }

  return { type, severity, lat, lon, pop, msg };
}

/** Verify CRC-16 checksum in bytes 17-18 */
export function verifyChecksum(code: Uint8Array): boolean {
  const expected = crc16(code.slice(0, 17));
  const actual = (code[17] << 8) | code[18];
  return expected === actual;
}

/** Convert bytes to hex string */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Convert hex string to bytes */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/** Get human-readable alert type name */
export function getAlertName(code: Uint8Array): string {
  return ALERT_NAMES[code[0]] ?? 'Unknown';
}

const ENCODE_SYSTEM_PROMPT = `You are the COGNITIVE CODEC for EchoSign — an AI-Native Emergency Triage System.

Your mission: Act as the "Gatekeeper" that filters noise, prioritizes life-saving data, and manages bandwidth in disaster scenarios.

## 🛑 CRITICAL INSTRUCTIONS

### STEP 1: GATEKEEPER (Filter Non-Emergencies)
Analyze if the input is a REAL EMERGENCY requiring immediate response.

**REJECT immediately if:**
- Personal/trivial issues (lost pets, minor inconveniences, casual questions)
- Non-urgent requests (routine supply needs, non-critical info)
- Spam, jokes, or test messages

**ACCEPT if:**
- Life-threatening situations (medical, trapped people, imminent danger)
- Infrastructure failures (dam collapse, building collapse, power grid failure)
- Natural disasters (earthquake, flood, fire, tsunami)
- Mass casualty events
- Evacuation needs

### STEP 2: CHAIN-OF-THOUGHT REASONING
If you determine this IS an emergency, provide detailed reasoning:
1. What keywords/context triggered acceptance?
2. What type of emergency is this?
3. How severe is it (1-9 scale)?
4. What's your confidence level (0-1)?

### STEP 3: STRUCTURED OUTPUT
Output ONLY a JSON object with this EXACT structure:

{
  "isEmergency": true/false,
  "reasoning": "Detailed chain-of-thought explanation here",
  "confidence": 0.0-1.0,
  "rejectionReason": "Only if isEmergency=false, explain why",
  "fields": {
    "type": "EQ/FL/FI/TS/EV/MD/SO/RC/IN/SC/AC",
    "severity": 1-9,
    "lat": decimal,
    "lon": decimal,
    "pop": integer,
    "msg": "8 chars max"
  }
}

### TYPE CODES:
- EQ=earthquake, FL=flood, FI=fire, TS=tsunami
- EV=evacuation, MD=medical, SO=SOS, RC=rescue
- IN=infrastructure, SC=supply, AC=all-clear

### SEVERITY SCALE:
1-3=minor, 4-6=serious, 7-8=critical, 9=catastrophic

### RULES:
- Use 0 for unknown lat/lon/pop
- If only city name given, use approximate coordinates
- msg: Abbreviate aggressively (e.g., "TRAPPED", "RISINGWT", "COLLAPSE")
- Be authoritative but don't guess wildly

### EXAMPLES:

Input: "My cat ran away help!"
Output: {"isEmergency": false, "reasoning": "This is a personal pet issue, not a life-threatening emergency.", "confidence": 0.95, "rejectionReason": "Non-emergency: personal pet issue"}

Input: "HELP! Massive flooding at Hoover Dam, water rising fast!"
Output: {"isEmergency": true, "reasoning": "Detected keywords 'flooding' and 'dam'. Hoover Dam is critical infrastructure. Water rising indicates imminent catastrophic failure. This is a mass casualty event.", "confidence": 0.92, "fields": {"type": "IN", "severity": 9, "lat": 36.0156, "lon": -114.7378, "pop": 10000, "msg": "DAMFAIL"}}

Output ONLY valid JSON. No markdown, no explanation outside the JSON.`;

const DECODE_SYSTEM_PROMPT = `You are an emergency alert decoder for disaster-response command centers.

Given a JSON object with fields {type, severity, lat, lon, pop, msg},
reconstruct a clear, actionable emergency alert.

Format your response exactly as:
[ALERT TYPE] — Severity: [X]/9
Location: [decoded lat/lon as place name or coordinates]
Situation: [1-2 sentence description based on type + msg]
Affected: [pop] people (estimated)
Action Required: [inferred from type and severity]

Rules:
- Be authoritative and calm. This is for first responders.
- Do NOT fabricate details not present in the data.
- If msg contains abbreviations, expand them sensibly.
- If pop is 0, say "Unknown number of people affected."`;

/**
 * Encode an emergency message into a 24-byte semantic code using Gemini.
 * Now includes AI triage/filtering and chain-of-thought reasoning.
 */
export async function encodeMessage(text: string, apiKey: string): Promise<SemanticCode> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text }] }],
    systemInstruction: { role: 'model', parts: [{ text: ENCODE_SYSTEM_PROMPT }] },
  });

  const responseText = result.response.text().trim();

  // Parse AI response with metadata
  interface AIResponse {
    isEmergency: boolean;
    reasoning: string;
    confidence: number;
    rejectionReason?: string;
    fields?: SemanticFields;
  }

  const aiResponse: AIResponse = JSON.parse(responseText);

  // If AI rejected as non-emergency, return rejection response
  if (!aiResponse.isEmergency) {
    return {
      bytes: new Uint8Array(24), // Empty bytes for rejected messages
      hex: '',
      fields: { type: '', severity: 0, lat: 0, lon: 0, pop: 0, msg: '' },
      isEmergency: false,
      reasoning: aiResponse.reasoning,
      confidence: aiResponse.confidence,
      rejectionReason: aiResponse.rejectionReason || 'Not classified as emergency',
    };
  }

  // AI accepted as emergency - encode normally
  const fields = aiResponse.fields!;

  // Clamp msg to 8 chars
  fields.msg = fields.msg.slice(0, 8);

  const bytes = packFields(fields);
  const hex = bytesToHex(bytes);

  return {
    bytes,
    hex,
    fields,
    isEmergency: true,
    reasoning: aiResponse.reasoning,
    confidence: aiResponse.confidence,
  };
}

/**
 * Decode a 24-byte semantic code back into a human-readable alert using Gemini.
 */
export async function decodeMessage(
  codeInput: Uint8Array | string,
  apiKey: string,
  verified: boolean | null = null,
): Promise<DecodedAlert> {
  const code = typeof codeInput === 'string' ? hexToBytes(codeInput) : codeInput;

  if (!verifyChecksum(code)) {
    throw new Error('CRC-16 checksum mismatch — data may be corrupted');
  }

  const fields = unpackFields(code);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(fields) }] }],
    systemInstruction: { role: 'model', parts: [{ text: DECODE_SYSTEM_PROMPT }] },
  });

  const text = result.response.text().trim();
  return { text, fields, verified };
}
