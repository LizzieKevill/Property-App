import {createHash} from 'node:crypto';
import {canonicalUrl,mergeCatalogue} from '../site/catalogue.mjs';
import {sourceFor} from '../site/model.mjs';
const text=v=>String(v||'').replace(/<[^>]*>/g,' ').replace(/&pound;|&#163;/g,'£').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const single=values=>{const all=[...new Set(values)];return all.length===1?all[0]:null;};
export function parseResult(result,config,observedAt){
 let url;try{url=new URL(result.url);}catch{return null;}
 const host=url.hostname.replace(/^www\./,'');if(!config.domains.includes(host)||url.protocol!=='https:')return null;
 if(!({'rightmove.co.uk':/^\/properties\/\d+\/?$/,'onthemarket.com':/^\/details\/\d+\/?$/,'landsale.co.uk':/^\/properties\/\d+\/?$/}[host]?.test(url.pathname)))return null;
 const title=text(result.title),body=text([result.description,...(result.extra_snippets||[])].join(' ')),all=title+' '+body;
 if(/no longer on the market|sold stc|under offer|sold subject|\blet agreed\b|\bto rent\b|\bper month\b/i.test(all))return null;
 // Search snippets can mix lot sizes or unrelated prices. Reject ambiguous values.
 const titlePrices=[...title.matchAll(/£\s*([\d,]+)(?:\s*(k|million|m)\b)?/gi)].map(m=>Number(m[1].replaceAll(',',''))*(m[2]?m[2].toLowerCase()==='k'?1000:1000000:1));
 const bodyPrices=[...body.matchAll(/£\s*([\d,]+)/g)].map(m=>Number(m[1].replaceAll(',',''))).filter(v=>v>50000);
 const price=single(titlePrices.length?titlePrices:bodyPrices);
 const acres=single([...all.matchAll(/\b(\d+(?:\.\d+)?)\s*(?:-|\s)?acres?\b/gi)].map(m=>Number(m[1])));
 const bedText=/\b\d+\s*bed(?:room)?s?\b/i.test(title)?title:body;
 const beds=single([...bedText.matchAll(/\b(\d+)\s*(?:bed(?:room)?s?)\b/gi)].map(m=>Number(m[1])));
 const region=config.regions.find(r=>new RegExp(r.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(title));
 if(price==null||price>config.maxPrice||acres==null||acres<config.minAcres||beds==null||beds<config.minBeds||!region||!/\bdetached\b/i.test(all)||/semi[- ]detached/i.test(all)||!/\brural\b|\bcountryside\b|\bsecluded\b|\bsmallholding\b|\bcountry cottage\b/i.test(all))return null;
 const canonical=canonicalUrl(url.href),postcode=title.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i)?.[0]?.toUpperCase()||'';
 const addressText=title.replace(/^.*?\bfor sale\s*(?:in\s*)?/i,'').replace(/\s*[-–|]\s*£.*$/,'').trim();
 // Only precise addresses are eligible for cross-site automatic merging.
 const address=postcode&&(/^(?:\d+[a-z]?\s+|[^,]+(?:farm|cottage|house|lodge|barn)\s*,)/i.test(addressText))?addressText:'';
 return {id:'search-'+createHash('sha256').update(canonical).digest('hex').slice(0,16),title:title.slice(0,120),area:addressText.slice(0,180),region:region==='Shropshire'?'Shropshire':'Mid Wales',postcode,address,price,acres,beds,baths:null,type:'Detached',setting:'Rural',condition:/renovation|modernisation|refurbishment/i.test(body)?'Renovation':'',source:sourceFor(url.href),url:url.href,links:[],sample:false,seen:false,decision:'',folders:[],notes:'',history:[{date:observedAt.slice(0,10),price}],created:Date.parse(observedAt),observedAt,availability:'Search-index result — availability unconfirmed',checked:'',access:'Not verified',planning:'Not verified',cautions:'Automatic search match. Price, acreage, rural setting and bedroom count come from search-index text and need checking on the original listing. No new-build permission or road position verified.',summary:'Discovered automatically through Brave Search. Open the listing for current particulars.'};
}
export function updateCatalogue(catalogue,results,config,observedAt){const incoming=results.map(r=>parseResult(r,config,observedAt)).filter(Boolean);const properties=mergeCatalogue(catalogue.properties,incoming);return {...catalogue,properties,updatedAt:observedAt,lastSearchAt:observedAt,searchStatus:`Search completed: ${incoming.length} matching results processed`};}
