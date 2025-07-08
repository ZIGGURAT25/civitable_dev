if(!self.define){let e,i={};const s=(s,c)=>(s=new URL(s+".js",c).href,i[s]||new Promise(i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()}).then(()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e}));self.define=(c,r)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(i[n])return;let o={};const a=e=>s(e,n),t={module:{uri:n},exports:o,require:a};i[n]=Promise.all(c.map(e=>t[e]||a(e))).then(e=>(r(...e),o))}}define(["./workbox-915e8d08"],function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"dist/styles.css",revision:"b742a59a43f074e3adb960bf31c55049"},{url:"images/icon-192x192.png",revision:"d4e7b2a54eb8f8d847cd23a52f3bc561"},{url:"images/icon-512x512.png",revision:"f7d08537703c355dc33928aac278472d"},{url:"images/org.png",revision:"2420b3eacf681adf1b1a968e4b1c2bba"},{url:"index.html",revision:"3919caf5a581cd0f444e393580be6e00"},{url:"manifest.json",revision:"1ca0916cc8fc49433d18fe76482b11c4"},{url:"package-lock.json",revision:"7ba899f914dba5c7a1842e976b954ccf"},{url:"package.json",revision:"c2c3521c3009d6a0b4addf9c19b54696"},{url:"postcss.config.js",revision:"854b38759e7a8b4b82306ae2d9a3a833"},{url:"src/styles.css",revision:"6af718801bc05cd77f0fa9bfa601009a"},{url:"tailwind.config.js",revision:"25d1ea464d0574209b103d75c2cfc061"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]})});
self.addEventListener('error', event => {
  // Suppress all errors
  event.preventDefault();
  // Optionally, log to an external service here
});

self.addEventListener('unhandledrejection', event => {
  // Suppress all unhandled promise rejections
  event.preventDefault();
  // Optionally, log to an external service here
});
//# sourceMappingURL=sw.js.map
