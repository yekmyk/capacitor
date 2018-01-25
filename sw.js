importScripts('workbox-sw.prod.v2.1.2.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "assets/img/checkbox.png",
    "revision": "ae3b4b201fb303732670371d573dd3e8"
  },
  {
    "url": "assets/img/docs/project-structure.png",
    "revision": "f27c862862e8f36772a6700dd06c697c"
  },
  {
    "url": "assets/img/favicon.ico",
    "revision": "79825038f1642fd3849aed4a6deb1c9d"
  },
  {
    "url": "assets/img/favicon.png",
    "revision": "79825038f1642fd3849aed4a6deb1c9d"
  },
  {
    "url": "assets/img/ionic-os-dark-logo.png",
    "revision": "a6c971b8f10881a96050c511c35984e3"
  },
  {
    "url": "assets/img/ionic-os-logo.png",
    "revision": "d1d25937ddf7e6e453f5a623d0b25b89"
  },
  {
    "url": "assets/img/logo-dark.png",
    "revision": "a52acd621b2471bd4f5567ddb4570c32"
  },
  {
    "url": "assets/img/logo-light.png",
    "revision": "f47714952da31e778de109a52fc49e28"
  },
  {
    "url": "assets/img/right-img.png",
    "revision": "5841d9860a1facd71f0e01fe283142f0"
  },
  {
    "url": "assets/img/video-icon.png",
    "revision": "6f27af15cab04aafd7193b76825c2eac"
  },
  {
    "url": "build/app.js",
    "revision": "707104120a6379521fb03f582b2e11b5"
  },
  {
    "url": "build/app/4aobwvoq.js",
    "revision": "ae87c55b6892652e607e2e3f282187d0"
  },
  {
    "url": "build/app/8cpqid3a.js",
    "revision": "c4c41692ff44fb9d6ed6bbbf008f3160"
  },
  {
    "url": "build/app/9vp1kpca.js",
    "revision": "ec63c784fbc2f0b40f0bcdb8ce78ee07"
  },
  {
    "url": "build/app/app.global.js",
    "revision": "3a5c841401a41c898207dc7d241ac038"
  },
  {
    "url": "build/app/app.gzgsz0co.js",
    "revision": "177700d815356e1394adb2ecc5151597"
  },
  {
    "url": "build/app/app.m3eyznes.js",
    "revision": "f80437a8f51181860b330e2f59bbd7ad"
  },
  {
    "url": "build/app/app.qnefnhxv.js",
    "revision": "0a42ace057e984409fc0b0c5cf03e10e"
  },
  {
    "url": "build/app/app.registry.json",
    "revision": "af9daa55cb3518cb829b0b12728446d7"
  },
  {
    "url": "build/app/cv7cbtbi.js",
    "revision": "b425d7fba0b1c25730cf13a34af6b556"
  },
  {
    "url": "build/app/fmj7rf1r.js",
    "revision": "27776da621e071c1debd8fec7e3f3fea"
  },
  {
    "url": "build/app/krirex7d.js",
    "revision": "2379293fa04a47b457246d63856c5362"
  },
  {
    "url": "build/app/lljbbqab.js",
    "revision": "4cb1be69cd6f9e9015e3d5d93d0159e5"
  },
  {
    "url": "build/app/lshpsice.js",
    "revision": "e005ec82cdd9f78de33ea72a8cebe839"
  },
  {
    "url": "build/app/m372a6dd.js",
    "revision": "5572996fc5c7b76f5df6665954e9f6e6"
  },
  {
    "url": "build/app/n56a2jzp.js",
    "revision": "e954543252f3704d0f97c59bfeda6c9c"
  },
  {
    "url": "build/app/nvgxmkhh.js",
    "revision": "549d52c8595fc8cd8cc1dcadb5edd3c2"
  },
  {
    "url": "build/app/orsdhirh.js",
    "revision": "7438a81d2db06c201be7ba516d9071ca"
  },
  {
    "url": "build/app/pbssls7g.js",
    "revision": "bceea4fa858c798bb6fa201033865b51"
  },
  {
    "url": "build/app/rhlmfaus.js",
    "revision": "6be3c0d5f97086f8fab64b1bf2a654a5"
  },
  {
    "url": "build/app/sqi87dqk.js",
    "revision": "2c546dbf30d539745ad397d4f54fd5c0"
  },
  {
    "url": "build/app/waljrbe1.js",
    "revision": "68e972c9289dffeceb9a02d63e2da8c6"
  },
  {
    "url": "build/app/wnmbbgpp.js",
    "revision": "382d6822942bd45881e9b3874b5ed057"
  },
  {
    "url": "build/app/xyfissap.js",
    "revision": "25d03519f99399851b14fdc57d211da6"
  },
  {
    "url": "host.config.json",
    "revision": "8bca362d788960ee703efc7fff4e221f"
  },
  {
    "url": "index.html",
    "revision": "d939b0545437a564966b12137abd4887"
  },
  {
    "url": "manifest.json",
    "revision": "933334db099a12ff06af4b62e3c30872"
  }
];

const workboxSW = new self.WorkboxSW({
  "skipWaiting": true,
  "clientsClaim": true
});
workboxSW.precache(fileManifest);
