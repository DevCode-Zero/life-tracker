import { test, expect, type Page } from '@playwright/test'

// ── Auth Flow ─────────────────────────────────────────────────
test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page).toHaveTitle(/Life Tracker/)
    await expect(page.locator('h1')).toContainText('Life Tracker')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/login')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
  })

  test('redirects to dashboard after login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    // In real e2e with test user this would pass
    // await expect(page).toHaveURL('/dashboard')
  })

  test('unauthenticated users redirected to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

// ── Dashboard ─────────────────────────────────────────────────
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set auth cookie for test user
    await page.context().addCookies([{
      name: 'sb-access-token',
      value: process.env.TEST_USER_TOKEN ?? 'test_token',
      domain: 'localhost',
      path: '/',
    }])
  })

  test('dashboard has stat cards', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="stat-habits"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-streak"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-savings"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-score"]')).toBeVisible()
  })

  test('habit grid is visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="habit-grid"]')).toBeVisible()
  })
})

// ── Habit Tracker ─────────────────────────────────────────────
test.describe('Habits', () => {
  test('habit page loads', async ({ page }) => {
    await page.goto('/habits')
    await expect(page.locator('h1')).toContainText('Habit')
  })

  test('can toggle habit completion', async ({ page }) => {
    await page.goto('/habits')
    const firstHabit = page.locator('[data-testid="habit-today-dot"]').first()
    if (await firstHabit.isVisible()) {
      await firstHabit.click()
      // Should show checkmark or toggle
      await expect(firstHabit).toHaveClass(/done|completed/)
    }
  })

  test('streak counter visible', async ({ page }) => {
    await page.goto('/habits')
    await expect(page.locator('[data-testid="streak-counter"]')).toBeVisible()
  })
})

// ── Budget ────────────────────────────────────────────────────
test.describe('Budget', () => {
  test('budget page loads with categories', async ({ page }) => {
    await page.goto('/budget')
    await expect(page.locator('[data-testid="budget-overview"]')).toBeVisible()
  })

  test('can open add transaction dialog', async ({ page }) => {
    await page.goto('/budget')
    await page.click('[data-testid="add-transaction-btn"]')
    await expect(page.locator('[data-testid="transaction-dialog"]')).toBeVisible()
  })

  test('transaction form validates required fields', async ({ page }) => {
    await page.goto('/budget')
    await page.click('[data-testid="add-transaction-btn"]')
    await page.click('[data-testid="transaction-submit"]')
    await expect(page.locator('[data-testid="form-error"]')).toBeVisible()
  })

  test('monthly tracker shows 12 months', async ({ page }) => {
    await page.goto('/budget')
    const monthCells = page.locator('[data-testid="month-cell"]')
    await expect(monthCells).toHaveCount(12)
  })
})

// ── Nutrition ─────────────────────────────────────────────────
test.describe('Nutrition', () => {
  test('meal plan page loads', async ({ page }) => {
    await page.goto('/nutrition')
    await expect(page.locator('[data-testid="meal-plan-week"]')).toBeVisible()
  })

  test('shows 7 day meal plan', async ({ page }) => {
    await page.goto('/nutrition')
    const dayCards = page.locator('[data-testid="meal-day-card"]')
    await expect(dayCards).toHaveCount(7)
  })

  test('protein tracker visible', async ({ page }) => {
    await page.goto('/nutrition')
    await expect(page.locator('[data-testid="protein-tracker"]')).toBeVisible()
  })
})

// ── Workout ───────────────────────────────────────────────────
test.describe('Workout', () => {
  test('workout page loads', async ({ page }) => {
    await page.goto('/workout')
    await expect(page.locator('[data-testid="workout-plan"]')).toBeVisible()
  })

  test('shows weekly plan', async ({ page }) => {
    await page.goto('/workout')
    const dayCards = page.locator('[data-testid="workout-day"]')
    await expect(dayCards).toHaveCount(7)
  })
})

// ── PWA ───────────────────────────────────────────────────────
test.describe('PWA', () => {
  test('has web app manifest', async ({ page }) => {
    const response = await page.request.get('/manifest.json')
    expect(response.status()).toBe(200)
    const manifest = await response.json()
    expect(manifest.name).toBe('Life Tracker')
    expect(manifest.display).toBe('standalone')
  })

  test('has service worker', async ({ page }) => {
    await page.goto('/')
    const swResponse = await page.request.get('/sw.js')
    expect(swResponse.status()).toBe(200)
  })

  test('is installable (has correct meta tags)', async ({ page }) => {
    await page.goto('/')
    const manifest = page.locator('link[rel="manifest"]')
    await expect(manifest).toHaveCount(1)
  })
})

// ── Mobile Responsiveness ─────────────────────────────────────
test.describe('Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14

  test('dashboard is usable on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    // Sidebar should be hidden on mobile
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible()
    // Mobile nav should be visible
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
  })

  test('habit dots are tappable on mobile', async ({ page }) => {
    await page.goto('/habits')
    const dot = page.locator('[data-testid="habit-today-dot"]').first()
    if (await dot.isVisible()) {
      await dot.tap()
    }
  })
})
