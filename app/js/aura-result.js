// Eredményoldal: a jóváhagyott auraportré-oldal (design/aura_scanner/forras/template.html) az app keretében.
// A rajzoló kód a sablonból változatlan. Az összetétel és az üzenet a 4. szakaszig mintaadat (a valódi elemzőmotor adja majd).
import { IC_RBACK, IC_RSHARE, IC_RSAVE } from './aura-deco.js?v=0.6.57';
import { FLOW } from './aura.js?v=0.6.57';
import { saveWithNotice, getEntry } from './journal.js?v=0.6.57';
import { mountDelete } from './myview.js?v=0.6.57';
import { makeShareCard } from './sharecard.js?v=0.6.57';
import { PETS } from './pets.js?v=0.6.57';
const GOLD='<defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".5" stop-color="#e9c46f"/><stop offset="1" stop-color="#b07f2c"/></linearGradient></defs>';
const ICON={
 astro:`<svg viewBox="0 0 32 32">${GOLD}<path fill="url(#gg)" d="M19 5a11 11 0 1 0 8 18A9 9 0 1 1 19 5z"/><path fill="url(#gg)" d="M24 6l1.1 2.9L28 10l-2.9 1.1L24 14l-1.1-2.9L20 10l2.9-1.1z"/></svg>`,
 qi:`<svg viewBox="0 0 32 32">${GOLD}<circle cx="16" cy="16" r="12" fill="none" stroke="url(#gg)" stroke-width="2"/><path fill="url(#gg)" d="M16 5l3 11-3 11-3-11z"/><circle cx="16" cy="16" r="1.6" fill="#3a1d63"/></svg>`,
 etho:`<svg viewBox="0 0 32 32">${GOLD}<ellipse cx="16" cy="21" rx="6.5" ry="5.5" fill="url(#gg)"/><ellipse cx="8" cy="13.5" rx="2.6" ry="3.3" fill="url(#gg)"/><ellipse cx="13" cy="8.5" rx="2.7" ry="3.5" fill="url(#gg)"/><ellipse cx="19" cy="8.5" rx="2.7" ry="3.5" fill="url(#gg)"/><ellipse cx="24" cy="13.5" rx="2.6" ry="3.3" fill="url(#gg)"/></svg>`};
