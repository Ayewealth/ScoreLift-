from playwright.sync_api import sync_playwright
import time
import os
import urllib.parse
import requests

EMAIL = "ayewealth11@gmail.com"
PASSWORD = "Emi15082005"
BASE = "http://localhost:3000"
OUTPUT = r"C:\Users\DON COMPUTER\Documents\Works\ScoreLift-\public"

PAGES = [
    ("/dashboard", "screenshot-dashboard.png"),
    ("/roadmap", "screenshot-roadmap.png"),
    ("/simulator", "screenshot-simulator.png"),
    ("/goals", "screenshot-goals.png"),
    ("/milestones", "screenshot-milestones.png"),
]

print("--- Getting session cookie ---")
resp = requests.post(f"{BASE}/api/auth/sign-in/email", json={
    "email": EMAIL,
    "password": PASSWORD
}, headers={"Origin": BASE})

if resp.status_code != 200:
    print(f"Login failed: {resp.status_code} {resp.text}")
    exit(1)

set_cookie = resp.headers.get("set-cookie") or resp.headers.get("Set-Cookie")
cookie_name, cookie_value = set_cookie.split(";")[0].split("=", 1)
print(f"Cookie obtained: {cookie_name}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    context.add_cookies([{
        "name": cookie_name,
        "value": urllib.parse.unquote(cookie_value),
        "domain": "localhost",
        "path": "/",
        "httpOnly": True,
        "sameSite": "Lax",
    }])

    page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
    time.sleep(5)
    print(f"Dashboard URL: {page.url}")

    page.evaluate("localStorage.setItem('scorelift_demo_mode', 'true')")
    print("--- Demo mode enabled ---")

    for route, filename in PAGES:
        page.goto(f"{BASE}{route}", wait_until="domcontentloaded")
        time.sleep(5)
        path = os.path.join(OUTPUT, filename)
        page.screenshot(path=path, full_page=True)
        print(f"[OK] {filename}")

    page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
    time.sleep(5)
    page.screenshot(path=os.path.join(OUTPUT, "screenshot-hero.png"), full_page=True)
    print("[OK] screenshot-hero.png")
    page.screenshot(path=os.path.join(OUTPUT, "screenshot-dashboard-hero.png"), full_page=True)
    print("[OK] screenshot-dashboard-hero.png")

    browser.close()
    print("--- All done ---")