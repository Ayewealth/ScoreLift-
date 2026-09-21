from playwright.sync_api import sync_playwright
import time

EMAIL = "ayewealth11@gmail.com"
PASSWORD = "Emi15082005"
BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()

    # Go to signup
    page.goto(f"{BASE}/signup")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    # Find form fields
    email_input = page.query_selector("#email")
    password_input = page.query_selector("#password")
    submit_btn = page.query_selector("button[type=submit]")
    
    if email_input:
        print(f"Email input placeholder: {email_input.get_attribute('placeholder')}")
    if submit_btn:
        print(f"Submit button text: {submit_btn.text_content()}")

    # Fill and submit
    page.fill("#name", "ScoreLift User")
    page.fill("#email", EMAIL)
    page.fill("#password", PASSWORD)
    page.fill("#confirmPassword", PASSWORD)
    time.sleep(0.5)
    submit_btn = page.query_selector("button[type=submit]")
    if submit_btn:
        submit_btn.click()
        time.sleep(3)

    current = page.url
    print(f"After signup, current URL: {current}")

    # Check for errors
    error_el = page.query_selector(".text-destructive")
    if error_el:
        print(f"Error: {error_el.text_content()}")

    page.screenshot(path=r"C:\Users\DON COMPUTER\AppData\Local\Temp\opencode\signup_result.png")
    print("Screenshot saved")

    browser.close()