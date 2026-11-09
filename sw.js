// Service worker Ruang Belajar PPKI - aplikasi boleh dibuka walaupun talian lemah.
// Data (soalan, nota, markah) sentiasa dari Google Apps Script, TIDAK disimpan di sini.
// Gambar nota/soalan/logo dari Google Drive disimpan dalam cache 'ppki-img' supaya boleh dilihat luar talian.
// Laluan relatif: berfungsi di Netlify (akar) dan GitHub Pages (sub-folder).
const V='ppki-v16', IMG='ppki-img', B=self.registration.scope;
const FAIL=['./','index.html','guru.html','manifest.json','manifest-guru.json','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'].map(x=>new URL(x,B).href);
// Hanya gambar Drive (thumbnail) dan googleusercontent bergambar (lh3.. dsb). API Apps Script (script.google.com) TIDAK disimpan.
const gambar=u=>(u.hostname==='drive.google.com'&&u.pathname==='/thumbnail')||/^lh\d*\.googleusercontent\.com$/.test(u.hostname)||u.hostname==='drive.usercontent.google.com';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FAIL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
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
  // Simpanan dahulu (paparan serta-merta, juga di talian lemah), segarkan di latar belakang untuk pembukaan seterusnya.
  // Versi baharu dimuat semasa pemasangan service worker (tukar nombor V setiap kali muat naik).
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{
    const net=fetch(r.url,{cache:'no-cache'}).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res});
    if(m){net.catch(()=>{});return m}
    return net.catch(()=>caches.match(new URL('index.html',B).href));
  }));
});
