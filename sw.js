// Service worker Ruang Belajar PPKI - aplikasi boleh dibuka walaupun talian lemah.
// Data (soalan, nota, markah) sentiasa dari Google Apps Script, TIDAK disimpan di sini.
// Gambar nota/soalan/logo dari Google Drive disimpan dalam cache 'ppki-img' supaya boleh dilihat luar talian.
// Laluan relatif: berfungsi di Netlify (akar) dan GitHub Pages (sub-folder).
const V='ppki-v9', IMG='ppki-img', B=self.registration.scope;
const FAIL=['./','index.html','guru.html','manifest.json','manifest-guru.json','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'].map(x=>new URL(x,B).href);
// Hanya gambar Drive (thumbnail) dan googleusercontent bergambar (lh3.. dsb). API Apps Script (script.google.com) TIDAK disimpan.
const gambar=u=>(u.hostname==='drive.google.com'&&u.pathname==='/thumbnail')||/^lh\d*\.googleusercontent\.com$/.test(u.hostname)||u.hostname==='drive.usercontent.google.com';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FAIL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==IMG).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(u.origin!==location.origin){
    if(!gambar(u))return; // API Google dan lain-lain: terus ke rangkaian
    // Gambar: rangkaian dahulu, simpan salinan; jika tiada talian guna salinan yang disimpan
    e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(IMG).then(x=>x.put(r,c)).catch(()=>{})}return res}).catch(()=>caches.match(r,{cacheName:IMG}).then(m=>m||Response.error())));
    return;
  }
  // Rangkaian dahulu (sentiasa versi terkini); simpanan sebagai cadangan jika tiada talian
  e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match(new URL('index.html',B).href))));
});