const SAT=true,HALO=true;
// Mintaösszetétel a 4. szakaszig: a réteg színei és címkéi (a döntések 5. pontja szerinti súlyokkal)
const WU={E:'wood',SE:'wood',S:'fire',SW:'earth',NE:'earth',W:'metal',NW:'metal',N:'water'};
const QCOL={wood:'#329B78',fire:'#C27A45',earth:'#65875C',metal:'#B8C3CC',water:'#468DAB'};
export function sampleComposition(t){
 const dog=FLOW.species!=='cat',dir=FLOW.dir;
 const astro=dog?{lab:[t('au.el.fire'),t('au.el.earth'),t('au.el.air')].join(' · '),col:'#BF985D'}:{lab:t('au.el.water'),col:'#468DAB'};
 const etho={lab:t('au.etho.curious'),col:dog?'#6FA9C8':'#E8C66A'};
 if(dir){const w=WU[dir];return [['astro',astro.lab,astro.col,.30],['qi',t('au.dir.'+dir)+' · '+t('au.wu.'+w),QCOL[w],.30],['etho',etho.lab,etho.col,.40]]}
 return [['astro',astro.lab,astro.col,.4286],['etho',etho.lab,etho.col,.5714]];
}
export function resultScreen(ctx){
 // ctx.archive: egy elmentett elemzés (Elemzéseim) – ugyanez a képernyő, a mentéskori fotóval, összetétellel, üzenettel és dátummal
 const {t,esc,pet,go,back,lang}=ctx,A=ctx.archive||null,name=A?(A.petName||t('au.start.noname')):(pet.name||t('au.start.noname'));
 const html=`<div class="au au-res"><canvas id="stars"></canvas><div class="scrollarea" id="sa"><canvas id="bgcv"></canvas>
 <div class="wrap"><h1>${esc(t('au.res.title'))}</h1><div class="sub" id="sub">${esc(t('au.res.date',{date:new Intl.DateTimeFormat(lang,{dateStyle:'long'}).format(A?new Date(A.date):new Date())}))}</div>
  <canvas id="aura"></canvas><div class="name" id="nm">${esc(name)}</div>
  <div class="comp"><div class="ctitle"><span class="ln"></span><span class="st"></span>${esc(t('au.res.comp'))}<span class="st"></span><span class="ln r"></span></div>
   <div class="bands"><canvas id="bandcv"></canvas><svg id="bandfr"></svg><div class="brow" id="brow"></div></div></div>
  <div class="scroll"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.webp" alt=""><img class="p-bot" src="assets/aura/perg_also.webp" alt=""><div class="p-ti">${esc(t('au.res.msg'))}</div><div class="p-in" id="msg"></div></div>
  <div class="vet">${esc(t('au.res.vet'))}</div>
  <nav class="acts"><a id="bBack" role="button" tabindex="0">${IC_RBACK}<span>${esc(t('back'))}</span></a><a id="bShare" role="button" tabindex="0">${IC_RSHARE}<span>${esc(t('au.res.share'))}</span></a><a id="bSave" role="button" tabindex="0">${IC_RSAVE}<span>${esc(t('au.res.save'))}</span></a></nav>${A?'<div class="mydelc" id="ardel"></div>':''}
 </div></div><div class="veil0" id="veil0"></div></div>`;
 const mount=(root)=>{
  const q=(s)=>root.querySelector(s),sa=q('#sa');let alive=true;
  const FRAMEIMG=new Image();FRAMEIMG.src='assets/aura/portrekeret.webp';
  const L=A?A.L:sampleComposition(t),LNAME={astro:t('au.res.l.astro'),qi:t('au.res.l.qi'),etho:t('au.res.l.etho')};
  // csillagok
  const sc=q('#stars'),sx=sc.getContext('2d');let ST=[];const sizeStars=()=>{sc.width=root.clientWidth*devicePixelRatio;sc.height=root.clientHeight*devicePixelRatio;ST=Array.from({length:40},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.3+.3,p:Math.random()*6}))};sizeStars();
  // --- színkeverés (lineáris RGB, mint az AURA_V1_DONTESEK 5. pontja) ---
  const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
  const toLin=c=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)};
  const toS=c=>{c=c<=0.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-0.055;return Math.round(Math.max(0,Math.min(1,c))*255)};
  function mix(list){const s=[0,0,0];list.forEach(([h,w])=>{hex2rgb(h).forEach((v,i)=>s[i]+=toLin(v)*w)});return s.map(toS)}
  const rgbHex=a=>'#'+a.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  const W={3:[.30,.30,.40],ce:[.4286,0,.5714],qe:[0,.4286,.5714],cq:[.5,.5,0]};


  const BGIMG=new Image();BGIMG.src='assets/ui/hatter_aura.webp';
  const bgc=q('#bgcv');let bgPix=null,bgKey='';
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function vnoise(seed){const R=rng(seed),P=new Float32Array(256*256);for(let i=0;i<P.length;i++)P[i]=R();
   const sm=x=>x*x*(3-2*x),g=(x,y)=>P[((y&255)<<8)|(x&255)];
   return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=sm(xf),v=sm(yf);
    const a=g(xi,yi),b=g(xi+1,yi),c=g(xi,yi+1),d=g(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}}
  const NZ=vnoise(7),NZ2=vnoise(19);
  function fbm(x,y){let s=0,a=.5,f=1;for(let o=0;o<4;o++){s+=a*NZ(x*f,y*f);f*=2.03;a*=.5}return s/0.9375}
  function buildBg(){
   if(!BGIMG.complete||!BGIMG.naturalWidth)return;
   const W=sa.clientWidth,Hp=Math.max(sa.scrollHeight,sa.clientHeight),d=Math.min(2,devicePixelRatio||1);
   if(W<40||!sa.scrollHeight)return; // még nincs valódi mérete (pl. előnézet első pillanata)
   const key=W+'x'+Hp;if(key===bgKey)return;bgKey=key;
   bgc.style.height=Hp+'px';bgc.width=Math.round(W*d);bgc.height=Math.round(Hp*d);
   const c=bgc.getContext('2d');c.setTransform(d,0,0,d,0,0);
   let s=Math.max(W/1024,820/1536);if(Hp>1536*s&&Hp<=1536*s*1.15)s=Hp/1536; // ha csak kicsit rövidebb a kép, enyhén nagyítunk
   const Wi=1024*s,Hi=1536*s,ox=(W-Wi)/2;
   c.fillStyle='#1c1240';c.fillRect(0,0,W,Hp);
   if(Hp<=Hi+40){c.drawImage(BGIMG,ox,0,Wi,Hi);return}
   // a festmény mintavételezése a csatlakozó sávokban (oszloponként)
   const sc=document.createElement('canvas');sc.width=Math.ceil(W);sc.height=Math.ceil(Hi);const sx2=sc.getContext('2d');sx2.drawImage(BGIMG,ox,0,Wi,Hi);
   const px=sx2.getImageData(0,0,sc.width,sc.height).data;
   const tEnd=Hi*0.62,tF=Hi*0.24,bStart=Hi*0.64,bF=Hi*0.22,yB=Hp-(Hi-bStart);
   const prof=(y0,y1)=>{const n=sc.width,o=new Float32Array(n*3);for(let x=0;x<n;x++){let r=0,g=0,b=0,k=0;for(let y=Math.floor(y0);y<y1;y+=2){const i=(y*n+x)*4;r+=px[i];g+=px[i+1];b+=px[i+2];k++}o[x*3]=r/k;o[x*3+1]=g/k;o[x*3+2]=b/k}
    const o2=new Float32Array(n*3),R=24;for(let x=0;x<n;x++){let r=0,g=0,b=0,k=0;for(let j=-R;j<=R;j++){const q=Math.min(n-1,Math.max(0,x+j));r+=o[q*3];g+=o[q*3+1];b+=o[q*3+2];k++}o2[x*3]=r/k;o2[x*3+1]=g/k;o2[x*3+2]=b/k}return o2};
   const pT=prof(tEnd-tF*0.6,tEnd),pB=prof(bStart,bStart+bF*0.6);
   // köd: alacsony felbontáson számolva, simán felnagyítva
   const q=3,lw=Math.ceil(W/q),lh=Math.ceil(Hp/q),lc=document.createElement('canvas');lc.width=lw;lc.height=lh;const lx=lc.getContext('2d'),im=lx.createImageData(lw,lh);
   const yA=tEnd-tF,yZ=yB+bF;
   for(let y=0;y<lh;y++){const Y=y*q;let v=(Y-yA)/(yZ-yA);v=Math.max(0,Math.min(1,v));v=v*v*(3-2*v);
    for(let x=0;x<lw;x++){const X=Math.min(sc.width-1,x*q),n=fbm(X/150,Y/150),n2=NZ2(X/60,Y/60);
     const f=0.80+0.42*n,i=(y*lw+x)*4;
     let r=(pT[X*3]*(1-v)+pB[X*3]*v)*f,g=(pT[X*3+1]*(1-v)+pB[X*3+1]*v)*f,b=(pT[X*3+2]*(1-v)+pB[X*3+2]*v)*f;
     const glow=Math.max(0,n-0.62)*1.6; r+=40*glow;g+=22*glow;b+=70*glow; // halvány lila ködfoltok
     r+=(n2-0.5)*4;g+=(n2-0.5)*3;b+=(n2-0.5)*6;
     im.data[i]=r;im.data[i+1]=g;im.data[i+2]=b;im.data[i+3]=255}}
   lx.putImageData(im,0,0);c.imageSmoothingQuality='high';c.drawImage(lc,0,0,W,Hp);
   // csillagok és halvány arany fátylak a középső részen (rögzített mag, nincs ismétlődés)
   const R=rng(42);
   for(let k=0;k<Math.round(W*(yZ-yA)/2600);k++){const x=R()*W,y=yA+R()*(yZ-yA),r=R()<0.92?0.4+R()*0.7:1+R()*0.9,a=0.35+R()*0.55;
    c.fillStyle=`rgba(255,240,215,${a})`;c.beginPath();c.arc(x,y,r,0,7);c.fill();
    if(r>1.2){c.strokeStyle=`rgba(255,226,160,${a*0.5})`;c.lineWidth=0.6;c.beginPath();c.moveTo(x-r*4,y);c.lineTo(x+r*4,y);c.moveTo(x,y-r*4);c.lineTo(x,y+r*4);c.stroke()}}
   c.save();c.globalCompositeOperation='lighter';c.filter='blur(6px)';
   const nW=Math.max(2,Math.round((yZ-yA)/520));
   for(let k=0;k<nW;k++){const left=k%2===0,y=yA+(k+0.5)*(yZ-yA)/nW+(R()-0.5)*80,x0=left?-20:W+20,dir=left?1:-1;
    for(let j=0;j<3;j++){c.strokeStyle=`rgba(240,196,120,${0.10-j*0.025})`;c.lineWidth=2.5-j*0.6;c.beginPath();
     c.moveTo(x0,y+j*10);c.bezierCurveTo(x0+dir*W*0.18,y-60+j*12,x0+dir*W*0.12,y+70-j*8,x0+dir*W*(0.30+0.05*j),y-20+j*14);c.stroke()}}
   c.restore();
   // festett felső rész, alján hosszú áttetsző átmenettel
   const band=(sy0,sy1,dy,fadeTop,fadeLen)=>{const h=sy1-sy0,tc=document.createElement('canvas');tc.width=Math.ceil(W*d);tc.height=Math.ceil(h*d);const tx=tc.getContext('2d');tx.setTransform(d,0,0,d,0,0);
    tx.drawImage(BGIMG,0,sy0/s,1024,h/s,ox,0,Wi,h);tx.globalCompositeOperation='destination-in';
    const gr=tx.createLinearGradient(0,0,0,h);
    if(fadeTop){gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(fadeLen/h,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,1)')}
    else{gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1-fadeLen/h,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)')}
    tx.fillStyle=gr;tx.fillRect(0,0,W,h);c.setTransform(1,0,0,1,0,0);c.drawImage(tc,0,Math.round(dy*d));c.setTransform(d,0,0,d,0,0)};
   band(0,tEnd,0,false,tF);
   band(bStart,Hi,yB,true,bF);
  }
  let bgT=0;const bgQ=()=>{clearTimeout(bgT);bgT=setTimeout(buildBg,60)};
  const bgLoaded=new Promise(r=>{BGIMG.onload=()=>{r();bgQ()};BGIMG.onerror=r});
  // minden méretváltozásra (első valódi méret, forgatás, ablakméret) újraépül minden réteg
  let rzT=0,lastW=0;const RO=new ResizeObserver(()=>{clearTimeout(rzT);rzT=setTimeout(()=>{const w=q('.wrap').getBoundingClientRect().width;
   if(w!==lastW){lastW=w;photo&&build();bandSetup();layoutCells()}bgQ()},50)});RO.observe(q('.wrap'));

  // --- aura ---
  const cv=q('#aura'),cx=cv.getContext('2d');
  let S,photo,cols,finalCol,ribbons,sparks,maskCanvas,hiRes=0; // hiRes: a megosztási kártyához egy pillanatra nagy felbontásban rajzolunk
  function tint(rgb,f){return rgb.map(v=>Math.round(v+(255-v)*f))}
  function deep(rgb,f){return rgb.map(v=>Math.round(v*(1-f)))}
  function lift(rgb){ // élénkítés: az aura fénye legyen ragyogó, a hue marad
   const m=Math.max(...rgb),k=m?235/m:1;return rgb.map(v=>Math.min(255,Math.round(v*k)))}
  function build(){
   const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;
   if(r.width<40||!photo||!photo.naturalWidth){maskCanvas=null;return}
   cv.width=hiRes||r.width*d;cv.height=hiRes||r.height*d;S=cv.width;
   const R=S*0.29; // fotó sugara
   // fotó lágy széllel
   maskCanvas=document.createElement('canvas');maskCanvas.width=maskCanvas.height=Math.ceil(R*2);
   const m=maskCanvas.getContext('2d');m.drawImage(photo,0,0,R*2,R*2);
   m.globalCompositeOperation='destination-in';
   const g=m.createRadialGradient(R,R,R*0.85,R,R,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.5,'rgba(0,0,0,.75)');g.addColorStop(1,'rgba(0,0,0,0)');
   m.fillStyle=g;m.beginPath();m.arc(R,R,R,0,7);m.fill();
   // fényfátylak: rétegenként 4 kiáramló fátyol (saját szín + világosabb/mélyebb árnyalat)
   ribbons=[];const n=cols.length;
   cols.forEach((c,k)=>{let L=lift(c);if(SAT){const m=(L[0]+L[1]+L[2])/3;L=L.map(v=>Math.max(0,Math.min(255,Math.round(m+(v-m)*1.6))));}
    [[L,1],[tint(L,.35),.8],[deep(L,.20),1],[L,.9],[tint(L,.2),.8],[deep(L,.1),.9]].forEach(([col,a],j)=>{
     const th0=-Math.PI/2+((k+j*n)/(6*n))*6.283+ (Math.random()-.5)*.4;
     const up=Math.max(0,-Math.sin(th0));
     ribbons.push({col,a,th0,dir:(j%2?-1:1),sweep:1.3+Math.random()*1.1,
      spread:R*(0.30+0.45*up+0.15*Math.random())*(1+0.35*Math.max(0,Math.cos(th0))),bal:1+0.30*Math.max(0,Math.cos(th0)),w:R*(0.16+0.10*Math.random()),
      sp:0.05+0.05*Math.random(),ph:Math.random()*6.28,fil:j<1})})});
   glow=document.createElement('canvas');glow.width=glow.height=Math.ceil(S/3);gx=glow.getContext('2d');
   sparks=Array.from({length:60},()=>newSpark(R,true));
  }
  let glow,gx;
  function wispPts(rb,t,R,c0,sc){const P=[];const N=40;
   for(let i=0;i<=N;i++){const u=i/N;
    const th=rb.th0+rb.dir*(u*rb.sweep)+0.25*Math.sin(t*rb.sp*6+rb.ph+u*2);
    const r=R*1.07+u*rb.spread+R*0.05*Math.sin(u*7+t*0.8+rb.ph);
    P.push([(c0+Math.cos(th)*r)*sc,(c0+Math.sin(th)*r)*sc,Math.sin(Math.PI*Math.min(1,u*1.3))*(1-u*0.5)])}
   return P}
  function newSpark(R,init){const a=Math.random()*6.28,d=R*(0.95+Math.random()*0.75);
   return{a,d,y:0,v:0.15+Math.random()*0.5,life:init?Math.random():0,s:Math.random()*1.6+0.5,
    gold:Math.random()<.6}}
  function drawWisps(t,R,c0){
   const sc=glow.width/S;gx.clearRect(0,0,glow.width,glow.height);gx.globalCompositeOperation='lighter';gx.lineCap='round';
   cols.forEach((c,k)=>{const [r,g,b]=lift(c);for(let j=0;j<3;j++){
    const th=t*0.12*(j%2?-1:1)+(k*3+j)*6.283/(cols.length*3);const d=R*(1.05+0.1*Math.sin(t*.5+j));
    const x=(c0+Math.cos(th)*d)*sc,y=(c0+Math.sin(th)*d)*sc,rr=R*0.75*sc;
    const gg=gx.createRadialGradient(x,y,0,x,y,rr);gg.addColorStop(0,`rgba(${r},${g},${b},.30)`);gg.addColorStop(1,'rgba(0,0,0,0)');
    gx.fillStyle=gg;gx.fillRect(x-rr,y-rr,rr*2,rr*2)}});
   ribbons.forEach(rb=>{const P=wispPts(rb,t,R,c0,sc);const [r,g,b]=rb.col;
    for(let i=1;i<P.length;i++){const w=P[i][2];
     gx.strokeStyle=`rgba(${r},${g},${b},${(SAT?0.10:0.13)*rb.a*w*rb.bal})`;gx.lineWidth=rb.w*sc*(0.4+w);
     gx.beginPath();gx.moveTo(P[i-1][0],P[i-1][1]);gx.lineTo(P[i][0],P[i][1]);gx.stroke()}});
   cx.save();cx.globalCompositeOperation='lighter';cx.filter=`blur(${S*0.012}px)`;
   cx.drawImage(glow,0,0,S,S);cx.filter='none';cx.drawImage(glow,0,0,S,S);cx.restore();
  }
  function drawFilaments(t,R,c0){
   cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';
   ribbons.filter(r=>r.fil).forEach(rb=>{const P=wispPts(rb,t,R,c0,1);const [r,g,b]=rb.col.map(v=>Math.min(255,v+(SAT?40:80)));
    for(let i=1;i<P.length;i++){cx.strokeStyle=`rgba(${r},${g},${b},${0.45*P[i][2]})`;cx.lineWidth=S*0.0022;
     cx.beginPath();cx.moveTo(P[i-1][0],P[i-1][1]);cx.lineTo(P[i][0],P[i][1]);cx.stroke()}});
   cx.restore();
  }
  function paw(x,y,s,col){cx.fillStyle=col;
   [[-.55,-.35,.22],[-.2,-.7,.24],[.2,-.7,.24],[.55,-.35,.22]].forEach(([a,b,r])=>{cx.beginPath();cx.ellipse(x+a*s,y+b*s,r*s,r*s*1.2,0,0,7);cx.fill()});
   cx.beginPath();cx.ellipse(x,y+.15*s,.48*s,.38*s,0,0,7);cx.fill()}
  // --- energiasávok ---
  const bc=q('#bandcv'),bx=bc.getContext('2d');let BW,BH,bOff,bOx;
  function bandSetup(){const el=bc.parentElement,r=el.getBoundingClientRect(),d=devicePixelRatio||1;
   if(r.width<40){bOff=null;return}
   bc.width=r.width*d;bc.height=r.height*d;BW=bc.width;BH=bc.height;bOff=1;
   // kettős arany keret (mint a menükeret): erősebb külső + vékony belső vonal
   const w=r.width,h=r.height,R1=48,fr=q('#bandfr');
   const rr=(i,rad)=>`<rect x="${i}" y="${i}" width="${w-2*i}" height="${h-2*i}" rx="${rad}" ry="${rad}" fill="none"/>`;
   fr.setAttribute('viewBox',`0 0 ${w} ${h}`);
   fr.innerHTML=`<defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dc95"/><stop offset=".5" stop-color="#c9953f"/><stop offset="1" stop-color="#f0cf80"/></linearGradient></defs>
   <g stroke="url(#fg)">${rr(1.2,R1-1).replace('fill="none"','fill="none" stroke-width="2.2"')}${rr(6,R1-6).replace('fill="none"','fill="none" stroke-width="0.9" opacity=".8"')}</g>
   <g fill="#f3d58a">${[[11,h/2],[w-11,h/2]].map(([x,y])=>`<path d="M${x} ${y-5}L${x+1.3} ${y-1.3}L${x+5} ${y}L${x+1.3} ${y+1.3}L${x} ${y+5}L${x-1.3} ${y+1.3}L${x-5} ${y}L${x-1.3} ${y-1.3}Z"/>`).join('')}</g>`;
  }
  const BX0=0.04;
  // feliratok a saját fényív közepére, a belső ~78%-on belül; tudatos sortörés, min. 13 px
  const MC=document.createElement('canvas').getContext('2d');
  function wordW(txt,px,it){MC.font=`${it?'italic ':''}600 ${px}px 'Cormorant Garamond', serif`;return Math.max(...txt.split(/\s+/).map(w=>MC.measureText(w).width))}
  function fullW(txt,px){MC.font=`600 ${px}px 'Cormorant Garamond', serif`;return MC.measureText(txt).width}
  function layoutCells(){const el=q('#brow'),w=el.getBoundingClientRect().width,h=el.getBoundingClientRect().height,cells=[...el.children],n=cells.length;
   if(w<40)return;
   const seg=w*(1-2*BX0)/n,maxW=n===1?w*0.60:seg*(n===3?0.70:0.72),lineW=n===1?w*0.60:seg*(n===3?0.70:0.56);
   cells.forEach((c,i)=>{c.style.left=(w*BX0+seg*(i+0.5))+'px';c.style.width=maxW+'px';
    const b=c.querySelector('b'),s=c.querySelector('small'),txt=b.dataset.t;
    let fb=17;while(fb>15&&wordW(txt,fb)>maxW)fb-=0.5;b.style.fontSize=fb+'px';
    b.innerHTML=(n===3||fullW(txt,fb)>lineW)?txt.replace(' ','<br>'):txt;
    const st=s.dataset.t||(s.dataset.t=s.textContent.replace(/\n/g,' '));
    let fs=14;while(fs>13&&wordW(st,fs)>maxW)fs-=0.5;s.style.fontSize=fs+'px';
    // tudatos sortörés: " · " elemek soronként; a sor végén nem marad árva pont
    const toks=st.split(' · ');
    if(toks.length>1){MC.font=`500 ${fs}px 'Cormorant Garamond', serif`;const lines=[];let cur='';
     toks.forEach(tk=>{const tr=cur?cur+' · '+tk:tk;if(cur&&MC.measureText(tr).width>lineW){lines.push(cur);cur=tk}else cur=tr});lines.push(cur);
     s.innerHTML=lines.join('<br>')}
    else{MC.font=`500 ${fs}px 'Cormorant Garamond', serif`;const ws=st.split(' ');const lines=[];let cur='';
     ws.forEach(wd=>{const tr=cur?cur+' '+wd:wd;if(cur&&MC.measureText(tr).width>lineW){lines.push(cur);cur=wd}else cur=tr});lines.push(cur);s.innerHTML=lines.join('<br>')}
    // függőleges ellenőrzés: a fényív belső magasságán belül maradjon
    let guard=0;while(c.offsetHeight>h*0.405*2*0.80&&guard++<8){fb=Math.max(15,fb-0.5);fs=Math.max(13,fs-0.5);b.style.fontSize=fb+'px';s.style.fontSize=fs+'px'}
    c.dataset.fit=`${fb}/${fs}/${c.offsetHeight}/${Math.round(h*0.405*2*0.8)}`});
  }
  function satCol(c){let L=lift(c);if(SAT){const m=(L[0]+L[1]+L[2])/3;L=L.map(v=>Math.max(0,Math.min(255,Math.round(m+(v-m)*1.6))))}return L}
  const BSPARK=Array.from({length:10},()=>({u:Math.random(),k:Math.floor(Math.random()*4),v:0.004+Math.random()*0.006,p:Math.random()*6}));
  function drawBands(t){if(!bOff||!cols)return;const n=cols.length,C=cols.map(satCol),d=devicePixelRatio||1;
   const x0=BW*BX0,x1=BW*(1-BX0),seg=(x1-x0)/n,mid=BH*0.5,A=BH*0.405;
   const S4=[-1,-0.72,0.72,1];
   const yAt=(x,k)=>{const q=(x-x0)/seg,i=Math.min(n-1,Math.max(0,Math.floor(q))),u=Math.min(1,Math.max(0,q-i));
    const env=Math.pow(Math.sin(Math.PI*u),0.6);
    const sway=BH*0.025*env*Math.sin(Math.PI*u*1.0+t*0.22+i*1.7); // az egész ív lassan himbálózik
    if(k===1||k===2){ // belső szálak: megcsavarodnak, keresztezik egymást
     const tw=Math.sin(Math.PI*2*u+t*0.18*(k===1?1:-1)+i)*(k===1?1:-1);
     return mid+sway+0.62*A*env*tw}
    return mid+sway+S4[k]*A*env*(1+0.06*Math.sin(t*0.3+k+i))};
   const grad=(a)=>{const g=bx.createLinearGradient(x0,0,x1,0);
    C.forEach(([r,gg,b],i)=>{const c=`rgba(${r},${gg},${b},${a})`;g.addColorStop(Math.max(0,(i+0.5)/n-0.5/n+0.02),c);g.addColorStop((i+0.5)/n,c);g.addColorStop(Math.min(1,(i+0.5)/n+0.5/n-0.02),c)});return g};
   const lite=(a)=>{const g=bx.createLinearGradient(x0,0,x1,0);
    C.forEach(([r,gg,b],i)=>g.addColorStop((i+0.5)/n,`rgba(${Math.min(255,r+70)},${Math.min(255,gg+70)},${Math.min(255,b+70)},${a})`));return g};
   bx.clearRect(0,0,BW,BH);bx.save();bx.globalCompositeOperation='lighter';
   // lencsék kitöltése rétegenként (saját szín, belülről ragyog)
   C.forEach(([r,g,b],i)=>{const a=x0+i*seg,cxm=a+seg/2;
    bx.beginPath();for(let x=a;x<=a+seg+0.5;x+=2)bx.lineTo(x,yAt(x,0));for(let x=a+seg;x>=a-0.5;x-=2)bx.lineTo(x,yAt(x,3));bx.closePath();
    const gr=bx.createRadialGradient(cxm,mid,0,cxm,mid,seg*0.55);
    gr.addColorStop(0,`rgba(${r},${g},${b},.38)`);gr.addColorStop(.6,`rgba(${r},${g},${b},.18)`);gr.addColorStop(1,`rgba(${r},${g},${b},.04)`);
    bx.fillStyle=gr;bx.filter=`blur(${3*d}px)`;bx.fill();bx.filter='none'});
   // szálak: elmosott fényudvar + fényes él
   const strand=(k)=>{bx.beginPath();for(let x=x0;x<=x1;x+=2){const y=yAt(x,k);x===x0?bx.moveTo(x,y):bx.lineTo(x,y)}};
   bx.filter=`blur(${9*d}px)`;
   for(let k=0;k<4;k++){strand(k);bx.strokeStyle=grad(k%3?0.20:0.45);bx.lineWidth=(k%3?10:16)*d;bx.stroke()}
   bx.filter=`blur(${2.5*d}px)`;
   for(let k=0;k<4;k++){strand(k);bx.strokeStyle=grad(k%3?0.28:0.6);bx.lineWidth=(k%3?3:4.5)*d;bx.stroke()}
   bx.filter='none';
   for(let k=0;k<4;k++){strand(k);bx.strokeStyle=lite(k%3?0.22:0.6);bx.lineWidth=(k%3?0.8:1.2)*d;bx.stroke()}
   // középső arany fényszál végig, a végein elhalványul
   const gl=bx.createLinearGradient(0,0,BW,0);gl.addColorStop(0,'rgba(255,220,150,0)');gl.addColorStop(.12,'rgba(255,220,150,.35)');gl.addColorStop(.88,'rgba(255,220,150,.35)');gl.addColorStop(1,'rgba(255,220,150,0)');
   bx.beginPath();for(let x=0;x<=BW;x+=3){const y=mid+BH*0.06*Math.sin(x/BW*6.283*n*0.5+t*0.2);x?bx.lineTo(x,y):bx.moveTo(x,y)}
   bx.strokeStyle=gl;bx.lineWidth=0.8*d;bx.stroke();
   // néhány arany szikra lassan vándorol a szálakon
   BSPARK.forEach(s=>{s.u=(s.u+s.v*0.2)%1;const x=x0+(x1-x0)*s.u,y=yAt(x,s.k),al=0.5+0.5*Math.sin(t*1.5+s.p);
    const g=bx.createRadialGradient(x,y,0,x,y,4*d);g.addColorStop(0,`rgba(255,232,170,${0.9*al})`);g.addColorStop(1,'rgba(255,232,170,0)');bx.fillStyle=g;bx.beginPath();bx.arc(x,y,4*d,0,7);bx.fill()});
   bx.restore();
  }
  let t0=performance.now();
  function frame(now){
   if(!alive)return;
   const t=(now-t0)/1000;
   // csillagok
    drawBands(t);
   if(!maskCanvas){requestAnimationFrame(frame);return}
   const R=S*0.29,c0=S/2,[fr,fg,fb]=lift(finalCol);
   cx.clearRect(0,0,S,S);
   // színsemleges levendulás-ezüstös ködös derengés a portré mögött
   if(HALO){cx.globalCompositeOperation='source-over';
    for(let j=0;j<5;j++){const a=t*0.07*(j%2?-1:1)+j*1.256,d=R*0.22;
     const x=c0+Math.cos(a)*d,y=c0+Math.sin(a)*d,rr=R*(1.55+0.12*Math.sin(t*0.3+j));
     const hg=cx.createRadialGradient(x,y,R*0.5,x,y,rr);
     hg.addColorStop(0,'rgba(200,196,226,.16)');hg.addColorStop(.6,'rgba(190,186,220,.08)');hg.addColorStop(1,'rgba(190,184,220,0)');
     cx.fillStyle=hg;cx.fillRect(0,0,S,S)}}
   cx.globalCompositeOperation='lighter';
   // belső fényudvar a végső színben
   const pulse=0.85+0.15*Math.sin(t*0.9);
   let g=cx.createRadialGradient(c0,c0,R*0.6,c0,c0,R*1.75);
   g.addColorStop(0,`rgba(${fr},${fg},${fb},${0.55*pulse})`);g.addColorStop(.45,`rgba(${fr},${fg},${fb},${0.22*pulse})`);g.addColorStop(1,'rgba(0,0,0,0)');
   cx.fillStyle=g;cx.fillRect(0,0,S,S);
   // fényfátylak (elmosva)
   drawWisps(t,R,c0);
   // fotó
   cx.globalCompositeOperation='source-over';
   cx.drawImage(maskCanvas,c0-R,c0-R);
   // fény a fotó szélén (perem-fény)
   cx.globalCompositeOperation='lighter';
   g=cx.createRadialGradient(c0,c0,R*0.86,c0,c0,R*1.08);
   g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.75,`rgba(${fr},${fg},${fb},${0.38*pulse})`);g.addColorStop(1,'rgba(0,0,0,0)');
   cx.fillStyle=g;cx.beginPath();cx.arc(c0,c0,R*1.05,0,7);cx.fill();
   // festett portrékeret (belső ívének sugara 478,5 px az 1280-as képen)
   cx.globalCompositeOperation='source-over';
   if(FRAMEIMG.complete){const fs=1280*(R*0.985/486.3);
    cx.shadowColor='rgba(15,5,30,.55)';cx.shadowBlur=S*0.012;
    cx.drawImage(FRAMEIMG,c0-fs/2,c0-fs/2,fs,fs);cx.shadowBlur=0;}
   drawFilaments(t,R,c0);
   // szikrák, csillagpor
   sparks.forEach((p,i)=>{p.life+=0.004*p.v*2;p.y-=p.v*S*0.0012;
    if(p.life>=1){sparks[i]=newSpark(R,false);return}
    const al=Math.sin(p.life*Math.PI),x=c0+Math.cos(p.a)*p.d,y=c0+Math.sin(p.a)*p.d+p.y;
    const col=p.gold?'255,222,150':`${Math.min(255,fr+60)},${Math.min(255,fg+60)},${Math.min(255,fb+60)}`;
    const rr=p.s*S*0.004;
    let sg=cx.createRadialGradient(x,y,0,x,y,rr*4);sg.addColorStop(0,`rgba(${col},${0.9*al})`);sg.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=sg;cx.beginPath();cx.arc(x,y,rr*4,0,7);cx.fill()});
   cx.globalCompositeOperation='source-over';
   // vízjel a keret jobb alsó ívén: arany mancs + felirat
   cx.save();cx.translate(c0+R*0.62,c0+R*0.98);cx.rotate(-0.55);
   {const gw=S*0.16,gh=S*0.045;const dg=cx.createRadialGradient(S*0.07,-S*0.012,0,S*0.07,-S*0.012,gw);
   dg.addColorStop(0,'rgba(25,8,48,.55)');dg.addColorStop(1,'rgba(25,8,48,0)');cx.save();cx.scale(1,gh/gw*2.2);cx.fillStyle=dg;
   cx.beginPath();cx.arc(S*0.07,-S*0.012/(gh/gw*2.2),gw,0,7);cx.fill();cx.restore();}
   cx.shadowColor='rgba(30,10,55,1)';cx.shadowBlur=S*0.02;
   for(let q=0;q<2;q++)paw(0,-S*0.006,S*0.016,'rgba(255,226,150,1)');
   cx.font=`italic 600 ${S*0.046}px 'Cormorant Garamond', serif`;cx.fillStyle='rgba(255,226,150,1)';cx.fillText('Pet Aura',S*0.022,0);cx.fillText('Pet Aura',S*0.022,0);cx.restore();
   requestAnimationFrame(frame);
  }

  // beállítás a mintaösszetétellel
  const fin=mix(L.map(l=>[l[2],l[3]]));finalCol=fin;cols=L.map(l=>hex2rgb(l[2]));
  const br=q('#brow');br.parentElement.className='bands n'+L.length;
  br.innerHTML=L.map(l=>`<div class="cell">${ICON[l[0]]}<b data-t="${LNAME[l[0]]}">${LNAME[l[0]]}</b><small>${l[1]}</small></div>`).join('');
  q('.ctitle').style.setProperty('--fc',rgbHex(lift(fin)));
  q('#msg').textContent=A?A.msg:t(L.length===3?'au.res.sample3':'au.res.sample2',{name});
  if(lang==='ja'){const m=q('#msg');m.style.fontStyle='normal';m.style.fontSize='14.5px';m.style.lineHeight='1.75';m.style.textAlign='left';q('.vet').style.fontStyle='normal'}
  bandSetup();layoutCells();
  photo=new Image();const photoLoaded=new Promise(r=>{photo.onload=()=>{build();r()};photo.onerror=r});photo.src=A?A.portrait:FLOW.portrait;
  const onR=()=>{sizeStars();bgQ()};addEventListener('resize',onR);document.fonts&&document.fonts.ready.then(()=>{layoutCells();bgQ()});
  // csillagok külön hurokban (a frame() a sablonban a fő vászonra rajzol)
  (function sf(now){if(!alive)return;const tt=(now-t0)/1000;sx.clearRect(0,0,sc.width,sc.height);ST.forEach(s=>{sx.globalAlpha=.35+.35*Math.sin(tt*1.3+s.p);sx.fillStyle='#fff3d6';sx.beginPath();sx.arc(s.x*sc.width,s.y*sc.height,s.r*devicePixelRatio,0,7);sx.fill()});sx.globalAlpha=1;requestAnimationFrame(sf)})(t0);
  requestAnimationFrame(frame);
  // a fehér takarás: az oldal felépülése után egyszer halványul ki (az elemzés fehér átmenetének folytatása)
  // Az eredmény a fehér takarás mögött TELJESEN elkészül (betűk, fotó, aura, sávok, festett háttér, néhány kirajzolt képkocka), és csak utána, egyszer bontakozik ki.
  const veil=q('#veil0');let unveiled=false;
  const frames=(n)=>new Promise(r=>{const f=()=>--n<=0?r():requestAnimationFrame(f);requestAnimationFrame(f)});
  const unveil=()=>{if(unveiled||!alive)return;unveiled=true;veil.classList.add('out');setTimeout(()=>veil.remove(),2100)};
  const prepared=Promise.all([document.fonts?document.fonts.ready:null,photoLoaded,bgLoaded]).then(async()=>{
   if(!alive)return;layoutCells();bandSetup();if(!maskCanvas)build();bgKey='';buildBg();await frames(4)});
  if(FLOW.arrivedFromAnalysis){FLOW.arrivedFromAnalysis=false;prepared.then(()=>setTimeout(unveil,150),unveil);setTimeout(unveil,8000);
   // új elemzés → az Elemzéseim közé kerül mindaz, amiből ez a képernyő később pontosan ugyanígy újraépül:
   // a kivágott portré, a faj, az égtáj, az összetétel, az üzenet és a dátum (a 4. szakaszig mintaeredmény)
   const snap={type:'aura',petId:pet.id||'',petName:name,sample:true,portrait:FLOW.portrait,species:FLOW.species||'dog',dir:FLOW.dir||null,L:L.map(l=>[...l]),
    comp:L.map(l=>({k:l[0],name:LNAME[l[0]],lab:l[1],col:l[2],w:l[3]})),msg:q('#msg').textContent,lang,date:Date.now()};
   prepared.then(()=>setTimeout(()=>{if(alive)saveWithNotice(snap,t)},1200))}
  else{veil.style.transition='opacity .45s ease';prepared.then(unveil,unveil);setTimeout(unveil,4000)}
  // gombok: vissza · megosztás · mentés (a kész auraportré képe)
  // vissza a portrékészítéshez (fotózás)
  q('#bBack').onclick=()=>A?back('my'):back('aura/kamera');
  if(A)mountDelete(q('#ardel'),A.id,{t,esc,done:()=>back('my')});
  // megosztási kártya: az aura egy pillanatra 1260 px-en rajzolódik (éles), aztán vissza a képernyő méretére
  let busy=false;
  const card=async()=>{if(busy)return null;busy=true;try{
   hiRes=1260;build();await frames(3);const big=document.createElement('canvas');big.width=big.height=1260;big.getContext('2d').drawImage(cv,0,0);hiRes=0;build();
   const pid=A?A.petId:pet.id,pp=PETS.list.find(p=>p.id===pid)||pet||{},when=new Intl.DateTimeFormat(lang,{dateStyle:'long'}).format(A?new Date(A.date):new Date());
   let sign='';if(pp.bday){try{const {birthProfile}=await import('./horoscope.js?v=0.6.57');sign=t('zs.'+birthProfile(pp).sun)+' · '}catch(e){}}
   const msg=q('#msg').textContent,ss=msg.match(/[^.!?。]+[.!?。]+/g)||[msg],quote=ss.slice(-2).join(' ').replace(/\s+/g,' ').replace(/。 /g,'。').trim();
   return await makeShareCard({lang,aura:big,name,sub:sign+when,title:t('au.card.sample'),quote,quotes:ss.map(x=>x.trim()),layers:L.map(l=>({k:l[0],col:l[2],label:LNAME[l[0]]})),brand:'Pet Aura',tagline:t('au.card.tag')});
  }finally{hiRes=0;busy=false}};
  q('#bSave').onclick=async()=>{const b=await card();if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`pet-aura-${name}.jpg`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
  q('#bShare').onclick=async()=>{const b=await card();if(!b)return;const f=new File([b],`pet-aura-${name}.jpg`,{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'Pet Aura'})}catch(e){}}else q('#bSave').click()};
  if(new URLSearchParams(location.search).has('kartyateszt'))window.__card=card; // csak teszthez
  return ()=>{alive=false;removeEventListener('resize',onR);RO.disconnect()};
 };
 return {html,mount,back:'home'};
}

// Elemzéseim → egy elmentett auraelemzés teljes eredményképernyője (#aura/naplo-<azonosító>)
export function archiveScreen(ctx,id){
 const html='<div class="au au-res"><div class="veil0"></div></div>';
 const mount=(root)=>{let stop=null,alive=true;
  getEntry(id).then((e)=>{if(!alive)return;if(!e||!e.portrait){ctx.go('my/'+id,true);return}
   const scr=resultScreen({...ctx,archive:e});root.innerHTML=scr.html;stop=scr.mount(root)});
  return ()=>{alive=false;if(stop)stop()}};
 return {html,mount,back:'my'};
}
