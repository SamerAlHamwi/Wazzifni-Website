// Sends a copy of the CV and rendered PDF to the Wazzifni backend DB when printed/saved.
(function(){
  const ENDPOINT="/api/cv/submit";
  const ENABLED=true;
  const SCHEMA_VERSION=1;
  const TIMEOUT_MS=45000;

  const CLIENT_KEY="wazzifni-cv-client-id";  // stable random id, so the server can update one CV per device
  const PENDING_KEY="wazzifni-cv-pending";   // the latest copy that hasn't reached the server yet
  const SENT_KEY="wazzifni-cv-sent-hash";    // fingerprint of the last copy the server accepted

  const store={
    get(k){try{return localStorage.getItem(k)}catch(e){return null}},
    set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},
    del(k){try{localStorage.removeItem(k)}catch(e){}}
  };

  function clientId(){
    let id=store.get(CLIENT_KEY);
    if(!id || typeof id !== "string" || !/^[A-Za-z0-9-]{1,64}$/.test(id)){
      let rawId = (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
      id = String(rawId).replace(/[^A-Za-z0-9-]/g, "").slice(0, 64);
      if(!id) id = "client-" + Date.now().toString(36);
      store.set(CLIENT_KEY, id);
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
      const opts = {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
        signal: ctrl && ctrl.signal
      };
      // keepalive is allowed by Fetch API spec only if request body < 64KB
      if (body && body.length < 60000) {
        opts.keepalive = true;
      }
      const res = await fetch(ENDPOINT, opts);
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

    let ok=await post(body);
    // If flush failed and body contains large pdfData, try light fallback without PDF binary
    if(!ok && body.includes('"pdfData":')){
      try {
        const parsed = JSON.parse(body);
        parsed.pdfData = null;
        ok = await post(JSON.stringify(parsed));
      } catch(e) {}
    }

    if(ok){
      store.set(SENT_KEY, fp);
      store.del(PENDING_KEY);
    } else {
      console.info("Wazzifni CV: pending upload retry postponed.");
    }
    return ok;
  }

  // Direct send first (doesn't fail if localStorage quota is exceeded by large base64 PDF)
  async function submit(S, pdfData){
    if(!ENABLED||!hasContent(S))return false;

    const data = payload(S, pdfData);
    const bodyStr = JSON.stringify(data);
    const fp = hash(bodyStr.replace(/"submittedAt":"[^"]*",/,""));

    if(fp === store.get(SENT_KEY)){
      store.del(PENDING_KEY);
      return true;
    }

    // Try posting full CV + PDF directly
    let ok = await post(bodyStr);

    // If direct upload failed and pdfData was present, fallback to uploading CV without PDF binary
    if(!ok && pdfData){
      console.warn("Wazzifni CV: Full upload failed, attempting fallback submission without PDF binary...");
      const fallbackData = payload(S, null);
      const fallbackBodyStr = JSON.stringify(fallbackData);
      ok = await post(fallbackBodyStr);
    }

    if(ok){
      store.set(SENT_KEY, fp);
      store.del(PENDING_KEY);
      return true;
    }

    // If upload failed (e.g. offline), try queuing in localStorage for later flush
    if (!store.set(PENDING_KEY, bodyStr)) {
      // If full body exceeds localStorage quota (common on iOS Safari), store light payload for retry
      const lightData = payload(S, null);
      store.set(PENDING_KEY, JSON.stringify(lightData));
    }

    console.info("Wazzifni CV: Server didn't accept the CV yet; queued for retry.");
    return false;
  }

  window.WZ_CV_UPLOAD={submit,flush};
  if(ENABLED)setTimeout(flush,3000);
})();

