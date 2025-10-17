import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    console.log("🚀 Starting BYMA logout...");

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("📡 Navigating to BYMA...");
    await page.goto("https://new2.bymadata.com.ar/#/dashboard", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    console.log("⏳ Waiting for page to load...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check if we're already on login page (not logged in)
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login')) {
      console.log("✅ Already logged out (on login page)");
      await browser.close();
      return NextResponse.json({
        success: true,
        message: "Already logged out - no active session found",
        alreadyLoggedOut: true,
      });
    }

    // Try to find and click logout button
    console.log("🔍 Looking for logout button...");
    const logoutResult = await page.evaluate(() => {
      // Look for common logout elements
      const buttons = Array.from(document.querySelectorAll('button, a'));

      const logoutButton = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        const title = btn.getAttribute('title')?.toLowerCase() || '';
        const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';

        return text.includes('cerrar sesión') ||
               text.includes('salir') ||
               text.includes('logout') ||
               title.includes('cerrar sesión') ||
               title.includes('salir') ||
               ariaLabel.includes('logout');
      });

      if (logoutButton) {
        (logoutButton as HTMLElement).click();
        return { found: true, text: logoutButton.textContent };
      }

      return { found: false, text: null };
    });

    if (logoutResult.found) {
      console.log(`✅ Clicked logout button: "${logoutResult.text}"`);

      // Wait for logout to complete
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Take screenshot after logout
      await page.screenshot({ path: "byma-after-logout.png" });

      // Check if we're back on login page
      const finalUrl = page.url();
      const isLoggedOut = finalUrl.includes('/auth/login');

      await browser.close();

      return NextResponse.json({
        success: true,
        message: isLoggedOut ? "Successfully logged out" : "Logout attempted",
        logoutButtonFound: true,
        isLoggedOut,
        finalUrl,
      });
    } else {
      // If no logout button found, try to navigate to logout URL directly
      console.log("⚠️ No logout button found, trying direct logout URL...");

      try {
        await page.goto("https://new2.bymadata.com.ar/#/auth/logout", {
          waitUntil: "networkidle0",
          timeout: 10000,
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));

        const finalUrl = page.url();
        const isLoggedOut = finalUrl.includes('/auth/login');

        await browser.close();

        return NextResponse.json({
          success: true,
          message: isLoggedOut ? "Logged out via direct URL" : "Logout URL attempted",
          logoutButtonFound: false,
          isLoggedOut,
          finalUrl,
        });
      } catch (error) {
        console.log("⚠️ Direct logout URL failed");

        await browser.close();

        return NextResponse.json({
          success: false,
          message: "Could not find logout button or URL",
          logoutButtonFound: false,
          suggestion: "Session may expire automatically after 30-60 minutes",
        });
      }
    }
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
        error: "Failed to logout from BYMA",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
