#!/usr/bin/env python3
"""Публикация карусели в Instagram через официальный Instagram API (Instagram Login).

Токен в коде и в репозитории НЕ хранится: в облачной сессии Claude его подставляет
сетевой прокси (секрет окружения для graph.instagram.com, заголовок Authorization: Bearer).
Локально можно задать переменную окружения IG_TOKEN.

Команды:
  python3 instagram/publish.py check
      — проверить токен: показать, к какому аккаунту он подключён, и лимит публикаций.
  python3 instagram/publish.py prepare carousels/<папка>
      — сделать JPEG-копии слайдов в instagram/jpg/<папка>/ (Instagram принимает только JPEG).
        После этого их нужно закоммитить и запушить, чтобы появились публичные ссылки.
  python3 instagram/publish.py publish carousels/<папка> --caption-file подпись.txt [--branch ветка] --yes
      — опубликовать карусель. Без --yes только покажет, что будет опубликовано.
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

import requests

API = "https://graph.instagram.com/v22.0"
REPO = "niyamelirzayev-boop/yur-immunitet-media"
ROOT = Path(__file__).resolve().parent.parent
JPG_DIR = ROOT / "instagram" / "jpg"

S = requests.Session()
# В облаке прокси заменит это значение настоящим токеном. Локально — IG_TOKEN.
S.headers["Authorization"] = "Bearer " + os.environ.get("IG_TOKEN", "proxy-injected")


def api(method: str, path: str, **params):
    r = S.request(method, f"{API}/{path}", params=params, timeout=60)
    try:
        data = r.json()
    except ValueError:
        data = {"raw": r.text[:500]}
    if r.status_code >= 400 or "error" in data:
        err = data.get("error", data)
        sys.exit(f"Ошибка Instagram API ({r.status_code}) на {path}: {err}")
    return data


def me() -> dict:
    return api("GET", "me", fields="user_id,username,account_type")


def slides(folder: Path) -> list[Path]:
    files = sorted(p for p in folder.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg"})
    if not 2 <= len(files) <= 10:
        sys.exit(f"В карусели должно быть 2–10 слайдов, в {folder} найдено {len(files)}")
    return files


def cmd_check(_):
    info = me()
    print(f"Аккаунт: @{info.get('username')} (id {info.get('user_id')}, тип {info.get('account_type')})")
    lim = api("GET", f"{info['user_id']}/content_publishing_limit", fields="quota_usage,config")
    d = (lim.get("data") or [{}])[0]
    total = d.get("config", {}).get("quota_total", "?")
    print(f"Публикаций за последние 24 ч: {d.get('quota_usage', '?')} из {total}")


def cmd_prepare(a):
    from PIL import Image

    folder = (ROOT / a.folder).resolve()
    out = JPG_DIR / folder.name
    out.mkdir(parents=True, exist_ok=True)
    for f in slides(folder):
        im = Image.open(f).convert("RGB")
        w, h = im.size
        if not 0.8 <= w / h <= 1.91:
            print(f"⚠️  {f.name}: пропорции {w}x{h} вне диапазона Instagram (от 4:5 до 1.91:1)")
        dst = out / (f.stem + ".jpg")
        im.save(dst, "JPEG", quality=92, optimize=True)
        print(f"  {dst.relative_to(ROOT)}")
    print("Готово. Закоммитьте и запушьте instagram/jpg/, затем запускайте publish.")


def public_urls(folder: Path, branch: str) -> list[str]:
    jpgs = sorted((JPG_DIR / folder.name).glob("*.jpg"))
    if not jpgs:
        sys.exit("Нет JPEG-слайдов: сначала выполните prepare и запушьте их.")
    urls = [f"https://raw.githubusercontent.com/{REPO}/{branch}/{p.relative_to(ROOT).as_posix()}" for p in jpgs]
    for u in urls:
        r = requests.head(u, timeout=30)
        if r.status_code != 200:
            sys.exit(f"Слайд недоступен по ссылке ({r.status_code}): {u}\nЗапушен ли он в ветку {branch}?")
    return urls


def wait_ready(cid: str, tries: int = 30):
    for _ in range(tries):
        st = api("GET", cid, fields="status_code,status")
        code = st.get("status_code")
        if code == "FINISHED":
            return
        if code in {"ERROR", "EXPIRED"}:
            sys.exit(f"Instagram не смог обработать медиа {cid}: {st}")
        time.sleep(3)
    sys.exit(f"Медиа {cid} так и не обработалось за {tries * 3} с")


def cmd_publish(a):
    folder = (ROOT / a.folder).resolve()
    caption = Path(a.caption_file).read_text(encoding="utf-8").strip() if a.caption_file else ""
    if len(caption) > 2200:
        sys.exit(f"Подпись длиннее 2200 символов ({len(caption)})")
    if caption.count("#") > 30:
        sys.exit("В подписи больше 30 хештегов — Instagram не примет")
    urls = public_urls(folder, a.branch)
    info = me()
    uid = info["user_id"]
    print(f"Аккаунт: @{info.get('username')}\nСлайдов: {len(urls)}")
    for u in urls:
        print("  " + u)
    print("Подпись:\n" + (caption or "(без подписи)"))
    if not a.yes:
        print("\nПробный запуск: ничего не опубликовано. Добавьте --yes для публикации.")
        return

    children = []
    for i, u in enumerate(urls, 1):
        c = api("POST", f"{uid}/media", image_url=u, is_carousel_item="true")
        wait_ready(c["id"])
        children.append(c["id"])
        print(f"  слайд {i}/{len(urls)} загружен")
    parent = api("POST", f"{uid}/media", media_type="CAROUSEL", children=",".join(children), caption=caption)
    wait_ready(parent["id"])
    pub = api("POST", f"{uid}/media_publish", creation_id=parent["id"])
    link = api("GET", pub["id"], fields="permalink").get("permalink")
    print(f"✅ Опубликовано: {link or pub['id']}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check").set_defaults(fn=cmd_check)
    pr = sub.add_parser("prepare")
    pr.add_argument("folder")
    pr.set_defaults(fn=cmd_prepare)
    pb = sub.add_parser("publish")
    pb.add_argument("folder")
    pb.add_argument("--caption-file")
    pb.add_argument("--branch", default="main")
    pb.add_argument("--yes", action="store_true")
    pb.set_defaults(fn=cmd_publish)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
