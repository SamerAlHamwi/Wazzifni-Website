// Wazzifni CV builder: the form fills a live A4 preview (3 templates, 1 or 2 pages); the draft autosaves locally.
const LOGO="assets/wazzifni-logo.png";
const QR="assets/wazzifni-qr.png";
const $=id=>document.getElementById(id);
const KEY="wazzifni-cv-draft-v1";
const FIELDS=["name","title","phone","email","city","birth","marital","military","license","about","skills","courses","start","shift","move","fileNo"];
const blank=()=>({template:"bold",pages:1,photo:"",jobs:[{t:"",o:"",p:"",d:""}],edu:[{t:"",o:"",p:""}],levels:[{n:"",v:3}],...Object.fromEntries(FIELDS.map(k=>[k,""]))});

const TEMPLATES={bold:{photo:true},classic:{photo:false},sidebar:{photo:true}};
const LEVELS=["","مبتدئ","مقبول","جيد","جيد جداً","ممتاز"];
const SAMPLE={...blank(),levels:[{n:"Microsoft Word",v:3},{n:"Microsoft Excel",v:3},{n:"العربية",v:5},{n:"الإنجليزية",v:3}],name:"علي حسين كاظم",title:"مندوب مبيعات",phone:"07XX XXX XXXX",email:"ali.example@email.com",city:"النجف – حي الأمير",birth:"2000",marital:"أعزب",military:"لا تنطبق",license:"نعم – خصوصي",
 about:"خريج إدارة أعمال بخبرة سنتين في المبيعات المباشرة وخدمة الزبائن. حققت المستهدف الشهري بانتظام وبنيت قاعدة زبائن ثابتة. أبحث عن وظيفة مبيعات في شركة تجارية بالنجف.",
 jobs:[{t:"مندوب مبيعات",o:"شركة تجارية – النجف",p:"2024 – حتى الآن",d:"أدرتُ قائمة 60 زبوناً من المحلات\nحققتُ المستهدف الشهري 10 أشهر من 12\nنظّمتُ جداول التوزيع الأسبوعية"},{t:"موظف خدمة زبائن",o:"مول تجاري – النجف",p:"2022 – 2024",d:"استقبلتُ استفسارات الزبائن وحللتُ الشكاوى\nدرّبتُ موظفين جدد على نظام البيع"}],
 edu:[{t:"بكالوريوس إدارة أعمال",o:"جامعة الكوفة",p:"2022"}],
 skills:"البيع والإقناع\nخدمة الزبائن\nالتفاوض\nالعمل ضمن فريق",courses:"مهارات البيع الاحترافي – 2023\nبرنامج تأهيل وظّفني: المقابلات وبيئة العمل – شركة بوابة التوظيف – 2026",
 start:"فوراً",shift:"صباحي أو مسائي",move:"داخل النجف",fileNo:"WZ-0001"};
let S=blank();
try{const d=JSON.parse(localStorage.getItem(KEY)||"null");if(d)S={...blank(),...d}}catch(e){}
// The draft is inserted into the page as HTML, so only accept a real JPEG photo and numeric levels from storage
if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(S.photo))S.photo="";
S.levels=(Array.isArray(S.levels)?S.levels:[]).map(l=>({n:String(l?.n??""),v:Math.min(5,Math.max(1,Math.round(Number(l?.v))||3))}));
if(!S.levels.length)S.levels=blank().levels;
S.pages=S.pages===2?2:1;
if(!TEMPLATES[S.template])S.template="bold";
let showSample=false;
// What the preview shows: the visitor's CV, or the sample in the visitor's chosen template and page count
const view=()=>showSample?{...JSON.parse(JSON.stringify(SAMPLE)),template:S.template,pages:S.pages}:S;

