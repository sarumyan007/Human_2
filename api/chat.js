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
    smalltalk: 'I am well, thank you. How can I assist you today with our services or fees?',
    default: 'I would need more details to give a precise answer. Please write to 221b@bakerstreet.example or use the contact links on the site for a confidential discussion.'
  },
  ru: {
    services: 'Услуги: наблюдение и слежка (от 15 000 ₽/день), поиск людей и розыск (от 35 000 ₽), проверка личности и репутации (от 20 000 ₽), проверка алиби и сбор доказательств (от 30 000 ₽), конфиденциальные расследования по запросу. Итоговая стоимость зависит от сложности.',
    contact: 'Контакты: email 221b@bakerstreet.example, Telegram, Baker Street. Для конфиденциального обсуждения напишите или позвоните.',
    prices: 'Наблюдение от 15 000 ₽/день; поиск людей от 35 000 ₽; проверки от 20 000–30 000 ₽; конфиденциальные расследования по запросу.',
    greeting: 'Добрый день. Готов рассказать об услугах, ценах и контактах. Что вас интересует?',
    smalltalk: 'Спасибо, всё отлично. Чем могу вам помочь по услугам, ценам или вашей ситуации?',
    default: 'Для точного ответа нужны детали. Напишите на 221b@bakerstreet.example или воспользуйтесь контактами на сайте для конфиденциального обсуждения.'
  }
};

function detectLang(text) {
  const t = (text || '').toLowerCase();
  const cyrillic = /[а-яё]/i.test(t);
  // NOTE: no \b for Cyrillic – JS \\b works only for ASCII word chars
  const ruWords = /(услуг|цен|контакт|сколько|рубл|связ|помощь|детектив)/i.test(t);
  return cyrillic || ruWords ? 'ru' : 'en';
}

function answer(message, lang) {
  const m = (message || '').toLowerCase().trim();
  const L = KNOWLEDGE[lang] || KNOWLEDGE.en;

  let kind = 'default';
  let result = L.default;

  if (!m) {
    kind = 'greeting';
    result = L.greeting;
  } else if (/(how are you|how's it going|как дел|как жизнь|как поживаете)/i.test(m)) {
    kind = 'smalltalk';
    result = L.smalltalk || L.greeting;
  } else if (/(service|услуг|услуги|what do you do|чем занимаетесь|чем вы занимаетесь|какие услуги|виды услуг|найти|розыск|разыскать|поиск человек|поиск людей)/i.test(m)) {
    kind = 'services';
    result = L.services;
  } else if (/(price|cost|fee|цен|стоимост|прайс|сколько стоит|сколько будет стоить|какая ценa|какая стоимост|по чем|почем|алиби)/i.test(m)) {
    kind = 'prices';
    result = L.prices;
  } else if (/(contact|email|e-mail|mail|почта|phone|телефон|как связаться|как с вами связаться|связаться|связатс|контакт|куда писать|куда написать|как обратиться|обратиться)/i.test(m)) {
    kind = 'contact';
    result = L.contact;
  } else if (/(hello|hi|привет|здравствуй|добрый|хай|хаи)/i.test(m)) {
    kind = 'greeting';
    result = L.greeting;
  }

  // #region agent log
  fetch('http://127.0.0.1:7758/ingest/3f2d0565-3ea2-4db2-9669-8227819b2eb8', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '00ce66'
    },
    body: JSON.stringify({
      sessionId: '00ce66',
      runId: 'chat-post-fix-husband',
      hypothesisId: 'H2',
      location: 'api/chat.js:answer',
      message: 'answer-classification',
      data: {
        lang,
        kind,
        snippet: m.slice(0, 80)
      },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion

  return result;
}

function handler(req, res) {
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
