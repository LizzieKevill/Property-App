import {readFile,writeFile,rename} from 'node:fs/promises';
import {enrichPhotos} from './photos.mjs';
import {listingUrl} from './photos.mjs';
import {inspectCandidates} from './listing-details.mjs';
import {mergeCatalogue,canonicalUrl} from '../site/catalogue.mjs';
import {searchPlan,searchResponse} from './search-plan.mjs';
const key=process.env.BRAVE_SEARCH_API_KEY;if(!key){console.error('BRAVE_SEARCH_API_KEY is not configured. Existing listings are unchanged.');process.exit(1);}
const config=JSON.parse(await readFile('scripts/search-config.json','utf8'));
const catalogue=JSON.parse(await readFile('site/listings.json','utf8'));
const results=[];
try{
 const offsets={...catalogue.searchOffsets};
 for(const {q,offset} of searchPlan(config,catalogue)){
  const url=new URL('https://api.search.brave.com/res/v1/web/search');for(const[k,v]of Object.entries({q,offset:String(offset),country:'GB',search_lang:'en',count:'20',extra_snippets:'true'}))url.searchParams.set(k,v);
  const response=await fetch(url,{headers:{Accept:'application/json','X-Subscription-Token':key},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Search API returned HTTP ${response.status}. No catalogue changes written.`);
  const data=await response.json();results.push(...searchResponse(data));offsets[q]=data.query?.more_results_available&&offset<9?offset+1:0;
  await new Promise(resolve=>setTimeout(resolve,1100));
 }
 const now=new Date().toISOString(),queue=new Map();
 for(const result of [...(catalogue.discoveryQueue||[]),...results]){const url=listingUrl(result.url);if(url&&!queue.has(canonicalUrl(url)))queue.set(canonicalUrl(url),{url,title:String(result.title||'').slice(0,180)});}
 const inspection=await inspectCandidates([...queue.values()],config,now);
 const properties=mergeCatalogue(catalogue.properties,inspection.incoming),added=properties.length-catalogue.properties.length;
 const report={resultsReturned:results.length,candidateListings:queue.size,pagesChecked:inspection.checked,pagesUnavailable:inspection.failed,matchingListings:inspection.incoming.length,newProperties:added,queued:inspection.pending.length,rejected:inspection.rejected};
 const updated={...catalogue,properties,updatedAt:now,lastSearchAt:now,searchOffsets:offsets,searchCycle:(catalogue.searchCycle||0)+1,discoveryQueue:inspection.pending,searchReport:report,searchStatus:`Search completed: ${results.length} results, ${inspection.checked} listing pages checked, ${inspection.incoming.length} matches, ${added} new houses. ${inspection.pending.length} awaiting a later check.`};
 await enrichPhotos(updated);
 await writeFile('site/listings.json.tmp',JSON.stringify(updated,null,2)+'\n');await rename('site/listings.json.tmp','site/listings.json');
 console.log(JSON.stringify(report,null,2));console.log(`Catalogue contains ${updated.properties.length} listings.`);
}catch(error){console.error(error.message);process.exit(1);}
