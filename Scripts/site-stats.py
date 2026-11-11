#!/usr/bin/env python3
"""Count website visitors and bots from the nginx access log.

Runs on the web server every 10 minutes (cron) and writes a small JSON file
that the website shows in its footer:

    {"visitors": 1234, "bots": 5678, "since": "2026-11-11", "updated": "..."}

How a visit is classified, per day and per (IP address + browser) pair:
  - person: the browser fetched /beacon.txt, which only happens when the page's
    script runs, and its user agent does not call itself a bot;
  - bot: it asked for a page but never ran the script, or says it is a bot.
Each pair is counted once per day, so the totals are "daily unique visits".

nginx rotates its log every day and deletes old ones, so finished days are
kept in a state file and only the days still in the logs are recounted.

Usage:  site-stats.py [--log PATH] [--state PATH] [--out PATH]
"""
import argparse, datetime as dt, glob, gzip, json, os, re, tempfile

LINE = re.compile(
    r'^(?P<ip>\S+) \S+ \S+ \[(?P<day>\d{2}/\w{3}/\d{4}):[^\]]+\] '
    r'"(?P<method>[A-Z]+) (?P<path>\S+)[^"]*" (?P<status>\d{3}) \S+ '
    r'"[^"]*" "(?P<ua>[^"]*)"')
BOT_UA = re.compile(
    r'bot|crawl|spider|slurp|fetch|preview|scan|monitor|curl|wget|python|'
    r'go-http|java/|okhttp|axios|node|headless|phantom|lighthouse|httpclient|'
    r'facebookexternalhit|whatsapp|telegram|discord|semrush|ahrefs|mj12|dotbot|'
    r'petalbot|bytespider|gptbot|claude|perplexity|ccbot', re.I)
PAGE = re.compile(r'^/(?:index\.html)?(?:[?#].*)?$')
BEACON = re.compile(r'^/beacon\.txt(?:\?.*)?$')


def read_lines(pattern):
    for path in sorted(glob.glob(pattern)):
        opener = gzip.open if path.endswith(".gz") else open
        try:
            with opener(path, "rt", encoding="utf-8", errors="replace") as f:
                yield from f
        except OSError:
            continue


def count(log_pattern):
    pages, beacons = {}, {}          # day -> {(ip, ua)}
    for line in read_lines(log_pattern):
        m = LINE.match(line)
        if not m or m["method"] not in ("GET", "HEAD"):
            continue
        day = dt.datetime.strptime(m["day"], "%d/%b/%Y").date().isoformat()
        who = (m["ip"], m["ua"])
        if BEACON.match(m["path"]):
            beacons.setdefault(day, set()).add(who)
        elif PAGE.match(m["path"]) and m["status"].startswith(("2", "3")):
            pages.setdefault(day, set()).add(who)
    days = {}
    for day in set(pages) | set(beacons):
        people = {w for w in beacons.get(day, set()) if not BOT_UA.search(w[1])}
        everyone = pages.get(day, set()) | beacons.get(day, set())
        days[day] = {"visitors": len(people), "bots": len(everyone - people)}
    return days


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path))
    with os.fdopen(fd, "w") as f:
        json.dump(data, f)
    os.chmod(tmp, 0o644)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--log", default="/var/log/nginx/bijoybanglaformac.access.log*")
    ap.add_argument("--state", default="/var/lib/bijoy-stats/days.json")
    ap.add_argument("--out", default="/var/lib/bijoy-stats/stats.json")
    a = ap.parse_args()

    try:
        with open(a.state) as f:
            saved = json.load(f)
    except (OSError, ValueError):
        saved = {}

    fresh = count(a.log)
    if len(fresh) > 1:
        # The oldest day still in the logs may be cut off by log rotation, so
        # trust the saved figure for it when there is one.
        oldest = min(fresh)
        if oldest in saved:
            fresh.pop(oldest)
    saved.update(fresh)
    write_json(a.state, saved)

    write_json(a.out, {
        "visitors": sum(d["visitors"] for d in saved.values()),
        "bots": sum(d["bots"] for d in saved.values()),
        "since": min(saved) if saved else None,
        "updated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
    })


if __name__ == "__main__":
    main()
