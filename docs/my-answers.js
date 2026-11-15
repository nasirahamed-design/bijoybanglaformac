// my-answers.js - your own questions and answers for the "Ask" chat on the website.
//
// Add as many as you like. Each answer is one block between { and }, followed by a comma.
// Copy one of the examples below, paste it above the closing  ];  and change it.
//
//   id        a short unique name (letters, numbers, dashes), only for you
//   keywords  words or phrases people might type: English, Bangla and Banglish.
//             Write them in lower case. Longer phrases count more than single words,
//             so 'how to install' beats 'install' when both match.
//   en        the answer on the English page
//   bn        the answer on the Bangla page (and for questions typed in Bangla)
//   priority  optional: 1 or 2 makes this answer win over a built-in one that also matches
//
// Answers can use simple HTML: <b>bold</b>, <a href="...">link</a>, <br> for a new line,
// <ul><li>...</li></ul> for a list. Put a backslash before an apostrophe: 'it\'s'.
// After editing, open the site, ask the question in the chat, and check the answer.
// These answers are checked before the built-in ones in helper.js.

window.BIJOY_MY_ANSWERS = [

  { id: 'contact',
    keywords: ['contact', 'phone number', 'whatsapp number', 'call you', 'যোগাযোগ', 'ফোন নম্বর', 'jogajog'],
    en: 'The quickest way to reach us is to <a href="https://github.com/nasirahamed-design/bijoybanglaformac/issues">open an issue on GitHub</a>.',
    bn: 'আমাদের সঙ্গে যোগাযোগের সবচেয়ে সহজ উপায় হলো <a href="https://github.com/nasirahamed-design/bijoybanglaformac/issues">GitHub-এ একটি issue খোলা</a>।',
    priority: 1 },

  // Template - copy these five lines, remove the // at the start of each, and fill them in:
  // { id: 'my-question',
  //   keywords: ['english words', 'বাংলা শব্দ', 'banglish words'],
  //   en: 'English answer.',
  //   bn: 'বাংলা উত্তর।' },

];
