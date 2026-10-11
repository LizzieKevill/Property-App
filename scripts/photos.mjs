import {photoUrl} from '../site/gallery.mjs';

const listingUrl=value=>{try{const u=new URL(value);const paths={'www.onthemarket.com':/^\/details\/\d+\/?$/,'www.rightmove.co.uk':/^\/properties\/\d+\/?$/,'www.landsale.co.uk':/^\/properties\/\d+\/?$/};return u.protocol==='https:'&&!u.username&&!u.password&&paths[u.hostname]?.test(u.pathname)?u.href:'';}catch{return '';}};
export function extractPhotos(html,url){
 const valid=listingUrl(url);if(!valid)return [];
 const u=new URL(valid),id=u.pathname.match(/\d+/)[0];let images=[];
 try{
  if(u.hostname==='www.onthemarket.com'){
   const script=html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
   const data=JSON.parse(script?.[1]||'null');
   images=(data?.props?.pageProps?.initialReduxState?.property?.images||[]).filter(i=>i.isImage!==false).map(i=>({url:i.largeUrl,caption:i.text||''}));
  }else if(u.hostname==='www.rightmove.co.uk'){
   const script=html.match(/window\.__PAGE_MODEL\s*=\s*({[^\n]+})\s*;/);
   const model=JSON.parse(script?.[1]||'null');
   if(typeof model?.data==='string'){
    // Rightmove serialises its page model as an array of references.
    const refs=JSON.parse(model.data),property=refs[refs[0]?.propertyData];
    if(String(refs[property?.id])===id)images=(refs[property.images]||[]).map(index=>{const i=refs[index];return {url:refs[i.url],caption:refs[i.caption]||''};});
   }else images=(model?.propertyData?.images||[]).map(i=>({url:i.url,caption:i.caption||''}));
  }else{
   for(const script of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){
    let data;try{data=JSON.parse(script[1]);}catch{continue;}
    const nodes=Array.isArray(data)?data:data['@graph']||[data];
    for(const node of nodes)if([].concat(node['@type']||[]).includes('RealEstateListing')){
     images=[].concat(node.image||[]).map(i=>({url:typeof i==='string'?i:i?.url||i?.contentUrl,caption:''}));break;
    }
    if(images.length)break;
   }
  }
 }catch{return [];}
 const host={'www.onthemarket.com':'media.onthemarket.com','www.rightmove.co.uk':'media.rightmove.co.uk','www.landsale.co.uk':'img.landsale.co.uk'}[u.hostname];
 const unique=new Map();
 for(const i of images){
  if(!photoUrl(i.url))continue;const image=new URL(i.url);
  if(image.hostname!==host||host==='media.onthemarket.com'&&!image.pathname.startsWith(`/properties/${id}/`)||host==='media.rightmove.co.uk'&&!image.pathname.split('/').includes(id))continue;
  if(!unique.has(i.url)||!unique.get(i.url).caption)unique.set(i.url,{url:i.url,caption:String(i.caption||'').slice(0,160)});
 }
 return [...unique.values()].slice(0,250);
}
export async function enrichPhotos(catalogue,{fetchPage=fetch,now=new Date().toISOString(),force=false}={}){
 for(const p of catalogue.properties){
  if(p.sample||!force&&p.photos?.length&&Date.parse(now)-Date.parse(p.photosChecked||'')<86400000)continue;
  const links=[...new Set([p.url,...(p.links||[]).map(l=>l.url)].map(listingUrl).filter(Boolean))];
  for(const url of links){
   try{
    const response=await fetchPage(url,{headers:{'User-Agent':'PropertyShortlist/1.0','Accept':'text/html'},redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.ok)continue;const html=await response.text();if(html.length>5000000)continue;
    const photos=extractPhotos(html,url);if(!photos.length)continue;
    p.photos=photos;p.photosSourceUrl=url;p.photosChecked=now;break;
   }catch{/* A gallery failure must not stop searches or discard existing photos. */}
  }
 }
 return catalogue;
}
