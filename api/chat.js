/**
 * Chatbot API for Sherlock Holmes business card
 * Simple keyword-based responses (no external API key).
 * Deploy on Vercel: /api/chat
 */

const KNOWLEDGE = {
  en: {
    services: 'Services: Surveillance & observation (from £65/hour), Missing persons & tracing (from £350), Background & due diligence (from £150), Evidence & alibi verification (from £400), Confidential enquiries by quotation. Final fee depends on complexity. Initial consultation by arrangement.',
    contact: 'Contact: Email 221b@bakerstreet.example, Telegram, or visit Baker Street. For a confidential discussion, write or call.',
    prices: 'Surveillance from £65/hour; Missing persons from £350; Background checks from £150; Evidence verification from £400; other work by quotation.',
    greeting: 'Good evening. I am at your service regarding our investigative work, fees, or any confidential matter. What would you like to know?',
    default: 'I would need more details to give a precise answer. Please write to 221b@bakerstreet.example or use the contact links on the site for a confidential discussion.'
  },
  ru: {
    services: 'Услуги: наблюдение и слежка (от 15 000 ₽/день), поиск людей и розыск (от 35 000 ₽), проверка личности и репутации (от 20 000 ₽), проверка алиби и сбор доказательств (от 30 000 ₽), конфиденциальные расследования по запросу. Итоговая стоимость зависит от сложности.',
    contact: 'Контакты: email 221b@bakerstreet.example, Telegram, Baker Street. Для конфиденциального обсуждения напишите или позвоните.',
    prices: 'Наблюдение от 15 000 ₽/день; поиск людей от 35 000 ₽; проверки от 20 000–30 000 ₽; конфиденциальные расследования по запросу.',
    greeting: 'Добрый день. Готов рассказать об услугах, ценах и контактах. Что вас интересует?',
    default: 'Для точного ответа нужны детали. Напишите на 221b@bakerstreet.example или воспользуйтесь контактами на сайте для конфиденциального обсуждения.'
  }
};

function detectLang(text) {
  const t = (text || '').toLowerCase();
  const cyrillic = /[а-яё]/i.test(t);
  const ruWords = /\b(услуг|цен|контакт|сколько|рубл|связ|помощь|детектив)\b/i.test(t);
  return cyrillic || ruWords ? 'ru' : 'en';
}

function answer(message, lang) {
  const m = (message || '').toLowerCase().trim();
  const L = KNOWLEDGE[lang] || KNOWLEDGE.en;

  if (!m) return L.greeting;

  if (/\b(service|услуг|what do you do|чем занимае|какие услуги)\b/i.test(m)) return L.services;
  if (/\b(price|cost|fee|цен|стоимость|прайс|сколько стоит)\b/i.test(m)) return L.prices;
  if (/\b(contact|email|phone|телефон|связаться|написать|контакт)\b/i.test(m)) return L.contact;
  if (/\b(hello|hi|привет|здравствуй|добрый)\b/i.test(m)) return L.greeting;

  return L.default;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const lang = detectLang(message);
    const response = answer(message, lang);
    res.status(200).json({ response });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}

module.exports = handler;
