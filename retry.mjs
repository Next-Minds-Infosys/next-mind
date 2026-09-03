import { chromium } from "playwright";
const B = "f126ca4e-1997-45c4-b3b2-6bc86e77cead";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
const p = await ctx.newPage();
p.on("pageerror", e => console.log("  [pageerror]", e.message.slice(0, 90)));

let presignCount = 0, putCount = 0;
await ctx.route("**/api/uploads", async route => { presignCount++; await route.continue(); });
await ctx.route("https://*.amazonaws.com/**", async route => {
  putCount++;
  if (putCount <= 2) {           // kill the first two attempts, like a flaky link
    await route.abort("connectionfailed");
  } else {
    await route.fulfill({ status: 200, body: "" });
  }
});

await p.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await p.fill('input[type="email"]', "saral@gmail.com");
await p.fill('input[type="password"]', "TempProbe@12345");
await Promise.all([p.waitForNavigation({ waitUntil: "networkidle" }).catch(()=>{}), p.click('button[type="submit"]')]);
await p.goto(`http://localhost:3000/instructor/batches/${B}`, { waitUntil: "networkidle" });

// seed + restore a recording so there is something to upload
await p.evaluate(async () => {
  await new Promise(r => { const d = indexedDB.deleteDatabase("nm-recordings"); d.onsuccess = d.onerror = d.onblocked = r; });
  const c = document.createElement("canvas"); c.width=320; c.height=240;
  const cx = c.getContext("2d"); let f=0;
  const iv = setInterval(()=>{cx.fillStyle=`hsl(${f++*8},70%,50%)`;cx.fillRect(0,0,320,240);},50);
  const mime = ["video/webm;codecs=vp9","video/webm"].find(t=>MediaRecorder.isTypeSupported(t));
  const rec = new MediaRecorder(c.captureStream(20), { mimeType: mime });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.start(1000); await new Promise(r=>setTimeout(r,2200));
  await new Promise(r=>{rec.onstop=r;rec.stop();}); clearInterval(iv);
  const db = await new Promise((res,rej)=>{ const r=indexedDB.open("nm-recordings",1);
    r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore("sessions",{keyPath:"id"});d.createObjectStore("chunks",{keyPath:["sessionId","seq"]});};
    r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
  await new Promise((res,rej)=>{ const t=db.transaction(["sessions","chunks"],"readwrite");
    t.objectStore("sessions").put({id:"retry-test",resourceId:"f126ca4e-1997-45c4-b3b2-6bc86e77cead",scope:"lesson",mimeType:"video/webm",startedAt:Date.now()-2200,bytes:chunks.reduce((n,x)=>n+x.size,0),chunkCount:chunks.length});
    chunks.forEach((x,i)=>t.objectStore("chunks").put({sessionId:"retry-test",seq:i,data:x}));
    t.oncomplete=res; t.onerror=()=>rej(t.error); });
  db.close();
});
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(1000);
await p.click('button:has-text("Restore it")');
await p.waitForTimeout(1200);

const uploadBtn = p.locator('button', { hasText: /upload/i }).first();
await uploadBtn.click();

// watch for the retry notice while it backs off
let sawRetry = "";
for (let i = 0; i < 40; i++) {
  const t = await p.locator('text=/Retrying in/').first().textContent().catch(()=>null);
  if (t) { sawRetry = t.trim(); break; }
  await p.waitForTimeout(250);
}
console.log("  retry notice shown  :", sawRetry || "(none seen)");

await p.waitForTimeout(8000);
const stillRecoverable = await p.evaluate(async () => {
  const db = await new Promise(res => { const r = indexedDB.open("nm-recordings",1); r.onsuccess=()=>res(r.result); });
  const n = await new Promise(res => { const t=db.transaction(["sessions"],"readonly"); const q=t.objectStore("sessions").getAll(); q.onsuccess=()=>res(q.result.length); });
  db.close(); return n;
});
console.log(`  presign requests    : ${presignCount} (one per attempt - the URL expires in 15 min)`);
console.log(`  S3 PUT attempts     : ${putCount} (2 forced failures, then success)`);
console.log(`  sessions left in IDB: ${stillRecoverable} (0 = cleared only after the upload confirmed)`);
await browser.close();
