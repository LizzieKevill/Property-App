import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'property-search-test-'));
try{
 await mkdir(join(dir,'scripts'));await mkdir(join(dir,'site'));
 await writeFile(join(dir,'scripts/search-config.json'),await readFile(new URL('../scripts/search-config.json',import.meta.url)));
 await writeFile(join(dir,'site/listings.json'),JSON.stringify({version:1,properties:[]}));
 const p={id:'123',propertyTitle:'2 bedroom detached house for sale',displayAddress:'Farm Lane, Shropshire',priceRaw:400000,bedrooms:2,bathrooms:1,humanisedPropertyType:'Detached house',description:'Rural house with 3 acres.',features:[{feature:'3 acres'}],forSale:true,images:[{largeUrl:'https://media.onthemarket.com/properties/123/456/image-0.jpg',isImage:true}]};
 const page='<script id="__NEXT_DATA__" type="application/json">'+JSON.stringify({props:{pageProps:{initialReduxState:{property:p}}}})+'</script>';
 const bootstrap=`
const page=${JSON.stringify(page)};
const originalTimeout=globalThis.setTimeout;globalThis.setTimeout=(fn,ms,...args)=>originalTimeout(fn,ms===1100?0:ms,...args);
globalThis.fetch=async value=>{const url=new URL(value);if(url.hostname==='api.search.brave.com'){const isOtm=url.searchParams.get('q').includes('onthemarket.com');return {ok:true,json:async()=>({query:{more_results_available:isOtm},web:{results:isOtm?[{url:'https://www.onthemarket.com/details/123/',title:'Farm Lane',description:'Snippet lacks all matching facts'}]:[]}})};}if(url.href==='https://www.onthemarket.com/details/123/')return {ok:true,text:async()=>page};throw Error('Unexpected request '+url.href);};
await import(${JSON.stringify(new URL('../scripts/search.mjs',import.meta.url).href)});`;
 await writeFile(join(dir,'bootstrap.mjs'),bootstrap);
 const env={...process.env,BRAVE_SEARCH_API_KEY:'test-placeholder-not-a-real-key'};
 let result=spawnSync(process.execPath,[join(dir,'bootstrap.mjs')],{cwd:dir,env,encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr);
 let data=JSON.parse(await readFile(join(dir,'site/listings.json'),'utf8'));
 assert.equal(data.properties.length,1);assert.equal(data.searchReport.newProperties,1);
 assert.equal(data.searchReport.pagesChecked,1);assert.equal(data.searchReport.resultsReturned,4);
 assert.equal(data.properties[0].photos.length,1);assert.equal(data.searchCycle,1);
 assert.ok(Object.values(data.searchOffsets).includes(1));
 result=spawnSync(process.execPath,[join(dir,'bootstrap.mjs')],{cwd:dir,env,encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr);
 data=JSON.parse(await readFile(join(dir,'site/listings.json'),'utf8'));
 assert.equal(data.properties.length,1);assert.equal(data.searchReport.newProperties,0);
 const before=await readFile(join(dir,'site/listings.json'),'utf8');delete env.BRAVE_SEARCH_API_KEY;
 result=spawnSync(process.execPath,[join(dir,'bootstrap.mjs')],{cwd:dir,env,encoding:'utf8',timeout:10000});
 assert.equal(result.status,1);assert.equal(await readFile(join(dir,'site/listings.json'),'utf8'),before);
 console.log('13 complete-search assertions passed with simulated API and listing responses.');
}finally{
 const target=resolve(dir);if(dirname(target)!==resolve(tmpdir())||!basename(target).startsWith('property-search-test-'))throw Error('Unsafe temporary cleanup path');
 await rm(target,{recursive:true,force:true});
}