const esc=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const lines=t=>String(t||"").split("\n").map(s=>s.trim()).filter(Boolean);
const filled=list=>(list||[]).filter(j=>j.t||j.o||j.d||j.p||j.n);
const kv=(k,v)=>v?`<div class="kv"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`:"";
const personal=D=>kv("سنة الميلاد",D.birth)+kv("الحالة الاجتماعية",D.marital)+kv("الخدمة العسكرية",D.military)+kv("إجازة السوق",D.license);
const readiness=D=>kv("المباشرة",D.start)+kv("الدوام المناسب",D.shift)+kv("التنقل",D.move);
const pageNo=(i,n)=>n>1?`صفحة ${i+1} من ${n}`:"";
// Wazzifni mark on every page: the logo and a small QR code (to the Wazzifni Linktree), no text
const brand=`<span class="brand-mark"><img class="bm-logo" src="${LOGO}" alt="وظّفني"><img class="bm-qr" src="${QR}" alt="رمز QR لوظّفني"></span>`;
const ul=items=>items.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"";
// A content block tagged with the form section (and field or entry) that edits it, e.g. "jobs:0" or "skills:courses"
const E=(e,h)=>({e,h});
// A titled section as page-flow blocks: the title travels with its first item so it is never left alone at a page end
const titled=(title,items)=>items.length?[{...items[0],h:title+items[0].h},...items.slice(1)]:[];
// Filled job/education entries as blocks, keeping each entry's index in the form
const entries=(list,key,fn)=>(list||[]).map((j,i)=>[j,i]).filter(([j])=>j.t||j.o||j.d||j.p).map(([j,i])=>E(`${key}:${i}`,fn(j)));
const ICON={phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  cal:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'};
const icon=k=>`<span class="i"><svg viewBox="0 0 24 24">${ICON[k]}</svg></span>`;

/* ---------- Templates: each draws a page shell (with flow columns marked data-col) and lists its content blocks ---------- */
const T={};

// عصري: brand header band with the photo, light side column, main column
T.bold={
  page:(D,i,n)=>`<article class="cv cv--bold">${i===0?`<header class="cv-head">
      <div class="cv-photo" data-edit="photo"><div class="ph${D.photo?"":" ph-empty"}">${D.photo?`<img src="${D.photo}" alt="">`:"الصورة الشخصية"}</div></div>
      <div class="cv-id"><div class="cv-name${D.name?"":" empty"}" data-edit="basic:name">${esc(D.name||"الاسم الثلاثي واللقب")}</div><div class="cv-title" data-edit="basic:title">${esc(D.title||"المسمى الوظيفي المستهدف")}</div>
      <div class="cv-contact" data-edit="basic:phone">${[D.phone,D.email,D.city].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('<span class="sep">|</span>')}</div></div>
    </header>`:`<header class="b-strip" data-edit="basic:name"><span>${esc(D.name)}</span><span>${esc(D.title)}</span></header>`}
    <div class="cv-body"><aside class="cv-side" data-col="side"></aside><main class="cv-main" data-col="main"></main></div>
    <footer class="cv-foot"><span>${pageNo(i,n)}</span>${brand}</footer></article>`,
  blocks:D=>{
    const pers=personal(D),rd=readiness(D),sk=lines(D.skills),lv=D.levels.filter(l=>l.n);
    const side=[pers&&E("personal",`<div class="sh">معلومات شخصية</div>${pers}`),
      sk.length&&E("skills:skills",`<div class="sh">المهارات</div>${sk.map(s=>`<div class="chip">${esc(s)}</div>`).join("")}`),
      lv.length&&E("levels",`<div class="sh">الحاسوب واللغات</div>${lv.map(l=>`<div class="bar"><div class="n">${esc(l.n)}</div><div class="t">${[1,2,3,4,5].map(x=>`<i class="${x<=l.v?"on":""}"></i>`).join("")}</div></div>`).join("")}`),
      rd&&E("ready",`<div class="sh">الجاهزية للعمل</div>${rd}`)].filter(Boolean);
    const item=j=>`<div class="job"><div class="h">${esc(j.t)}</div><div class="o">${esc(j.o)}<span class="p">${esc(j.p)}</span></div>${j.d!==undefined?ul(lines(j.d)):""}</div>`;
    const cr=lines(D.courses);
    const main=[...(D.about?[E("about",`<div class="mh">نبذة مهنية</div><p class="about">${esc(D.about)}</p>`)]:[]),
      ...titled(`<div class="mh">الخبرات العملية</div>`,entries(D.jobs,"jobs",item)),
      ...titled(`<div class="mh">التحصيل الدراسي</div>`,entries(D.edu,"edu",item)),
      ...(cr.length?[E("skills:courses",`<div class="mh">الدورات والشهادات</div><div class="job">${ul(cr)}</div>`)]:[]),
      `<div class="mh">المعرّفون</div><div class="ref">تُقدَّم عند الطلب.</div>`];
    return {side,main};
  }
};

// كلاسيكي: one column, centred name, titled sections over a full rule; no photo
T.classic={
  page:(D,i,n)=>`<article class="cv cv--classic">${i===0?`<header class="c-head">
      <div class="c-name${D.name?"":" empty"}" data-edit="basic:name">${esc(D.name||"الاسم الثلاثي واللقب")}</div>
      ${D.title?`<div class="c-title" data-edit="basic:title">${esc(D.title)}</div>`:""}
      <div class="c-contact" data-edit="basic:phone">${[D.city&&esc(D.city),D.email&&`<span class="c-acc" dir="ltr">${esc(D.email)}</span>`,D.phone&&`<span dir="ltr">${esc(D.phone)}</span>`].filter(Boolean).join('<span class="dot">·</span>')}</div>
    </header>`:""}
    <main class="c-main" data-col="main"></main>
    <footer class="c-foot"><span>${pageNo(i,n)}</span>${brand}</footer></article>`,
  blocks:D=>{
    const h=t=>`<div class="c-h">${t}</div>`;
    // "Label — detail" lines get the label in the accent colour, as in the template
    const row=s=>{const m=s.match(/^(.+?)\s+[—–-]\s+(.+)$/);return `<div class="c-row">${m?`<span class="c-acc">${esc(m[1])}</span> — ${esc(m[2])}`:esc(s)}</div>`};
    const item=j=>`<div class="c-item"><div class="c-line"><span><span class="c-acc">${esc(j.t)}</span>${j.o?` — ${esc(j.o)}`:""}</span><span class="c-date">${esc(j.p)}</span></div>${j.d!==undefined?ul(lines(j.d)):""}</div>`;
    const kvs=(e,t,html)=>html?[E(e,`${h(t)}<div class="c-kv">${html}</div>`)]:[];
    const sk=lines(D.skills),lv=D.levels.filter(l=>l.n),cr=lines(D.courses);
    const main=[...(D.about?[E("about",`<p class="c-about">${esc(D.about)}</p>`)]:[]),
      // Plain skill names sit in a three-column grid; "Label — detail" lines keep a row each
      ...(sk.some(x=>/\s[—–-]\s/.test(x))?titled(h("المهارات"),sk.map(x=>E("skills:skills",row(x)))):sk.length?[E("skills:skills",`${h("المهارات")}<div class="c-cols">${sk.map(x=>`<div>${esc(x)}</div>`).join("")}</div>`)]:[]),
      ...(lv.length?[E("levels",`${h("الحاسوب واللغات")}<div class="c-kv">${lv.map(l=>`<div class="c-row"><span class="c-acc">${esc(l.n)}</span> — ${LEVELS[l.v]}</div>`).join("")}</div>`)]:[]),
      ...titled(h("الخبرات العملية"),entries(D.jobs,"jobs",item)),
      ...titled(h("التحصيل الدراسي"),entries(D.edu,"edu",item)),
      ...titled(h("الدورات والشهادات"),cr.map(x=>E("skills:courses",row(x)))),
      ...kvs("personal","معلومات شخصية",personal(D)),
      ...kvs("ready","الجاهزية للعمل",readiness(D)),
      `${h("المعرّفون")}<div class="c-row">تُقدَّم عند الطلب.</div>`];
    return {main};
  }
};

// احترافي: grey side column with photo, name and contacts; main sections under grey title bars with a date column
T.sidebar={
  page:(D,i,n)=>`<article class="cv cv--sidebar"><aside class="s-side">
      ${i===0&&D.photo?`<div class="s-photo" data-edit="photo"><img src="${D.photo}" alt=""></div>`:""}
      <div class="s-name${D.name?"":" empty"}" data-edit="basic:name">${esc(D.name||"الاسم الثلاثي واللقب")}</div>
      ${D.title?`<div class="s-title" data-edit="basic:title">${esc(D.title)}</div>`:""}
      ${i===0?`<div class="s-contacts" data-edit="basic:phone">${[["cal",D.birth],["pin",D.city],["phone",D.phone],["mail",D.email]].filter(c=>c[1]).map(([k,v])=>`<div>${icon(k)}<span${k==="phone"||k==="mail"?' dir="ltr"':""}>${esc(v)}</span></div>`).join("")}</div>`:""}
      <div class="s-flow" data-col="side"></div>
      <div class="s-foot"><span>${pageNo(i,n)}</span>${brand}</div>
    </aside><main class="s-main" data-col="main"></main></article>`,
  blocks:D=>{
    const h=t=>`<div class="s-h">${t}</div>`,mh=t=>`<div class="s-mh">${t}</div>`;
    const sk=lines(D.skills),lv=D.levels.filter(l=>l.n),cr=lines(D.courses);
    const side=[D.about&&E("about",`${h("نبذة عني")}<p class="s-text">${esc(D.about)}</p>`),
      sk.length&&E("skills:skills",`${h("المهارات")}${ul(sk)}`),
      lv.length&&E("levels",`${h("الحاسوب واللغات")}${lv.map(l=>`<div class="s-bar"><div class="n">${esc(l.n)}</div><div class="t"><i style="width:${l.v*20}%"></i></div></div>`).join("")}<div class="s-scale">المقياس: 1 (مبتدئ) – 5 (ممتاز)</div>`)].filter(Boolean);
    const item=j=>`<div class="s-item"><div class="d">${esc(j.p)}</div><div><div class="h"><b>${esc(j.t)}</b><small>${esc(j.o)}</small></div>${j.d!==undefined&&lines(j.d).length?`<div class="s-desc">${ul(lines(j.d))}</div>`:""}</div></div>`;
    const kvs=(e,t,html)=>html?[E(e,`${mh(t)}<div class="s-kv">${html}</div>`)]:[];
    const main=[...titled(mh("الخبرات العملية"),entries(D.jobs,"jobs",item)),
      ...titled(mh("التحصيل الدراسي"),entries(D.edu,"edu",item)),
      ...titled(mh("الدورات والشهادات"),cr.map(c=>E("skills:courses",`<div class="s-item"><div class="d"></div><div>${esc(c)}</div></div>`))),
      // Year of birth already sits with the contacts in the side column
      ...kvs("personal","معلومات شخصية",kv("الحالة الاجتماعية",D.marital)+kv("الخدمة العسكرية",D.military)+kv("إجازة السوق",D.license)),
      ...kvs("ready","الجاهزية للعمل",readiness(D)),
      `${mh("المعرّفون")}<p class="s-text">تُقدَّم عند الطلب.</p>`];
    return {side,main};
  }
};

/* ---------- Page flow: blocks fill page 1's columns, then move on to page 2; anything left over is flagged ---------- */
function layout(D){
  const sc=$("scaler"),n=D.pages===2?2:1,tpl=T[D.template];
  if(!sc || !tpl) return;
  sc.innerHTML=Array.from({length:n},(_,i)=>tpl.page(D,i,n)).join("");
  const pages=[...sc.querySelectorAll(".cv")],B=tpl.blocks(D);
  const fits=box=>!box.clientHeight || box.scrollHeight<=box.clientHeight+1;
  let over=false;
  for(const col of ["main","side"]){
    let p=0;
    for(const b of B[col]||[]){
      const el=document.createElement("div");
      el.className="blk";
      if(typeof b==="object"){el.innerHTML=b.h;el.dataset.edit=b.e}else el.innerHTML=b;
      let box=pages[p] ? pages[p].querySelector(`[data-col="${col}"]`) : null;
      if(!box)continue;
      box.appendChild(el);
      while(!fits(box)&&p<n-1){
        p++;
        box=pages[p] ? pages[p].querySelector(`[data-col="${col}"]`) : null;
        if(!box)break;
        box.appendChild(el);
      }
      if(box && box.clientHeight && !fits(box))over=true;
    }
  }
  const emptyLast=n===2&&pages[1]&&[...pages[1].querySelectorAll("[data-col]")].every(c=>!c.children.length);
  const o=$("overflow");
  if(o){
    o.hidden=!(over||emptyLast);
    o.classList.toggle("info",!over);
    o.textContent=over?(n===1?"المحتوى أطول من صفحة واحدة. اختصر النبذة أو المهام، أو اختر «صفحتان».":"المحتوى أطول من صفحتين. اختصر النبذة أو المهام حتى لا يُقص شيء.")
      :"المحتوى يتسع لصفحة واحدة، لذا الصفحة الثانية فارغة. يمكنك اختيار «صفحة واحدة».";
  }
}

// Clicking a part of the preview opens its form section and puts the cursor in the matching field
function goEdit(key){
  const [sec,arg]=key.split(":"),d=document.querySelector(`details[data-sec="${sec}"]`);
  if(!d)return;
  if(showSample){showSample=false;renderCV()}
  setMode("edit");
  d.open=true;
  const f=arg===undefined?d.querySelector("input:not([type=range]),textarea")
    :sec==="jobs"||sec==="edu"?d.querySelector(`[data-l="${sec}"][data-i="${arg}"]`):$(arg);
  d.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  if(f)f.focus({preventScroll:true});
  d.classList.remove("flash");void d.offsetWidth;d.classList.add("flash");
}

// Phones show the form or the preview, switched from the bottom bar
const phone=matchMedia("(max-width:900px)");
function setMode(m){
  document.body.dataset.mode=m;
  document.querySelectorAll("[data-mode]").forEach(b=>{if(b.tagName==="BUTTON")b.setAttribute("aria-pressed",b.dataset.mode===m)});
  renderCV();
  if(m==="preview"&&phone.matches)scrollTo(0,0);
}

function fit(){
  const vp=$("viewport"),sc=$("scaler");
  if(!vp || !sc) return;
  const k=Math.min(1,vp.clientWidth/794);
  sc.style.transform=`scale(${k})`;
  if(sc.offsetHeight > 0){
    vp.style.height=(sc.offsetHeight*k)+"px";
  }
}

/* ---------- Form ---------- */
function fillForm(){FIELDS.forEach(k=>{if($(k))$(k).value=S[k]||""});renderLists()}
function renderLists(){
  if($("jobs"))$("jobs").innerHTML=S.jobs.map((j,i)=>`<div class="item"><div class="grid2"><label>المسمى الوظيفي<input data-l="jobs" data-i="${i}" data-k="t" value="${esc(j.t)}"></label><label>الفترة<input data-l="jobs" data-i="${i}" data-k="p" value="${esc(j.p)}" placeholder="2024 – حتى الآن"></label></div><label>الجهة والمدينة<input data-l="jobs" data-i="${i}" data-k="o" value="${esc(j.o)}"></label><label>المهام والإنجازات (كل واحدة بسطر، ابدأ بفعل)<textarea data-l="jobs" data-i="${i}" data-k="d" rows="3">${esc(j.d)}</textarea></label><button class="rm" type="button" data-rm="jobs" data-i="${i}">حذف الخبرة</button></div>`).join("");
  if($("edu"))$("edu").innerHTML=S.edu.map((j,i)=>`<div class="item"><label>الشهادة والاختصاص<input data-l="edu" data-i="${i}" data-k="t" value="${esc(j.t)}"></label><div class="grid2"><label>الجامعة / المعهد<input data-l="edu" data-i="${i}" data-k="o" value="${esc(j.o)}"></label><label>سنة التخرج والمعدل<input data-l="edu" data-i="${i}" data-k="p" value="${esc(j.p)}"></label></div><button class="rm" type="button" data-rm="edu" data-i="${i}">حذف</button></div>`).join("");
  if($("levels"))$("levels").innerHTML=S.levels.map((j,i)=>`<div class="lvl"><input aria-label="البرنامج أو اللغة" placeholder="مثال: Microsoft Word أو الإنجليزية" data-l="levels" data-i="${i}" data-k="n" value="${esc(j.n)}"><input type="range" min="1" max="5" aria-label="المستوى" data-l="levels" data-i="${i}" data-k="v" value="${j.v}"><output>${j.v}</output></div>`).join("");
}

// Section progress and UI synchronization
const DONE={basic:D=>D.name||D.title||D.phone||D.email||D.city,photo:D=>D.photo,personal:D=>D.birth||D.marital||D.military||D.license,
  about:D=>D.about,jobs:D=>filled(D.jobs).length,edu:D=>filled(D.edu).length,skills:D=>D.skills||D.courses,
  levels:D=>D.levels.some(l=>l.n),ready:D=>D.start||D.shift||D.move||D.fileNo};

function syncUI(){
  document.querySelectorAll("[data-tpl]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tpl===S.template)));
  document.querySelectorAll("[data-pages]").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.pages===(S.pages===2?2:1))));
  if($("photoThumb"))$("photoThumb").innerHTML=S.photo?`<img src="${S.photo}" alt="الصورة الشخصية">`:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  if($("photoRm"))$("photoRm").hidden=!S.photo;
  let done=0,total=0;
  document.querySelectorAll("details[data-sec]").forEach(d=>{
    const na=d.dataset.sec==="photo"&&!TEMPLATES[S.template].photo,ok=!na&&!!DONE[d.dataset.sec](S);
    d.classList.toggle("is-na",na);d.classList.toggle("is-done",ok);
    if(!na){total++;if(ok)done++}});
  if($("progText"))$("progText").textContent=`${done} من ${total} أقسام`;
  if($("progBar"))$("progBar").style.width=`${total?done/total*100:0}%`;
  if($("btnSample"))$("btnSample").textContent=showSample?"إخفاء المثال":"عرض مثال";
  if($("btnSample"))$("btnSample").setAttribute("aria-pressed",String(showSample));
  if($("sampleNote"))$("sampleNote").hidden=!showSample;
}

