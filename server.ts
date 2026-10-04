import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const ARTH_SAARTHI_SYSTEM_INSTRUCTION = `You are Arth-Saarthi, a premier financial education assistant designed specifically for first-time investors in India.
Your mission is to explain financial concepts clearly, simply, and neutrally.

CRITICAL MANDATORY RULES:
1. Educate before advising. Never tell users what to buy or sell.
2. NEVER provide personalized investment recommendations, buy/sell recommendations, stock tips, or trading signals.
3. NEVER promise returns or guaranteed profits. If a user asks "Which stock should I buy?" or "Give me a guaranteed 20% return", you MUST decline politely and educate them on how to evaluate risk, diversification, and asset allocation instead.
4. Never present predictions or hypotheses as certainty.
5. Clearly identify hypothetical simulations.
6. Use simple, crisp language. Avoid heavy financial jargon; if you use a term (like NAV, CAGR, Expense Ratio), immediately explain it in plain terms.
7. Use everyday Indian examples (groceries, school fees, milk/chai prices, rent, auto rickshaw fares, buying a scooter or gold during Diwali).
8. Respect the selected language: respond in the user's selected language using its native script (Devanagari, Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Gurmukhi, Odia, Arabic/Urdu, etc.). Understand Hinglish queries naturally.
9. Admit uncertainty whenever market variables are involved.
10. Never invent facts, data, or SEBI regulations.
11. Encourage independent decision-making.
12. NEVER request sensitive financial information, passwords, UPI PINs, card CVVs, bank credentials, or OTPs.

FORMATTING:
Structure your response cleanly using concise headings:
### Simple Explanation
[1-2 clear paragraphs]
### Real-World Example
[A relatable Indian scenario]
### What to Remember
[2-3 bullet points]
### Key Risks to Keep in Mind
[1-2 bullet points on what can go wrong]

Only include relevant sections. Keep explanations concise, warm, professional, and readable on a smartphone screen.`;

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  or: 'Odia (ଓଡ଼ିଆ)',
  as: 'Assamese (অসমীয়া)',
  ur: 'Urdu (اردو)',
  sa: 'Sanskrit (संस्कृतम्)',
  ne: 'Nepali (नेपाली)',
  kok: 'Konkani (कोंकणी)',
  ks: 'Kashmiri (کٲشُر / कश्मीरी)',
  sd: 'Sindhi (سنڌي / सिन्धी)',
  mai: 'Maithili (मैथिली)',
  doi: 'Dogri (डोगरी)',
  mni: 'Manipuri (মৈতৈলোন্)',
};

function getLanguageInstruction(code: string): string {
  const name = LANGUAGE_NAMES[code] || 'English';
  return `USER_PREFERRED_LANGUAGE = ${name} (code: ${code}).
The user might input their question in English, Hinglish (mix of Hindi & English words), or their local script.
Understand the input naturally and respond fluently in ${name}.
Retain standard, widely recognized financial acronyms (like SIP, NAV, FD, IPO, SEBI, UPI) while providing their explanation in ${name}.`;
}

async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || err?.status === 503;
      if (isTransient && i < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// 1. Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      return res.status(200).json({
        text: `### Simple Explanation\nArth-Saarthi is running in educational offline mode. To enable real-time Gemini AI explanations, please ensure a valid GEMINI_API_KEY is configured in your Secrets.\n\n### What to Remember\n- Systematic Investment Plans (SIP) help average out market volatility.\n- Diversifying across equities, debt, gold, and cash reduces risk.\n- Never share your UPI PIN or OTP with anyone.`,
      });
    }

    const langPrompt = getLanguageInstruction(language);

    // Construct conversation contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: `${message}\n\n[Language requirement: ${langPrompt}]` }],
    });

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: ARTH_SAARTHI_SYSTEM_INSTRUCTION,
          temperature: 0.5,
        },
      })
    );

    const responseText = response.text || 'Unable to generate response. Please try asking in another way.';
    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    res.status(200).json({
      text: `### Simple Explanation\nArth-Saarthi is experiencing high network traffic. Please try asking your question again in a moment.\n\n### Key Principle\nUnderstanding risk and diversification is the foundation of sound investing. Never rush into an investment based on short-term excitement.`,
    });
  }
});

