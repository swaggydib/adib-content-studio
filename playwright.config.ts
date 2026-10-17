import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./e2e',timeout:120000,use:{baseURL:process.env.STUDIO_TEST_URL??'http://127.0.0.1:3002',headless:true,actionTimeout:10000,channel:'chrome',viewport:{width:1440,height:1000}},reporter:[['list'],['json',{outputFile:process.env.STUDIO_REPORT_PATH??'artifacts/browser-results.json'}]],workers:1});
