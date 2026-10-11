import {readFile,writeFile,rename} from 'node:fs/promises';
import {enrichPhotos} from './photos.mjs';
const catalogue=JSON.parse(await readFile('site/listings.json','utf8'));
await enrichPhotos(catalogue,{force:process.argv.includes('--force')});
await writeFile('site/listings.json.tmp',JSON.stringify(catalogue,null,2)+'\n');
await rename('site/listings.json.tmp','site/listings.json');
console.log(`${catalogue.properties.filter(p=>p.photos?.length).length} listings have photo galleries.`);
