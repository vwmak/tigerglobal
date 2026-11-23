const { chromium } = require('playwright');
const file = 'file://' + process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let fail = 0;
  for (const scheme of ['light','dark']) for (const w of [1340,760]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900}, colorScheme:scheme });
    const pg = await ctx.newPage(); const errs=[];
    pg.on('pageerror', e=>errs.push(e.message));
    await pg.goto(file); await pg.waitForTimeout(400);
    const r = await pg.evaluate(() => {
      const out = {};
      out.rows = document.querySelectorAll('#tbody tr').length;
      out.bars = document.querySelectorAll('.bar-row').length;
      out.marks = document.querySelectorAll('#matrix .mark').length;
      out.overflow = document.documentElement.scrollWidth - window.innerWidth;
      out.glyphs = [...document.querySelectorAll('.lg svg')].map(s=>{const r=s.getBoundingClientRect();return r.width+'x'+r.height}).filter(x=>x!=='15x15');
      out.clipped = [...document.querySelectorAll('.ni-date,.bar-name')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
      return out;
    });
    // dossiers + label collisions per selection
    const ids = await pg.evaluate(()=>[...document.querySelectorAll('#tbody tr')].map(t=>t.dataset.id));
    const bad=[], coll=new Set();
    for (const id of ids) {
      await pg.click(`#tbody tr[data-id="${id}"]`);
      const d = await pg.evaluate(()=>{
        const dos=document.getElementById('dossier');
        const ok = dos.querySelector('.mx') && dos.querySelector('.pos');
        const lab=[...document.querySelectorAll('#matrix .pt-label')].map(e=>({t:e.textContent,b:e.getBoundingClientRect()}));
        const mk=[...document.querySelectorAll('#matrix .mark')].map(e=>({t:e.getAttribute('aria-label'),b:e.getBoundingClientRect()}));
        const ov=(a,b)=>a.left<b.right-0.5&&b.left<a.right-0.5&&a.top<b.bottom-0.5&&b.top<a.bottom-0.5;
        const c=[];
        for(let i=0;i<lab.length;i++){for(let j=i+1;j<lab.length;j++) if(ov(lab[i].b,lab[j].b)) c.push(lab[i].t+'|'+lab[j].t);
          for(const m of mk) if(ov(lab[i].b,m.b)) c.push(lab[i].t+'~'+m.t.split(':')[0]);}
        return {ok:!!ok,c};
      });
      if(!d.ok) bad.push(id); d.c.forEach(x=>coll.add(x));
    }
    console.log(scheme,w,JSON.stringify(r),'errs',errs.length,errs[0]||'','badDossier',bad,'collisions',[...coll]);
    if (errs.length||bad.length||coll.size||r.overflow>0||r.glyphs.length||r.clipped.length||r.marks!==r.rows+1||r.bars!==r.rows) fail++;
    await ctx.close();
  }
  await b.close(); console.log(fail?'FAIL':'PASS');
})();
