import { AssetAllocation, Language, SafetyAnalysisResult } from '../types';

export async function askArthSaarthiAI(
  message: string,
  history: { role: 'user' | 'assistant'; text: string }[],
  language: Language
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, language }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.text || 'Thank you for your question. As an educational companion, I encourage understanding fundamental risk before investing.';
  } catch (error) {
    console.warn('AI API call failed, providing educational fallback:', error);
    if (language === 'hi') {
      return `### सरल व्याख्या\nअर्थ-सारथी आपको स्वतंत्र वित्तीय निर्णय लेने में मदद करता है। किसी भी निवेश में रिटर्न के साथ-साथ जोखिम को समझना सबसे जरूरी है।\n\n### याद रखने योग्य बातें\n- कभी भी किसी के वादे पर आंख मूंदकर भरोसा न करें।\n- अपना पैसा एक ही जगह लगाने की बजाय अलग-अलग एसेट्स (इक्विटी, डेट, सोना) में बांटें।\n- अपना यूपीआई पिन या ओटीपी किसी के साथ साझा न करें।`;
    }
    if (language === 'mr') {
      return `### सोपे स्पष्टीकरण\nअर्थ-सारथी तुम्हाला स्वतंत्र आर्थिक निर्णय घेण्यास मदत करते. गुंतवणुकीत परताव्यापेक्षा जोखीम समजून घेणे अधिक महत्त्वाचे आहे.\n\n### लक्षात ठेवण्याच्या गोष्टी\n- कोणत्याही हमखास परताव्याच्या दाव्याला बळी पडू नका.\n- इक्विटी, कर्ज आणि सोने यामध्ये भांडवल विखुरल्याने जोखीम कमी होते.\n- यूपीआय पिन किंवा ओटीपी कोणाशीही शेअर करू नका.`;
    }
    return `### Simple Explanation\nArth-Saarthi helps you understand financial mechanics so you can decide independently. In any investment, evaluating downside risk is just as important as evaluating potential return.\n\n### Real-World Example\nThink of planning a family budget: you keep emergency cash for hospital or repairs, invest some for long-term growth, and protect the rest in stable instruments.\n\n### What to Remember\n- Never invest money you might need within the next 6-12 months into equities.\n- Diversification across Equity, Debt, and Gold prevents catastrophe.\n- SEBI-regulated mutual funds and index funds provide a transparent foundation for beginners.`;
  }
}

export async function analyzeSafetyMessage(
  message: string,
  language: Language
): Promise<SafetyAnalysisResult> {
  try {
    const response = await fetch('/api/analyze-safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Safety analyzer API call failed, using heuristic rules:', error);
    const lower = message.toLowerCase();
    const warningSigns: string[] = [];

    if (/guarantee|100% profit|double your money|2x in|risk[- ]free profit|paisa double/i.test(lower)) {
      warningSigns.push('Promise of guaranteed or unrealistic profits (Regulated capital markets cannot legally guarantee stock returns).');
    }
    if (/hurry|urgent|limited seats|today only|within 1 hour|act fast/i.test(lower)) {
      warningSigns.push('Artificial urgency engineered to bypass critical reasoning.');
    }
    if (/whatsapp|telegram|vip group|pump|insider/i.test(lower)) {
      warningSigns.push('Unregistered tip channels on Telegram/WhatsApp with anonymous admins.');
    }
    if (/otp|upi pin|bank details|password|transfer to personal account/i.test(lower)) {
      warningSigns.push('Solicitation of private payment credentials or personal bank accounts.');
    }

    const riskLevel = warningSigns.length >= 2 ? 'high' : warningSigns.length === 1 ? 'medium' : 'low';

    return {
      riskLevel,
      summary:
        riskLevel === 'high'
          ? 'This message matches known patterns of predatory financial promotion and tip scams.'
          : riskLevel === 'medium'
          ? 'Exercise caution. This offer makes assertions that require rigorous independent verification.'
          : 'No immediate red flags detected, but always independently verify SEBI credentials before investing.',
      warningSigns:
        warningSigns.length > 0
          ? warningSigns
          : ['No explicit red-flag keywords detected; still confirm SEBI registration of the sender.'],
      whatYouCanDo: [
        'Never reveal your UPI PIN or banking OTP.',
        'Verify registered entities directly on the SEBI portal (sebi.gov.in).',
        'Avoid making fund transfers to personal individual bank accounts or unknown UPI handles.',
      ],
    };
  }
}

export async function explainSimulationWithAI(params: {
  scenario: string;
  initialCapital: number;
  finalValue: number;
  changePercent: number;
  allocation: AssetAllocation;
  language: Language;
}): Promise<string> {
  try {
    const response = await fetch('/api/explain-simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.warn('Simulation explanation API failed:', error);
    return `In this simulation, the "${params.scenario}" scenario affected your portfolio based on your asset split. Equities drove the majority of the movement, while your debt and gold allocations acted as shock absorbers. Maintaining a disciplined balance ensures you are not wiped out during severe downturns while still participating in expansions.`;
  }
}
