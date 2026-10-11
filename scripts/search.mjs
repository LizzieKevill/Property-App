import {readFile,writeFile,rename} from 'node:fs/promises';
import {updateCatalogue} from './discovery.mjs';
import {enrichPhotos} from './photos.mjs';
const key=process.env.BRAVE_SEARCH_API_KEY;if(!key){console.error('BRAVE_SEARCH_API_KEY is not configured. Existing listings are unchanged.');process.exit(1);}
const config=JSON.parse(await readFile('scripts/search-config.json','utf8'));
const catalogue=JSON.parse(await readFile('site/listings.json','utf8'));
const results=[];
try{
 for(const domain of config.domains)for(const region of config.regions){
  const q=`site:${domain} ${region} detached house cottage smallholding acres for sale`;
  const url=new URL('https://api.search.brave.com/res/v1/web/search');for(const[k,v]of Object.entries({q,country:'GB',search_lang:'en',count:'20',extra_snippets:'true'}))url.searchParams.set(k,v);
  const response=await fetch(url,{headers:{Accept:'application/json','X-Subscription-Token':key},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Search API returned HTTP ${response.status}. No catalogue changes written.`);
  const data=await response.json();if(!Array.isArray(data.web?.results))throw Error('Search API response was missing expected results.');results.push(...data.web.results);
  await new Promise(resolve=>setTimeout(resolve,1100));
 }
 const updated=updateCatalogue(catalogue,results,config,new Date().toISOString());
 await enrichPhotos(updated);
 await writeFile('site/listings.json.tmp',JSON.stringify(updated,null,2)+'\n');await rename('site/listings.json.tmp','site/listings.json');
 console.log(`${results.length} search results examined. Catalogue contains ${updated.properties.length} listings.`);
}catch(error){console.error(error.message);process.exit(1);}
