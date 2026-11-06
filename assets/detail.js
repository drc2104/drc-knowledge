/* DRC 지식창고 상세 화면 — item-data(JSON) 하나로 화면 전체를 그린다 (2026-11-06) */
(function(){
const D=JSON.parse(document.getElementById("item-data").textContent);
const $=id=>document.getElementById(id);
const S=D.sections||[];
const LBL=D.sectionLabel||"발표";
const CATS=[
 {id:"over",name:"한눈에",sub:"결론·큰 숫자"},
 ...(D.glossary&&D.glossary.length?[{id:"terms",name:"용어 풀이",sub:`어려운 말 ${D.glossary.length}개 · 영상`}]:[]),
 {id:"sec",name:`${LBL} ${S.length}개`,sub:"하나씩 상세"},
 ...(D.flow&&D.flow.length?[{id:"flow",name:"공통 흐름",sub:"겹치는 메시지"}]:[]),
 {id:"apply",name:"우리 회사 적용",sub:`쓸 것 ${(D.apply||[]).length}가지`},
 {id:"media",name:"영상·자료",sub:"다시보기·원문"},
 {id:"src",name:"출처",sub:"기사·공식 자료"}
];
const key="kb_"+D.id;
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let cur=ls.get(key,{c:"over",t:0});
if(!CATS.find(c=>c.id===cur.c)||cur.t>=S.length)cur={c:"over",t:0};
const esc=s=>String(s==null?"":s);
const circ=n=>n<=20?"①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"[n-1]:`(${n})`;
const ytId=u=>{const m=String(u||"").match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);return m?m[1]:null};

function kin(text,hl){let i=0;return esc(text).split(" ").map(w=>{const h=hl&&hl.some(x=>x&&w.includes(x));return `<span class="w${h?" hl":""}" style="animation-delay:${(i++)*55}ms">${w}</span>`}).join(" ")}
function numsHTML(a){if(!a||!a.length)return"";return `<div class="nums">${a.map(([v,u,l,hot],i)=>`<div class="num${hot?" hot":""}" style="animation:rise .5s ${i*90}ms both"><b data-count="${v}">${v}<i>${u||""}</i></b><span>${l}</span></div>`).join("")}</div>`}
function barsHTML(b){if(!b||!b.rows||!b.rows.length)return"";const mx=Math.max(...b.rows.map(r=>+r[1]||0))||1;
 return `<div class="chart"><div class="t">${b.t||""}</div><div class="bars">${b.rows.map((r,i)=>`<span class="l">${r[0]}</span><span class="track"><span class="fill ${r[2]||""}" style="width:${Math.max(.8,(+r[1]||0)/mx*100)}%;animation-delay:${200+i*150}ms"></span></span><span class="v">${(+r[1]).toLocaleString("ko-KR")}${b.u||""}</span>`).join("")}</div></div>`}
function shiftHTML(s){if(!s)return"";return `<div class="shift"><span class="from">${s.from}</span><span class="arrow"></span><span class="to">${s.to}</span><small>${s.cap||""}</small></div>`}
function tableHTML(t){if(!t||t.length<2)return"";return `<div class="tbl"><table><tr>${t[0].map(h=>`<th>${h}</th>`).join("")}</tr>${t.slice(1).map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`}
function vidHTML(v){const id=ytId(v.url);if(!id)return `<p><a href="${v.url}" target="_blank" rel="noopener">${v.title||"영상 열기"}</a></p>`;
 const tm=String(v.url).match(/[?&]t=(\d+)/);
 return `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${id}${tm?"?start="+tm[1]:""}" title="${esc(v.title)}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`}
function thumb(v){const id=ytId(v.url);if(!id)return `<a href="${v.url}" target="_blank" rel="noopener">${esc(v.title)}</a>`;
 return `<button class="vthumb" data-yt="${id}" title="${esc(v.title)}"><img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy"><span class="play"></span><span class="vt">${esc(v.title)}${v.len?` · ${v.len}`:""}</span></button>`}
function viewTerms(){
 const G=D.glossary||[];
 return `<span class="tag">처음 보는 말은 여기서 먼저</span><h2 class="kin">${kin(D.glossaryHeadline||"어려운 말을 쉬운 말로 바꿨습니다",["쉬운","말로"])}</h2>
 <div class="terms">${G.map((g,i)=>`<div class="term" style="animation-delay:${i*50}ms"><div class="tw"><b>${g.term}</b><p>${g.easy}</p>${g.why?`<p class="why">우리 일과의 관계: ${g.why}</p>`:""}</div>${g.video?thumb(g.video):"<span></span>"}</div>`).join("")}</div>
 <p class="src">영상은 눌러서 이 화면에서 바로 봅니다. 출처: 각 영상 채널.</p>`}
function countUp(root){if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
 root.querySelectorAll("[data-count]").forEach(el=>{const raw=el.dataset.count;const m=raw.match(/^([\d,.]+)(.*)$/);if(!m)return;
  const target=parseFloat(m[1].replace(/,/g,""));if(!isFinite(target))return;const dec=(m[1].split(".")[1]||"").length;const tail=m[2];const ie=el.querySelector("i");const unit=ie?ie.outerHTML:"";
  const t0=performance.now(),dur=1100;const step=now=>{const p=Math.min(1,(now-t0)/dur);const e=1-Math.pow(1-p,3);
   el.innerHTML=Number((target*e).toFixed(dec)).toLocaleString("ko-KR",{minimumFractionDigits:dec,maximumFractionDigits:dec})+tail+unit;
   if(p<1)requestAnimationFrame(step);else el.innerHTML=raw+unit};requestAnimationFrame(step)})}

function viewOver(){
 const ev=D.event||{};
 return `<span class="tag">${[ev.when,D.type,`${LBL} ${S.length}개`].filter(Boolean).join(" · ")}</span>
 <h2 class="kin">${kin(D.headline,D.hl)}</h2>
 <div class="cols"><div>
  <h3>결론 3줄</h3>
  <ul class="pts stagger">${(D.summary3||[]).map((s,i)=>`<li style="animation-delay:${.2+i*.15}s"><b>${s[0]}</b> ${s[1]||""}</li>`).join("")}</ul>
  ${D.cases?`<h3>가장 쓸 만한 사례</h3>${tableHTML(D.cases)}`:""}
 </div><div>${shiftHTML(D.shift)}${barsHTML(D.chart)}${numsHTML(D.keynums)}</div></div>
 ${D.overviewNote?`<p class="src">${D.overviewNote}</p>`:""}`}
function viewSec(){
 const i=Math.min(cur.t,S.length-1),t=S[i];
 const list=S.map((x,j)=>`<button data-t="${j}" aria-current="${j===i}"><span class="tm">${x.tm||circ(j+1)}</span><span class="nm">${circ(j+1)} ${x.name}</span><span class="co">${x.co||""}</span></button>`).join("");
 return `<div class="talks"><div class="tlist" id="tlist">${list}</div><div class="tdetail" id="tdetail">
  <span class="tag">${t.tm?t.tm+" · ":""}${LBL} ${i+1}/${S.length}</span>
  <p class="who"><b>${t.name}</b>${t.co?" · "+t.co:""}</p>
  ${t.title?`<h3 style="font-size:18px;color:var(--muted);font-weight:700">${t.title}</h3>`:""}
  ${t.q?`<h2 class="kin">${kin(t.q,t.hl)}</h2>`:""}
  <div class="cols"><div><h3>핵심 내용</h3><ul class="pts stagger">${(t.pts||[]).map((p,j)=>`<li style="animation-delay:${.15+j*.08}s">${p}</li>`).join("")}</ul></div>
  <div>${t.video?vidHTML(t.video):""}${(t.slides||[]).map(s=>`<figure class="slide"><a href="${s.src}" target="_blank" rel="noopener"><img src="${s.src}" alt="${esc(s.cap)}" loading="lazy"></a><figcaption>${s.cap}</figcaption></figure>`).join("")}${shiftHTML(t.shift)}${numsHTML(t.nums)}${barsHTML(t.bars)}${tableHTML(t.table)}</div></div>
  <p class="src">출처: ${t.src||""}${t.grade?`<span class="grade ${t.grade==="확인"?"ok":"as"}">${t.grade==="확인"?"원문 확인":"추정 포함"}</span>`:""}</p>
  <div class="navrow">${i>0?`<button class="btn" data-t="${i-1}">이전: ${S[i-1].name}</button>`:""}${i<S.length-1?`<button class="btn p" data-t="${i+1}">다음: ${S[i+1].name}</button>`:`<button class="btn p" data-cat="${D.flow&&D.flow.length?"flow":"apply"}">다음 묶음으로</button>`}</div>
 </div></div>`}
function viewFlow(){
 const head=S.map((x,j)=>`<th title="${x.name}">${circ(j+1)}</th>`).join("");
 const rows=D.flow.map((f,r)=>`<tr><td><b>${f.k}</b><br><span style="font-size:14px;color:var(--muted)">${f.d||""}</span></td>${S.map((x,j)=>`<td style="text-align:center">${(f.who||[]).includes(j+1)?`<span class="dot${f.who[0]===j+1?" h":""}" style="animation-delay:${r*80+j*25}ms"></span>`:""}</td>`).join("")}<td class="n">${(f.who||[]).length}</td></tr>`).join("");
 return `<span class="tag">${LBL} ${S.length}개를 겹쳐 본 결과</span><h2 class="kin">${kin(D.flowHeadline||"따로 말했지만 같은 방향을 가리켰다",["같은","방향을"])}</h2>
 <div class="tbl"><table><tr><th>흐름</th>${head}<th>${LBL} 수</th></tr>${rows}</table></div>
 <p class="src">주황 점은 그 흐름을 가장 직접 말한 ${LBL}입니다. 번호는 '${LBL} ${S.length}개' 묶음 순서와 같습니다.</p>`}
function viewApply(){
 const A=D.apply||[];
 return `<span class="tag">디알컴퍼니에 옮겨 쓸 것 · 클로드 제안</span><h2 class="kin">${kin(`우리 회사에 쓸 ${A.length}가지`,[`${A.length}가지`])}</h2>
 <p class="lead">우선 = 이번 달 계획에 넣을 것 / 검토 = 숫자 확인 후 결정 / 유지 = 이미 하는 방향이 맞다는 확인. 내용 요약은 원문 기준, 회사 적용은 클로드의 제안입니다.</p>
 ${A.map((a,i)=>`<div class="apply" style="animation-delay:${i*70}ms"><span class="k">${i+1}</span><div><h4>${a.k}<span class="pri">${a.p||""}</span></h4><p>${a.d}</p><span class="meta">근거: ${a.r||""}${a.who?" · 맡을 곳: "+a.who:""}</span></div></div>`).join("")}`}
function viewMedia(){
 const M=D.media||{};const V=M.videos||[];
 const vids=V.length?`<h3>영상 ${V.length}편</h3>${vidHTML(V[0])}<div class="vgrid">${V.map(v=>`<div>${thumb(v)}<p class="vn">${v.note||""}</p></div>`).join("")}</div>`:"";
 return `<span class="tag">${D.date} 확인</span><h2 class="kin">${kin(M.headline||(V.length?`영상 ${V.length}편을 함께 볼 수 있습니다`:"공개된 영상이 없습니다"),[])}</h2>
 <div class="cols"><div>${vids}${M.checked&&M.checked.length?`<h3>찾아본 곳</h3>${tableHTML([["확인한 곳","결과"],...M.checked])}`:""}</div>
 <div><h3>원문·자료</h3>${tableHTML([["자료","열기"],...(M.docs||[]).map(d=>[d[0],`<a href="${d[1]}" target="_blank" rel="noopener">열기</a>`])])}</div></div>`}
function viewSrc(){
 return `<span class="tag">모든 링크는 새 창으로 열립니다</span><h2>출처</h2>
 ${tableHTML([["내용","주소"],...(D.sources||[]).map(s=>[s[0],`<a href="${s[1]}" target="_blank" rel="noopener">${s[1].replace(/^https?:\/\//,"").slice(0,52)}${s[1].length>60?"…":""}</a>`])])}
 ${D.numberNotes&&D.numberNotes.length?tableHTML([["숫자가 출처마다 다른 곳","정리"],...D.numberNotes]):""}
 <p class="src">${D.madeBy||""}</p>`}

function render(){
 $("cats").innerHTML=CATS.map(c=>`<button data-c="${c.id}" aria-current="${c.id===cur.c}">${c.name}<small>${c.sub}</small></button>`).join("");
 const st=$("stage");st.style.padding=cur.c==="sec"?"0":"";
 st.innerHTML={over:viewOver,terms:viewTerms,sec:viewSec,flow:viewFlow,apply:viewApply,media:viewMedia,src:viewSrc}[cur.c]();
 st.scrollTop=0;const d=$("tdetail");if(d)d.scrollTop=0;
 const a=document.querySelector('#tlist [aria-current="true"]');if(a)a.scrollIntoView({block:"nearest",inline:"nearest"});
 countUp(st);ls.set(key,cur);
}
const ev=D.event||{};
$("h1").innerHTML=esc(D.title).replace(/(\d+)/,"<em>$1</em>");
$("evline").textContent=[ev.host&&ev.host+" 주최",ev.when,ev.where,ev.theme&&`주제 "${ev.theme}"`].filter(Boolean).join(" · ");
$("stamp").textContent=`${D.topic} · ${D.date} 정리 · 디알컴퍼니`;
document.title=D.title+" · DRC 지식창고";
$("cats").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cur={c:b.dataset.c,t:cur.t||0};render()});
$("stage").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.yt){const f=document.createElement("div");f.className="vid";f.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;b.replaceWith(f);return}
 if(b.dataset.t!=null){cur={c:"sec",t:+b.dataset.t};render()}else if(b.dataset.cat){cur={c:b.dataset.cat,t:cur.t};render()}});
render();
})();
