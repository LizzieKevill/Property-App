// Rotate broad queries and result pages without increasing hourly API requests.
export function searchPlan(config,catalogue){
 const terms=['acres "for sale"','land detached "for sale"','smallholding "for sale"'];
 const term=terms[(catalogue.searchCycle||0)%terms.length];
 return config.domains.flatMap(domain=>config.regions.map(region=>{const q=`site:${domain} ${region} ${term}`;return {q,offset:Math.min(9,Math.max(0,Number(catalogue.searchOffsets?.[q])||0))};}));
}
export function searchResponse(data){
 if(Array.isArray(data.web?.results))return data.web.results;
 if(data.query&&data.web===undefined)return [];
 throw Error('Search API response was missing expected results.');
}
