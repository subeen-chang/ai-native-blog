import { test, expect } from '@playwright/test'

test.describe('Email Subscription Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('구독 폼이 페이지에 표시되는지 확인', async ({ page }) => {
    // 구독 폼 제목 확인
    const heading = page.getByRole('heading', { name: '새 글 알림 받기' })
    await expect(heading).toBeVisible()

    // 설명 텍스트 확인
    const description = page.getByText('새로운 블로그 글이 발행되면')
    await expect(description).toBeVisible()

    // 이메일 입력 필드 확인
    const emailInput = page.getByPlaceholder('your@email.com')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required', '')

    // 구독 버튼 확인
    const submitButton = page.getByRole('button', { name: '구독하기' })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('유효한 이메일로 구독 신청 성공', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    // 이메일 입력
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')

    // 구독 버튼 클릭
    await submitButton.click()

    // 성공 메시지 확인 (더 구체적인 selector 사용)
    const successMessage = page.locator('#subscription-message')
    await expect(successMessage).toBeVisible()
    await expect(successMessage).toContainText('인증 이메일이 발송되었습니다')

    // 성공 메시지 스타일 확인 (녹색 배경)
    await expect(successMessage).toHaveClass(/bg-green/)

    // 입력 필드가 초기화되었는지 확인
    await expect(emailInput).toHaveValue('')

    // 버튼이 다시 활성화되었는지 확인
    await expect(submitButton).toBeEnabled()
    await expect(submitButton).toHaveText('구독하기')
  })

  test.skip('잘못된 이메일 형식으로 구독 신청 실패', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    // @ 기호는 있지만 도메인이 없는 이메일 (브라우저는 통과하지만 서버에서 검증 실패)
    await emailInput.fill('invalid@')

    // 구독 버튼 클릭
    await submitButton.click()

    // 에러 메시지 확인
    const errorMessage = page.locator('#subscription-message')
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
    await expect(errorMessage).toContainText('올바른 이메일 형식을 입력해주세요')

    // 에러 메시지 스타일 확인 (빨간색 배경)
    await expect(errorMessage).toHaveClass(/bg-red/)
  })

  test('빈 이메일로 구독 신청 시 브라우저 기본 검증', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    // 빈 입력 상태에서 버튼 클릭
    await submitButton.click()

    // HTML5 required 속성으로 인해 폼이 제출되지 않음
    // 검증: 페이지에 subscription-message가 나타나지 않음
    const alert = page.locator('#subscription-message')
    await expect(alert).not.toBeVisible()
  })

  test('너무 긴 이메일 주소 입력 시 에러 메시지', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    // 254자를 초과하는 이메일 생성
    const longEmail = 'a'.repeat(250) + '@example.com' // 263자
    await emailInput.fill(longEmail)

    await submitButton.click()

    // 에러 메시지 확인
    const errorMessage = page.locator('#subscription-message')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('이메일 주소가 너무 깁니다')
  })

  test('여러 다양한 유효한 이메일 형식 테스트', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    const validEmails = [
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.co.kr',
      'user_name@sub.example.com',
    ]

    for (const email of validEmails) {
      await emailInput.fill(email)
      await submitButton.click()

      // 성공 메시지 확인
      const successMessage = page.locator('#subscription-message')
      await expect(successMessage).toBeVisible()
      await expect(successMessage).toContainText('인증 이메일이 발송되었습니다')

      // 다음 테스트를 위해 잠시 대기
      await page.waitForTimeout(600)
    }
  })

  test('접근성: 키보드 네비게이션 테스트', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    // 이메일 입력 필드에 직접 포커스
    await emailInput.focus()
    await expect(emailInput).toBeFocused()

    // 이메일 입력
    await emailInput.type('keyboard@test.com')

    // Tab 키로 버튼으로 이동
    await page.keyboard.press('Tab')
    await expect(submitButton).toBeFocused()

    // Enter 키로 폼 제출
    await page.keyboard.press('Enter')

    // 성공 메시지 확인
    const successMessage = page.locator('#subscription-message')
    await expect(successMessage).toBeVisible()
  })

  test('다크모드에서 구독 폼 표시 확인', async ({ page }) => {
    // 다크모드 전환 (ThemeToggle 버튼 클릭)
    const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙/ })

    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      await page.waitForTimeout(300) // 테마 전환 애니메이션 대기
    }

    // 구독 폼이 여전히 표시되는지 확인
    const heading = page.getByRole('heading', { name: '새 글 알림 받기' })
    await expect(heading).toBeVisible()

    const emailInput = page.getByPlaceholder('your@email.com')
    await expect(emailInput).toBeVisible()

    const submitButton = page.getByRole('button', { name: '구독하기' })
    await expect(submitButton).toBeVisible()
  })

  test('연속된 구독 신청 테스트', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    // 첫 번째 구독
    await emailInput.fill('first@example.com')
    await submitButton.click()

    let successMessage = page.locator('#subscription-message')
    await expect(successMessage).toBeVisible()
    await page.waitForTimeout(600)

    // 두 번째 구독
    await emailInput.fill('second@example.com')
    await submitButton.click()

    successMessage = page.locator('#subscription-message')
    await expect(successMessage).toBeVisible()
  })

  test('API 에러 시나리오 시뮬레이션', async ({ page }) => {
    // API를 차단하여 500 에러 유발
    await page.route('**/api/subscribe', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: '서버 오류가 발생했습니다.',
        }),
      })
    })

    const emailInput = page.getByPlaceholder('your@email.com')
    const submitButton = page.getByRole('button', { name: '구독하기' })

    await emailInput.fill('error@test.com')
    await submitButton.click()

    // 에러 메시지 확인
    const errorMessage = page.locator('#subscription-message')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('서버 오류가 발생했습니다')
  })
})
