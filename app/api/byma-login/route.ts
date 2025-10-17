import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  const email = process.env.BYMA_EMAIL;
  const password = process.env.BYMA_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: "BYMA credentials not configured" },
      { status: 500 }
    );
  }

  let browser;

  try {
    console.log("🚀 Starting BYMA login...");

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("📡 Navigating to BYMA login page...");
    await page.goto("https://new2.bymadata.com.ar/#/auth/login", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    console.log("⏳ Waiting for login form...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Take screenshot before login
    await page.screenshot({ path: "byma-before-login.png" });
    console.log("📸 Screenshot saved: byma-before-login.png");

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

    console.log("✅ Login button clicked!");

    // Wait for navigation
    console.log("⏳ Waiting for dashboard to load...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Take screenshot after login
    await page.screenshot({ path: "byma-after-login.png", fullPage: true });
    console.log("📸 Screenshot saved: byma-after-login.png");

    // Get current URL to check if login was successful
    const currentUrl = page.url();
    console.log("📍 Current URL:", currentUrl);

    // Check if we're in the dashboard
    const isLoggedIn = !currentUrl.includes('/auth/login');

    if (!isLoggedIn) {
      throw new Error("Login failed - still on login page");
    }

    // Wait for data to load - the dashboard uses dynamic content
    console.log("⏳ Waiting for dashboard data to load...");
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for JS to render

    // Try to wait for specific content indicators
    try {
      await page.waitForFunction(() => {
        const text = document.body.innerText;
        return text.includes('RENTA VARIABLE') || text.includes('RENTA FIJA') || text.length > 5000;
      }, { timeout: 15000 });
      console.log("✅ Dashboard content detected");
    } catch {
      console.log("⚠️ Timeout waiting for content, proceeding anyway...");
    }

    // Get dashboard info AND extract price data
    const dashboardData = await page.evaluate(() => {
      const dashboardInfo = {
        url: window.location.href,
        title: document.title,
        bodyText: document.body?.innerText?.substring(0, 1000) || "",
      };

      const prices: any[] = [];
      const debugInfo: any = {
        tablesFound: 0,
        rowsFound: 0,
        divRowsFound: 0,
        bodyTextLength: document.body.innerText.length,
        sampleData: [],
      };

      // First try: Look for traditional tables
      const tables = document.querySelectorAll('table');
      debugInfo.tablesFound = tables.length;

      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tbody tr, tr');
        debugInfo.rowsFound += rows.length;

        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td, th');

          // Capture sample data
          if (tableIndex < 2 && rowIndex < 3 && cells.length > 0) {
            const sampleCells = Array.from(cells).slice(0, 5).map(c => c.textContent?.trim());
            debugInfo.sampleData.push({
              type: 'table',
              table: tableIndex,
              row: rowIndex,
              cellCount: cells.length,
              cells: sampleCells,
            });
          }

          if (cells.length >= 2) {
            const ticker = cells[0]?.textContent?.trim() || "";

            for (let i = 1; i < cells.length; i++) {
              const text = cells[i]?.textContent?.trim() || "";
              if (!text) continue;

              const numText = text.replace(/\./g, '').replace(',', '.');
              const price = parseFloat(numText);

              if (ticker && ticker.length >= 2 && ticker.length <= 10 &&
                  !isNaN(price) && price > 0 && price < 10000000) {
                prices.push({
                  ticker,
                  priceARS: price,
                  lastUpdate: new Date().toISOString(),
                });
                break;
              }
            }
          }
        });
      });

      // Second try: Look for div-based rows (common in modern frameworks)
      const divRows = document.querySelectorAll('[role="row"], .table-row, .row');
      debugInfo.divRowsFound = divRows.length;

      divRows.forEach((row, idx) => {
        if (idx < 3) {
          const cells = row.querySelectorAll('[role="cell"], .cell, .col');
          if (cells.length > 0) {
            debugInfo.sampleData.push({
              type: 'div-row',
              row: idx,
              cellCount: cells.length,
              cells: Array.from(cells).slice(0, 5).map(c => c.textContent?.trim()),
            });
          }
        }
      });

      // Third try: Parse from text content directly (fallback)
      if (prices.length === 0) {
        const bodyText = document.body.innerText;
        // Look for patterns like "AL30" followed by numbers
        const tickerPattern = /([A-Z]{2,10}\d{0,4})[^\d]*?([\d,.]+)/g;
        let match;
        let matchCount = 0;

        while ((match = tickerPattern.exec(bodyText)) !== null && matchCount < 100) {
          matchCount++;
          const ticker = match[1];
          const priceText = match[2];
          const numText = priceText.replace(/\./g, '').replace(',', '.');
          const price = parseFloat(numText);

          if (ticker.length >= 3 && ticker.length <= 10 &&
              !isNaN(price) && price > 10 && price < 10000000) {
            // Only add if not duplicate
            if (!prices.some(p => p.ticker === ticker)) {
              prices.push({
                ticker,
                priceARS: price,
                lastUpdate: new Date().toISOString(),
                source: 'text-parser',
              });
            }
          }
        }

        debugInfo.textParserMatches = matchCount;
      }

      return { dashboardInfo, prices, debugInfo };
    });

    console.log(`📊 Extracted ${dashboardData.prices.length} prices`);
    console.log(`🔍 Debug - Tables: ${dashboardData.debugInfo.tablesFound}, Rows: ${dashboardData.debugInfo.rowsFound}`);

    // Filter for relevant instruments
    const targetTickers = ['AL30', 'GD30', 'AL29', 'GD29', 'GD35', 'GD38', 'GD41', 'GD46',
                          'GGAL', 'YPF', 'PAMP', 'BMA', 'SUPV', 'ALUA', 'BBAR', 'CEPU',
                          'TX26', 'TX28', 'TX31', 'TZX26', 'TZXD6'];

    const relevantPrices = dashboardData.prices.filter((p: any) =>
      targetTickers.some(ticker => p.ticker.toUpperCase().includes(ticker))
    );

    console.log(`📌 Found ${relevantPrices.length} relevant instruments`);
    console.log("🎉 Login successful!");

    await browser.close();

    return NextResponse.json({
      success: true,
      message: "Login successful!",
      isLoggedIn,
      currentUrl,
      dashboardInfo: dashboardData.dashboardInfo,
      prices: relevantPrices,
      totalPrices: dashboardData.prices.length,
      debugInfo: dashboardData.debugInfo,
      buttonInfo,
      screenshots: ["byma-before-login.png", "byma-after-login.png"],
      nextStep: "Use the prices data to update your instruments",
    });
  } catch (error: any) {
    console.error("❌ Error:", error);

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to login to BYMA",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