function renderCV(){layout(view());fit();syncUI()}
let tm;function save(){clearTimeout(tm);tm=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S));if($("saved"))$("saved").textContent="حُفظت المسودة على هذا الجهاز"}catch(e){if($("saved"))$("saved").textContent=""}},400)}

document.addEventListener("input",e=>{const t=e.target;
  if(FIELDS.includes(t.id)){S[t.id]=t.value}
  else if(t.dataset.l){const v=t.dataset.k==="v"?+t.value:t.value;S[t.dataset.l][+t.dataset.i][t.dataset.k]=v;if(t.type==="range"&&t.nextElementSibling)t.nextElementSibling.textContent=v}
  else return;showSample=false;renderCV();save()});

document.addEventListener("click",e=>{
  const tpl=e.target.closest("[data-tpl]"),pg=e.target.closest("[data-pages]");
  const btnAdd=e.target.closest("[data-add]"),btnRm=e.target.closest("[data-rm]");
  if(tpl){S.template=tpl.dataset.tpl;renderCV();save()}
  if(pg){S.pages=+pg.dataset.pages;renderCV();save()}
  if(btnAdd){
    const a=btnAdd.dataset.add;
    showSample=false;
    S[a].push(a==="levels"?{n:"",v:3}:a==="jobs"?{t:"",o:"",p:"",d:""}:{t:"",o:"",p:""});
    renderLists();renderCV();save();
  }
  if(btnRm){
    const r=btnRm.dataset.rm;
    showSample=false;
    S[r].splice(+btnRm.dataset.i,1);
    renderLists();renderCV();save();
  }
});

