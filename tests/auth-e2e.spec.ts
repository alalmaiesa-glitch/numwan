import { test, expect } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "https://numwan.vercel.app";
const email = process.env.NUMWAN_E2E_EMAIL;
const password = process.env.NUMWAN_E2E_PASSWORD;

test("public homepage is reachable", async ({ page }) => {
  const response = await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByText("أفكارٌ بُنيت")).toBeVisible();
});

for (const route of ["/dashboard", "/vault", "/assets", "/deals"]) {
  test(`unauthenticated access to ${route} redirects to login`, async ({ page }) => {
    await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/login\\?next=.*${route.slice(1)}`));
    await expect(page.getByRole("heading", { name: "تسجيل الدخول" })).toBeVisible();
  });
}

test("authenticated return-path, logout and browser-back protection", async ({ page }) => {
  test.skip(!email || !password, "NUMWAN_E2E_EMAIL / NUMWAN_E2E_PASSWORD are not configured.");

  await page.goto(`${baseURL}/vault`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login\?next=/);

  await page.getByLabel("البريد الإلكتروني").fill(email!);
  await page.getByLabel("كلمة المرور").fill(password!);
  await page.getByRole("button", { name: "دخول" }).click();

  await expect(page).toHaveURL(/\/vault$/);
  await expect(page.getByText("خزنة الفرص").first()).toBeVisible();

  await page.getByRole("link", { name: "لوحة التحكم" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goBack();
  await page.waitForTimeout(800);
  await expect(page).not.toHaveURL(/\/(dashboard|vault|assets|deals)(\/|$)/);
});
