const randomUseragent = require('random-useragent');
//Enable stealth mode
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';

async function createPage(browser, url) {

    //Randomize User agent or Set a valid one
    const userAgent = randomUseragent.getRandom();
    const UA = userAgent || USER_AGENT;
    const page = await browser.newPage();

    //Randomize viewport size
    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });

    await page.setUserAgent(UA);
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0);

    //Skip images/styles/fonts loading for performance
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.evaluateOnNewDocument(() => {
        // Pass webdriver check
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    await page.evaluateOnNewDocument(() => {
        // Pass chrome check
        window.chrome = {
            runtime: {},
            // etc.
        };
    });

    await page.evaluateOnNewDocument(() => {
        //Pass notifications check
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });

    await page.evaluateOnNewDocument(() => {
        // Overwrite the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'plugins', {
            // This just needs to have `length > 0` for the current test,
            // but we could mock the plugins too if necessary.
            get: () => [1, 2, 3, 4, 5],
        });
    });

    await page.evaluateOnNewDocument(() => {
        // Overwrite the `languages` property to use a custom getter.
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    return page;
}

class PuppeteerService {

    constructor() {
        this.browser = null;
        this.page = null;
        this.pageOptions = null;
        this.waitForFunction = null;
        this.isLinkCrawlTest = null;
    }

    async initiate(countsLimitsData, isLinkCrawlTest) {
        this.pageOptions = {
            waitUntil: 'networkidle2',
            timeout: countsLimitsData.millisecondsTimeoutSourceRequestCount
        };
        this.waitForFunction = 'document.querySelector("body")';
        puppeteerExtra.use(pluginStealth());
        //const browser = await puppeteerExtra.launch({ headless: false });
        this.browser = await puppeteerExtra.launch({ headless: false });
        this.page = await this.browser.newPage();
        await this.page.setRequestInterception(true);
        this.page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });
        this.isLinkCrawlTest = isLinkCrawlTest;
    }

    async crawl(link) {
        const userAgent = randomUseragent.getRandom();
        const crawlResults = { isValidPage: true, pageSource: null };
        try {
            await this.page.setUserAgent(userAgent);
            await this.page.goto(link, this.pageOptions);
            await this.page.waitForFunction(this.waitForFunction);
            crawlResults.pageSource = await this.page.content();
        }
        catch (error) {
            crawlResults.isValidPage = false;
        }
        if (this.isLinkCrawlTest) {
            this.close();
        }
        return crawlResults;
    }

    close() {
        if (!this.browser) {
            this.browser.close();
        }
    }
}

const puppeteerService = new PuppeteerService();

module.exports = { createPage, puppeteerService }
