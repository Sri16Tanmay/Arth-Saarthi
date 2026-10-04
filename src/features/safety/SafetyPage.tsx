import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  ArrowRight,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Language, SafetyAnalysisResult } from '../../types';
import { translations } from '../../data/translations';
import { analyzeSafetyMessage } from '../../services/aiService';

interface SafetyPageProps {
  language: Language;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({ language }) => {
  const t = translations[language];
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SafetyAnalysisResult | null>(null);

  const sampleMessages = [
    {
      title: 'Guaranteed 35% Weekly Return',
      text: '🔥 100% Guaranteed 35% weekly returns in new automated forex bot! Join our private VIP Telegram group now. Send initial ₹5,000 to UPI handle to activate account before 5 PM today!',
    },
    {
      title: 'SEBI "Insider Tip" 2X in 3 Days',
      text: 'URGENT: Guaranteed 2x profit in 3 days! Buy penny stock ABC tomorrow at market open. Limited insider access for 15 members only. Transfer ₹2,500 advisory fee to join.',
    },
    {
      title: 'Urgent Bank KYC / UPI PIN Phishing',
      text: 'Dear customer, your bank account and debit card will be suspended within 2 hours. Click the link to update your KYC and verify your UPI PIN immediately.',
    },
  ];

  const handleScan = async (textToScan?: string) => {
    const text = (textToScan || inputText).trim();
    if (!text || isScanning) return;

    if (textToScan) {
      setInputText(textToScan);
    }

    setIsScanning(true);
    setResult(null);

    try {
      const data = await analyzeSafetyMessage(text, language);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-16 flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <section className="flex flex-col gap-2 pb-4 border-b border-[#E6E4DD]">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D97706]">
          <Shield className="w-3.5 h-3.5" />
          <span>Consumer Protection & Awareness</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141716] tracking-tight">
          {t.safetyTitle}
        </h1>
        <p className="text-sm text-[#59605C] max-w-2xl leading-relaxed">
          {t.safetySubtitle}
        </p>
      </section>

      {/* Input Box */}
      <section className="glass-premium rounded-2xl p-5 sm:p-6 border border-[#E6E4DD] flex flex-col gap-4 shadow-sm">
        <label htmlFor="safety-input" className="text-xs font-bold uppercase tracking-wider text-[#141716]">
          Paste Suspicious Message, Forward, or Social Media Offer:
        </label>

        <textarea
          id="safety-input"
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.safetyPlaceholder}
          className="w-full p-3.5 rounded-xl bg-white border border-[#E6E4DD] text-sm text-[#141716] placeholder-[#59605C]/70 focus:outline-none focus:ring-2 focus:ring-[#166534]/30"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sample Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-[#59605C] whitespace-nowrap mr-1">
              Sample scams:
            </span>
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleScan(sample.text)}
                className="whitespace-nowrap px-2.5 py-1 text-xs rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#141716] transition-colors cursor-pointer"
              >
                {sample.title}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleScan()}
            disabled={!inputText.trim() || isScanning}
            className="px-5 py-2.5 rounded-xl bg-[#141716] text-[#FBFBF9] hover:bg-neutral-800 disabled:opacity-40 transition-all font-semibold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing message...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t.safetyAnalyzeBtn}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Results View */}
      {result && (
        <section className="glass-medium rounded-2xl p-5 sm:p-7 border border-[#E6E4DD] flex flex-col gap-6 animate-in fade-in duration-200 shadow-sm">
          {/* Risk Level Badge & Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E6E4DD]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#59605C] block mb-1">
                Risk Assessment
              </span>
              <h3 className="text-lg font-bold text-[#141716]">
                {result.summary}
              </h3>
            </div>

            <div
              className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 self-start sm:self-auto ${
                result.riskLevel === 'high'
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : result.riskLevel === 'medium'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-[#166534]/10 text-[#166534] border-[#166534]/30'
              }`}
            >
              {result.riskLevel === 'high' ? (
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              ) : result.riskLevel === 'medium' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-[#166534]" />
              )}
              <span>
                {result.riskLevel === 'high'
                  ? t.riskHigh
                  : result.riskLevel === 'medium'
                  ? t.riskMedium
                  : t.riskLow}
              </span>
            </div>
          </div>

          {/* Potential Warning Signs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.potentialWarningSigns}</span>
            </h4>
            <div className="flex flex-col gap-2">
              {result.warningSigns.map((sign, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-[#E6E4DD] text-xs sm:text-sm text-[#141716] flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0" />
                  <span>{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What You Can Do */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>{t.whatYouCanDo}</span>
            </h4>
            <div className="flex flex-col gap-2">
              {result.whatYouCanDo.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#166534]/[0.04] border border-[#166534]/15 text-xs sm:text-sm text-[#141716] flex items-start gap-2.5 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#166534] mt-2 shrink-0" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEBI Verification Help Note */}
          <div className="p-4 rounded-xl bg-[#F7F7F2] border border-[#E6E4DD] flex items-center justify-between text-xs text-[#59605C]">
            <span>
              Always verify SEBI registration for investment advisors at <strong>sebi.gov.in</strong> before transferring funds.
            </span>
            <a
              href="https://www.sebi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#166534] font-semibold flex items-center gap-1 hover:underline ml-2 shrink-0"
            >
              <span>SEBI Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>
      )}
    </div>
  );
};
