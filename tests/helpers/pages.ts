import { expect, type Locator, type Page } from '@playwright/test';
import { ADMIN_URL } from './fixtures';

export class HomePage {
  constructor(private readonly page: Page) {}

  async navigate() {
    await this.page.goto('/');
    await expect(this.page.locator('#shop-view-container')).toBeVisible();
  }

  getProducts() {
    return this.page.locator('#our-products-section button, #categories-grid-collection-view button');
  }

  async clickProduct(index = 0) {
    const product = this.getProducts().nth(index);
    await expect(product).toBeVisible();
    await product.click();
  }

  getAnnouncementTicker() {
    return this.page.locator('#announcement-ticker, text=/FREE SHIPPING|SALE|AUTHENTIC/i').first();
  }
}

export class ProductPage {
  constructor(private readonly page: Page) {}

  async selectSize(size = 'M') {
    const button = this.page.locator('#detail-sizes-selector button', { hasText: size }).first();
    if (await button.count()) await button.click();
  }

  async selectColor(color = 'Black') {
    const button = this.page.locator('#detail-colors-selector button').filter({ has: this.page.locator(`[title="${color}"]`) }).first();
    const fallback = this.page.locator(`#detail-colors-selector button[title="${color}"]`).first();
    if (await fallback.count()) await fallback.click();
    else if (await button.count()) await button.click();
  }

  async addToCart() {
    await this.page.locator('#add-to-cart-action-btn').click();
    await expect(this.page.locator('#cart-drawer-panel')).toBeVisible({ timeout: 10_000 });
  }

  getPrice() {
    return this.page.locator('#detail-options-panel').getByText(/INR|₹|Rs/i).first();
  }

  getTitle() {
    return this.page.locator('#detail-options-panel h1').first();
  }
}

export class CartDrawer {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.locator('#nav-cart-btn, button[aria-label="Shopping bag"]').first().click();
    await expect(this.page.locator('#cart-drawer-panel')).toBeVisible();
  }

  async close() {
    await this.page.locator('#close-cart-drawer-btn').click();
    await expect(this.page.locator('#cart-drawer-panel')).toBeHidden();
  }

  getItems() {
    return this.page.locator('[id^="cart-drawer-item-"]');
  }

  async updateQuantity(delta: 'increase' | 'decrease') {
    await this.page.getByTitle(delta === 'increase' ? 'Increase' : 'Decrease').first().click();
  }

  async removeItem() {
    await this.page.getByTitle('Remove article').first().click();
  }

  async checkout() {
    await this.page.locator('#cart-drawer-checkout-btn').click();
    await expect(this.page.locator('#bag-view-container')).toBeVisible();
  }
}

export class LoginPage {
  constructor(private readonly page: Page) {}

  async fillEmail(email: string) {
    await this.page.locator('#email-input').fill(email);
  }

  async fillPassword(password: string) {
    await this.page.locator('#pass-input').fill(password);
  }

  async submit() {
    await this.page.locator('#signin-interactive-form button[type="submit"]').click();
  }

  getError() {
    return this.page.locator('#login-view-root').getByText(/invalid|failed|incorrect|error|could not|wrong/i).first();
  }

  googleButton(): Locator {
    return this.page.locator('iframe[title*="Google"], div[role="button"]').first();
  }
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async selectAddress(labelOrName = 'Home') {
    const option = this.page.getByRole('button', { name: new RegExp(labelOrName, 'i') }).first();
    if (await option.count()) await option.click();
  }

  async applyCoupon(code: string) {
    await this.page.getByPlaceholder(/enter code/i).fill(code);
    await this.page.getByRole('button', { name: /^apply$/i }).click();
  }

  async placeOrder() {
    await this.page.locator('#checkout-proceed-btn').click();
  }
}

export class AdminDashboard {
  constructor(private readonly page: Page) {}

  async navigate() {
    await this.page.goto(ADMIN_URL);
  }

  getStats() {
    return this.page.getByText(/orders|revenue|customers|products/i);
  }

  async selectView(view: string) {
    await this.page.getByRole('button', { name: new RegExp(view, 'i') }).click();
  }
}
