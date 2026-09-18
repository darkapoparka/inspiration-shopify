import { expect, test } from "@playwright/test";

test("desktop dealership inventory and CRM workflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");

  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Good morning, Alex" })).toBeVisible();
  await expect(page.getByText("Active inventory")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("overview-desktop.png"), fullPage: true });

  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await navigation.getByRole("button", { name: "Inventory" }).click();
  await expect(page.getByRole("heading", { name: "Vehicle inventory" })).toBeVisible();
  await expect(page.getByText("Stock value")).toBeVisible();

  await page.getByRole("button", { name: "Add vehicle" }).click();
  const vehicleDialog = page.getByRole("dialog", { name: "Add vehicle" });
  await expect(vehicleDialog).toBeVisible();
  await vehicleDialog.getByLabel("Make").fill("Toyota");
  await vehicleDialog.getByLabel("Model").fill("Land Cruiser");
  await vehicleDialog.getByLabel("Variant").fill("2.8 D-4D Executive");
  await vehicleDialog.getByLabel("Year").fill("2024");
  await vehicleDialog.getByLabel("Price").fill("79900");
  await vehicleDialog.getByLabel("Mileage (km)").fill("12000");
  await vehicleDialog.getByLabel("Fuel").selectOption("Diesel");
  await vehicleDialog.getByLabel("Transmission").selectOption("Automatic");
  await vehicleDialog.getByLabel("Body type").selectOption("SUV");
  await vehicleDialog.getByLabel("Colour").fill("Pearl White");
  await vehicleDialog.getByLabel("Initial status").selectOption("Published");
  await vehicleDialog.getByRole("button", { name: "Add vehicle" }).click();

  await expect(page.getByText("Toyota Land Cruiser", { exact: true })).toBeVisible();
  await expect(page.getByText("2.8 D-4D Executive")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("inventory-desktop.png"), fullPage: true });

  await navigation.getByRole("button", { name: /Sales leads/ }).click();
  await expect(page.getByRole("heading", { name: "Sales pipeline" })).toBeVisible();
  await expect(page.getByText("Daniel Carter", { exact: true })).toBeVisible();
  await page.getByText("Daniel Carter", { exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Daniel Carter" })).toBeVisible();
  await page.getByLabel("Pipeline stage").selectOption("Contacted");
  await page.getByRole("button", { name: "Close" }).click();
  await page.screenshot({ path: testInfo.outputPath("pipeline-desktop.png"), fullPage: true });

  expect(browserErrors, browserErrors.join("\n")).toEqual([]);
});

test("mobile dealership navigation remains usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Good morning, Alex" })).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("button", { name: "Website" }).click();
  await expect(page.getByRole("heading", { name: "Dealership website" })).toBeVisible();
  await expect(page.getByText("Website online")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("website-mobile.png"), fullPage: true });

  await page.getByRole("button", { name: "Open navigation" }).click();
  await navigation.getByRole("button", { name: "Appointments" }).click();
  await expect(page.getByRole("heading", { name: "Appointments" })).toBeVisible();
  await expect(page.getByText("Next appointments")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("calendar-mobile.png"), fullPage: true });

  expect(browserErrors, browserErrors.join("\n")).toEqual([]);
});
