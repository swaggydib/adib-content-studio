import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:3000');
await page.getByRole('heading',{name:'Meja konten.'}).waitFor();
await page.screenshot({path:'artifacts/desktop-initial.png',fullPage:true});
console.log(JSON.stringify({title:await page.title(),cards:await page.locator('.content-card').count(),errors},null,2));
await browser.close();
