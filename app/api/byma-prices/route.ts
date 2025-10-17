import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout

interface InstrumentPrice {
  ticker: string;
  priceARS?: number;
  priceUSD?: number;
  yield?: number;
  lastUpdate?: string;
}

export async function GET() {
  const email = process.env.BYMA_EMAIL;
  const password = process.env.BYMA_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: "BYMA credentials not configured in .env.local" },
      { status: 500 }
    );
  }

  let browser;

  try {
    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to login page
    console.log("📡 Navigating to BYMA login page...");
    await page.goto("https://new2.bymadata.com.ar/#/auth/login", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    console.log("⏳ Waiting for login form...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Wait for input fields to be ready
    console.log("⏳ Waiting for form fields...");
    await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    // Find and fill email/username field
    console.log("📧 Filling username...");
    const emailFilled = await page.evaluate((emailValue) => {
      // Try multiple selectors for the username field
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      let emailInput = null;

      // Find input that looks like username/email field
      for (const input of inputs) {
        const placeholder = (input as HTMLInputElement).placeholder?.toLowerCase() || '';
        const name = (input as HTMLInputElement).name?.toLowerCase() || '';
        if (placeholder.includes('usuario') || placeholder.includes('email') ||
            name.includes('user') || name.includes('email')) {
          emailInput = input as HTMLInputElement;
          break;
        }
      }

      // If not found by placeholder, just use first text input
      if (!emailInput && inputs.length > 0) {
        emailInput = inputs[0] as HTMLInputElement;
      }

      if (emailInput) {
        emailInput.focus();
        emailInput.value = emailValue;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
        return true;
      }
      return false;
    }, email);

    if (!emailFilled) {
      throw new Error("Username field not found");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find and fill password field
    console.log("🔒 Filling password...");
    const passwordFilled = await page.evaluate((passwordValue) => {
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.value = passwordValue;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('blur', { bubbles: true }));
        return true;
      }
      return false;
    }, password);

    if (!passwordFilled) {
      throw new Error("Password field not found");
    }

    // Wait a bit for validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to find and click login button
    console.log("🔑 Looking for login button...");
    const buttonInfo = await page.evaluate(() => {
      // Get all buttons and their text
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonTexts = buttons.map(btn => btn.textContent?.trim() || '');

      // Try to find the login button
      const loginButton = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase().trim() || '';
        return text.includes('iniciar') ||
               text.includes('ingresar') ||
               text.includes('login') ||
               text.includes('sesión') ||
               text.includes('sesion');
      });

      if (loginButton) {
        loginButton.click();
        return { clicked: true, foundTexts: buttonTexts };
      }

      return { clicked: false, foundTexts: buttonTexts };
    });

    console.log("🔍 Found buttons:", buttonInfo.foundTexts);

    if (!buttonInfo.clicked) {
      // Try alternative approach - submit the form or press Enter
      console.log("⌨️ Trying alternative: pressing Enter on password field...");
      await page.keyboard.press('Enter');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("✅ Login submitted!");

    // Wait for navigation - wait longer to ensure dashboard loads
    console.log("⏳ Waiting for dashboard to load...");
    await new Promise((resolve) => setTimeout(resolve, 12000));

    // Check current URL
    const currentUrl = page.url();
    console.log("📍 Current URL:", currentUrl);

    // More lenient check - if we're still on login, try waiting longer
    if (currentUrl.includes('/auth/login')) {
      console.log("⏳ Still on login page, waiting 8 more seconds...");
      await new Promise((resolve) => setTimeout(resolve, 8000));

      const finalUrl = page.url();
      console.log("📍 Final URL:", finalUrl);

      if (finalUrl.includes('/auth/login')) {
        // Take screenshot for debugging
        await page.screenshot({ path: "byma-login-failed.png" });
        throw new Error(`Login failed - still on login page after 20s. URL: ${finalUrl}`);
      }
    }

    console.log("✅ Login successful!");

    // Wait for tables to be present
    console.log("⏳ Waiting for data tables to load...");
    await page.waitForSelector('table', { timeout: 15000 });
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Extra time for data to populate

    // Take screenshot
    await page.screenshot({ path: "byma-prices-dashboard.png", fullPage: true });
    console.log("📸 Screenshot saved");

    // Extract all available price data from tables
    console.log("📊 Extracting price data...");
    const extractionResult = await page.evaluate(() => {
      const data: InstrumentPrice[] = [];
      const debugInfo: any = {
        tablesFound: 0,
        rowsProcessed: 0,
        sampleRows: [],
      };

      // Find all table rows across the page
      const tables = document.querySelectorAll('table');
      debugInfo.tablesFound = tables.length;

      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tbody tr, tr');

        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td, th');
          debugInfo.rowsProcessed++;

          // Capture first few rows for debugging
          if (debugInfo.sampleRows.length < 5 && cells.length > 0) {
            const cellTexts = Array.from(cells).slice(0, 5).map(c => c.textContent?.trim());
            debugInfo.sampleRows.push({
              table: tableIndex,
              row: rowIndex,
              cells: cellTexts,
            });
          }

          if (cells.length >= 2) {
            // First cell might be the ticker
            const ticker = cells[0]?.textContent?.trim() || "";

            // Look through all cells for price-like values
            for (let i = 1; i < cells.length; i++) {
              const text = cells[i]?.textContent?.trim() || "";

              // Skip empty cells
              if (!text) continue;

              // Try to parse as number
              // BYMA uses comma for decimals and dot for thousands
              const numText = text.replace(/\./g, '').replace(',', '.');
              const price = parseFloat(numText);

              // If we found a valid price
              if (ticker && ticker.length >= 2 && ticker.length <= 10 &&
                  !isNaN(price) && price > 0 && price < 10000000) {
                data.push({
                  ticker,
                  priceARS: price,
                  lastUpdate: new Date().toISOString(),
                });
                break; // Found price for this ticker, move to next row
              }
            }
          }
        });
      });

      return { data, debugInfo };
    });

    const prices = extractionResult.data;
    console.log(`📊 Found ${prices.length} instruments`);
    console.log(`🔍 Debug info:`, extractionResult.debugInfo);

    // Filter for instruments we care about
    const targetTickers = ['AL30', 'GD30', 'AL29', 'GD29', 'GD35', 'GD38', 'GD41', 'GD46',
                          'GGAL', 'YPF', 'PAMP', 'BMA', 'SUPV', 'ALUA', 'BBAR', 'CEPU',
                          'TX26', 'TX28', 'TX31', 'TZX26', 'TZXD6'];

    const relevantPrices = prices.filter(p =>
      targetTickers.some(ticker => p.ticker.toUpperCase().includes(ticker))
    );

    console.log(`📌 Found ${relevantPrices.length} relevant instruments`);

    await browser.close();

    return NextResponse.json({
      success: true,
      data: relevantPrices,
      totalFound: prices.length,
      debugInfo: extractionResult.debugInfo,
      timestamp: new Date().toISOString(),
      message: `Successfully scraped ${relevantPrices.length} relevant instruments out of ${prices.length} total`,
    });
  } catch (error: any) {
    console.error("❌ Error scraping BYMA:", error);

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      {
        error: "Failed to scrape BYMA data",
        message: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
