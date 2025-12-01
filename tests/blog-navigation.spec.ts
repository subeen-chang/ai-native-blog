import { test, expect } from '@playwright/test';

test.describe('Blog Navigation', () => {
  test('홈페이지 접속 및 기본 요소 확인', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('My Portfolio');

    await expect(page.locator('p').first()).toContainText("I'm a Vim enthusiast");

    const blogPostsSection = page.locator('div').filter({ hasText: /\d{4}-\d{2}-\d{2}/ }).first();
    await expect(blogPostsSection).toBeVisible();
  });

  test('블로그 목록 페이지에서 포스트 확인', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.locator('h1')).toContainText('My Blog');

    const blogLinks = page.locator('a[href^="/blog/"]');
    const count = await blogLinks.count();
    expect(count).toBeGreaterThan(0);

    const firstPost = blogLinks.first();
    await expect(firstPost).toBeVisible();

    const dateText = firstPost.locator('p.text-neutral-600');
    await expect(dateText).toBeVisible();

    const titleText = firstPost.locator('p.text-neutral-900');
    await expect(titleText).toBeVisible();
  });

  test('개별 블로그 포스트 페이지 접근 및 콘텐츠 확인', async ({ page }) => {
    await page.goto('/blog');

    const firstBlogLink = page.locator('a[href^="/blog/"]').first();
    const postTitleElement = firstBlogLink.locator('p').nth(1);
    const postTitle = await postTitleElement.textContent();

    await firstBlogLink.click();

    await expect(page).toHaveURL(/\/blog\/.+/);

    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible();
    if (postTitle) {
      const cleanTitle = postTitle.replace(/^[""]|[""]$/g, '');
      await expect(pageTitle).toContainText(cleanTitle);
    }

    const publishDate = page.locator('p.text-neutral-600').first();
    await expect(publishDate).toBeVisible();
    await expect(publishDate.textContent()).resolves.toMatch(/\d{4}/);

    const article = page.locator('article');
    await expect(article).toBeVisible();

    const authorProfile = page.getByRole('region', { name: 'John Doe' });
    await expect(authorProfile).toBeVisible();
    await expect(authorProfile.getByRole('heading', { name: 'John Doe' })).toBeVisible();
  });

  test('블로그 포스트 목록에서 여러 포스트 확인', async ({ page }) => {
    await page.goto('/blog');

    const blogLinks = page.locator('a[href^="/blog/"]');
    const count = await blogLinks.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const link = blogLinks.nth(i);
      await expect(link.locator('p.text-neutral-600')).toBeVisible();
      await expect(link.locator('p.text-neutral-900')).toBeVisible();
    }
  });

  test('홈페이지에서 블로그 페이지로 네비게이션', async ({ page }) => {
    await page.goto('/');

    const firstBlogLinkFromHome = page.locator('a[href^="/blog/"]').first();
    await expect(firstBlogLinkFromHome).toBeVisible();

    await firstBlogLinkFromHome.click();

    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.locator('h1')).toBeVisible();
  });
});
