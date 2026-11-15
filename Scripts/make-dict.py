#!/usr/bin/env python3
"""Build docs/bn-words.txt, the word list behind the phonetic suggestions in the
website's chat box, from the Hunspell Bengali dictionary (bn_BD.dic, GPL-2).

Each Bangla letter is stored as one ASCII character so the file is about a third
of the size: line 1 is a comment, line 2 the alphabet (the letter for "!" first,
then for '"', and so on), then one word per line.

    python3 Scripts/make-dict.py /usr/share/hunspell/bn_BD.dic
"""
import pathlib, re, sys, unicodedata

src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/usr/share/hunspell/bn_BD.dic")
words = [w.strip() for w in src.read_text(encoding="utf-8").split("\n")[1:]]
# Everyday words the dictionary lacks (mostly inflected forms), and every Bangla word on this website
EXTRA = """সোনার সোনালি ভালোবাসি ভালোবাসা ভালো কম্পিউটার ল্যাপটপ মোবাইল ইন্টারনেট ওয়েবসাইট ফেসবুক ইমেইল
বিশ্ববিদ্যালয় বিশ্ববিদ্যালয়ের মহাবিদ্যালয় বিদ্যালয়ের স্কুল কলেজ অফিস ডাক্তার হাসপাতাল ঢাকা চট্টগ্রাম সিলেট
রাজশাহী খুলনা বরিশাল রংপুর ময়মনসিংহ কুমিল্লা আয়ারল্যান্ড ডাবলিন লন্ডন আমেরিকা কানাডা মালয়েশিয়া সৌদি
বাংলায় বাংলার বাংলাদেশের বাংলাদেশি মানুষের দেশের ভাষার ভাষায় মায়ের বাবার ভাইয়ের বোনের বন্ধুর বন্ধুরা
তোমাকে আপনাকে আমাকে তাকে ওকে তোমাদের আপনাদের আমাদের তাদের ওদের কেমন কোথায় কখন কেন কীভাবে কিভাবে
হ্যাঁ না ঠিক আছে ধন্যবাদ শুভেচ্ছা অভিনন্দন শুভ সকাল রাত দুপুর বিকেল সন্ধ্যা আজ কাল পরশু এখন তখন
লিখব লিখবো লিখছি লিখলাম পড়ব পড়বো পড়ছি যাব যাবো যাচ্ছি আসব আসবো আসছি খাব খাবো খাচ্ছি করব করবো করছি
করেছি করেছেন করবেন বলব বলবো বলছি বলেছি দেখব দেখবো দেখছি পারব পারবো পারছি জানি জানেন জানতে চাই চাই
টাইপ কীবোর্ড বিজয় ইউনিকোড ক্লাসিক ফন্ট ইনস্টল ডাউনলোড আপডেট সমস্যা সাহায্য প্রশ্ন উত্তর
""".split()
for page in ("docs/index.html", "docs/bn/index.html", "docs/helper.js"):
    path = pathlib.Path(__file__).resolve().parent.parent / page
    if path.exists():
        EXTRA += re.findall(r"[\u0985-\u09B9\u09CE\u09DC-\u09DF][\u0980-\u09FF\u200C]*", path.read_text(encoding="utf-8"))
words = sorted({unicodedata.normalize("NFC", w) for w in words + EXTRA if w and 1 < len(w) <= 14})
alphabet = "".join(sorted({ch for w in words for ch in w}))
assert len(alphabet) <= 90, len(alphabet)
code = {ch: chr(0x21 + i) for i, ch in enumerate(alphabet)}
out = ["# Bangla word list from the Hunspell Bengali (bn_BD) dictionary, GPL-2. Built by Scripts/make-dict.py.", alphabet]
out += ["".join(code[ch] for ch in w) for w in words]
dest = pathlib.Path(__file__).resolve().parent.parent / "docs/bn-words.txt"
dest.write_text("\n".join(out) + "\n", encoding="utf-8")
print(f"wrote {dest.name}: {len(words)} words, {dest.stat().st_size // 1024} KB")
