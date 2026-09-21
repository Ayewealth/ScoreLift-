from playwright.sync_api import sync_playwright
import time

EMAIL = "ayewealth11@gmail.com"
PASSWORD = "Emi15082005"
BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Sign up
    page.goto(f"{BASE}/signup")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    page.fill("#name", "ScoreLift User")
    page.fill("#email", EMAIL)
    page.fill("#password", PASSWORD)
    page.fill("#confirmPassword", PASSWORD)
    time.sleep(1)
    page.click("button[type=submit]")
    time.sleep(5)

    print(f"Current URL: {page.url}")

    # Check body for error
    body_text = page.text_content("body")
    if "already" in body_text.lower():
        print("Account may already exist — attempting login instead")
        page.goto(f"{BASE}/login")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.fill("#email", EMAIL)
        page.fill("#password", PASSWORD)
        time.sleep(1)
        page.click("button[type=submit]")
        time.sleep(5)
        print(f"Login result: {page.url}")

    page.screenshot(path=r"C:\Users\DON COMPUTER\AppData\Local\Temp\opencode\signup_login_result.png")
    browser.close()