#!/usr/bin/env python3
"""Show what visitors asked the website chat that it could not answer, and how
its answers were rated (👍 / 👎). Run on the web server:

    ssh -t spsv "sudo python3 /var/www/bijoybanglaformac/Scripts/chat-report.py"

Add answers for the common questions to docs/my-answers.js.
Options: --days 30 (how far back, default all), --file PATH (default /var/lib/bijoy-stats/chat.json)
"""
import argparse, datetime as dt, json

ap = argparse.ArgumentParser()
ap.add_argument("--days", type=int, default=0)
ap.add_argument("--file", default="/var/lib/bijoy-stats/chat.json")
a = ap.parse_args()
try:
    with open(a.file) as f:
        chat = json.load(f)
except (OSError, ValueError):
    print("No chat reports yet."); raise SystemExit
since = (dt.date.today() - dt.timedelta(days=a.days)).isoformat() if a.days else ""
asks, votes = {}, {}
for day, rec in chat.items():
    if day < since:
        continue
    for key, n in rec.get("ask", {}).items():
        asks[key] = asks.get(key, 0) + n
    for name, v in rec.get("fb", {}).items():
        t = votes.setdefault(name, {"up": 0, "down": 0})
        t["up"] += v.get("up", 0); t["down"] += v.get("down", 0)

print(f"Unanswered questions ({sum(asks.values())} in total, most asked first):")
for key, n in sorted(asks.items(), key=lambda x: -x[1]):
    lang, q = key.split("|", 1)
    print(f"  {n:4d}  [{lang}] {q}")
print()
print("Answer ratings (most 👎 first):")
for name, v in sorted(votes.items(), key=lambda x: (-x[1]["down"], -x[1]["up"])):
    print(f"  {name:20s}  👍 {v['up']:3d}   👎 {v['down']:3d}")
