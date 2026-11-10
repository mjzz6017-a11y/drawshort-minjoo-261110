import * as cheerio from 'cheerio';
export const escapeXml = s => String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function naverUrl(input) {
  let u; try { u = new URL(input); } catch { throw Error('올바른 블로그 주소를 입력해주세요.'); }
  if(u.protocol !== 'https:' || !['blog.naver.com','m.blog.naver.com'].includes(u.hostname) || u.port || u.username || u.password) throw Error('https://blog.naver.com 또는 m.blog.naver.com 주소만 지원합니다.');
  const parts=u.pathname.split('/').filter(Boolean);
  const id=u.searchParams.get('blogId') || parts[0];
  const post=u.searchParams.get('logNo') || parts[1];
  if(!/^[a-zA-Z0-9_-]+$/.test(id||'') || !/^\d+$/.test(post||'')) throw Error('블로그 개별 게시물 주소를 입력해주세요.');
  return `https://m.blog.naver.com/${id}/${post}`;
}
export function extractHtml(html) {
 const $=cheerio.load(html); $('script,style,nav,header,footer').remove();
 const title=$('meta[property="og:title"]').attr('content') || $('title').text();
 const el=$('.se-main-container').first().length?$('.se-main-container').first():$('#postViewArea').first();
 const text=el.find('p').length?el.find('p').map((_,e)=>$(e).text().trim()).get().filter(Boolean).join('\n'):el.text();
 if(text.trim().length<40) throw Error('공개 본문을 읽지 못했어요. 본문 직접 입력을 이용해주세요.');
 return {title:(title||'블로그 이야기').slice(0,100),text:text.trim().slice(0,24000)};
}
export function demoStoryboard(text,title='오늘의 이야기') {
 const lines=text.split(/\n+|(?<=[.!?。])\s+/).map(x=>x.trim()).filter(x=>x.length>8);
 if(!lines.length) throw Error('본문을 40자 이상 입력해주세요.');
 const n=Math.min(5,lines.length); const scenes=[];
 for(let i=0;i<n;i++){const at=Math.floor(i*lines.length/n);scenes.push({title:i===0?'이야기의 시작':i===n-1?'기억할 한 가지':`핵심 포인트 ${i}`,narration:lines[at].slice(0,180),visual:'idea'});}
 return {title:title.slice(0,45),scenes};
}
export function wrap(s,max=18){const out=[];for(const line of String(s).split('\n')){let cur='';for(const word of line.split(/\s+/)){if(cur&&(cur+' '+word).length>max){out.push(cur);cur='';}if(word.length>max){if(cur){out.push(cur);cur='';}for(let i=0;i<word.length;i+=max)out.push(word.slice(i,i+max));}else cur=cur?cur+' '+word:word;}if(cur)out.push(cur);}return out;}
export function sceneSvg(scene,index,total,title){
 const lines=wrap(scene.narration,21).slice(0,7);
 const icons=[`<path d="M460 520c-105-90 20-200 80-100 60-100 185 10 80 100l-80 78z"/>`,`<path d="M425 390h230v210H425zM460 450h155M460 490h120M460 530h145"/><path d="m585 570 40 40 85-100"/>`,`<circle cx="540" cy="465" r="90"/><path d="M500 550v55h80v-55M510 630h60M540 330v-35M405 350l-25-25M675 350l25-25M390 465h-35M690 465h35"/>`,`<path d="M400 590V430h90v160M495 590V370h90v220M590 590V300h90v290M395 340l100-70 95 5 100-90"/>`,`<path d="m540 320 55 110 122 18-89 86 21 122-109-58-109 58 21-122-89-86 122-18z"/>`];
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#faf9f5"/><path d="M80 100H1000" stroke="#e7e5dc" stroke-width="2"/><text x="80" y="75" font-family="Malgun Gothic" font-size="30" fill="#716e65">DRAWSHORT / ${index+1} OF ${total}</text><text x="80" y="190" font-family="Malgun Gothic" font-weight="bold" font-size="48" fill="#20251d">${escapeXml(scene.title.slice(0,20))}</text><circle cx="540" cy="475" r="220" fill="#ebf0c9"/><g fill="none" stroke="#262d22" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">${icons[index%5]}</g>${lines.map((line,i)=>`<text x="540" y="${830+i*78}" text-anchor="middle" font-family="Malgun Gothic" font-size="46" fill="#22261f">${escapeXml(line)}</text>`).join('')}<rect x="80" y="1655" width="920" height="5" fill="#e4e6da"/><rect x="80" y="1655" width="${920*(index+1)/total}" height="5" fill="#526a32"/><text x="80" y="1740" font-family="Malgun Gothic" font-size="27" fill="#6a7062">${escapeXml(title.slice(0,34))}</text><text x="80" y="1810" font-family="Malgun Gothic" font-size="24" fill="#96998f">글에서 시작되는 작은 이야기</text></svg>`;
}
