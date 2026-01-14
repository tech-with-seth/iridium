import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { getOutline, getInteractiveOutline } from '../outline';

describe('outline utilities', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage();
    });

    afterAll(async () => {
        await browser.close();
    });

    describe('getOutline', () => {
        it('returns formatted tree for simple structure', async () => {
            await page.setContent(`
        <body>
          <header><h1>Title</h1></header>
          <main><p>Content</p></main>
        </body>
      `);

            const outline = await getOutline(page);

            expect(outline).toContain('body');
            expect(outline).toContain('header');
            expect(outline).toContain('main');
            expect(outline).toContain('h1');
            expect(outline).toContain('p');
        });

        it('shows element attributes', async () => {
            await page.setContent(`
        <body>
          <a href="/products">Products</a>
          <input type="text" placeholder="Search" />
        </body>
      `);

            const outline = await getOutline(page);

            expect(outline).toContain('[href=/products]');
            expect(outline).toContain('[type=text]');
            expect(outline).toContain('[placeholder="Search"]');
        });

        it('collapses repeated siblings', async () => {
            await page.setContent(`
        <body>
          <ul>
            <li>Item</li>
            <li>Item</li>
            <li>Item</li>
            <li>Item</li>
            <li>Item</li>
          </ul>
        </body>
      `);

            const outline = await getOutline(page);

            expect(outline).toContain('(×');
        });

        it('respects maxDepth option', async () => {
            await page.setContent(`
        <body>
          <div>
            <div>
              <div>
                <div>
                  <p>Deep content</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      `);

            const outline = await getOutline(page, { maxDepth: 2 });

            expect(outline).toContain('...');
        });

        it('respects selector option', async () => {
            await page.setContent(`
        <body>
          <header>Header</header>
          <main id="content">Main content</main>
        </body>
      `);

            const outline = await getOutline(page, { selector: 'main' });

            expect(outline).not.toContain('header');
            expect(outline).toContain('main');
        });
    });

    describe('getInteractiveOutline', () => {
        it('shows only interactive elements', async () => {
            await page.setContent(`
        <body>
          <header>
            <h1>Title</h1>
            <a href="/">Home</a>
          </header>
          <main>
            <p>Some text</p>
            <button>Click me</button>
          </main>
        </body>
      `);

            const outline = await getInteractiveOutline(page);

            expect(outline).toContain('header');
            expect(outline).toContain('a "Home"');
            expect(outline).toContain('main');
            expect(outline).toContain('button "Click me"');
            expect(outline).not.toContain('h1');
            expect(outline).not.toContain('p');
        });

        it('preserves landmarks', async () => {
            await page.setContent(`
        <body>
          <header>
            <button>Menu</button>
          </header>
          <main>
            <input type="text" />
          </main>
          <footer>
            <a href="/contact">Contact</a>
          </footer>
        </body>
      `);

            const outline = await getInteractiveOutline(page);

            expect(outline).toContain('header');
            expect(outline).toContain('main');
            expect(outline).toContain('footer');
        });

        it('detects interactive elements by role', async () => {
            await page.setContent(`
        <body>
          <div role="button">Click me</div>
          <div onclick="alert('hi')">Alert</div>
          <div tabindex="0">Focusable</div>
        </body>
      `);

            const outline = await getInteractiveOutline(page);

            expect(outline).toContain('[role=button]');
            expect(outline).toContain('onclick');
            expect(outline).toContain('tabindex');
        });
    });
});
