import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { ChatRequest, ChatResponse, LanguageCode } from "@shared/api";

// Simple in-memory session context
const sessions = new Map<string, { lastIntent?: string; lastTopic?: string }>();

// Minimal multilingual FAQ dataset
const FAQ: Array<{
  intent: string;
  topic: string;
  patterns: string[]; // keyword triggers across languages
  answers: Partial<Record<LanguageCode, string>>;
}> = [
  {
    intent: "fees_deadline",
    topic: "fee_deadlines",
    patterns: [
      "fee deadline",
      "fees last date",
      "शुल्क जमा",
      "फीस आखिरी",
      "फीस की अंतिम तारीख",
      "फीस कब",
      "fees kab",
      "ফি শেষ তারিখ",
      "शुल्क", // mr/hi
      "शुल्क अंतिम",
      "கட்டணம் கடைசி தேதி",
    ],
    answers: {
      en: "Upcoming fee deadlines: Semester I – 15 Aug, Semester II – 15 Jan. Pay online via the student portal.",
      hi: "आगामी शुल्क अंतिम तिथियाँ: सेमेस्टर I – 15 अगस्त, सेमेस्टर II – 15 जनवरी। भुगतान छात्र पोर्टल पर ऑनलाइन करें।",
      bn: "ফি জমার শেষ তারিখ: সেমেস্টার I – ১৫ অগাস্ট, সেমেস্টার II – ১৫ জানুয়ারি। স্টুডেন্ট পোর্টালের মাধ্যমে পরিশোধ করুন।",
      mr: "शुल्क भरणाची अंतिम तारीख: सेमेस्टर I – १५ ऑगस्ट, सेमेस्टर II – १५ जानेवारी. विद्यार्थी पोर्टलवर ऑनलाइन भरा.",
      ta: "கட்டணம் செலுத்தும் கடைசி தேதி: செமஸ்டர் I – ஆகஸ்ட் 15, செமஸ்டர் II – ஜனவரி 15. மாணவர் போர்டலில் ஆன்லைனில் செலுத்தவும்.",
    },
  },
  {
    intent: "scholarship_forms",
    topic: "scholarships",
    patterns: [
      "scholarship",
      "scholarship form",
      "वृत्ति",
      "स्कॉलरशिप",
      "বৃত্তি",
      "शिष्यवृत्ती",
      "உதவித்தொகை",
    ],
    answers: {
      en: "Scholarship forms are available on the portal > Finance > Scholarships. Submit before 30 Sept with income certificate.",
      hi: "स्कॉलरशिप फॉर्म पोर्टल > वित्त > स्कॉलरशिप में उपलब्ध हैं। आय प्रमाण पत्र के साथ 30 सितम्बर से पहले जमा करें।",
      bn: "স্কলারশিপ ফর্ম পোর্টাল > Finance > Scholarships-এ পাওয়া যায়। আয়ের সনদসহ ৩০ সেপ্টেম্বরের মধ্যে জমা দিন।",
      mr: "शिष्यवृत्ती फॉर्म पोर्टल > Finance > Scholarships येथे उपलब्ध आहेत. उत्प���्न प्रमाणपत्रासह ३० सप्टेंबरपूर्वी सादर करा.",
      ta: "உதவித்தொகை படிவங்கள் போர்டல் > Finance > Scholarships பகுதியில் உள்ளன. வருமானச் சான்றுடன் செப் 30க்கு முன் சமர்ப்பிக்கவும்.",
    },
  },
  {
    intent: "timetable_change",
    topic: "timetable",
    patterns: [
      "timetable",
      "class timings",
      "समय सारिणी",
      "टाइमटेबल",
      "সময়সূচী",
      "वेळापत्रक",
      "நேர அட்டவணை",
    ],
    answers: {
      en: "Timetable updates are posted daily at 7am on the portal dashboard and the notice board channel.",
      hi: "समय सारिणी अपडेट रोज सुबह 7 बजे पोर्टल डैशबोर्ड और नोटिस बोर्ड चैनल पर पोस्ट किए जाते हैं।",
      bn: "টাইমটেবিল আপডেট প্রতিদিন সকাল ৭টায় পোর্টাল ড্যাশবোর্ড এবং নোটিস বোর্ড চ্যানেলে পোস্ট হয়।",
      mr: "वेळापत्रकातील अद्यतने दररोज सकाळी ७ वाजता पोर्टल डॅशबोर्ड आणि नोटिस बोर्ड चॅनेलवर पोस्ट होतात.",
      ta: "நேர அட்டவணை புதுப்பிப்புகள் தினமும் காலை 7 மணிக்கு போர்டல் டாஷ்போர்டு மற்றும் அறிவிப்பு சேனலில் இடப்படுகின்றன.",
    },
  },
];

