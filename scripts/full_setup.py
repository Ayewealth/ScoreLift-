from playwright.sync_api import sync_playwright
import time
import os
import subprocess

EMAIL = "ayewealth11@gmail.com"
PASSWORD = "Emi15082005"
NAME = "ScoreLift User"
BASE = "http://localhost:3000"
OUTPUT = r"C:\Users\DON COMPUTER\Documents\Works\ScoreLift-\public"

def screenshot_page(page, route, filename):
    page.goto(f"{BASE}{route}")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    path = os.path.join(OUTPUT, filename)
    page.screenshot(path=path, full_page=True)
    print(f"[OK] {filename}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    # ---- STEP 1: Sign up ----
    print("--- Signing up ---")
    page.goto(f"{BASE}/signup")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    page.fill("#name", NAME)
    page.fill("#email", EMAIL)
    page.fill("#password", PASSWORD)
    page.fill("#confirmPassword", PASSWORD)
    time.sleep(0.5)
    page.click("button[type=submit]")
    time.sleep(3)

    current = page.url
    print(f"Signup result: {current}")

    if "verify-email" in current:
        print("--- Signup OK, redirected to /verify-email ---")
    else:
        error_el = page.query_selector("[role=alert], .text-destructive")
        if error_el:
            print(f"Error: {error_el.text_content()}")
        print("Signup may have failed or already exists")

    # ---- STEP 2: Update DB directly to verify email & complete onboarding ----
    print("--- Updating DB to verify email + complete onboarding ---")
    psql_cmd = (
        'psql -U postgres -d scorelift -c '
        '"UPDATE user SET email_verified = true, onboarding_complete = true WHERE email = \'ayewealth11@gmail.com\';"'
    )
    result = subprocess.run(
        ["cmd", "/c", psql_cmd],
        capture_output=True, text=True, timeout=10
    )
    print(f"DB update: {result.stdout.strip()}{result.stderr.strip()}")

    # Also try via psql connection string with password
    psql_cmd2 = (
        'SET PGPASSWORD=Emi15082005 && psql -U postgres -d scorelift -c '
        '"UPDATE \"user\" SET email_verified = true WHERE email = \'ayewealth11@gmail.com\';"'
    )
    result2 = subprocess.run(
        ["cmd", "/c", psql_cmd2],
        capture_output=True, text=True, timeout=10, shell=True
    )
    print(f"DB update 2: {result2.stdout.strip()}{result2.stderr.strip()}")
    
    # Check if the table is named differently
    psql_cmd3 = (
        'SET PGPASSWORD=Emi15082005 && psql -U postgres -d scorelift -c '
        '"SELECT tablename FROM pg_tables WHERE schemaname=\'public\';"'
    )
    result3 = subprocess.run(
        ["cmd", "/c", psql_cmd3],
        capture_output=True, text=True, timeout=10, shell=True
    )
    print(f"Tables:\n{result3.stdout.strip()}")
    print(f"Errors: {result3.stderr.strip()}")

    browser.close()