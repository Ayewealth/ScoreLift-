from playwright.sync_api import sync_playwright
import time

EMAIL = "ayewealth11@gmail.com"
PASSWORD = "Emi15082005"
BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()

    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    # Fill the form
    page.fill("#email", EMAIL)
    page.fill("#password", PASSWORD)
    time.sleep(1)

    # Click submit
    page.click("button[type=submit]")
    time.sleep(4)

    current = page.url
    print(f"Current URL: {current}")

    # Check for error messages
    error = page.query_selector(".text-destructive")
    if error:
        print(f"Error text: {error.text_content()}")

    # Get page content around the form area
    form_html = page.inner_html("#email")
    print(f"Email field value: {page.input_value('#email')}")
    
    submit_btn = page.query_selector("button[type=submit]")
    if submit_btn:
        print(f"Button text: {submit_btn.text_content()}")

    page.screenshot(path=r"C:\Users\DON COMPUTER\AppData\Local\Temp\opencode\login_result.png")
    print("Screenshot saved to login_result.png")

    input("Press Enter after checking the browser...")
    browser.close()