// 2. Safety Message Analyzer Endpoint
app.post('/api/analyze-safety', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    if (!ai) {
      // Deterministic rule-based fallback
      const lower = message.toLowerCase();
      const warningSigns: string[] = [];
      if (/guarantee|100% profit|double your money|2x in|risk[- ]free profit/i.test(lower)) {
        warningSigns.push('Promise of guaranteed or risk-free returns (No legitimate market investment guarantees fixed profits).');
      }
      if (/hurry|urgent|limited seats|today only|within 1 hour|act fast/i.test(lower)) {
        warningSigns.push('High psychological pressure and artificial urgency to prevent you from researching.');
      }
      if (/whatsapp|telegram|vip group|pump|insider/i.test(lower)) {
        warningSigns.push('Unregulated private messaging channels (Telegram/WhatsApp groups are frequently used for illegal pump-and-dump schemes).');
      }
      if (/otp|upi pin|bank details|password|transfer to personal account/i.test(lower)) {
        warningSigns.push('Request for sensitive personal or payment authentication credentials.');
      }

      const riskLevel = warningSigns.length >= 2 ? 'high' : warningSigns.length === 1 ? 'medium' : 'low';

      return res.json({
        riskLevel,
        summary:
          riskLevel === 'high'
            ? 'This message displays classic characteristics of high-risk financial manipulation or scam tactics.'
            : riskLevel === 'medium'
            ? 'This message contains questionable claims that require caution and independent verification.'
            : 'No immediate red flags detected, but always verify before transferring any funds.',
        warningSigns:
          warningSigns.length > 0
            ? warningSigns
            : ['No overt pressure or guaranteed return promises found, but proceed with standard caution.'],
        whatYouCanDo: [
          'Never share your UPI PIN, banking passwords, or OTPs.',
          'Verify whether the entity is registered with SEBI on sebi.gov.in.',
          'Remember: Higher promised return always entails higher risk.',
        ],
      });
    }

    const langName = LANGUAGE_NAMES[language] || 'English';
    const langInstruction = `Output the summary, warning signs, and action items in ${langName}.`;

    const prompt = `Analyze this financial message, tip, or advertisement for suspicious traits, scams, or misleading claims:
"""
${message}
"""

Instructions:
- Look for: guaranteed returns, urgency/pressure, unrealistic claims, payment requests to personal accounts, unregistered advisory, demands for sensitive info.
- Do NOT label something an absolute scam without reasonable evidence; characterize as "Potential warning signs".
- Provide practical steps the user can take.
- ${langInstruction}`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are an expert financial consumer protection auditor in India. Evaluate messages objectively and return a structured JSON response.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: 'Must be "low", "medium", or "high"',
              },
              summary: {
                type: Type.STRING,
                description: '1-2 sentence neutral summary of the evaluation',
              },
              warningSigns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of specific warning indicators detected',
              },
              whatYouCanDo: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 actionable safety measures',
              },
            },
            required: ['riskLevel', 'summary', 'warningSigns', 'whatYouCanDo'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-safety:', error);
    res.status(500).json({
      error: 'Failed to analyze message safety',
      riskLevel: 'medium',
      summary: 'Automated scan encountered a temporary issue. Please treat unknown investment offers with high skepticism.',
      warningSigns: ['Could not complete AI audit. Be wary of guaranteed returns, urgent deadlines, and unverified Telegram/WhatsApp tips.'],
      whatYouCanDo: [
        'Do not send money to any unverified UPI handle or private account.',
        'Check SEBI registration on sebi.gov.in before trusting any investment advisor.',
      ],
    });
  }
});

// 3. Explain Simulation Endpoint
app.post('/api/explain-simulation', async (req, res) => {
  try {
    const { scenario = 'Market Scenario', initialCapital = 100000, finalValue = 100000, changePercent = 0, allocation, language = 'en' } = req.body;
    const alloc = allocation || { equity: 40, debt: 30, gold: 20, cash: 10 };

    if (!ai) {
      return res.json({
        explanation: `In the "${scenario}" scenario, equities experience sharp fluctuations while debt instruments and gold provide stability and hedging. Diversification protects against deep single-asset losses.`,
      });
    }

    const langName = LANGUAGE_NAMES[language] || 'English';
    const langInstruction = `Explain in simple, clear ${langName}. Retain standard financial acronyms like SIP, NAV, FD, IPO.`;

    const prompt = `A first-time investor ran an educational simulation:
- Starting Capital: ₹${initialCapital}
- Allocation: Equity ${alloc.equity ?? 40}%, Debt ${alloc.debt ?? 30}%, Gold ${alloc.gold ?? 20}%, Cash ${alloc.cash ?? 10}%
- Scenario tested: "${scenario}"
- Result: Portfolio ended at ₹${finalValue} (${Number(changePercent) > 0 ? '+' : ''}${changePercent}%)

Explain in 3 short, easy-to-understand paragraphs:
1. Why this happened (how the asset classes reacted to this scenario).
2. How the user's specific allocation helped or exposed them (e.g., did gold hedge equity losses, or did high cash drag returns).
3. The key educational takeaway for a beginner.

Rules:
- Strictly educational. No buy/sell advice.
- Relatable Indian context.
- ${langInstruction}`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: ARTH_SAARTHI_SYSTEM_INSTRUCTION,
          temperature: 0.4,
        },
      })
    );

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error('Error in /api/explain-simulation:', error?.message || error);
    res.status(200).json({
      explanation: 'In this scenario, diversification across multiple asset classes protected your portfolio. When equities fell, safer assets like gold and fixed income cushioned the impact.',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arth-Saarthi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
