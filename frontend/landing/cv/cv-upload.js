// Sends a copy of the CV and rendered PDF to the Wazzifni backend DB when printed/saved.
(function(){
  const ENDPOINT="/api/cv/submit";
  const ENABLED=true;
  const SCHEMA_VERSION=1;
  const TIMEOUT_MS=30000;

  const CLIENT_KEY="wazzifni-cv-client-id";  // stable random id, so the server can update one CV per device
  const PENDING_KEY="wazzifni-cv-pending";   // the latest copy that hasn't reached the server yet
  const SENT_KEY="wazzifni-cv-sent-hash";    // fingerprint of the last copy the server accepted

  const store={
    get(k){try{return localStorage.getItem(k)}catch(e){return null}},
    set(k,v){try{localStorage.setItem(k,v)}catch(e){}},
    del(k){try{localStorage.removeItem(k)}catch(e){}}
  };

  function clientId(){
    let id=store.get(CLIENT_KEY);
    if(!id){
      id=(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
      store.set(CLIENT_KEY,id);
    }
    return id;
  }

  // Small non-cryptographic fingerprint, only to skip re-sending an unchanged CV
  function hash(str){let h=5381;for(let i=0;i<str.length;i++)h=(h*33^str.charCodeAt(i))>>>0;return h.toString(36)}

  // The CV as the builder holds it, plus the rendered PDF base64 string
  function payload(S, pdfData){
    const {template,pages,photo,jobs,edu,levels,...fields}=S;
    const rows=(list,keys)=>(list||[]).filter(r=>keys.some(k=>String(r[k]||"").trim()));
    return {
      schemaVersion:SCHEMA_VERSION,
      clientId:clientId(),
      submittedAt:new Date().toISOString(),
      language:window.WZ_LANG==="en"?"en":"ar",
      template,
      pages,
      cv:{...fields,jobs:rows(jobs,["t","o","p","d"]),edu:rows(edu,["t","o","p"]),levels:rows(levels,["n"])},
      photo:photo||null,
      pdfData:pdfData||null
    };
  }

  function hasContent(S){
    return ["name","phone","email","title"].some(k=>String(S[k]||"").trim());
  }

  async function post(body){
    const ctrl=window.AbortController?new AbortController():null;
    const timer=ctrl&&setTimeout(()=>ctrl.abort(),TIMEOUT_MS);
    try{
      const res=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body,signal:ctrl&&ctrl.signal});
      return res.ok;
    }catch(e){
      return false;
    }finally{
      if(timer)clearTimeout(timer);
    }
  }

  // Sends the waiting copy, if any. Resolves true when the server has the latest CV.
  async function flush(){
    const body=store.get(PENDING_KEY);
    if(!body)return true;
    const fp=hash(body.replace(/"submittedAt":"[^"]*",/,""));
    if(fp===store.get(SENT_KEY)){store.del(PENDING_KEY);return true}
    const ok=await post(body);
    if(ok){store.set(SENT_KEY,fp);store.del(PENDING_KEY)}
    else console.info("Wazzifni CV: the server didn't accept the CV yet; it will be retried on the next visit or print.");
    return ok;
  }

  function submit(S, pdfData){
    if(!ENABLED||!hasContent(S))return Promise.resolve(false);
    store.set(PENDING_KEY,JSON.stringify(payload(S, pdfData)));
    return flush();
  }

  window.WZ_CV_UPLOAD={submit,flush};
  if(ENABLED)setTimeout(flush,3000);
})();
