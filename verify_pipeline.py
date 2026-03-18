from playwright.sync_api import sync_playwright, expect
import os

def test_pipeline():
    os.makedirs("/home/jules/verification/video", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/home/jules/verification/video")
        page = context.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:5173/Investissement_Immobilier/")
            page.wait_for_timeout(2000)

            # Switch to Pipeline view
            page.get_by_role("button", name="Pipeline").click()
            page.wait_for_timeout(1000)

            # Verify the Pipeline view is open
            expect(page.get_by_role("heading", name="Deal Pipeline")).to_be_visible()

            # Click the alert button on the first card
            # Since the button uses an icon and title, we can find it by title
            alert_button = page.locator("button[title='Créer une alerte de prix']").first
            alert_button.click()
            page.wait_for_timeout(500)

            # Dismiss the alert dialog
            page.on("dialog", lambda dialog: dialog.accept())

            page.wait_for_timeout(1000)

            # Move the card to the next column
            next_col_button = page.get_by_role("button", name="Déplacer à l'étape suivante").first
            next_col_button.click()
            page.wait_for_timeout(1000)

            # Move it back
            prev_col_button = page.get_by_role("button", name="Déplacer à l'étape précédente").first
            prev_col_button.click()
            page.wait_for_timeout(1000)

            # Take a screenshot
            page.screenshot(path="/home/jules/verification/pipeline_card.png")
            print("Screenshot saved to /home/jules/verification/pipeline_card.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    test_pipeline()
