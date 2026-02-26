from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming Vite default port 5173)
        page.goto("http://localhost:5173")

        # Wait for the page to load
        page.wait_for_load_state("networkidle")

        # 1. Verify Bankability Indicator
        # Check if "Profil Investisseur" section exists
        if page.get_by_text("Profil Investisseur").count() > 0:
            print("Profil Investisseur found.")
        else:
            print("Profil Investisseur NOT found.")

        # Check for Bankability Indicator text
        if page.get_by_text("Faisabilité Bancaire").count() > 0:
            print("Faisabilité Bancaire found.")
        else:
            print("Faisabilité Bancaire NOT found.")

        if page.get_by_text("Dossier Solide").count() > 0:
            print("Dossier Solide found.") # Default data should be green
        else:
            print("Dossier Solide NOT found.")


        # 2. Verify Amortization Chart
        # Check if "Trajectoire 20 ans" title exists (Chart 1)
        if page.get_by_text("Trajectoire 20 ans").count() > 0:
             print("Trajectoire 20 ans found.")
        else:
             print("Trajectoire 20 ans NOT found.")

        # Check if "Structure Fiscale" title exists (Chart 2 - Amortization)
        if page.get_by_text("Structure Fiscale").count() > 0:
             print("Structure Fiscale found.")
        else:
             print("Structure Fiscale NOT found.")


        # 3. Verify Stress Test Module
        # Scroll down to Stress Test
        stress_test_heading = page.get_by_text("Stress Test", exact=True)
        if stress_test_heading.count() > 0:
            print("Stress Test found.")
            stress_test_heading.scroll_into_view_if_needed()

            # Check for scenarios
            if page.get_by_text("Vacance Élevée").count() > 0:
                 print("Vacance Élevée found.")
            if page.get_by_text("Baisse Loyers").count() > 0:
                 print("Baisse Loyers found.")
            if page.get_by_text("Hausse Charges").count() > 0:
                 print("Hausse Charges found.")
        else:
            print("Stress Test NOT found.")

        # Take a full page screenshot to see all features
        page.screenshot(path="verification_features.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
