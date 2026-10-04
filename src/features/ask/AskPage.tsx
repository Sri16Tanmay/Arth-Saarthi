import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Loader2,
  Volume2,
  VolumeX,
  Trash2,
  HelpCircle,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, Language } from '../../types';
import { translations } from '../../data/translations';
import { askArthSaarthiAI } from '../../services/aiService';
import { voiceController, VoiceState } from '../../services/voiceService';

interface AskPageProps {
  language: Language;
  initialQuestion?: string | null;
  onClearInitialQuestion?: () => void;
}

export const AskPage: React.FC<AskPageProps> = ({
  language,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Default welcome message
    const welcomeText =
      language === 'hi'
        ? `### सरल व्याख्या\nनमस्ते! मैं अर्थ-सारथी हूँ। मेरा उद्देश्य आपको वित्तीय अवधारणाओं और जोखिम को आसानी से समझाने में मदद करना है।\n\n### याद रखने योग्य बातें\n- मैं किसी विशिष्ट शेयर को खरीदने या बेचने की सलाह नहीं देता।\n- मैं आपको जोखिम, विविधीकरण और सही वित्तीय निर्णय लेने के सिद्धांत सिखाता हूँ।`
        : language === 'mr'
        ? `### सोपे स्पष्टीकरण\nनमस्कार! मी अर्थ-सारथी आहे. नवशिक्या गुंतवणूकदारांना आर्थिक संकल्पना आणि जोखीम समजावून सांगणे हे माझे काम आहे.\n\n### लक्षात ठेवण्याच्या गोष्टी\n- मी कोणत्याही शेअर खरेदी किंवा विक्रीचा सल्ला देत नाही.\n- मी तुम्हाला जोखीम आणि योग्य निर्णय घेण्याची पद्धत समजून घेण्यास मदत करतो.`
        : `### Simple Explanation\nWelcome! I am Arth-Saarthi, your financial literacy and risk companion. I help you understand how financial instruments and market dynamics work so you can make informed, independent decisions.\n\n### What to Remember\n- I do not provide personalized stock tips, buy/sell signals, or guaranteed return schemes.\n- Ask me anything about inflation, compounding, mutual funds, gold, SIPs, or market volatility!`;

    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: welcomeText,
        timestamp: Date.now(),
        language,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    {
      en: 'Should a beginner start with mutual funds or direct stocks?',
      hi: 'शुरुआत करने वाले को म्यूचुअल फंड से शुरुआत करनी चाहिए या शेयर से?',
      mr: 'नवशिक्याने म्युच्युअल फंडाने सुरुवात करावी की थेट शेअर्सने?',
    },
    {
      en: 'How much emergency fund should a first-time earner maintain?',
      hi: 'पहली नौकरी में कितना इमरजेंसी फंड रखना चाहिए?',
      mr: 'पहिल्या नोकरीत किती आणीबाणी निधी (Emergency Fund) ठेवावा?',
    },
    {
      en: 'Why do bank fixed deposits lose value during high inflation?',
      hi: 'महंगाई के समय बैंक एफडी का वास्तविक मूल्य क्यों घट जाता है?',
      mr: 'महागाईच्या काळात बँक मुदत ठेवींचे प्रत्यक्ष मूल्य का कमी होते?',
    },
    {
      en: 'Someone promised 25% guaranteed monthly returns on Telegram. Is it real?',
      hi: 'टेलीग्राम पर किसी ने हर महीने 25% गारंटीड रिटर्न का वादा किया, क्या यह सच है?',
      mr: 'टेलिग्रामवर कोणीतरी २५% हमखास मासिक परताव्याचे वचन दिले, हे खरे असू शकते का?',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle passed initial question from home command bar
  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      if (onClearInitialQuestion) onClearInitialQuestion();
    }
  }, [initialQuestion]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
      language,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const historyPayload = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const reply = await askArthSaarthiAI(query, historyPayload, language);

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: Date.now(),
        language,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoice = () => {
    setVoiceError(null);
    if (voiceState === 'listening') {
      voiceController.stopListening();
      setVoiceState('idle');
      return;
    }

    voiceController.setLanguage(language);
    voiceController.startListening(
      (res) => {
        setInput(res.transcript);
        if (res.isFinal) {
          handleSendMessage(res.transcript);
        }
      },
      (state) => {
        setVoiceState(state);
      },
      (err) => {
        setVoiceError(err);
        setTimeout(() => setVoiceError(null), 5000);
      }
    );
  };

  const handleSpeak = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      voiceController.cancelSpeech();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msg.id);
    voiceController.speak(
      msg.text,
      language,
      () => setSpeakingMessageId(msg.id),
      () => setSpeakingMessageId(null)
    );
  };

  const handleClearHistory = () => {
    voiceController.cancelSpeech();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text:
          language === 'hi'
            ? 'बातचीत रीसेट हो गई है। आप कोई नया वित्तीय सवाल पूछ सकते हैं।'
            : language === 'mr'
            ? 'संभाषण रीसेट केले आहे. आपण नवीन प्रश्न विचारू शकता.'
            : 'Conversation reset. Ask any financial question to understand risk and mechanics.',
        timestamp: Date.now(),
        language,
      },
    ]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-16 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD] shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#141716] tracking-tight">
            Ask Arth-Saarthi
          </h1>
          <p className="text-xs text-[#59605C]">
            Neutral, educational guidance · Never provides buy/sell recommendations
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          title={t.clearHistory}
          className="p-2 rounded-xl text-[#59605C] hover:text-[#141716] hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 transition-all text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? 'bg-[#141716] text-[#FBFBF9] rounded-tr-xs shadow-xs'
                    : 'glass-medium border border-[#E6E4DD] text-[#141716] rounded-tl-xs shadow-2xs'
                }`}
              >
                {/* Text Formatting */}
                <div className="space-y-3">
                  {msg.text.split('### ').map((section, idx) => {
                    if (!section.trim()) return null;
                    const lines = section.split('\n');
                    const heading = lines[0].trim();
                    const body = lines.slice(1).join('\n').trim();

                    if (idx === 0 && !section.startsWith('###')) {
                      return (
                        <p key={idx} className="whitespace-pre-line">
                          {section}
                        </p>
                      );
                    }

                    return (
                      <div key={idx} className="pt-1 first:pt-0">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-1">
                          {heading}
                        </h4>
                        <div className="whitespace-pre-line text-sm text-[#141716] opacity-90 leading-relaxed">
                          {body}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Speak button for assistant messages */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between">
                    <span className="text-[11px] text-[#59605C]">
                      Arth-Saarthi AI
                    </span>
                    <button
                      onClick={() => handleSpeak(msg)}
                      className="inline-flex items-center gap-1 text-xs text-[#59605C] hover:text-[#166534] transition-colors cursor-pointer"
                      title={speakingMessageId === msg.id ? 'Stop reading' : 'Read aloud'}
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-rose-600 text-[11px]">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start">
            <div className="glass-light rounded-2xl p-4 border border-[#E6E4DD] flex items-center gap-2 text-xs text-[#59605C]">
              <Loader2 className="w-4 h-4 animate-spin text-[#166534]" />
              <span>{t.commandBarProcessing}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions when history is short */}
      {messages.length <= 2 && (
        <div className="py-2 flex flex-col gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#59605C]">
            Suggested questions:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQuestions.map((item, idx) => {
              const qText = (item as Record<string, string>)[language] || item.en;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qText)}
                  className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 text-left text-xs font-medium text-[#141716] border border-[#E6E4DD] hover:border-neutral-300 transition-all cursor-pointer shadow-2xs"
                >
                  {qText}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Form at bottom */}
      <div className="pt-2 shrink-0">
        <div className="glass-premium rounded-2xl p-2 sm:p-2.5 border border-[#E6E4DD] shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                voiceState === 'listening'
                  ? t.commandBarListening
                  : t.commandBarPlaceholder
              }
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#141716] placeholder-[#59605C]/70 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleToggleVoice}
              aria-label="Voice input"
              className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
                voiceState === 'listening'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-black/[0.04] text-[#59605C] hover:text-[#141716]'
              }`}
            >
              {voiceState === 'listening' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              className="p-2 sm:p-2.5 rounded-xl bg-[#141716] text-[#FBFBF9] hover:bg-neutral-800 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {voiceError && (
            <div className="mt-2 px-3 py-1 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200 flex justify-between items-center">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
