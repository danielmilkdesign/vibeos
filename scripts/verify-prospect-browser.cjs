'use strict';
// Called only by verify-crm-integration against its disposable database schema.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
module.exports=async function verifyBrowser({origin,cookie,artifactDir}) {
 const playwrightPath=process.env.QA_PLAYWRIGHT_MODULE;
 if(!playwrightPath)throw Error('Configure QA_PLAYWRIGHT_MODULE para testar a interface real.');
 const {chromium}=require(playwrightPath);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const checks=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const split=cookie.indexOf('=');
  await context.addCookies([{name:cookie.slice(0,split),value:cookie.slice(split+1),url:origin,httpOnly:true,secure:false,sameSite:'Lax'}]);
  // No external navigation, messages, or third-party resources in QA.
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/prospeccao');
  const upload=page.locator('#leadUpload');await upload.waitFor();
  await upload.setInputFiles({name:'leads-browser.csv',mimeType:'text/csv',buffer:Buffer.from('Nome;Telefone;Website;Categoria\nEmpresa Browser Sintética;+55 41 99999-0001;https://example.invalid;Ateliê\n')});
  await page.getByText('Importados: 1 leads',{exact:true}).waitFor();
  await page.locator('table thead input[type=checkbox]').check();
  await page.getByRole('button',{name:'Preparar propostas (1)',exact:true}).click();
  await page.getByText('Empresa Browser Sintética — 5 propostas no CRM',{exact:true}).waitFor({timeout:120000});
  checks.push('upload CSV no navegador → seleção → 5 rascunhos confirmados no CRM');
  await page.getByRole('button',{name:'Preparar propostas (1)',exact:true}).click();
  await page.getByText('Empresa Browser Sintética — 5 propostas no CRM',{exact:true}).waitFor({timeout:120000});
  const snapshot=await page.evaluate(()=>fetch('/api/crm').then(r=>r.json()));
  assert.equal(snapshot.collections.vibe_proposals.data.filter(p=>p.clientName==='Empresa Browser Sintética').length,5);
  checks.push('repetir preparação não duplica propostas');
  fs.mkdirSync(artifactDir,{recursive:true});
  await page.screenshot({path:path.join(artifactDir,'prospeccao-desktop.png'),fullPage:true});
  await page.goto(origin+'/pipeline');
  await page.getByText('Empresa Browser Sintética',{exact:true}).first().waitFor();
  checks.push('Pipeline renderiza contato salvo pela prospecção');
  await page.goto(origin+'/propostas');
  const article=page.locator('article').filter({has:page.getByRole('heading',{name:'Empresa Sintetica',exact:true})}).filter({hasText:'Site Institucional'});
  await article.getByRole('button',{name:'Detalhes',exact:true}).click();
  const detail=page.locator('section[aria-labelledby="proposal-detail"]');
  const image=detail.locator('img').first();await image.waitFor();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('section[aria-labelledby="proposal-detail"] img')).every(img=>img.complete&&img.naturalWidth>0));
  const pendingDownload=page.waitForEvent('download');
  await detail.getByRole('button',{name:/Baixar PNG/}).first().click();
  const download=await pendingDownload;const target=path.join(artifactDir,'proposta-site.png');await download.saveAs(target);
  const png=fs.readFileSync(target);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.ok(png.length>1000);
  checks.push('proposta aprovada renderiza imagem e baixa PNG real');
  const popupPromise=page.waitForEvent('popup');
  await detail.getByRole('button',{name:'Abrir WhatsApp do cliente',exact:true}).click();
  const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded').catch(()=>{});
  // External navigation was blocked; never send a real message.
  await popup.close();checks.push('ação WhatsApp abre janela; tráfego externo bloqueado no teste');
  await page.setViewportSize({width:390,height:844});await page.goto(origin+'/prospeccao');await page.locator('#leadUpload').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'sem overflow horizontal mobile');
  await page.screenshot({path:path.join(artifactDir,'prospeccao-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);checks.push('upload preservado em mobile e nenhum erro JS nas páginas testadas');
  return {checks,artifacts:artifactDir};
 }finally{await browser.close();}
};
