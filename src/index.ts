#!/usr/bin/env node

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { type Browser, launch, type Page } from 'puppeteer';

main().catch((error) => console.error(error.message));

async function main() {
  const { url, output, timeout, ui } = await parseCommand();

  const { id } = parseVideoUrl(url);

  const filePath = path.resolve(process.cwd(), output || `videos/${id}.mp4`);

  const browser: Browser = await launch({ headless: !ui });
  const page: Page = await browser.newPage();

  page.setDefaultTimeout(timeout);

  await page.goto(url);
  await page.setViewport({ width: 1280, height: 720 });
  await page.waitForNetworkIdle();

  // Accept cookies
  const acceptCookiesButtonSelector = '.fc-consent-root .fc-cta-consent';
  await page.waitForSelector(acceptCookiesButtonSelector);
  await page.click(acceptCookiesButtonSelector);

  // Start playing video or ads
  const playButtonSelector = '.button-players > .pb-bar > .pb-play';
  await page.waitForSelector(playButtonSelector);
  await page.click(playButtonSelector);

  // Read low quality video url
  const videoSelector = 'video.pb-video-player';
  const initialVideoRef = await page.$(videoSelector);
  const initialVideoUrl = await page.evaluate((el) => el.src, initialVideoRef);

  // Wait for low quality video start playing (possible ads before it)
  await page.waitForRequest((req) => req.url() === initialVideoUrl);

  // Open quality settings
  const qualitySettingsSelector = '.pb-quality > .pb-settings-click';
  await page.waitForSelector(qualitySettingsSelector);
  await page.click(qualitySettingsSelector);

  // Set best available quality option
  const bestQualityOptionSelector = '.settings-quality[data-quality]:last-child > a';
  await page.waitForSelector(bestQualityOptionSelector);
  await page.click(bestQualityOptionSelector);

  // Wait for DOM updates
  await waitFor(5_000);

  // Read best quality video url
  const videoRef = await page.$(videoSelector);
  const videoUrl = await page.evaluate((el) => el.src, videoRef);

  // Close browser
  await browser.close();

  await ensureDirnameExist(filePath);

  // Start downloading video file
  https.get(videoUrl, (res) => {
    const stream = fs.createWriteStream(filePath);

    res.pipe(stream);

    stream.on('finish', () => {
      console.log(`Finished downloading: ${videoUrl}`);
      console.log(`Downloaded file could be found at: ${filePath}`);
      stream.close();
    });

    console.log(`Started downloading: ${videoUrl}`);
  });
}

async function parseCommand(): Promise<{
  url: string;
  output: string;
  timeout: number;
  ui: boolean;
}> {
  try {
    const args = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: true,
      strict: true,
      options: {
        url: {
          type: 'string',
          short: '0',
        },
        output: {
          type: 'string',
          short: 'o',
          default: '',
        },
        timeout: {
          type: 'string',
          short: 't',
          default: '',
        },
        ui: {
          type: 'boolean',
          default: false,
        },
      },
    });

    const {
      positionals: [url],
      values: { output = '', timeout = '', ui = false },
    } = args;

    return { url, output, timeout: parseInt(timeout) || 300000, ui };
  } catch (error) {
    return logErrorThenExit(error instanceof Error ? error.message : 'Unable to parse cda-dl command');
  }
}

async function waitFor(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), delay));
}

async function ensureDirnameExist(filePath: string): Promise<void> {
  return new Promise((resolve) => {
    fs.mkdir(path.dirname(filePath), { recursive: true }, (error) => {
      if (error) {
        logErrorThenExit(error.message);
      }

      resolve();
    });
  });
}

const VIDEO_URL_PATTERN = /^https?:\/\/www\.cda\.pl\/video\/([\w-]+)(?:\/.*)?$/;

function parseVideoUrl(url: string): { url: string; id: string } {
  const match = VIDEO_URL_PATTERN.exec(url);

  if (match == null) {
    return logErrorThenExit('Invalid or missing video url');
  }

  return { url, id: match[1] };
}

function logErrorThenExit(message: string): never {
  console.error(message);
  process.exit(1);
}
