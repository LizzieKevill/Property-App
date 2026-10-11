import {createHash} from 'node:crypto';
import {canonicalUrl} from '../site/catalogue.mjs';
import {sourceFor} from '../site/model.mjs';
import {listingUrl,extractPhotos} from './photos.mjs';
const text=v=>String(v||'').replace(/<[^>]*>/g,' ').replace(/&pound;|&#163;/g,'£').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const number=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const single=values=>{const unique=[...new Set(values)];return unique.length===1?unique[0]:null;};
const price=v=>{const m=text(v).match(/£\s*([\d,]+(?:\.\d+)?)(?:\s*(k|million|m)\b)?/i);return m?Number(m[1].replaceAll(',',''))*(m[2]?m[2].toLowerCase()==='k'?1000:1000000:1):null;};
export function landAcres(features,description,explicit=null){
 if(/tenanc|subject to AHA/i.test(description+' '+features)){
  const usable=description.match(/land not subject[^.]{0,150}?(\d+(?:\.\d+)?)\s*acres/i);
  return usable?Number(usable[1]):null;
 }
 if(explicit!=null)return number(explicit);
 const extract=s=>[...s.matchAll(/\b(\d+(?:\.\d+)?)\s*[- ]?acres?\b/gi)].map(m=>Number(m[1]));
 const main=extract(features),all=extract(description);
 if(/\blot\s*[1-9]/i.test(description)&&new Set([...main,...all]).size>1)return null;
 if(main.length)return single(main);
 if(all.length)return single(all);
 const hectares=[...description.matchAll(/\b(\d+(?:\.\d+)?)\s*hectares?\b/gi)].map(m=>Number(m[1])*2.47105381);
 return single(hectares);
}
export function extractListing(html,value){
 const url=listingUrl(value);if(!url)return null;const u=new URL(url),id=u.pathname.match(/\d+/)[0];let facts;
 try{
  if(u.hostname==='www.onthemarket.com'){
   const script=html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
   const p=JSON.parse(script?.[1]||'null')?.props?.pageProps?.initialReduxState?.property;if(!p||String(p.id)!==id)return null;
   const features=(p.features||[]).map(f=>text(f.feature)).join(' '),description=text(p.description);
   let postcode='';try{postcode=JSON.parse(p.headerData?.dataLayer||'{}').postcode||'';}catch{}
   facts={title:p.propertyTitle,area:p.displayAddress,postcode,regionText:[p.displayAddress,...(p.breadcrumbs||[]).map(b=>b.text)].join(' '),price:number(p.priceRaw),beds:number(p.bedrooms),baths:number(p.bathrooms),type:text(p.humanisedPropertyType||p.propSubId),description,features,acres:landAcres(features,description),lat:number(p.location?.lat),lon:number(p.location?.lon),active:p.forSale===true&&p.toRent!==true,availability:text([p.propertyTitle,...(p.propertyLabels||[]),p.status||''].join(' '))};
  }else if(u.hostname==='www.rightmove.co.uk'){
   const model=JSON.parse(html.match(/window\.__PAGE_MODEL\s*=\s*({[^\n]+})\s*;/)?.[1]||'null');let p=model?.propertyData;
   if(typeof model?.data==='string'){
    const refs=JSON.parse(model.data);const resolve=(index,depth=0)=>{if(depth>10)return null;const item=refs[index];if(Array.isArray(item))return item.map(i=>resolve(i,depth+1));if(item&&typeof item==='object')return Object.fromEntries(Object.entries(item).map(([k,i])=>[k,resolve(i,depth+1)]));return item;};
    p=resolve(refs[0]?.propertyData);
   }
   if(!p||String(p.id)!==id)return null;
   const features=(p.keyFeatures||[]).map(text).join(' '),description=text(p.text?.description);
   facts={title:p.text?.propertyPhrase||p.propertySubType,area:p.address?.displayAddress,postcode:[p.address?.outcode,p.address?.incode].join(' '),regionText:p.address?.displayAddress,price:price(p.prices?.primaryPrice),beds:number(p.bedrooms),baths:number(p.bathrooms),type:text(p.propertySubType),description,features,acres:landAcres(features,description),lat:number(p.location?.latitude),lon:number(p.location?.longitude),active:p.channel==='RES_BUY'&&p.status?.published===true&&!p.status?.archived,availability:text([p.text?.pageTitle,p.text?.propertyPhrase,p.prices?.message].join(' '))};
  }else{
   let node;for(const script of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){
    let d;try{d=JSON.parse(script[1]);}catch{continue;}
    node=(Array.isArray(d)?d:d['@graph']||[d]).find(n=>[].concat(n['@type']||[]).includes('RealEstateListing')&&listingUrl(n.url)===url);if(node)break;
   }
   const p=node?.offers?.itemOffered;if(!p)return null;
   const features=text(html.match(/<ul[^>]*class="[^"]*key-features-list[^>]*>([\s\S]*?)<\/ul>/i)?.[1]);
   const description=text(html.match(/<h2[^>]*>Description<\/h2>\s*<div[^>]*>([\s\S]*?)<\/div>/i)?.[1]||node.description);
   const land=p.additionalProperty?.find(v=>/land area/i.test(v.name));
   facts={title:node.name,area:p.name,postcode:p.address?.postalCode,regionText:[p.name,p.address?.addressRegion].join(' '),price:number(node.offers.price),beds:number(p.numberOfBedrooms),baths:number(p.numberOfBathrooms),type:text(features+' '+description),description,features,acres:landAcres(features,description,/acres?/i.test(land?.unitText||'')?land.value:null),lat:number(p.geo?.latitude),lon:number(p.geo?.longitude),active:/\/InStock$/.test(node.offers.availability||''),availability:text(node.name)};
  }
 }catch{return null;}
 facts.postcode=text(facts.postcode+' '+facts.area).match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i)?.[0]?.toUpperCase()||'';
 facts.address=facts.postcode&&/^(?:\d+[a-z]?\s+|[^,]+(?:farm|cottage|house|lodge|barn)\s*,)/i.test(facts.area||'')?text(facts.area):'';
 facts.url=url;return facts;
}
export function qualifyListing(facts,config,observedAt){
 if(!facts)return {reason:'details unavailable'};
 if(!facts.active||/no longer on the market|sold stc|under offer|sold subject|\bsold\b|\blet agreed\b/i.test(facts.availability))return {reason:'not available for sale'};
 if(facts.price==null)return {reason:'price missing'};if(facts.price>config.maxPrice)return {reason:'above budget'};
 if(facts.acres==null)return {reason:'land missing or ambiguous'};if(facts.acres<config.minAcres)return {reason:'too little land'};
 if(facts.beds==null||facts.beds<config.minBeds)return {reason:'bedrooms missing or below minimum'};
 const region=config.regions.find(r=>new RegExp(`\\b${r}\\b`,'i').test(facts.regionText||''));if(!region)return {reason:'outside search area or location missing'};
 if(!/\bdetached\b/i.test(facts.type)||/semi[- ]detached/i.test(facts.type))return {reason:'detached house not confirmed'};
 if(!/\brural\b|\bcountryside\b|\bsecluded\b|\bsmallholding\b|\bcountry cottage\b/i.test(facts.description+' '+facts.features))return {reason:'rural setting not confirmed'};
 const url=facts.url;
 return {property:{id:'search-'+createHash('sha256').update(canonicalUrl(url)).digest('hex').slice(0,16),title:text(facts.area||facts.title).slice(0,120),area:text(facts.area),postcode:facts.postcode,address:facts.address,region:region==='Shropshire'?'Shropshire':'Mid Wales',price:facts.price,acres:facts.acres,beds:facts.beds,baths:facts.baths,type:'Detached',setting:'Rural',condition:/renovation|modernisation|refurbishment/i.test(facts.description)?'Renovation':'',source:sourceFor(url),url,links:[],sample:false,seen:false,decision:'',folders:[],notes:'',history:[{date:observedAt.slice(0,10),price:facts.price}],created:Date.parse(observedAt),observedAt,lat:facts.lat,lon:facts.lon,availability:'Advertised for sale — confirm with agent',checked:observedAt.slice(0,10),dataQuality:'listing-page',priceQualifier:'Listing-page price — confirm',access:'Not verified',planning:'Not verified',cautions:'Automatically matched from the original advert. Verify land boundaries, road access, availability and planning with the agent. Permission to build is not confirmed.',summary:'Price, land and bedroom details checked against the original listing.'}};
}
export async function resolveRegion(facts,{fetchPage=fetch,cache=new Map()}={}){
 const postcode=(facts.postcode||'').replace(/\s/g,'').toUpperCase();if(!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(postcode))return facts;
 if(!cache.has(postcode))cache.set(postcode,(async()=>{
  try{const response=await fetchPage('https://api.postcodes.io/postcodes/'+encodeURIComponent(postcode),{signal:AbortSignal.timeout(5000),redirect:'error'});if(!response.ok)return null;const d=await response.json();return d.status===200&&d.result?.postcode?.replace(/\s/g,'').toUpperCase()===postcode?d.result:null;}catch{return null;}
 })());
 const result=await cache.get(postcode);if(result){facts.regionText=[facts.regionText,result.admin_district,result.admin_county].filter(Boolean).join(' ');facts.locationSource='Published postcode / ONS postcode district';}return facts;
}
export async function inspectCandidates(candidates,config,observedAt,{fetchPage=fetch,limit=48}={}){
 const pending=candidates.slice(limit),rows=candidates.slice(0,limit),incoming=[],rejected={},postcodeCache=new Map();let checked=0,failed=0,index=0;
 await Promise.all(Array.from({length:Math.min(3,rows.length)},async()=>{
  while(index<rows.length){const candidate=rows[index++];let html;
   try{const response=await fetchPage(listingUrl(candidate.url),{headers:{Accept:'text/html','User-Agent':'PropertyShortlist/1.0'},redirect:'error',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();html=await response.text();if(html.length>5000000)throw Error();}
   catch{failed++;pending.push(candidate);continue;}
   const facts=extractListing(html,candidate.url);if(!facts){failed++;pending.push(candidate);continue;}
   checked++;let result=qualifyListing(facts,config,observedAt);
   if(result.reason==='outside search area or location missing'){await resolveRegion(facts,{fetchPage,cache:postcodeCache});result=qualifyListing(facts,config,observedAt);}
   if(result.property){const p=result.property,photos=extractPhotos(html,p.url);if(photos.length){p.photos=photos;p.photosSourceUrl=p.url;p.photosChecked=observedAt;}incoming.push(p);}else rejected[result.reason]=(rejected[result.reason]||0)+1;
  }
 }));
 return {incoming,pending,checked,failed,rejected};
}