if($("photo"))$("photo").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),W=360,H=410,k=Math.max(W/im.width,H/im.height);c.width=W;c.height=H;const x=c.getContext("2d");x.drawImage(im,(W-im.width*k)/2,(H-im.height*k)/2,im.width*k,im.height*k);S.photo=c.toDataURL("image/jpeg",.88);showSample=false;renderCV();save()};im.onerror=()=>{};im.src=rd.result};rd.readAsDataURL(f)});
if($("photoRm"))$("photoRm").onclick=()=>{S.photo="";if($("photo"))$("photo").value="";renderCV();save()};
if($("btnSample"))$("btnSample").onclick=()=>{showSample=!showSample;renderCV()};

// Clear: asks first in a dialog; keeps the chosen template and page count
const dlg=$("confirmClear");
if($("btnClear")&&dlg)$("btnClear").onclick=()=>dlg.showModal();
if(dlg){
  dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close("cancel")});
  dlg.addEventListener("close",()=>{if(dlg.returnValue!=="clear")return;
    S={...blank(),template:S.template,pages:S.pages};showSample=false;fillForm();if($("photo"))$("photo").value="";renderCV();save();
    if($("status"))$("status").textContent="تم مسح كل البيانات."});
}

// Download PDF: draws each CV page with html2canvas and saves them as one A4 PDF (jsPDF), no print dialog.
// The same PDF goes to the Wazzifni server in the background (cv-upload.js), where admins can see it.
// The libraries load on the first click; if they can't load, it falls back to the browser's print dialog.
const PDF_LIBS=["https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js","https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"];
const loadScript=src=>new Promise((ok,fail)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
let pdfLibs;const loadPdfLibs=()=>pdfLibs||(pdfLibs=Promise.all(PDF_LIBS.map(loadScript)).catch(e=>{pdfLibs=null;throw e}));
async function buildPdf(){
  await loadPdfLibs();
  const pdf=new jspdf.jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
  const pages=[...$("scaler").querySelectorAll(".cv")];
  for(let i=0;i<pages.length;i++){
    // Draw the page at full A4 size: in the copy, drop the preview scaling
    const canvas=await html2canvas(pages[i],{scale:2,useCORS:true,backgroundColor:"#fff",logging:false,
      onclone:doc=>{doc.body.dataset.mode="preview";doc.getElementById("scaler").style.transform="none";
        doc.querySelectorAll(".ph-empty").forEach(e=>e.style.visibility="hidden")}});
    if(i)pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg",.92),"JPEG",0,0,210,297);
  }
  return pdf;
}
let busy=false;
if($("btnPdf"))$("btnPdf").onclick=async ()=>{
  if(busy)return;busy=true;$("btnPdf").disabled=true;
  showSample=false;
  const prevMode=document.body.dataset.mode;
  document.body.dataset.mode="preview"; // the page flow needs the preview on screen to measure it (phones)
  renderCV();
  const title="السيرة الذاتية - "+(S.name||"مرشح").trim();
  if($("status"))$("status").textContent="جارٍ تجهيز ملف PDF…";
  try{
    const pdf=await buildPdf();
    pdf.save(title.replace(/[\\/:*?"<>|]/g,"")+".pdf");
    if($("status"))$("status").textContent="تم تنزيل ملف PDF.";
    if(window.WZ_CV_UPLOAD)WZ_CV_UPLOAD.submit(S,pdf.output("datauristring"));
  }catch(e){
    console.warn("Wazzifni CV: PDF download failed, opening print instead",e);
    if(window.WZ_CV_UPLOAD)WZ_CV_UPLOAD.submit(S,null);
    const t=document.title;document.title=title;
    if($("status"))$("status").textContent="اختر «حفظ بتنسيق PDF» من نافذة الطباعة.";
    window.print();setTimeout(()=>{document.title=t},1000);
  }finally{
    busy=false;$("btnPdf").disabled=false;
    if(prevMode&&prevMode!=="preview")setMode(prevMode);
  }
};

if($("scaler"))$("scaler").addEventListener("click",e=>{const t=e.target.closest("[data-edit]");if(t)goEdit(t.dataset.edit)});

// Initialize page mode and state after all declarations
document.querySelectorAll("button[data-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
setMode("edit");
fillForm();
renderCV();
addEventListener("resize",fit);
if(window.ResizeObserver && $("viewport"))new ResizeObserver(fit).observe($("viewport"));
if(document.fonts)document.fonts.ready.then(renderCV);
