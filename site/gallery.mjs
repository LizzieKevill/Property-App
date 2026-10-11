// Only images published by the supported listing portals are displayed.
export function photoUrl(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return '';
 const paths={'media.onthemarket.com':/^\/properties\/\d+\//,'media.rightmove.co.uk':/^\/property-photo\//,'img.landsale.co.uk':/^\/images\/properties\//};
 return paths[u.hostname]?.test(u.pathname)&&/\.(?:jpe?g|png|webp)$/i.test(u.pathname)?u.href:'';
 }catch{return '';}
}
export function propertyPhotos(p){return Array.isArray(p.photos)?p.photos.filter(photo=>photo&&photoUrl(photo.url)):[];}
