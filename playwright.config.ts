import { defineConfig } from '@playwright/test';
import {qaTarget} from './lib/qa-safety.ts';
export default defineConfig({globalSetup:'./scripts/browser-qa-setup.ts',testDir:'./e2e',timeout:120000,use:{baseURL:qaTarget(process.env).url,headless:true,actionTimeout:10000,channel:'chrome',viewport:{width:1440,height:1000}},reporter:[['list'],['json',{outputFile:process.env.STUDIO_REPORT_PATH??'artifacts/browser-results.json'}]],workers:1});
