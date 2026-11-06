import sharp from 'sharp';
import {writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const out=new URL('.',import.meta.url).pathname;
await mkdir(join(out,'png'),{recursive:true});await mkdir(join(out,'svg'),{recursive:true});
const colors={white:'#F5F7F8',black:'#111619',mint:'#2FE0A0'};
const letters=`<path d="M91 17C70-2 9 0 9 29C9 60 91 48 91 79C91 112 27 114 8 94"/><path d="M225 18C213 4 199 1 185 1C157 1 135 25 135 54C135 84 157 108 185 108C201 108 214 102 225 91"/><ellipse cx="318" cy="55" rx="49" ry="53"/><ellipse cx="452" cy="55" rx="49" ry="53"/><path d="M537 108V2H589C646 2 646 60 589 60H537"/>`;
const word=(color)=>`<g fill="none" stroke="${color}" stroke-width="7" stroke-linecap="butt" stroke-linejoin="round">${letters}</g>`;
const mark=(color,accent=color)=>`<g fill="none" stroke-linecap="butt"><circle cx="100" cy="100" r="90" stroke="${accent}" stroke-width="6"/><path d="M135 66C119 47 68 49 68 75C68 100 133 89 133 117C133 144 82 151 63 130" stroke="${color}" stroke-width="9"/></g>`;
function art(type,color,accent=color){
 if(type==='mark')return {box:'0 0 200 200',w:200,h:200,body:mark(color,accent)};
 if(type==='wordmark')return {box:'-14 -16 664 142',w:664,h:142,body:word(color)};
 if(type==='horizontal')return {box:'-18 -18 940 236',w:940,h:236,body:mark(color,accent)+`<g transform="translate(268 45)">${word(color)}</g>`};
 return {box:'-24 -24 684 474',w:684,h:474,body:`<g transform="translate(218 0)">${mark(color,accent)}</g><g transform="translate(0 310)">${word(color)}</g>`};
}
function svg(a){return `<svg xmlns="http://www.w3.org/2000/svg" width="${a.w}" height="${a.h}" viewBox="${a.box}">${a.body}</svg>`;}
const files=[];
for(const [name,color] of Object.entries(colors))for(const type of ['mark','wordmark','horizontal','stacked']){
 const a=art(type,color);const source=svg(a);const base=`scoop-${type}-${name}`;
 await writeFile(join(out,'svg',base+'.svg'),source);files.push('svg/'+base+'.svg');
 const width=type==='mark'?2048:type==='stacked'?2400:3200;
 await sharp(Buffer.from(source)).resize({width}).png().toFile(join(out,'png',base+'.png'));files.push('png/'+base+'.png');
 if(type==='mark')for(const size of [32,64,128,256,512]){const file=base+'-'+size+'.png';await sharp(Buffer.from(source)).resize(size,size).png().toFile(join(out,'png',file));files.push('png/'+file);}
}
for(const type of ['mark','horizontal','stacked']){
 const a=art(type,colors.white,colors.mint),base=`scoop-${type}-white-mint`;
 await writeFile(join(out,'svg',base+'.svg'),svg(a));
 await sharp(Buffer.from(svg(a))).resize({width:type==='mark'?2048:type==='stacked'?2400:3200}).png().toFile(join(out,'png',base+'.png'));
 files.push('svg/'+base+'.svg','png/'+base+'.png');
}
// Opaque presentation sheet for reviewing transparent artwork on intended backgrounds.
const text=(s,x,y,size=18,fill='#87959F',extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${s}</text>`;
let board=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1560" viewBox="0 0 1800 1560"><rect width="1800" height="1560" fill="#0E1419"/>${text('SCOOP',72,83,35,'#F5F7F8','font-weight="700" letter-spacing="5"')}${text('LOGO SYSTEM / 01',1728,79,16,'#83959F','text-anchor="end" letter-spacing="3"')}<line x1="72" y1="116" x2="1728" y2="116" stroke="#2B3740"/>${text('01 / FULL WORDMARK',72,167,15,'#8D9CA6','letter-spacing="2"')}<g transform="translate(275 220) scale(1.96)">${word(colors.white)}</g>${text('02 / COMPACT MARK',72,530,15,'#8D9CA6','letter-spacing="2"')}<g transform="translate(110 590) scale(1.12)">${mark(colors.white)}</g><g transform="translate(435 590) scale(1.12)">${mark(colors.mint)}</g>${text('03 / HORIZONTAL LOCKUP',790,530,15,'#8D9CA6','letter-spacing="2"')}<g transform="translate(790 640) scale(.83)">${art('horizontal',colors.white,colors.mint).body}</g><line x1="72" y1="890" x2="1728" y2="890" stroke="#2B3740"/><rect x="72" y="930" width="805" height="550" rx="18" fill="#F2F4F1"/>${text('04 / STACKED · DARK',106,979,14,'#68756E','letter-spacing="2"')}<g transform="translate(211 1026) scale(.82)">${art('stacked',colors.black).body}</g><rect x="907" y="930" width="821" height="550" rx="18" fill="#1D2B2E"/>${text('05 / STACKED · ACCENT',944,979,14,'#A0B1B7','letter-spacing="2"')}<g transform="translate(1060 1026) scale(.82)">${art('stacked',colors.white,colors.mint).body}</g>${text('TRANSPARENT PNG + EDITABLE SVG / SMALL TO LARGE',72,1524,12,'#7A8C96','letter-spacing="2"')}</svg>`;
await sharp(Buffer.from(board)).png().toFile(join(out,'scoop-logo-variations.png'));
await writeFile(join(out,'README.md'),`# Scoop logo kit\n\nFour matching compositions: compact S mark, full SCOOP wordmark, horizontal lockup, stacked lockup. White, dark and mint transparent PNGs, plus white/mint accents.\n\n- Large PNGs: mark 2048px, wordmark/horizontal 3200px wide, stacked 2400px wide.\n- Small marks: 32, 64, 128, 256 and 512px.\n- SVGs are editable vector masters; all letterforms are paths, with no font dependencies.\n- White versions are meant for dark backgrounds. Dark versions are meant for light backgrounds.\n- Preview sheet is an opaque presentation board. Individual PNGs have real alpha transparency.\n- New geometric lettering and S symbol inspired by the requested minimal performance-brand style. Existing app files and deployment were not modified.\n\nCreated deterministically as vector paths and rasterized with Sharp, extending the app's existing SVG logo system.\n`);
console.log(`Exported ${files.length} logo assets plus preview sheet.`);
