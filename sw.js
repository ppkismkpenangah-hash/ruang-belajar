// Service worker Ruang Belajar PPKI - aplikasi boleh dibuka walaupun talian lemah.
// Data (soalan, nota, markah) sentiasa dari Google Apps Script, TIDAK disimpan di sini.
// Laluan relatif: berfungsi di Netlify (akar) dan GitHub Pages (sub-folder).
const V='ppki-v1', B=self.registration.scope;
const FAIL=['./','index.html','guru.html','manifest.json','manifest-guru.json','icons/icon-192.png','icons/icon-512.png'].map(x=>new URL(x,B).href);
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FAIL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return; // API Google & gambar Drive: terus ke rangkaian
  // Rangkaian dahulu (sentiasa versi terkini); simpanan sebagai cadangan jika tiada talian
  e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match(new URL('index.html',B).href))));
});