const LANGS: LanguageCode[] = ["en", "hi", "bn", "mr", "ta"];

const LOG_DIR = path.join(process.cwd(), "server", "logs");
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}
function todayFile(prefix: string) {
  const d = new Date();
  const iso = d.toISOString().slice(0, 10);
  return path.join(LOG_DIR, `${prefix}-${iso}.jsonl`);
}
function maskPII(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (m) => "<email>")
    .replace(/\b\+?\d[\d\s-]{7,}\b/g, () => "<phone>");
}

function detectLanguage(s: string): LanguageCode {
  // Rough script detection; defaults to English
  if (/[\u0900-\u097F]/.test(s)) return "hi"; // Devanagari (hi/mr)
  if (/[\u0980-\u09FF]/.test(s)) return "bn"; // Bengali
  if (/[\u0B80-\u0BFF]/.test(s)) return "ta"; // Tamil
  return "en";
}

function matchIntent(q: string): { intent?: string; topic?: string; confidence: number } {
  const lower = q.toLowerCase();
  let best: { intent?: string; topic?: string; confidence: number } = {
    confidence: 0,
  };
  for (const item of FAQ) {
    let score = 0;
    for (const p of item.patterns) {
      if (lower.includes(p.toLowerCase())) score += 1;
    }
    if (score > 0 && score >= best.confidence) {
      best = { intent: item.intent, topic: item.topic, confidence: Math.min(1, score / 2) };
    }
  }
  return best;
}

export const handleChat: RequestHandler = (req, res) => {
  const body = req.body as ChatRequest | undefined;
  if (!body || !body.sessionId || !body.message) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const session = sessions.get(body.sessionId) ?? {};

  const lang: LanguageCode = body.language ?? detectLanguage(body.message);
  const { intent, topic, confidence } = matchIntent(body.message);

  let fallbackToHuman = false;
  let answer = "";
  let usedTopic = topic ?? session.lastTopic;
  let usedIntent = intent ?? session.lastIntent;

  if (!usedIntent || !usedTopic || confidence < 0.25) {
    fallbackToHuman = true;
    usedTopic = undefined;
    usedIntent = undefined;
    const suggestions: Record<LanguageCode, string> = {
      en: "I couldn't find an exact answer. Please rephrase or request human help.",
      hi: "सटीक उत्तर नहीं मिला। कृपया प्रश्न बदलकर पूछें या मानव सहायता का अनुरोध करें।",
      bn: "সঠিক উত্তর পাওয়া যায়নি। অনুগ্রহ করে প্রশ্নটি বদলে জিজ্ঞাসা করুন বা মানব সহায়তা চান।",
      mr: "तंतोतंत उत्तर सापडले नाही. कृपया प्रश्न पुन्हा मांडावा किंवा मानवी मदत मागा.",
      ta: "சரியான பதில் கிடைக்கவில்லை. தயவு செய்து கேள்வியை மாற்றி கேளுங்கள் அல்லது மனித உதவியை கோருங்கள்.",
    };
    answer = suggestions[lang];
  } else {
    const item = FAQ.find((f) => f.intent === usedIntent);
    const localized = item?.answers[lang] ?? item?.answers.en ?? "";
    answer = localized;
  }

  sessions.set(body.sessionId, { lastIntent: usedIntent, lastTopic: usedTopic });

  const response: ChatResponse = {
    sessionId: body.sessionId,
    answer,
    language: lang,
    intent: usedIntent,
    confidence: Number(confidence.toFixed(2)),
    fallbackToHuman,
    contextTopic: usedTopic,
  };

  try {
    ensureLogDir();
    const line = JSON.stringify({
      t: new Date().toISOString(),
      sessionId: body.sessionId,
      lang,
      q: maskPII(body.message),
      a: maskPII(answer),
      intent: usedIntent,
      topic: usedTopic,
      conf: response.confidence,
      handoff: fallbackToHuman,
    });
    fs.appendFileSync(todayFile("chat"), line + "\n", "utf8");
  } catch {}

  res.json(response);
};
