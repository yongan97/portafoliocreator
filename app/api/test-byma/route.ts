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
    console.log("🚀 Starting BYMA login test...");

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

    console.log("⏳ Waiting for page to stabilize...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Take screenshot
    console.log("📸 Taking screenshot...");
    await page.screenshot({ path: "byma-page.png", fullPage: true });

    // Get page info safely
    console.log("📊 Analyzing page structure...");
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasLoginForm: !!document.querySelector('input[type="email"], input[type="text"]'),
        hasPasswordField: !!document.querySelector('input[type="password"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
        bodyText: document.body?.innerText?.substring(0, 500) || "",
      };
    });

    console.log("✅ Page analyzed successfully");

    await browser.close();

    return NextResponse.json({
      success: true,
      message: "Page loaded and analyzed successfully",
      pageInfo,
      screenshotSaved: "byma-page.png",
      instructions: "Check byma-page.png in the project root to see the page structure",
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
        error: "Failed to test BYMA",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
