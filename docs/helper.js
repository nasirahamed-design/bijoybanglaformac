// helper.js - the "Ask" chat helper on bijoybanglaformac.com.
// No AI and no server: it matches the question against prepared answers
// (English and Bangla), and works out the Bijoy keys for any Bangla word
// ("কিভাবে লিখব ক্ষ?") with the same engine as the keyboard, checking the
// keys really type that word before showing them.
(function () {
  if (typeof Bijoy === 'undefined') return;
  var PAGE_BN = document.documentElement.lang === 'bn';
  var PKG = 'https://github.com/nasirahamed-design/bijoybanglaformac/releases/latest/download/BijoyBangla.pkg';
  var GH = 'https://github.com/nasirahamed-design/bijoybanglaformac';

  // ---------- Keys for a Bangla word ----------
  var CONS = { 'ক': 'j', 'খ': 'J', 'গ': 'o', 'ঘ': 'O', 'ঙ': 'q', 'চ': 'y', 'ছ': 'Y', 'জ': 'u', 'ঝ': 'U', 'ঞ': 'I',
    'ট': 't', 'ঠ': 'T', 'ড': 'e', 'ঢ': 'E', 'ণ': 'B', 'ত': 'k', 'থ': 'K', 'দ': 'l', 'ধ': 'L', 'ন': 'b',
    'প': 'r', 'ফ': 'R', 'ব': 'h', 'ভ': 'H', 'ম': 'm', 'য': 'w', 'র': 'v', 'ল': 'V', 'শ': 'M', 'ষ': 'N', 'স': 'n', 'হ': 'i' };
  var NUKTA_CONS = { 'য': 'W', 'ড': 'p', 'ঢ': 'P' };          // য়  ড়  ঢ় (after NFD: letter + ়)
  var PRE = { 'ি': 'd', 'ে': 'c', 'ৈ': 'C' };
  var POST = { 'া': 'f', 'ী': 'D', 'ু': 's', 'ূ': 'S', 'ৃ': 'a', 'ৗ': 'X' };
  var INDEP = { 'অ': 'F', 'আ': 'gf', 'ই': 'gd', 'ঈ': 'gD', 'উ': 'gs', 'ঊ': 'gS', 'ঋ': 'ga', 'এ': 'gc', 'ঐ': 'gC', 'ও': 'x', 'ঔ': 'gX' };
  var SIGN = { 'ং': 'Q', 'ঃ': '|', 'ঁ': '&', 'ৎ': '\\', '।': 'G', '৳': '$',
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  var H = '্', NUKTA = '়', ZWNJ = '‌', ZWJ = '‍';

  function plan(word, rephLate) {
    var ch = Array.from(word.normalize('NFD')), keys = '', i = 0;
    function cons(at) {          // key for the consonant at ch[at], and how many characters it used
      var c = ch[at];
      if (ch[at + 1] === NUKTA && NUKTA_CONS[c]) return [NUKTA_CONS[c], 2];
      return CONS[c] ? [CONS[c], 1] : null;
    }
    while (i < ch.length) {
      var c = ch[i];
      if (c === ' ') { keys += ' '; i++; continue; }
      if (INDEP[c]) { keys += INDEP[c]; i++; continue; }
      if (SIGN[c]) { keys += SIGN[c]; i++; continue; }
      if (/[\x21-\x7e]/.test(c) && !/[a-zA-Z]/.test(c)) { keys += c; i++; continue; }
      var reph = false;
      if (c === 'র' && ch[i + 1] === H && cons(i + 2) && ch[i + 2] !== ZWJ) { reph = true; i += 2; }
      var first = cons(i);
      if (!first) return null;
      var cluster = first[0]; i += first[1];
      if (ch[i] === ZWJ && ch[i + 1] === H && ch[i + 2] === 'য') { cluster += 'Z'; i += 3; }
      while (ch[i] === H) {
        if (ch[i + 1] === ZWNJ) { cluster += 'gg'; i += 2; break; }
        if (ch[i + 1] === 'র' && ch[i + 2] !== NUKTA) { cluster += 'z'; i += 2; continue; }
        if (ch[i + 1] === 'য' && ch[i + 2] !== NUKTA) { cluster += 'Z'; i += 2; continue; }
        var next = cons(i + 1);
        if (!next) { cluster += 'g'; i += 1; break; }
        cluster += 'g' + next[0]; i += 1 + next[1];
      }
      var pre = '', post = '';
      while (PRE[ch[i]] || POST[ch[i]]) { if (PRE[ch[i]]) pre += PRE[ch[i]]; else post += POST[ch[i]]; i++; }
      keys += pre + cluster + (reph && !rephLate ? 'A' : '') + post + (reph && rephLate ? 'A' : '');
    }
    return keys;
  }
  function keysFor(word) {
    var want = word.normalize('NFD');
    var tries = [plan(word, false), plan(word, true)];
    for (var t = 0; t < tries.length; t++) {
      var k = tries[t];
      if (k && Bijoy.render(Array.from(k)).normalize('NFD') === want) return k;
    }
    return null;
  }
  var SHIFT_BASE = { '|': '\\', '&': '7', '$': '4', '!': '1', '@': '2', '#': '3', '%': '5', '^': '6', '*': '8', '(': '9', ')': '0',
    '_': '-', '+': '=', '{': '[', '}': ']', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/', '~': '`' };
  function kbd(t) { return '<kbd>' + esc(t) + '</kbd>'; }
  function keyCaps(keys) {
    return Array.from(keys).map(function (k) {
      if (k === ' ') return kbd(PAGE_BN || bnAnswer ? 'স্পেস' : 'space');
      if (/[A-Z]/.test(k)) return '<span class="hk-shift">' + kbd('Shift') + '+' + kbd(k) + '</span>';
      if (SHIFT_BASE[k]) return '<span class="hk-shift">' + kbd('Shift') + '+' + kbd(SHIFT_BASE[k]) + '</span>';
      return kbd(/[a-z]/.test(k) ? k.toUpperCase() : k);
    }).join(' ');
  }

  // ---------- Prepared answers ----------
  // k: words that point to this answer (English, Bangla and Banglish). Longer phrases count more.
  var KB = [
    { id: 'free', k: ['free', 'cost', 'price', 'paid', 'pay', 'money', 'licence', 'license', 'trial', 'subscription', 'ফ্রি', 'বিনামূল্য', 'দাম', 'টাকা', 'খরচ', 'পয়সা', 'লাইসেন্স', 'taka', 'dam'],
      en: 'Yes, it is completely free: no trial, no account and no ads. The source code is on <a href="' + GH + '">GitHub</a> under the MIT licence.',
      bn: 'হ্যাঁ, সম্পূর্ণ বিনামূল্যে। কোনো ট্রায়াল, অ্যাকাউন্ট বা বিজ্ঞাপন নেই। সোর্স কোড MIT লাইসেন্সে <a href="' + GH + '">GitHub</a>-এ আছে।' },
    { id: 'download', k: ['download', 'get it', 'where can i get', 'pkg', 'installer file', 'ডাউনলোড', 'নামাব', 'কোথায় পাব', 'কোথায় পাবো', 'download korbo', 'dmg'],
      en: 'Click <b>Download for Mac</b> at the top of this page, or <a href="' + PKG + '">download BijoyBangla.pkg here</a> (about 1 MB). Then open it to install.',
      bn: 'এই পাতার উপরে <b>ম্যাকের জন্য ডাউনলোড</b> বোতামে ক্লিক করুন, অথবা <a href="' + PKG + '">এখান থেকে BijoyBangla.pkg ডাউনলোড করুন</a> (প্রায় ১ মেগাবাইট)। তারপর ফাইলটি খুলে ইনস্টল করুন।' },
    { id: 'install', k: ['install', 'setup', 'set up', 'how to start', 'installation', 'ইনস্টল', 'ইন্সটল', 'সেটআপ', 'চালু করব', 'চালু করবো', 'install korbo', 'kivabe install'],
      en: 'Installing takes a minute:<ol><li>Open <b>BijoyBangla.pkg</b> and select Continue.</li><li>Leave “Install for all users” selected.</li><li>Select Install and enter your Mac password.</li><li>If asked, select Allow, then Log Out and sign back in.</li></ol>Then choose <b>বিজয় ইউনিকোড</b> from the input menu at the top right of the screen. See <a href="#install">How to install</a> or the <a href="/Activation-Guide.pdf">Activation Guide (PDF)</a>.',
      bn: 'ইনস্টল করতে এক মিনিট লাগে:<ol><li><b>BijoyBangla.pkg</b> খুলে Continue নির্বাচন করুন।</li><li>“Install for all users” যেমন আছে রেখে দিন।</li><li>Install নির্বাচন করে ম্যাকের পাসওয়ার্ড দিন।</li><li>জিজ্ঞেস করলে Allow দিন, তারপর Log Out করে আবার সাইন ইন করুন।</li></ol>এরপর স্ক্রিনের উপরে ডানদিকের ইনপুট মেনু থেকে <b>বিজয় ইউনিকোড</b> বেছে নিন। দেখুন <a href="#install">ইনস্টলের ধাপ</a> বা <a href="/Activation-Guide.pdf">অ্যাক্টিভেশন গাইড (PDF)</a>।' },
    { id: 'activate', k: ['not showing', 'not in the list', 'can\'t find', 'cannot find', 'doesn\'t appear', 'activate', 'enable', 'input source', 'input sources', 'add keyboard', 'not working', 'doesn\'t work', 'not typing', 'দেখাচ্ছে না', 'খুঁজে পাচ্ছি না', 'পাচ্ছি না', 'কাজ করছে না', 'আসছে না', 'চালু হচ্ছে না', 'ইনপুট সোর্স', 'kaj korche na', 'dekhache na'],
      en: 'If Bijoy Bangla does not show up or does not type Bangla:<ol><li>Log out and sign back in after installing.</li><li>Open System Settings → Keyboard → Input Sources → Edit, select <b>+</b>, find Bijoy Bangla under Bangla, and add বিজয় ইউনিকোড (and বিজয় ক্লাসিক if you need it).</li><li>Choose it from the input menu at the top right of the screen.</li></ol>The <a href="/Activation-Guide.pdf">Activation Guide (PDF)</a> shows each step with pictures.',
      bn: 'বিজয় বাংলা দেখা না গেলে বা বাংলা না লিখলে:<ol><li>ইনস্টলের পর একবার Log Out করে আবার সাইন ইন করুন।</li><li>System Settings → Keyboard → Input Sources → Edit খুলে <b>+</b> চাপুন, Bangla-র মধ্যে Bijoy Bangla খুঁজে বিজয় ইউনিকোড যোগ করুন (দরকার হলে বিজয় ক্লাসিকও)।</li><li>স্ক্রিনের উপরে ডানদিকের ইনপুট মেনু থেকে সেটি বেছে নিন।</li></ol><a href="/Activation-Guide.pdf">অ্যাক্টিভেশন গাইডে (PDF)</a> ছবি দিয়ে প্রতিটি ধাপ দেখানো আছে।' },
    { id: 'switch', k: ['switch', 'change language', 'toggle', 'shortcut', 'control space', 'control-space', 'ctrl space', 'globe key', 'fn key', 'english to bangla', 'bangla to english', 'back to english', 'ভাষা পরিবর্তন', 'ভাষা বদল', 'ইংরেজি', 'ইংলিশ', 'বদলাব', 'বদলাবো', 'সুইচ', 'শর্টকাট', 'english e', 'bangla theke'],
      en: 'Press <kbd>Control</kbd>+<kbd>Space</kbd> or the <b>Globe</b> (fn) key to switch between Bangla and English. You can also pick from the input menu at the top right of the screen, which has English, বিজয় ইউনিকোড and বিজয় ক্লাসিক.',
      bn: 'বাংলা ও ইংরেজির মধ্যে বদলাতে <kbd>Control</kbd>+<kbd>Space</kbd> বা <b>Globe</b> (fn) কী চাপুন। স্ক্রিনের উপরে ডানদিকের ইনপুট মেনু থেকেও বেছে নিতে পারেন: English, বিজয় ইউনিকোড ও বিজয় ক্লাসিক।' },
    { id: 'modes', k: ['unicode', 'classic', 'difference', 'which mode', 'mode', 'ansi', 'ইউনিকোড', 'ক্লাসিক', 'পার্থক্য', 'তফাৎ', 'মোড', 'parthokko'],
      en: '<b>বিজয় ইউনিকোড</b> types standard Unicode Bangla. Use it for Facebook, WhatsApp, email, websites and documents you share; it shows correctly in any Bangla font.<br><b>বিজয় ক্লাসিক</b> types classic Bijoy text for <b>SutonnyMJ</b> and other MJ fonts, for printing and desktop publishing. Both use the same keys. See <a href="#modes">Unicode or Classic</a>.',
      bn: '<b>বিজয় ইউনিকোড</b> স্ট্যান্ডার্ড ইউনিকোড বাংলা লেখে। ফেসবুক, হোয়াটসঅ্যাপ, ইমেইল, ওয়েবসাইট ও শেয়ার করা ডকুমেন্টের জন্য এটি ব্যবহার করুন; যেকোনো বাংলা ফন্টে ঠিকভাবে দেখায়।<br><b>বিজয় ক্লাসিক</b> <b>SutonnyMJ</b> ও অন্যান্য MJ ফন্টের জন্য ক্লাসিক বিজয় লেখা তৈরি করে, ছাপা ও ডেস্কটপ পাবলিশিংয়ের কাজে। দুটোতেই একই কী। দেখুন <a href="#modes">ইউনিকোড না ক্লাসিক</a>।' },
    { id: 'sutonny', p: 1, k: ['sutonny', 'sutonnymj', 'mj font', 'avgvi', 'print', 'printing', 'garbage', 'strange letters', 'english letters', 'সুতন্নি', 'সুতনী', 'ছাপা', 'প্রিন্ট', 'ভাঙা', 'হিজিবিজি'],
      en: 'For SutonnyMJ and other MJ fonts, choose <b>বিজয় ক্লাসিক</b> in the input menu and set the text to SutonnyMJ. If you see letters like “Avgvi” instead of Bangla, the text is classic Bijoy but the font is not an MJ font: change the font to SutonnyMJ, or use বিজয় ইউনিকোড instead for normal fonts.',
      bn: 'SutonnyMJ ও অন্যান্য MJ ফন্টের জন্য ইনপুট মেনুতে <b>বিজয় ক্লাসিক</b> বেছে নিন এবং লেখার ফন্ট SutonnyMJ করুন। বাংলার বদলে “Avgvi” এর মতো অক্ষর দেখালে লেখাটি ক্লাসিক বিজয়ে, কিন্তু ফন্টটি MJ নয়: ফন্ট SutonnyMJ করুন, অথবা সাধারণ ফন্টের জন্য বিজয় ইউনিকোড ব্যবহার করুন।' },
    { id: 'fonts', p: 3, k: ['font', 'fonts', 'noto', 'kalpurush', 'solaimanlipi', 'nikosh', 'ফন্ট', 'কোন ফন্ট', 'ওয়ার্ড', 'নোটো'],
      en: 'For Word, Pages and Google Docs, <b>Noto Sans Bengali</b> is the best Unicode font (free from <a href="https://fonts.google.com/noto/specimen/Noto+Sans+Bengali">Google Fonts</a>). Others that work well: Noto Serif Bengali, Tiro Bangla, Hind Siliguri, Anek Bangla, Baloo Da 2, SolaimanLipi, Kalpurush and Nikosh. Every Mac already has Kohinoor Bangla, Bangla Sangam MN and Bangla MN. SutonnyMJ is only for বিজয় ক্লাসিক.',
      bn: 'Word, Pages ও Google Docs এর জন্য সবচেয়ে ভালো ইউনিকোড ফন্ট <b>Noto Sans Bengali</b> (<a href="https://fonts.google.com/noto/specimen/Noto+Sans+Bengali">Google Fonts</a> থেকে বিনামূল্যে)। আরও ভালো ফন্ট: Noto Serif Bengali, Tiro Bangla, Hind Siliguri, Anek Bangla, Baloo Da 2, SolaimanLipi, Kalpurush ও Nikosh। প্রতিটি ম্যাকে আগে থেকেই আছে Kohinoor Bangla, Bangla Sangam MN ও Bangla MN। SutonnyMJ শুধু বিজয় ক্লাসিকের জন্য।' },
    { id: 'compat', k: ['macos', 'version', 'ventura', 'sonoma', 'sequoia', 'tahoe', 'monterey', 'big sur', 'catalina', 'intel', 'apple silicon', 'm1', 'm2', 'm3', 'm4', 'macbook', 'imac', 'mac mini', 'support', 'compatible', 'requirement', 'old mac', 'সাপোর্ট', 'চলবে', 'চলে', 'ভার্সন', 'সংস্করণ', 'পুরনো ম্যাক', 'cholbe'],
      en: 'It needs <b>macOS 13 Ventura or later</b> (including Sonoma, Sequoia and Tahoe) and runs on Apple silicon (M1, M2, M3, M4) and Intel Macs: MacBook, iMac, Mac mini and others. macOS 12 Monterey and older are not supported.',
      bn: 'এর জন্য <b>macOS 13 Ventura বা পরবর্তী সংস্করণ</b> লাগবে (Sonoma, Sequoia ও Tahoe সহ)। Apple silicon (M1, M2, M3, M4) ও Intel দুই ধরনের ম্যাকেই চলে: MacBook, iMac, Mac mini ইত্যাদি। macOS 12 Monterey বা তার আগের সংস্করণে চলবে না।' },
    { id: 'uninstall', p: 1, k: ['uninstall', 'remove', 'delete the app', 'get rid', 'আনইনস্টল', 'মুছে', 'সরাব', 'সরাবো', 'বাদ দেব', 'remove korbo'],
      en: 'Open the input menu at the top right of the screen and select <b>Uninstall Bijoy Bangla…</b>. Enter your Mac password when asked, then log out and sign back in.',
      bn: 'স্ক্রিনের উপরে ডানদিকের ইনপুট মেনু খুলে <b>Uninstall Bijoy Bangla…</b> নির্বাচন করুন। পাসওয়ার্ড চাইলে দিন, তারপর Log Out করে আবার সাইন ইন করুন।' },
    { id: 'update', k: ['update', 'upgrade', 'new version', 'latest version', 'what\'s new', 'whats new', 'আপডেট', 'নতুন ভার্সন', 'নতুন সংস্করণ', 'সর্বশেষ'],
      en: 'Download the latest installer from this page and open it. It replaces the old version; you do not need to uninstall first. See <a href="#news">What’s new</a> for the changes in each version.',
      bn: 'এই পাতা থেকে সর্বশেষ ইনস্টলার ডাউনলোড করে খুলুন। এটি পুরনো সংস্করণের জায়গায় বসে যাবে; আগে আনইনস্টল করতে হবে না। প্রতিটি সংস্করণে কী বদলেছে দেখতে <a href="#news">নতুন যা এসেছে</a> দেখুন।' },
    { id: 'layout', k: ['layout', 'chart', 'key map', 'keymap', 'which key', 'keys', 'keyboard picture', 'sticker', 'pdf', 'লেআউট', 'চার্ট', 'কী-বোর্ড', 'কীবোর্ড', 'কোন কী', 'বোতাম'],
      en: 'There are three ways to see the keys:<ul><li>Open the input menu and select <b>Show Bijoy Keyboard Layout…</b></li><li>Try the <a href="#layout">keyboard on this page</a>: hold Shift to see the second letters.</li><li>Print the <a href="/Bijoy-Keyboard-Layout.pdf">layout (PDF)</a>.</li></ul>You can also ask me how to type any Bangla word, for example “ক্ষ”.',
      bn: 'কী-গুলো দেখার তিনটি উপায়:<ul><li>ইনপুট মেনু থেকে <b>Show Bijoy Keyboard Layout…</b> নির্বাচন করুন</li><li>এই পাতার <a href="#layout">কীবোর্ডে</a> চেষ্টা করুন: দ্বিতীয় অক্ষর দেখতে Shift চাপুন।</li><li><a href="/Bijoy-Keyboard-Layout.pdf">লেআউট (PDF)</a> প্রিন্ট করুন।</li></ul>যেকোনো বাংলা শব্দ কীভাবে লিখবেন তাও আমাকে জিজ্ঞেস করতে পারেন, যেমন “ক্ষ”।' },
    { id: 'kar', k: ['kar', 'vowel sign', 'i-kar', 'e-kar', 'ikar', 'ekar', 'okar', 'before the consonant', 'কার', 'ি-কার', 'ই-কার', 'এ-কার', 'ও-কার', 'হ্রস্ব', 'আগে'],
      en: 'Most vowel signs are typed <b>after</b> the letter: <kbd>J</kbd> <kbd>F</kbd> = কা. But ি, ে and ৈ are typed <b>before</b> it, as on paper: <kbd>D</kbd> <kbd>J</kbd> = কি, <kbd>C</kbd> <kbd>J</kbd> = কে. For ো and ৌ type ে first and the second part after: <kbd>C</kbd> <kbd>J</kbd> <kbd>F</kbd> = কো.',
      bn: 'বেশিরভাগ কার অক্ষরের <b>পরে</b> টাইপ করতে হয়: <kbd>J</kbd> <kbd>F</kbd> = কা। কিন্তু ি, ে ও ৈ লেখার মতোই অক্ষরের <b>আগে</b>: <kbd>D</kbd> <kbd>J</kbd> = কি, <kbd>C</kbd> <kbd>J</kbd> = কে। ো ও ৌ-এর জন্য আগে ে, পরে বাকি অংশ: <kbd>C</kbd> <kbd>J</kbd> <kbd>F</kbd> = কো।' },
    { id: 'juktakkhor', k: ['juktakkhor', 'joint letter', 'conjunct', 'hasanta', 'hosonto', 'link', 'reph', 'ref', 'ra-phala', 'ya-phala', 'phola', 'যুক্তাক্ষর', 'যুক্তবর্ণ', 'হসন্ত', 'হসন্ত', 'রেফ', 'র-ফলা', 'য-ফলা', 'ফলা', 'জোড়া'],
      en: '<b>G</b> joins letters: <kbd>J</kbd> <kbd>G</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>N</kbd></span> = ক্ষ. Press <kbd>G</kbd> twice for a visible hasanta: ক্‌. <kbd>Z</kbd> adds র-ফলা (প্র = <kbd>R</kbd> <kbd>Z</kbd>), <span class="hk-shift"><kbd>Shift</kbd>+<kbd>Z</kbd></span> adds য-ফলা, and রেফ is <span class="hk-shift"><kbd>Shift</kbd>+<kbd>A</kbd></span> typed after the letter: কর্ম = <kbd>J</kbd> <kbd>M</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>A</kbd></span>. Ask me about any word to see its keys.',
      bn: '<b>G</b> অক্ষর জোড়া লাগায়: <kbd>J</kbd> <kbd>G</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>N</kbd></span> = ক্ষ। দেখা যায় এমন হসন্তের জন্য <kbd>G</kbd> দুবার: ক্‌। <kbd>Z</kbd> দিয়ে র-ফলা (প্র = <kbd>R</kbd> <kbd>Z</kbd>), <span class="hk-shift"><kbd>Shift</kbd>+<kbd>Z</kbd></span> দিয়ে য-ফলা, আর রেফ হলো অক্ষরের পরে <span class="hk-shift"><kbd>Shift</kbd>+<kbd>A</kbd></span>: কর্ম = <kbd>J</kbd> <kbd>M</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>A</kbd></span>। যেকোনো শব্দ লিখে জিজ্ঞেস করুন, কী-গুলো দেখিয়ে দেব।' },
    { id: 'vowels', k: ['independent vowel', 'vowel', 'shoroborno', 'sorborno', 'স্বরবর্ণ', 'স্বর', 'অ আ', 'আ ই'],
      en: 'Type full vowels with <kbd>G</kbd> first, then the vowel sign: <kbd>G</kbd> <kbd>F</kbd> = আ, <kbd>G</kbd> <kbd>D</kbd> = ই, <kbd>G</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>D</kbd></span> = ঈ, <kbd>G</kbd> <kbd>S</kbd> = উ, <kbd>G</kbd> <kbd>C</kbd> = এ, <kbd>G</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>C</kbd></span> = ঐ. অ is <span class="hk-shift"><kbd>Shift</kbd>+<kbd>F</kbd></span> and ও is <kbd>X</kbd>.',
      bn: 'পূর্ণ স্বরবর্ণ লিখতে আগে <kbd>G</kbd>, তারপর কার: <kbd>G</kbd> <kbd>F</kbd> = আ, <kbd>G</kbd> <kbd>D</kbd> = ই, <kbd>G</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>D</kbd></span> = ঈ, <kbd>G</kbd> <kbd>S</kbd> = উ, <kbd>G</kbd> <kbd>C</kbd> = এ, <kbd>G</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>C</kbd></span> = ঐ। অ হলো <span class="hk-shift"><kbd>Shift</kbd>+<kbd>F</kbd></span>, আর ও হলো <kbd>X</kbd>।' },
    { id: 'symbols', k: ['dari', 'danda', 'full stop', 'taka sign', 'number', 'numbers', 'digit', 'chandrabindu', 'anusvara', 'visarga', 'khanda ta', 'দাঁড়ি', 'দাড়ি', 'টাকা চিহ্ন', 'সংখ্যা', 'চন্দ্রবিন্দু', 'অনুস্বার', 'বিসর্গ', 'খণ্ড ত', 'ইংরেজি সংখ্যা'],
      en: 'Signs: । = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>G</kbd></span>, ং = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>Q</kbd></span>, ঃ = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>\\</kbd></span>, ঁ = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>7</kbd></span>, ৎ = <kbd>\\</kbd>, ৳ = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>4</kbd></span>. The number keys type Bangla digits ১২৩; switch to English for 123.',
      bn: 'চিহ্ন: । = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>G</kbd></span>, ং = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>Q</kbd></span>, ঃ = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>\\</kbd></span>, ঁ = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>7</kbd></span>, ৎ = <kbd>\\</kbd>, ৳ = <span class="hk-shift"><kbd>Shift</kbd>+<kbd>4</kbd></span>। সংখ্যার কী দিয়ে বাংলা সংখ্যা ১২৩ লেখা হয়; ইংরেজি 123 এর জন্য ইংরেজিতে বদলান।' },
    { id: 'safe', k: ['safe', 'virus', 'malware', 'trust', 'security', 'notarized', 'signed', 'app store', 'unidentified developer', 'can\'t be opened', 'নিরাপদ', 'ভাইরাস', 'অ্যাপ স্টোর', 'বিশ্বাস', 'নিরাপত্তা'],
      en: 'Yes, it is safe. The installer is signed with an Apple Developer ID and notarized by Apple, and macOS checks it when you open it. It is shared directly from this website rather than the Mac App Store, and its full source code is on <a href="' + GH + '">GitHub</a>.',
      bn: 'হ্যাঁ, এটি নিরাপদ। ইনস্টলারটি Apple Developer ID দিয়ে সাইন করা এবং Apple নোটারাইজ করেছে; খোলার সময় macOS নিজেই যাচাই করে। এটি Mac App Store নয়, সরাসরি এই ওয়েবসাইট থেকে দেওয়া হয়, আর পুরো সোর্স কোড <a href="' + GH + '">GitHub</a>-এ আছে।' },
    { id: 'inscript', p: 1, k: ['inscript', 'bangla - inscript', 'bangla inscript', 'ইনস্ক্রিপ্ট'],
      en: 'macOS sometimes adds its own “Bangla - InScript” keyboard back. In the input menu, keep <b>Keep Bangla - InScript Off</b> ticked and Bijoy Bangla switches it off for you.',
      bn: 'macOS মাঝে মাঝে নিজের “Bangla - InScript” কীবোর্ড আবার যোগ করে। ইনপুট মেনুতে <b>Keep Bangla - InScript Off</b> টিক দেওয়া রাখুন, বিজয় বাংলা নিজেই সেটি বন্ধ রাখবে।' },
    { id: 'diagram', k: ['diagram', 'system settings', 'no picture', 'keyboard viewer', 'information notice', 'ডায়াগ্রাম', 'ছবি দেখাচ্ছে না'],
      en: 'System Settings only draws pictures for simple keyboard layouts. Bijoy Bangla is an input method that handles vowel signs and যুক্তাক্ষর, so macOS shows a notice instead. To see the keys, open the input menu and select <b>Show Bijoy Keyboard Layout…</b>',
      bn: 'System Settings শুধু সাধারণ কীবোর্ড লেআউটের ছবি দেখায়। বিজয় বাংলা একটি ইনপুট মেথড, যা কার ও যুক্তাক্ষর সামলায়, তাই macOS ছবির বদলে একটি নোটিশ দেখায়। কী দেখতে ইনপুট মেনু থেকে <b>Show Bijoy Keyboard Layout…</b> নির্বাচন করুন।' },
    { id: 'phone', p: 1, k: ['iphone', 'android', 'phone', 'mobile', 'ipad', 'tablet', 'ios', 'ফোন', 'মোবাইল', 'আইফোন', 'অ্যান্ড্রয়েড', 'ট্যাবলেট'],
      en: 'The app is for Mac only; there is no iPhone, iPad or Android app. But the <a href="#layout">keyboard on this page</a> works on phones: tap <b>Full screen</b>, type with the Bijoy keys, and tap <b>Save</b> to download your text, or copy it into any app.',
      bn: 'অ্যাপটি শুধু ম্যাকের জন্য; আইফোন, আইপ্যাড বা অ্যান্ড্রয়েড অ্যাপ নেই। তবে এই পাতার <a href="#layout">কীবোর্ড</a> ফোনেও চলে: <b>পূর্ণ স্ক্রিন</b> চাপুন, বিজয় কী দিয়ে লিখুন, তারপর <b>সেভ করুন</b> চেপে লেখা ডাউনলোড করুন, অথবা কপি করে যেকোনো অ্যাপে বসান।' },
    { id: 'windows', p: 1, k: ['windows', 'pc', 'linux', 'ubuntu', 'উইন্ডোজ', 'লিনাক্স'],
      en: 'Bijoy Bangla for Mac is for macOS only. There is no Windows or Linux version. On any computer you can still use the <a href="#layout">keyboard on this page</a> in a browser.',
      bn: 'বিজয় বাংলা ফর ম্যাক শুধু macOS এর জন্য। উইন্ডোজ বা লিনাক্স সংস্করণ নেই। তবে যেকোনো কম্পিউটারের ব্রাউজারে এই পাতার <a href="#layout">কীবোর্ড</a> ব্যবহার করতে পারেন।' },
    { id: 'phonetic', p: 1, k: ['phonetic', 'avro', 'banglish', 'transliteration', 'probhat', 'ফোনেটিক', 'অভ্র'],
      en: 'The Mac app uses the <b>Bijoy</b> key layout only, the one used in offices and print shops; it does not do phonetic typing. In this chat box you can choose <b>Phonetic</b> at the top (Esc switches) and type Bangla the phonetic way, for example “amar sonar bangla”.',
      bn: 'ম্যাক অ্যাপটি কেবল <b>বিজয়</b> লেআউট ব্যবহার করে, যা অফিস ও ছাপাখানায় প্রচলিত; এতে ফনেটিক টাইপিং নেই। তবে এই চ্যাট বক্সের উপরে <b>ফনেটিক</b> বেছে নিয়ে (Esc চেপেও বদলানো যায়) ফনেটিক পদ্ধতিতে বাংলা লিখতে পারেন, যেমন “amar sonar bangla”।' },
    { id: 'webkb', k: ['this page', 'website keyboard', 'online keyboard', 'full screen', 'save', 'txt', 'sound', 'copy', 'ওয়েবসাইটের কীবোর্ড', 'অনলাইন', 'সেভ', 'শব্দ', 'কপি'],
      en: 'The <a href="#layout">keyboard on this page</a> types Bijoy Bangla in the browser. <b>Full screen</b> gives you a big typing area, the speaker button turns key sounds on or off, <b>Save</b> downloads your text as a .txt file, and Esc (or the globe key) switches between Bangla and English.',
      bn: 'এই পাতার <a href="#layout">কীবোর্ড</a> দিয়ে ব্রাউজারেই বিজয়ে বাংলা লেখা যায়। <b>পূর্ণ স্ক্রিন</b> বড় লেখার জায়গা দেয়, স্পিকার বোতাম কী-এর শব্দ চালু বা বন্ধ করে, <b>সেভ করুন</b> লেখাটি .txt ফাইল হিসেবে ডাউনলোড করে, আর Esc (বা গ্লোব কী) বাংলা ও ইংরেজির মধ্যে বদলায়।' },
    { id: 'report', k: ['bug', 'problem', 'issue', 'report', 'contact', 'email', 'help me', 'feedback', 'suggestion', 'সমস্যা', 'যোগাযোগ', 'রিপোর্ট', 'ভুল', 'পরামর্শ', 'somossa'],
      en: 'Please <a href="' + GH + '/issues">open an issue on GitHub</a>. Include your macOS version, the keys you pressed and the Bangla text you expected.',
      bn: 'অনুগ্রহ করে <a href="' + GH + '/issues">GitHub-এ একটি issue খুলুন</a>। আপনার macOS সংস্করণ, কোন কী চেপেছেন এবং কোন বাংলা লেখা আশা করেছিলেন তা লিখুন।' },
    { id: 'opensource', k: ['open source', 'source code', 'github', 'mit', 'contribute', 'code', 'ওপেন সোর্স', 'সোর্স কোড', 'গিটহাব'],
      en: 'Yes, it is open source under the MIT licence. The code is on <a href="' + GH + '">GitHub</a>.',
      bn: 'হ্যাঁ, এটি MIT লাইসেন্সে ওপেন সোর্স। কোড আছে <a href="' + GH + '">GitHub</a>-এ।' },
    { id: 'who', k: ['who made', 'who built', 'developer', 'author', 'creator', 'কে বানিয়েছে', 'কে তৈরি', 'নির্মাতা', 'ডেভেলপার'],
      en: 'Bijoy Bangla for Mac was made by Nasir Ahamed, and it is free and open source.',
      bn: 'বিজয় বাংলা ফর ম্যাক তৈরি করেছেন নাসির আহামেদ। এটি বিনামূল্যের ও ওপেন সোর্স।' },
    // ---- Apps: "Will it work in ...?" ----
    { id: 'social', p: 1, k: ['facebook', 'fb', 'messenger', 'whatsapp', 'instagram', 'telegram', 'viber', 'imo', 'signal', 'twitter', 'tiktok', 'linkedin', 'youtube', 'comment', 'post', 'status', 'চ্যাট',
        'ফেসবুক', 'ফেইসবুক', 'মেসেঞ্জার', 'ম্যাসেঞ্জার', 'হোয়াটসঅ্যাপ', 'হোয়াটস অ্যাপ', 'ইনস্টাগ্রাম', 'টেলিগ্রাম', 'ইমো', 'ভাইবার', 'ইউটিউব', 'টুইটার', 'স্ট্যাটাস', 'কমেন্ট', 'পোস্ট', 'facebook e', 'fb te'],
      en: 'Yes. Choose <b>বিজয় ইউনিকোড</b> and type straight into Facebook, Messenger, WhatsApp, Instagram, Telegram, Viber, YouTube comments and the rest, in the app or in the browser. Everyone sees normal Bangla on their phone or computer. Do not use বিজয় ক্লাসিক there: others would see letters like “Avgvi”.',
      bn: 'হ্যাঁ। <b>বিজয় ইউনিকোড</b> বেছে নিয়ে সরাসরি ফেসবুক, মেসেঞ্জার, হোয়াটসঅ্যাপ, ইনস্টাগ্রাম, টেলিগ্রাম, ভাইবার, ইউটিউব কমেন্ট সব জায়গায় লিখুন, অ্যাপে বা ব্রাউজারে। সবাই তাদের ফোন বা কম্পিউটারে সাধারণ বাংলাই দেখবেন। সেখানে বিজয় ক্লাসিক ব্যবহার করবেন না: অন্যরা “Avgvi” এর মতো অক্ষর দেখবেন।' },
    { id: 'office', p: 1, k: ['microsoft word', 'ms word', 'word', 'excel', 'powerpoint', 'power point', 'outlook', 'office', 'microsoft', 'word file', 'docx',
        'ওয়ার্ড', 'ওয়ার্ডে', 'মাইক্রোসফ', 'মাইক্রোসফট', 'এক্সেল', 'পাওয়ারপয়েন্ট', 'পাওয়ার পয়েন্ট', 'আউটলুক', 'অফিস', 'word e'],
      en: 'Yes, it works in Microsoft Word, Excel, PowerPoint and Outlook on the Mac.<ul><li>For normal documents choose <b>বিজয় ইউনিকোড</b> and a Unicode Bangla font; <b>Noto Sans Bengali</b> looks best.</li><li>For print work with <b>SutonnyMJ</b>, choose <b>বিজয় ক্লাসিক</b> and set the font to SutonnyMJ.</li></ul>See <a href="#see">it typing in Word</a>.',
      bn: 'হ্যাঁ, ম্যাকের Microsoft Word, Excel, PowerPoint ও Outlook-এ কাজ করে।<ul><li>সাধারণ ডকুমেন্টের জন্য <b>বিজয় ইউনিকোড</b> আর একটি ইউনিকোড বাংলা ফন্ট বেছে নিন; <b>Noto Sans Bengali</b> সবচেয়ে সুন্দর দেখায়।</li><li><b>SutonnyMJ</b> দিয়ে ছাপার কাজের জন্য <b>বিজয় ক্লাসিক</b> বেছে নিয়ে ফন্ট SutonnyMJ করুন।</li></ul><a href="#see">Word-এ টাইপ করার ভিডিও</a> দেখুন।' },
    { id: 'appleapps', p: 1, k: ['pages', 'keynote', 'numbers', 'notes', 'textedit', 'text edit', 'messages', 'imessage', 'mail', 'apple mail', 'safari', 'chrome', 'firefox', 'edge', 'brave', 'opera', 'browser', 'every app', 'all apps', 'any app', 'which apps', 'other apps',
        'পেজেস', 'কিনোট', 'নোটস', 'নোট', 'মেসেজ', 'মেইল', 'সাফারি', 'ক্রোম', 'ফায়ারফক্স', 'ব্রাউজার', 'সব অ্যাপ', 'সব জায়গায়', 'কোন কোন অ্যাপ', 'যেকোনো অ্যাপ'],
      en: 'Yes. It works in any Mac app where you can type: Pages, Keynote, Numbers, Notes, TextEdit, Messages, Mail, and every browser (Safari, Chrome, Edge, Firefox, Brave). Choose it from the input menu and start typing.',
      bn: 'হ্যাঁ। ম্যাকের যেকোনো অ্যাপে, যেখানে টাইপ করা যায়, কাজ করে: Pages, Keynote, Numbers, Notes, TextEdit, Messages, Mail এবং সব ব্রাউজার (Safari, Chrome, Edge, Firefox, Brave)। ইনপুট মেনু থেকে বেছে নিয়ে লিখতে শুরু করুন।' },
    { id: 'webapps', p: 1, k: ['google docs', 'google doc', 'gmail', 'google sheets', 'google slides', 'canva', 'notion', 'wordpress', 'blog', 'website', 'online form', 'chatgpt', 'zoom', 'teams', 'slack', 'skype',
        'গুগল ডক', 'গুগল ডকস', 'জিমেইল', 'ক্যানভা', 'ওয়ার্ডপ্রেস', 'ব্লগ', 'ওয়েবসাইটে', 'ফর্ম', 'জুম'],
      en: 'Yes. Google Docs, Gmail, Canva, Notion, WordPress, Zoom, Teams, Slack and other websites and apps all take Bangla from it. Use <b>বিজয় ইউনিকোড</b>, so the text shows correctly for everyone.',
      bn: 'হ্যাঁ। Google Docs, Gmail, Canva, Notion, WordPress, Zoom, Teams, Slack সহ সব ওয়েবসাইট ও অ্যাপে এটি দিয়ে বাংলা লেখা যায়। <b>বিজয় ইউনিকোড</b> ব্যবহার করুন, যাতে সবার কাছে লেখা ঠিকভাবে দেখায়।' },
    { id: 'adobe', p: 2, k: ['photoshop', 'illustrator', 'indesign', 'adobe', 'premiere', 'after effects', 'coreldraw', 'corel', 'figma', 'affinity', 'quarkxpress',
        'ফটোশপ', 'ইলাস্ট্রেটর', 'ইলাস্ট্রেটর', 'ইনডিজাইন', 'অ্যাডোবি', 'এডোবি', 'প্রিমিয়ার', 'কোরেল'],
      en: 'Yes.<ul><li><b>বিজয় ক্লাসিক</b> with <b>SutonnyMJ</b> works straight away in Photoshop, Illustrator, InDesign and QuarkXPress, as in print shops.</li><li>For <b>বিজয় ইউনিকোড</b> in Adobe apps, choose a Unicode Bangla font and turn on the <b>World-Ready</b> (Middle Eastern and South Asian) composer in the Paragraph panel menu. Without it, vowel signs and যুক্তাক্ষর can look broken.</li></ul>',
      bn: 'হ্যাঁ।<ul><li><b>বিজয় ক্লাসিক</b> আর <b>SutonnyMJ</b> দিয়ে Photoshop, Illustrator, InDesign ও QuarkXPress-এ সরাসরি কাজ হয়, ছাপাখানার মতোই।</li><li>Adobe অ্যাপে <b>বিজয় ইউনিকোড</b> ব্যবহার করলে একটি ইউনিকোড বাংলা ফন্ট বেছে নিন এবং Paragraph প্যানেলের মেনু থেকে <b>World-Ready</b> (Middle Eastern and South Asian) কম্পোজার চালু করুন। না করলে কার ও যুক্তাক্ষর ভাঙা দেখাতে পারে।</li></ul>' },
    { id: 'broken', p: 1, k: ['boxes', 'box', 'squares', 'question marks', 'broken', 'separate letters', 'not joining', 'letters break', 'wrong shape', 'kar is separate', 'looks wrong',
        'ভেঙে', 'ভাঙা', 'বক্স', 'চারকোনা', 'আলাদা', 'জোড়া লাগছে না', 'ঠিকমতো দেখাচ্ছে না', 'উল্টাপাল্টা', 'ভুল দেখাচ্ছে'],
      en: 'That is almost always the font, not the keyboard:<ul><li>Boxes or broken letters with বিজয় ইউনিকোড: choose a Unicode Bangla font such as <b>Noto Sans Bengali</b> or Kohinoor Bangla.</li><li>Letters like “Avgvi”: the text is বিজয় ক্লাসিক, so set the font to <b>SutonnyMJ</b>, or retype with বিজয় ইউনিকোড.</li><li>In Photoshop, Illustrator or InDesign, turn on the World-Ready composer.</li></ul>',
      bn: 'এটি প্রায় সবসময় ফন্টের সমস্যা, কীবোর্ডের নয়:<ul><li>বিজয় ইউনিকোডে বক্স বা ভাঙা অক্ষর: <b>Noto Sans Bengali</b> বা Kohinoor Bangla-র মতো ইউনিকোড বাংলা ফন্ট বেছে নিন।</li><li>“Avgvi” এর মতো অক্ষর: লেখাটি বিজয় ক্লাসিকে, তাই ফন্ট <b>SutonnyMJ</b> করুন, অথবা বিজয় ইউনিকোডে আবার লিখুন।</li><li>Photoshop, Illustrator বা InDesign-এ World-Ready কম্পোজার চালু করুন।</li></ul>' },
    // ---- About the app ----
    { id: 'offline', p: 1, k: ['internet', 'offline', 'online', 'wifi', 'wi-fi', 'without internet', 'need internet', 'ইন্টারনেট', 'অফলাইন', 'নেট ছাড়া', 'ওয়াইফাই', 'net lagbe'],
      en: 'No internet is needed. Once installed, it works completely offline.',
      bn: 'ইন্টারনেট লাগবে না। ইনস্টলের পর এটি পুরোপুরি অফলাইনে কাজ করে।' },
    { id: 'privacy', p: 1, k: ['privacy', 'private', 'collect', 'data', 'track', 'tracking', 'keylogger', 'spy', 'record', 'send my', 'গোপনীয়তা', 'তথ্য', 'ডেটা', 'ডাটা', 'নজরদারি'],
      en: 'Your typing stays on your Mac. Bijoy Bangla does not collect, store or send anything, and it does not use the internet. The full source code is on <a href="' + GH + '">GitHub</a> for anyone to check.',
      bn: 'আপনার লেখা আপনার ম্যাকেই থাকে। বিজয় বাংলা কিছু সংগ্রহ, সংরক্ষণ বা কোথাও পাঠায় না, ইন্টারনেটও ব্যবহার করে না। পুরো সোর্স কোড <a href="' + GH + '">GitHub</a>-এ আছে, যে কেউ যাচাই করতে পারেন।' },
    { id: 'size', p: 1, k: ['size', 'how big', 'mb', 'megabyte', 'space', 'slow', 'battery', 'memory', 'ram', 'heavy', 'performance', 'সাইজ', 'আকার', 'মেগাবাইট', 'জায়গা', 'ধীর', 'স্লো', 'ব্যাটারি', 'হ্যাং'],
      en: 'It is tiny: the installer is about 1 MB. It only works while you type, so it does not slow your Mac or drain the battery.',
      bn: 'এটি খুব ছোট: ইনস্টলার প্রায় ১ মেগাবাইট। শুধু টাইপ করার সময় কাজ করে, তাই ম্যাক ধীর করে না বা ব্যাটারি খরচ করে না।' },
    { id: 'convert', p: 1, k: ['convert', 'converter', 'conversion', 'sutonny to unicode', 'classic to unicode', 'unicode to sutonny', 'change old text', 'কনভার্ট', 'কনভার্টার', 'রূপান্তর', 'ইউনিকোডে নেব'],
      en: 'Bijoy Bangla types new text; it does not convert text you already have between SutonnyMJ (classic) and Unicode. For new writing, pick the mode you need before you type.',
      bn: 'বিজয় বাংলা নতুন লেখা টাইপ করে; আগে থেকে থাকা লেখা SutonnyMJ (ক্লাসিক) থেকে ইউনিকোডে বা উল্টোটা রূপান্তর করে না। নতুন লেখার আগে দরকার মতো মোড বেছে নিন।' },
    { id: 'official', p: 1, k: ['bayanno', 'bijoy 52', 'bijoy ekushe', 'ekushe', 'official', 'ananda', 'serial', 'serial key', 'license key', 'activation key', 'product key', 'crack', 'original bijoy',
        'বায়ান্ন', 'একুশে', 'আনন্দ', 'অফিসিয়াল', 'সিরিয়াল', 'ক্র্যাক', 'লাইসেন্স কী', 'আসল বিজয়'],
      en: 'Bijoy Bangla for Mac is an independent, free keyboard that uses the familiar Bijoy key layout. It is not affiliated with Ananda Computers, and it needs no serial number, licence key or activation code.',
      bn: 'বিজয় বাংলা ফর ম্যাক একটি স্বতন্ত্র, বিনামূল্যের কীবোর্ড, যা পরিচিত বিজয় লেআউট ব্যবহার করে। আনন্দ কম্পিউটার্সের সঙ্গে এর কোনো সম্পর্ক নেই, আর এতে কোনো সিরিয়াল নম্বর, লাইসেন্স কী বা অ্যাক্টিভেশন কোড লাগে না।' },
    { id: 'hardware', p: 1, k: ['uk keyboard', 'irish keyboard', 'us keyboard', 'iso', 'azerty', 'qwertz', 'external keyboard', 'magic keyboard', 'logitech', 'bluetooth keyboard', 'keyboard sticker', 'stickers', 'my keyboard layout',
        'বাহ্যিক কীবোর্ড', 'ব্লুটুথ কীবোর্ড', 'স্টিকার', 'ইউকে কীবোর্ড'],
      en: 'It works with any Mac keyboard: the built-in one, a Magic Keyboard or any USB or Bluetooth keyboard, US, UK or other. It goes by where the keys are, so the Bijoy letters are always in the usual places. You do not need Bangla stickers; you can print the <a href="/Bijoy-Keyboard-Layout.pdf">layout (PDF)</a>.',
      bn: 'ম্যাকের যেকোনো কীবোর্ডে কাজ করে: বিল্ট-ইন, Magic Keyboard বা যেকোনো USB বা ব্লুটুথ কীবোর্ড, US, UK বা অন্য যেকোনো। এটি কী-এর অবস্থান দেখে কাজ করে, তাই বিজয়ের অক্ষর সবসময় চেনা জায়গাতেই থাকে। বাংলা স্টিকার লাগবে না; চাইলে <a href="/Bijoy-Keyboard-Layout.pdf">লেআউট (PDF)</a> প্রিন্ট করতে পারেন।' },
    { id: 'learn', p: 1, k: ['learn', 'practice', 'practise', 'beginner', 'tutorial', 'teach', 'new to bijoy', 'never used', 'how to learn', 'typing speed',
        'শিখব', 'শিখবো', 'শেখা', 'শিখতে', 'অনুশীলন', 'প্র্যাকটিস', 'নতুন শিখছি', 'শেখার'],
      en: 'Practise with the <a href="#layout">keyboard on this page</a>: hold Shift to see the second letter on each key, and tap <b>Full screen</b> for a big typing area. Start with the home row (<kbd>F</kbd> = া, <kbd>D</kbd> = ি, <kbd>J</kbd> = ক, <kbd>K</kbd> = ত), print the <a href="/Bijoy-Keyboard-Layout.pdf">layout (PDF)</a>, and ask me how to type any word.',
      bn: 'এই পাতার <a href="#layout">কীবোর্ডে</a> অনুশীলন করুন: প্রতিটি কী-এর দ্বিতীয় অক্ষর দেখতে Shift চাপুন, আর বড় জায়গায় লিখতে <b>পূর্ণ স্ক্রিন</b> চাপুন। মাঝের সারি দিয়ে শুরু করুন (<kbd>F</kbd> = া, <kbd>D</kbd> = ি, <kbd>J</kbd> = ক, <kbd>K</kbd> = ত), <a href="/Bijoy-Keyboard-Layout.pdf">লেআউট (PDF)</a> প্রিন্ট করুন, আর যেকোনো শব্দ কীভাবে লিখবেন আমাকে জিজ্ঞেস করুন।' },
    { id: 'password', p: 1, k: ['admin', 'administrator', 'password', 'admin password', 'পাসওয়ার্ড', 'অ্যাডমিন'],
      en: 'Your Mac password is needed once, to install, because it installs for all users of the Mac. Typing never asks for it. Uninstalling asks again.',
      bn: 'ইনস্টল করার সময় একবার ম্যাকের পাসওয়ার্ড লাগে, কারণ এটি ম্যাকের সব ব্যবহারকারীর জন্য ইনস্টল হয়। টাইপ করার সময় কখনো লাগে না। আনইনস্টল করার সময় আবার চাইবে।' },
    { id: 'default', p: 1, k: ['default', 'every time', 'startup', 'start up', 'remember', 'automatically', 'always bangla', 'login', 'ডিফল্ট', 'প্রতিবার', 'সবসময় বাংলা', 'চালু হলে'],
      en: 'macOS remembers the input source you used last, so it stays selected. Switch any time with <kbd>Control</kbd>+<kbd>Space</kbd> or the Globe key. If you do not want other keyboards in the menu, remove them in System Settings → Keyboard → Input Sources (select one, then <b>−</b>).',
      bn: 'macOS শেষবার ব্যবহার করা ইনপুট সোর্স মনে রাখে, তাই এটি বেছে নেওয়াই থাকে। যেকোনো সময় <kbd>Control</kbd>+<kbd>Space</kbd> বা Globe কী দিয়ে বদলান। মেনুতে অন্য কীবোর্ড না চাইলে System Settings → Keyboard → Input Sources-এ গিয়ে সেটি বেছে <b>−</b> চাপুন।' },
    { id: 'macupdate', p: 1, k: ['after update', 'macos update', 'after updating', 'stopped working', 'suddenly', 'disappeared', 'gone from menu', 'আপডেটের পর', 'হঠাৎ', 'হারিয়ে গেছে', 'উধাও', 'বন্ধ হয়ে গেছে'],
      en: 'If it stopped working or disappeared after a macOS update:<ol><li>Pick বিজয় ইউনিকোড again from the input menu.</li><li>If it is not there, download and install the latest version from this page.</li><li>Log out and sign back in.</li></ol>Still stuck? <a href="' + GH + '/issues">Tell us on GitHub</a>.',
      bn: 'macOS আপডেটের পর কাজ না করলে বা হারিয়ে গেলে:<ol><li>ইনপুট মেনু থেকে আবার বিজয় ইউনিকোড বেছে নিন।</li><li>সেখানে না থাকলে এই পাতা থেকে সর্বশেষ সংস্করণ ডাউনলোড করে ইনস্টল করুন।</li><li>Log Out করে আবার সাইন ইন করুন।</li></ol>তবুও সমস্যা হলে <a href="' + GH + '/issues">GitHub-এ জানান</a>।' },
    { id: 'spell', p: 1, k: ['spell', 'spelling', 'spell check', 'autocorrect', 'red line', 'red underline', 'বানান', 'লাল দাগ'],
      en: 'Bijoy Bangla types the letters you press; it does not check spelling. If Word or Pages underlines Bangla in red, that is the app’s English spell checker. You can switch it off for that text, or set the text language to Bangla.',
      bn: 'বিজয় বাংলা যে কী চাপেন সেই অক্ষরই লেখে; বানান যাচাই করে না। Word বা Pages বাংলার নিচে লাল দাগ দিলে সেটি অ্যাপের ইংরেজি বানান-যাচাই। সেই লেখার জন্য এটি বন্ধ করতে পারেন, বা লেখার ভাষা বাংলা করে দিতে পারেন।' },
    { id: 'share', p: 1, k: ['share', 'friend', 'another mac', 'other mac', 'many macs', 'how many computers', 'commercial', 'business', 'company', 'office use', 'school', 'organisation', 'organization',
        'অন্য ম্যাক', 'বন্ধু', 'শেয়ার', 'বাণিজ্যিক', 'অফিসে', 'প্রতিষ্ঠান', 'স্কুল', 'কয়টা ম্যাকে'],
      en: 'Install it on as many Macs as you like, at home, at school or at work, including for business. It is free under the MIT licence. To share it, send people the link <b>bijoybanglaformac.com</b>.',
      bn: 'যত খুশি ম্যাকে ইনস্টল করুন, বাসায়, স্কুলে বা অফিসে, ব্যবসার কাজেও। MIT লাইসেন্সে এটি বিনামূল্যে। অন্যদের দিতে <b>bijoybanglaformac.com</b> লিংকটি পাঠান।' },
    { id: 'shortcutold', p: 1, k: ['ctrl alt b', 'ctrl+alt+b', 'control alt b', 'f12', 'bijoy shortcut', 'old shortcut', 'like windows'],
      en: 'On a Mac there is no Ctrl+Alt+B or F12 like on Windows. Use <kbd>Control</kbd>+<kbd>Space</kbd> or the Globe key to switch between Bangla and English.',
      bn: 'ম্যাকে উইন্ডোজের মতো Ctrl+Alt+B বা F12 নেই। বাংলা ও ইংরেজির মধ্যে বদলাতে <kbd>Control</kbd>+<kbd>Space</kbd> বা Globe কী ব্যবহার করুন।' },
    { id: 'saved', p: 1, k: ['where is my file', 'where did it save', 'saved file', 'txt file', 'downloads folder', 'ফাইল কোথায়', 'সেভ কোথায়', 'কোথায় সেভ'],
      en: 'The <b>Save</b> button on this page’s keyboard downloads a .txt file named with the date and time. On a Mac and Android it goes to <b>Downloads</b>; on iPhone Safari asks first, then it is in the Files app under Downloads.',
      bn: 'এই পাতার কীবোর্ডের <b>সেভ করুন</b> বোতাম তারিখ ও সময়ের নামে একটি .txt ফাইল ডাউনলোড করে। ম্যাক ও অ্যান্ড্রয়েডে সেটি <b>Downloads</b>-এ যায়; আইফোনে Safari আগে জিজ্ঞেস করে, তারপর Files অ্যাপের Downloads-এ পাওয়া যায়।' },
    // ---- From the install steps, installer screens and the rest of the page ----
    { id: 'menubar', p: 2, k: ['input menu missing', 'no input menu', 'menu icon', 'icon', 'missing', 'menu bar icon', 'no icon', 'icon missing', 'top right', 'show input menu', 'where is the menu', 'can\'t see the menu', 'flag icon',
        'মেনু বার', 'মেনু দেখছি না', 'আইকন নেই', 'আইকন দেখা যাচ্ছে না', 'ইনপুট মেনু নেই', 'ইনপুট মেনু কোথায়'],
      en: 'The input menu is the small icon near the clock, at the top right of the screen. If it is missing, open System Settings → Keyboard → Input Sources → Edit… and turn on <b>Show Input menu in menu bar</b>.',
      bn: 'ইনপুট মেনু হলো স্ক্রিনের উপরে ডানদিকে, ঘড়ির পাশের ছোট আইকনটি। সেটি না থাকলে System Settings → Keyboard → Input Sources → Edit… খুলে <b>Show Input menu in menu bar</b> চালু করুন।' },
    { id: 'logout', p: 1, k: ['log out', 'logout', 'sign out', 'restart', 'reboot', 'why log out', 'do i need to restart', 'লগ আউট', 'লগআউট', 'রিস্টার্ট', 'সাইন আউট', 'আবার চালু'],
      en: 'macOS loads new keyboards when you sign in, so after installing, log out and sign back in once (a restart works too). After that, বিজয় ইউনিকোড and বিজয় ক্লাসিক appear in the input menu.',
      bn: 'macOS সাইন ইন করার সময় নতুন কীবোর্ড চালু করে। তাই ইনস্টলের পর একবার লগ আউট করে আবার সাইন ইন করুন (রিস্টার্ট করলেও চলবে)। তারপর ইনপুট মেনুতে বিজয় ইউনিকোড ও বিজয় ক্লাসিক দেখা যাবে।' },
    { id: 'allow', p: 1, k: ['allow', 'permission', 'prompt', 'pop up', 'popup', 'asks to allow', 'enable bijoy bangla', 'অনুমতি', 'অ্যালাও', 'পপআপ', 'জানতে চাইছে'],
      en: 'If macOS asks “Allow Bijoy Bangla to enable Bijoy Bangla?”, click <b>Allow</b>. It is macOS checking that you want the new keyboard. Then log out and sign back in. If you missed it, add the keyboard in System Settings → Keyboard → Input Sources.',
      bn: 'macOS যদি জিজ্ঞেস করে “Allow Bijoy Bangla to enable Bijoy Bangla?”, তাহলে <b>Allow</b>-এ ক্লিক করুন। নতুন কীবোর্ড চালু করতে চান কি না, macOS তা নিশ্চিত হয়ে নিচ্ছে। তারপর লগ আউট করে আবার সাইন ইন করুন। বার্তাটি চলে গেলে System Settings → Keyboard → Input Sources থেকে কীবোর্ডটি যোগ করুন।' },
    { id: 'diskspace', p: 1, k: ['disk space', 'storage', 'install location', 'all users', 'destination', 'which disk', 'where is it installed', 'জায়গা লাগবে', 'কোথায় ইনস্টল', 'সব ব্যবহারকারী'],
      en: 'Leave “Install for all users of this computer” selected. It installs into /Library/Input Methods and needs about 1.7 MB of disk space.',
      bn: '“Install for all users of this computer” যেমন আছে তেমন রাখুন। এটি /Library/Input Methods-এ ইনস্টল হয় এবং প্রায় ১.৭ মেগাবাইট জায়গা লাগে।' },
    { id: 'guide', p: 1, k: ['activation guide', 'guide', 'manual', 'instructions', 'step by step', 'pictures', 'গাইড', 'নির্দেশিকা', 'ধাপে ধাপে', 'ম্যানুয়াল'],
      en: 'The <a href="/Activation-Guide.pdf">Activation Guide (PDF)</a> shows every step with pictures: installing, allowing the input source and choosing বিজয় ইউনিকোড. The <a href="#install">install steps</a> on this page show the four installer screens.',
      bn: '<a href="/Activation-Guide.pdf">অ্যাক্টিভেশন গাইডে (PDF)</a> ছবিসহ প্রতিটি ধাপ দেখানো আছে: ইনস্টল, ইনপুট সোর্সের অনুমতি ও বিজয় ইউনিকোড বেছে নেওয়া। এই পাতার <a href="#install">ইনস্টলের ধাপে</a> ইনস্টলারের চারটি স্ক্রিনও দেখতে পাবেন।' },
    { id: 'version', p: 1, k: ['current version', 'latest version', 'which version', 'version number', 'what version', 'version', 'release', 'বর্তমান সংস্করণ', 'সর্বশেষ সংস্করণ', 'কোন সংস্করণ', 'ভার্সন কত'],
      dyn: function (bn) {
        var v = (document.querySelector('.ver') || {}).textContent || '';
        return bn ? 'বর্তমান সংস্করণ <b>' + v + '</b>, আকার প্রায় ১ মেগাবাইট। প্রতিটি সংস্করণে কী বদলেছে, দেখুন <a href="#news">নতুন কী এসেছে</a>।'
                  : 'The current version is <b>' + v + '</b>, about 1 MB. See <a href="#news">What’s new</a> for the changes in each version.';
      } },
    { id: 'count', p: 1, k: ['how many downloads', 'downloads', 'how many people', 'how many users', 'popular', 'visitors', 'কতজন', 'কত বার ডাউনলোড', 'কতবার ডাউনলোড', 'ডাউনলোড সংখ্যা', 'কত মানুষ'],
      dyn: function (bn) {
        var d = (document.querySelector('.dl-count') || {}).textContent || '';
        if (!d.trim()) return bn ? 'ডাউনলোডের সংখ্যা এই মুহূর্তে পাওয়া যাচ্ছে না। পাতার উপরে Download বোতামের পাশে সংখ্যাটি দেখা যায়।' : 'The download count is not available right now. It is shown next to the Download button at the top of the page.';
        return bn ? 'এখন পর্যন্ত <b>' + d.trim() + '</b>। পাতার নিচে দর্শকের সংখ্যাও দেখা যায়।' : 'So far: <b>' + d.trim() + '</b>. Visitor numbers are at the bottom of the page.';
      } },
    { id: 'tryit', p: 1, k: ['try it', 'try before', 'test it', 'demo', 'try online', 'without installing', 'sample words', 'টেস্ট', 'ডেমো', 'ইনস্টল না করে', 'চেষ্টা করে দেখ', 'নমুনা শব্দ'],
      en: 'You can try it right here without installing: type Bijoy keys in the box at the top of the page (for example <kbd>H</kbd> <kbd>F</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>Q</kbd></span> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>V</kbd></span> <kbd>F</kbd> = বাংলা) or tap a sample word, or use the full <a href="#layout">keyboard on this page</a>.',
      bn: 'ইনস্টল না করেই এখানে চেষ্টা করে দেখতে পারেন: পাতার উপরের বক্সে বিজয় কী টাইপ করুন (যেমন <kbd>H</kbd> <kbd>F</kbd> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>Q</kbd></span> <span class="hk-shift"><kbd>Shift</kbd>+<kbd>V</kbd></span> <kbd>F</kbd> = বাংলা), কোনো নমুনা শব্দে ট্যাপ করুন, অথবা এই পাতার পুরো <a href="#layout">কীবোর্ড</a> ব্যবহার করুন।' },
    { id: 'appmenu', p: 1, k: ['menu items', 'menu', 'options', 'what is in the menu', 'options in the menu', 'about bijoy bangla', 'menu options', 'settings', 'preferences', 'মেনুতে কী', 'অপশন', 'সেটিংস'],
      en: 'The input menu (top right of the screen) has: English, বিজয় ইউনিকোড, বিজয় ক্লাসিক, <b>Show Bijoy Keyboard Layout…</b>, <b>About Bijoy Bangla</b>, <b>Keep Bangla - InScript Off</b> and <b>Uninstall Bijoy Bangla…</b>',
      bn: 'ইনপুট মেনুতে (স্ক্রিনের উপরে ডানদিকে) আছে: English, বিজয় ইউনিকোড, বিজয় ক্লাসিক, <b>Show Bijoy Keyboard Layout…</b>, <b>About Bijoy Bangla</b>, <b>Keep Bangla - InScript Off</b> এবং <b>Uninstall Bijoy Bangla…</b>' },
    { id: 'shortcutfix', p: 2, k: ['control space not working', 'control-space not working', 'shortcut not working', 'ctrl space not working', 'globe key not working', 'switching not working', 'শর্টকাট কাজ করছে না', 'বদলাচ্ছে না', 'সুইচ হচ্ছে না'],
      en: 'Check System Settings → Keyboard → Keyboard Shortcuts… → Input Sources, and turn on <b>Select the previous input source</b> (<kbd>Control</kbd>+<kbd>Space</kbd>). For the Globe key, set “Press 🌐 key to” <b>Change Input Source</b> in System Settings → Keyboard.',
      bn: 'System Settings → Keyboard → Keyboard Shortcuts… → Input Sources-এ গিয়ে <b>Select the previous input source</b> (<kbd>Control</kbd>+<kbd>Space</kbd>) চালু করুন। Globe কী-এর জন্য System Settings → Keyboard-এ “Press 🌐 key to” অপশনে <b>Change Input Source</b> বেছে দিন।' },
    { id: 'whatis', p: 0, k: ['what is this', 'what is bijoy', 'what does it do', 'tell me about', 'about this app', 'bijoy bangla for mac', 'এটা কী', 'এটি কী', 'কী কাজ করে', 'সম্পর্কে বলুন', 'বিজয় বাংলা ফর ম্যাক কী'],
      en: '<b>Bijoy Bangla for Mac</b> is a free, open-source Bangla keyboard for macOS with the familiar Bijoy layout. Type Bangla in Word, Pages, Google Docs, Safari, Chrome, Facebook, WhatsApp, Gmail and every other Mac app, in Unicode or classic SutonnyMJ text.',
      bn: '<b>বিজয় বাংলা ফর ম্যাক</b> macOS এর জন্য বিনামূল্যের, ওপেন-সোর্স বাংলা কীবোর্ড, যাতে রয়েছে পরিচিত বিজয় লেআউট। Word, Pages, Google Docs, Safari, Chrome, Facebook, WhatsApp, Gmail-সহ ম্যাকের সব অ্যাপে ইউনিকোড বা ক্লাসিক SutonnyMJ লেখায় বাংলা লিখুন।' },
    { id: 'online', p: 1, k: ['display correctly', 'show correctly', 'others see', 'other people see', 'will people see', 'readable', 'ঠিকভাবে দেখাবে', 'অন্যরা দেখতে পাবে', 'সবাই দেখতে পাবে', 'পড়তে পারবে'],
      en: 'Yes, with <b>বিজয় ইউনিকোড</b>. The text is standard Unicode Bangla, so it shows correctly in every browser and app that supports Bangla: Word, Pages, WordPress, Facebook and the rest, on phones and computers alike.',
      bn: 'হ্যাঁ, <b>বিজয় ইউনিকোডে</b> লিখলে। লেখাটি আদর্শ ইউনিকোড বাংলা, তাই বাংলা সমর্থন করে এমন সব ব্রাউজার ও অ্যাপে, যেমন Word, Pages, WordPress, Facebook-এ, ফোন ও কম্পিউটার দুই জায়গাতেই ঠিকভাবে দেখায়।' },
    { id: 'hello', k: ['hello', 'hi', 'hey', 'salam', 'assalamu', 'good morning', 'হ্যালো', 'হাই', 'সালাম', 'আসসালামু', 'নমস্কার', 'কেমন আছ'],
      en: 'Hello! Ask me anything about Bijoy Bangla for Mac, or type a Bangla word and I will show you the keys for it.',
      bn: 'হ্যালো! বিজয় বাংলা ফর ম্যাক নিয়ে যা জানতে চান জিজ্ঞেস করুন, অথবা একটি বাংলা শব্দ লিখুন, কোন কী চাপতে হবে দেখিয়ে দেব।' },
    { id: 'thanks', k: ['thank', 'thanks', 'great', 'perfect', 'awesome', 'ধন্যবাদ', 'অনেক ধন্যবাদ', 'thanks a lot', 'dhonnobad'],
      en: 'You are welcome! Happy typing in Bangla.',
      bn: 'আপনাকেও ধন্যবাদ! শুভ হোক আপনার বাংলা লেখা।' }
  ];

  // Your own answers from my-answers.js come first, so they win a tie with a built-in one
  var mine = null;
  function allAnswers() {
    if (mine === null) {
      mine = (window.BIJOY_MY_ANSWERS || []).filter(function (a) { return a && a.keywords && (a.en || a.bn); }).map(function (a) {
        return { id: 'my-' + a.id, k: a.keywords.map(function (w) { return String(w).toLowerCase(); }), en: a.en || a.bn, bn: a.bn || a.en, p: (+a.priority || 0) + 0.5 };
      });
    }
    return mine.concat(KB);
  }

  var SUGGEST = {
    en: ['How do I install it?', 'How do I type ক্ষ?', 'Does it work on Facebook?', 'Does it work in Word?', 'Unicode or Classic?', 'Switch to English', 'Is it free?'],
    bn: ['কীভাবে ইনস্টল করব?', 'ক্ষ কীভাবে লিখব?', 'ফেসবুকে কি কাজ করবে?', 'ওয়ার্ডে কি কাজ করবে?', 'ইউনিকোড না ক্লাসিক?', 'ইংরেজিতে কীভাবে বদলাব?', 'এটা কি ফ্রি?']
  };

  // ---------- Matching ----------
  var BN_RE = /[ঀ-৿]/;
  var TYPE_WORDS = /(লিখব|লিখবো|লিখতে|লেখা যায়|লিখি|লেখে|টাইপ|type|write|spell|keys for|likhbo|likhte|lekha)/i;
  var STOP = ['কিভাবে', 'কীভাবে', 'কেমনে', 'কেমন', 'করে', 'লিখব', 'লিখবো', 'লিখতে', 'লেখা', 'যায়', 'লিখি', 'টাইপ', 'করব', 'করবো', 'করতে', 'হয়', 'কি', 'কী',
    'বিজয়ে', 'দিয়ে', 'দিয়ে', 'শব্দ', 'শব্দটি', 'শব্দটা', 'অক্ষর', 'অক্ষরটি', 'এটা', 'এই', 'আমি', 'চাই', 'বলুন', 'বলো', 'দেখান', 'কোন', 'কী-বোর্ডে', 'কীবোর্ডে', 'এ', 'ও', 'আর'];
  function norm(s) { return ' ' + s.toLowerCase().replace(/[’']/g, "'").replace(/[?!.,;:()“”"]/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function score(q, item) {
    var best = 0;
    item.k.forEach(function (w) {
      // Bangla words may carry endings (ইংরেজিতে), English words must start a word (install, not uninstall)
      var hit = BN_RE.test(w) ? q.indexOf(w) >= 0 : q.indexOf(' ' + w + ' ') >= 0 || (w.length > 4 && q.indexOf(' ' + w) >= 0);
      if (hit) best += 1 + w.split(' ').length + (w.length > 6 ? 1 : 0);
    });
    return best ? best + (item.p || 0) : 0;
  }
  function banglaWords(text) {
    return (text.match(/[ঀ-৿‌‍]+/g) || []).filter(function (w) { return STOP.indexOf(w) < 0 && !/^[।]+$/.test(w); });
  }

  var bnAnswer = PAGE_BN;
  function answer(text) {
    var q = norm(text);
    bnAnswer = PAGE_BN || (BN_RE.test(text) && !/[a-z]{3,}/i.test(text.replace(/[ঀ-৿\s]/g, '')));
    var words = banglaWords(text);
    var scored = allAnswers().map(function (it) { return { it: it, s: score(q, it) }; }).sort(function (a, b) { return b.s - a.s; });
    // A question about typing a Bangla word, or just a Bangla word on its own
    // ...or just a Bangla word (or two) on its own, with no question around it
    var onlyWords = !/[a-z]/i.test(text) && (text.match(/[\u0980-\u09FF\u200C\u200D]+/g) || []).length === words.length && words.length <= 2;
    var asksTyping = words.length && (TYPE_WORDS.test(text) || (onlyWords && scored[0].s === 0));
    if (asksTyping) {
      var parts = words.slice(0, 4).map(function (w) {
        var k = keysFor(w);
        return k ? '<div class="hk-word"><span class="hk-bn" lang="bn">' + esc(w) + '</span><span class="hk-keys">' + keyCaps(k) + '</span></div>'
                 : '<div class="hk-word"><span class="hk-bn" lang="bn">' + esc(w) + '</span><span class="hk-miss">' + (bnAnswer ? 'এই শব্দের কী খুঁজে পাইনি' : 'I could not work this one out') + '</span></div>';
      }).join('');
      return (bnAnswer ? 'এই কী-গুলো পরপর চাপুন (বিজয় ইউনিকোড বা ক্লাসিক):' : 'Press these keys in order (in বিজয় ইউনিকোড or বিজয় ক্লাসিক):') + parts +
        '<p class="hk-note">' + (bnAnswer ? 'Shift + মানে Shift চেপে ধরে সেই কী চাপুন।' : 'Shift + means hold Shift while pressing that key.') + '</p>';
    }
    if (scored[0].s >= 2) { var it = scored[0].it; return it.dyn ? it.dyn(bnAnswer) : (bnAnswer ? it.bn : it.en); }
    return null;
  }

  // ---------- Chat window ----------
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var T = PAGE_BN
    ? { sugg: 'শব্দের পরামর্শ', modes: 'লেখার ধরন', mBijoy: 'বিজয়', mPhon: 'ফনেটিক', escTip: 'Esc চেপে বদলান',
        open: 'প্রশ্ন করুন', title: 'বিজয় বাংলা সহায়িকা', sub: 'সফটওয়্যার ও লেআউট নিয়ে প্রশ্নের উত্তর', ph: 'প্রশ্ন বা বাংলা শব্দ লিখুন…', send: 'পাঠান', close: 'বন্ধ করুন',
        hi: 'আসসালামু আলাইকুম! বিজয় বাংলা ফর ম্যাক নিয়ে যা জানতে চান জিজ্ঞেস করুন। কোনো বাংলা শব্দ লিখলে সেটি টাইপ করার কী-ও দেখিয়ে দেব।',
        miss: 'দুঃখিত, এর উত্তর আমার জানা নেই। কোনো শব্দ টাইপ করার কী জানতে লিখুন, যেমন “ক্ষ কীভাবে লিখব”। অথবা নিচের কোনো একটি বেছে নিন, বা <a href="' + GH + '/issues">GitHub-এ প্রশ্ন করুন</a>।' }
    : { sugg: 'Word suggestions', modes: 'Typing layout', mBijoy: 'Bijoy', mPhon: 'Phonetic', escTip: 'Press Esc to switch',
        open: 'Ask a question', title: 'Bijoy Bangla help', sub: 'Answers about the app and the layout', ph: 'Ask a question or type a Bangla word…', send: 'Send', close: 'Close',
        hi: 'Hi! Ask me anything about Bijoy Bangla for Mac. Type a Bangla word and I will show you the keys for it too.',
        miss: 'Sorry, I do not have an answer for that. To see the keys for a Bangla word, ask for example “how do I type ক্ষ”. Or try one of these, or <a href="' + GH + '/issues">ask on GitHub</a>.' };

  var CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h16v10H9l-5 4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" stroke-width="3"/></svg>';
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';

  var launcher = document.createElement('button');
  launcher.type = 'button'; launcher.className = 'hk-open'; launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = CHAT + '<span>' + T.open + '</span>';
  var box = document.createElement('div');
  box.className = 'hk-box'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', T.title);
  box.innerHTML = '<div class="hk-head"><picture class="hk-logo"><source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)"><img src="/logo.svg" alt="" width="58" height="36"></picture><div><b>' + T.title + '</b><small>' + T.sub + '</small></div>' +
    '<button type="button" class="hk-x" aria-label="' + T.close + '">' + X + '</button></div>' +
    '<div class="hk-modes" role="radiogroup" aria-label="' + T.modes + '">' +
      '<button type="button" role="radio" data-mode="bijoy">' + T.mBijoy + '</button>' +
      '<button type="button" role="radio" data-mode="phonetic">' + T.mPhon + '</button>' +
      '<button type="button" role="radio" data-mode="english">English</button>' +
      '<kbd class="hk-esc" title="' + T.escTip + '">Esc</kbd></div>' +
    '<div class="hk-log" aria-live="polite"></div>' +
    '<div class="hk-suggest" role="listbox" aria-label="' + T.sugg + '" hidden></div>' +
    '<form class="hk-form"><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" maxlength="300" placeholder="' + T.ph + '" aria-label="' + T.ph + '">' +
    '<button type="submit" aria-label="' + T.send + '">' + SEND + '</button></form>';
  document.body.appendChild(launcher); document.body.appendChild(box);
  var log = box.querySelector('.hk-log'), form = box.querySelector('.hk-form'), input = form.querySelector('input');

  function add(who, html) {
    var m = document.createElement('div'); m.className = 'hk-msg ' + who; m.innerHTML = html;
    var dl = document.querySelector('main .download');
    if (dl) m.querySelectorAll('a[href="' + PKG + '"]').forEach(function (a) { a.href = dl.href; });
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  }
  function chips(list) {
    var c = document.createElement('div'); c.className = 'hk-chips';
    list.forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = q;
      b.addEventListener('click', function () { ask(q); });
      c.appendChild(b);
    });
    log.appendChild(c); log.scrollTop = log.scrollHeight;
  }
  function ask(text) {
    text = text.trim(); if (!text) return;
    add('me', esc(text));
    var a = answer(text);
    var wait = add('bot hk-typing', '<span></span><span></span><span></span>');
    setTimeout(function () {
      wait.remove();
      if (a) add('bot', a);
      else { add('bot', T.miss); chips(SUGGEST[bnAnswer ? 'bn' : 'en']); }
    }, 350);
  }
  // Links inside answers that point to this page close the chat on phones so the section is visible
  log.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (a && a.getAttribute('href').charAt(0) === '#' && innerWidth <= 640) toggle(false);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); finish(); var t = input.value; input.value = ''; reset(); ask(t); });

  // ---------- Typing layouts for the chat box: Bijoy, Phonetic (Avro rules) and English ----------
  // The box holds: text before the word being typed (base), the Latin keys of that
  // word (raw, shown converted to Bangla) and the text after the cursor (tail).
  var MODES = ['bijoy', 'phonetic', 'english'], mode = PAGE_BN ? 'bijoy' : 'english';
  try { var saved = localStorage.getItem('hkMode'); if (MODES.indexOf(saved) >= 0) mode = saved; } catch (e) {}
  var base = '', raw = '', tail = '';
  var hasAvro = function () { return typeof OmicronLab !== 'undefined' && OmicronLab.Avro && OmicronLab.Avro.Phonetic; };
  function conv(r) {
    if (!r) return '';
    if (mode === 'bijoy') return Bijoy.render(Array.from(r));
    if (mode === 'phonetic' && hasAvro()) { var list = suggestFor(r); return list[Math.min(pick, list.length - 1)]; }
    return r;
  }

  // ---------- Word suggestions for phonetic typing ----------
  // Like Avro Keyboard: the typed Latin word is turned into a pattern of the Bangla
  // spellings it could stand for ("s" can be স, শ or ষ; "o" can be অ, ো or nothing...),
  // and matching words from a 110,000-word Bangla dictionary are offered, closest first.
  // The dictionary loads the first time Phonetic is used.
  var dict = null, dictIndex = null, dictLoading = false, pick = 0, sugCache = { key: '', list: [] };
  function loadDict() {
    if (dict || dictLoading) return;
    dictLoading = true;
    fetch('/bn-words.txt').then(function (r) { return r.ok ? r.text() : ''; }).then(function (txt) {
      var lines = txt.split('\n'), abc = Array.from(lines[1] || '');
      if (!abc.length) return;
      var decode = function (w) { var o = ''; for (var i = 0; i < w.length; i++) o += abc[w.charCodeAt(i) - 33] || ''; return o; };
      dict = []; dictIndex = {};
      for (var i = 2; i < lines.length; i++) {
        if (!lines[i]) continue;
        var w = decode(lines[i]); dict.push(w);
        var f = w.charAt(0); (dictIndex[f] = dictIndex[f] || []).push(w);
      }
      sugCache.key = '';
      if (raw && mode === 'phonetic') { draw(); }
    }).catch(function () {}).then(function () { dictLoading = false; });
  }
  var V = '(?:া|আ|অ|য়া|এ)';
  var TOKENS = [
    ['t``', 'ৎ'], ['kkh', 'ক্ষ'], ['kSh', 'ক্ষ'], ['rri', '(?:ৃ|ঋ|রি)'], ['oi', '(?:ৈ|ঐ|োই|ই)'], ['ou', '(?:ৌ|ঔ|োউ)'],
    ['kh', '(?:খ|ক্ষ)'], ['gh', 'ঘ'], ['Ng', 'ঙ'], ['ng', '(?:ং|ঙ|ঙ্গ)'], ['ch', '(?:ছ|চ)'], ['jh', 'ঝ'], ['NG', 'ঞ'],
    ['Th', 'ঠ'], ['Dh', 'ঢ'], ['th', '(?:থ|ঠ)'], ['dh', '(?:ধ|ঢ)'], ['ph', 'ফ'], ['bh', 'ভ'], ['Sh', 'ষ'], ['sh', '(?:শ|ষ|স|স্ব)'], ['Rh', 'ঢ়'],
    ['k', 'ক'], ['g', '(?:গ|জ্ঞ)'], ['c', '(?:চ|ছ)'], ['j', '(?:জ|য)'], ['T', '(?:ট|ত)'], ['t', '(?:ত|ট|ৎ)'], ['D', '(?:ড|দ)'], ['d', '(?:দ|ড)'],
    ['N', '(?:ণ|ন)'], ['n', '(?:ন|ণ|ং)'], ['p', 'প'], ['f', 'ফ'], ['b', 'ব'], ['v', 'ভ'], ['m', 'ম'], ['z', '(?:য|জ)'], ['y', '(?:য়|্য|ই)'],
    ['Y', 'য়'], ['r', '(?:র|ড়|ঋ|ৃ)'], ['R', '(?:ড়|ঢ়)'], ['l', 'ল'], ['S', '(?:শ|ষ)'], ['s', '(?:স|শ|ষ|স্ব)'], ['h', '(?:হ|ঃ)'], ['w', '(?:ও|ব|্ব)'],
    ['x', 'ক্স'], ['q', 'ক'],
    ['a', V], ['i', '(?:ি|ী|ই|ঈ|য়ি)'], ['I', '(?:ী|ঈ)'], ['u', '(?:ু|ূ|উ|ঊ)'], ['U', '(?:ূ|ঊ)'], ['e', '(?:ে|এ|্যা|অ্যা|য়ে)'],
    ['o', '(?:ো|অ|ও|য়ো)?'], ['O', '(?:ো|ও)'], ['^', 'ঁ'], [':', 'ঃ']
  ];
  var VOWELS = /^(?:a|i|I|u|U|e|o|O|oi|ou|rri)$/;
  // The typed word as a list of regex pieces, one per sound
  function pieces(r) {
    var out = [], i = 0, prevCons = false, prevTok = '';
    while (i < r.length) {
      var hit = null, t;
      for (t = 0; t < TOKENS.length && !hit; t++) if (r.substr(i, TOKENS[t][0].length) === TOKENS[t][0]) hit = TOKENS[t];
      for (t = 0; t < TOKENS.length && !hit; t++) if (r.substr(i, TOKENS[t][0].length).toLowerCase() === TOKENS[t][0].toLowerCase()) hit = TOKENS[t];
      if (!hit) return null;
      var cons = !VOWELS.test(hit[0]) && hit[0] !== '^' && hit[0] !== ':';
      var piece = (cons && prevCons ? '্?' : '') + hit[1];
      // A doubled letter often stands for য-ফলা: "biddaloy" = বিদ্যালয়, "dhonnobad" = ধন্যবাদ
      if (cons && prevCons && hit[0] === prevTok) piece = '(?:' + piece + '|্য)';
      out.push(piece.normalize('NFC'));
      prevCons = cons; prevTok = hit[0]; i += hit[0].length;
    }
    return out;
  }
  // Letters a match can start with, so only those parts of the dictionary are searched
  function starts(ps) {
    var set = {}, k = 0;
    while (k < ps.length) {
      var p = ps[k], optional = /\)\?$/.test(p);
      p.replace(/^\(\?:/, '').replace(/\)\??$/, '').split('|').forEach(function (alt) { if (alt) set[alt.charAt(0)] = 1; });
      if (!optional) break;
      k++;
    }
    return Object.keys(set);
  }
  var SUFFIXES = [['der', 'দের'], ['er', 'ের'], ['r', 'র'], ['ke', 'কে'], ['te', 'তে'], ['ra', 'রা'], ['gulo', 'গুলো'], ['ta', 'টা'], ['ti', 'টি'], ['e', 'ে']];
  var matchCache = {};
  function matches(r) {
    if (matchCache[r]) return matchCache[r].slice();
    var ps = pieces(r), found = [];
    if (ps && ps.length) {
      var re = new RegExp('^' + ps.join('') + '$');
      starts(ps).forEach(function (f) {
        var bucket = dictIndex[f] || [];
        for (var k = 0; k < bucket.length; k++) if (re.test(bucket[k])) found.push(bucket[k]);
      });
    }
    matchCache[r] = found;
    return found.slice();
  }
  function distance(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) d[i] = [i];
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function suggestFor(r) {
    var key = r + '|' + (dict ? 1 : 0);
    if (sugCache.key === key) return sugCache.list;
    var avro = OmicronLab.Avro.Phonetic.parse(r).normalize('NFC'), list = [];
    var found = dict && /^[A-Za-z`^:]+$/.test(r) ? matches(r) : [];
    // Word endings the dictionary often lacks: সোনা + র, বাংলাদেশ + ের, তোমা + কে...
    if (dict && (!found.length || distance(found[0], avro) > 1)) {
      SUFFIXES.forEach(function (sf) {
        if (r.length - sf[0].length < 2 || r.slice(-sf[0].length) !== sf[0]) return;
        matches(r.slice(0, -sf[0].length)).slice(0, 4).forEach(function (w) { found.push(w + sf[1]); });
      });
    }
    var seen = {};
    found = found.filter(function (w) { return seen[w] ? false : (seen[w] = 1); });
    found.sort(function (x, y) { return (distance(x, avro) - distance(y, avro)) || (x.length - y.length); });
    list = found.slice(0, 5);
    // A dictionary word goes first only when it is close to what was typed; otherwise
    // Avro's own spelling comes first, so Space never puts in an unexpected word
    var i0 = list.indexOf(avro);
    if (i0 > 0) list.splice(i0, 1);
    if (i0 !== 0) list.splice(list.length && distance(list[0], avro) <= 1 ? 1 : 0, 0, avro);
    if (list.length > 6) list.length = 6;
    sugCache = { key: key, list: list };
    return list;
  }
  var sugBar = null;
  function showSuggestions() {
    if (!sugBar) return;
    if (mode !== 'phonetic' || !raw || !hasAvro()) { sugBar.hidden = true; sugBar.innerHTML = ''; return; }
    var list = suggestFor(raw);
    sugBar.innerHTML = '';
    list.forEach(function (w, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = w; b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(i === pick));
      if (i === pick) b.className = 'on';
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { pick = i; finish(); base += ' '; draw(); input.focus({ preventScroll: true }); });
      sugBar.appendChild(b);
    });
    var en = document.createElement('button');
    en.type = 'button'; en.className = 'latin'; en.textContent = raw; en.lang = 'en';
    en.addEventListener('mousedown', function (e) { e.preventDefault(); });
    en.addEventListener('click', function () { base += raw; raw = ''; pick = 0; base += ' '; draw(); input.focus({ preventScroll: true }); });
    sugBar.appendChild(en);
    sugBar.hidden = false;
  }
  function inWord(ch) {
    if (mode === 'bijoy') return Bijoy.isMapped(ch);
    if (mode === 'phonetic') return /[A-Za-z`^:$0-9]/.test(ch);
    return false;
  }
  function draw() {
    setTimeout(showSuggestions, 0);
    var mid = conv(raw);
    input.value = base + mid + tail;
    var c = base.length + mid.length;
    try { input.setSelectionRange(c, c); } catch (e) {}
  }
  function finish() { base += conv(raw); raw = ''; pick = 0; }
  function reset() { base = ''; raw = ''; tail = ''; }
  // The person moved the cursor, pasted or selected: start again from what the box shows
  function resync() {
    var v = input.value, a = input.selectionStart == null ? v.length : input.selectionStart, b = input.selectionEnd == null ? a : input.selectionEnd;
    base = v.slice(0, a); tail = v.slice(b); raw = '';
  }
  function expected() { return base + conv(raw) + tail; }
  function addText(t) {
    Array.from(t).forEach(function (ch) {
      if (inWord(ch)) { raw += ch; pick = 0; return; }
      finish();
      base += mode === 'phonetic' && ch === '.' ? '।' : ch;   // as in Avro, a full stop is the দাঁড়ি
    });
  }
  function showMode() {
    box.querySelectorAll('.hk-modes button').forEach(function (b) {
      var on = b.getAttribute('data-mode') === mode;
      b.setAttribute('aria-checked', String(on)); b.classList.toggle('on', on);
    });
    input.lang = mode === 'english' ? 'en' : 'bn';
  }
  function setMode(m) {
    if (input.value !== expected()) resync();
    finish(); mode = m; showMode();
    if (m === 'phonetic') loadDict();
    showSuggestions();
    try { localStorage.setItem('hkMode', m); } catch (e) {}
  }
  function nextMode() { setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]); input.focus({ preventScroll: true }); }
  box.querySelectorAll('.hk-modes button').forEach(function (b) {
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });   // keep the cursor in the box
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); input.focus({ preventScroll: true }); });
  });
  sugBar = box.querySelector('.hk-suggest');
  showMode();
  if (mode === 'phonetic') loadDict();

  // Computers: take the key from where it is on the keyboard (works with any keyboard language)
  input.addEventListener('keydown', function (e) {
    if (mode === 'english' || e.isComposing || e.keyCode === 229) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (input.value !== expected() || input.selectionStart !== input.selectionEnd ||
        input.selectionStart !== base.length + conv(raw).length) { resync(); }
    if (e.key === 'Backspace') {
      if (raw) { e.preventDefault(); raw = Array.from(raw).slice(0, -1).join(''); pick = 0; draw(); }
      return;   // otherwise the browser deletes, and the next key starts from there
    }
    if (e.key === 'Enter') { finish(); draw(); return; }
    if (mode === 'phonetic' && raw && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || (e.key === 'Tab' && !e.shiftKey))) {
      var n = suggestFor(raw).length;
      e.preventDefault(); pick = (pick + (e.key === 'ArrowUp' ? n - 1 : 1)) % n; draw(); return;
    }
    var ch = null;
    if (mode === 'bijoy' && e.code) ch = Bijoy.usChar(e.code, e.shiftKey);
    // Same letter key, but trust the case the keyboard reports (Caps Lock, some virtual keyboards)
    if (ch && e.key && e.key.length === 1 && /[a-z]/i.test(e.key) && e.key.toLowerCase() === ch.toLowerCase()) ch = e.key;
    if (!ch && e.key && e.key.length === 1) ch = e.key;
    if (!ch) return;
    e.preventDefault();
    if (ch === ' ') { finish(); base += ' '; } else addText(ch);
    draw();
  });
  // Phones and tablets (Android Gboard and Samsung keyboards send only the text they insert)
  input.addEventListener('input', function () {
    if (mode === 'english') return;
    var v = input.value, was = conv(raw);
    var front = base, back = tail;
    if (v.length >= front.length + back.length && v.slice(0, front.length) === front && v.slice(v.length - back.length) === back) {
      var mid = v.slice(front.length, v.length - back.length);
      if (mid.length > was.length && mid.slice(0, was.length) === was) { addText(mid.slice(was.length)); draw(); return; }
      if (mid.length < was.length && was.slice(0, mid.length) === mid && raw) { raw = Array.from(raw).slice(0, -1).join(''); draw(); return; }
      if (mid === was) return;
    }
    resync();
  });
  input.addEventListener('click', function () { if (input.value !== expected() || input.selectionStart !== base.length + conv(raw).length) resync(); });
  input.addEventListener('blur', function () { if (input.value === expected()) { finish(); } });

  var started = false;
  function toggle(open) {
    box.hidden = !open; launcher.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('hk-on', open);
    fitToKeyboard();
    if (open) {
      if (!started) { started = true; add('bot', T.hi); chips(SUGGEST[PAGE_BN ? 'bn' : 'en']); }
      setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
    } else launcher.focus({ preventScroll: true });
  }
  launcher.addEventListener('click', function () { toggle(box.hidden); });

  // Phones: keep the text box just above the on-screen keyboard. The chat fills the part
  // of the screen the keyboard leaves free (iPhone Safari and some Android browsers do
  // not shrink full-height panels when the keyboard opens).
  var vv = window.visualViewport;
  function fitToKeyboard() {
    if (box.hidden || !vv || innerWidth > 640) { box.style.height = ''; box.style.top = ''; return; }
    box.style.top = vv.offsetTop + 'px';
    box.style.height = vv.height + 'px';
    log.scrollTop = log.scrollHeight;
  }
  if (vv) { vv.addEventListener('resize', fitToKeyboard); vv.addEventListener('scroll', fitToKeyboard); }
  input.addEventListener('focus', function () { setTimeout(fitToKeyboard, 50); setTimeout(fitToKeyboard, 350); });
  input.addEventListener('blur', function () { setTimeout(fitToKeyboard, 50); });
  box.querySelector('.hk-x').addEventListener('click', function () { toggle(false); });
  box.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    if (e.target === input) { e.preventDefault(); nextMode(); } else toggle(false);
  });

  // For testing from the browser console
  window.bijoyHelper = { keysFor: keysFor, answer: answer };
})();
