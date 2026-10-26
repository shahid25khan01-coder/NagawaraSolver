/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "273ee4f3c6fc16b9463917da39264193"
  }, {
    "url": "pwa-512x512.png",
    "revision": "273ee4f3c6fc16b9463917da39264193"
  }, {
    "url": "pwa-192x192.png",
    "revision": "c52058d68d3920a25a0ccb51ace9504f"
  }, {
    "url": "index.html",
    "revision": "3cc14eccecb82f8a195f82035fe84fa3"
  }, {
    "url": "icon.svg",
    "revision": "b800a3d0ad3363ff61a56a6b819dae8a"
  }, {
    "url": "favicon.ico",
    "revision": "6efe7c86d573b86220f47f8a4a285445"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d435eb2c9f0935c8d68f7c229702457e"
  }, {
    "url": "assets/index-BPV40luV.css",
    "revision": null
  }, {
    "url": "assets/index-BIvb1Wr8.js",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-21_at_5.49.01_PM_1311f9b4.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d435eb2c9f0935c8d68f7c229702457e"
  }, {
    "url": "favicon.ico",
    "revision": "6efe7c86d573b86220f47f8a4a285445"
  }, {
    "url": "icon.svg",
    "revision": "b800a3d0ad3363ff61a56a6b819dae8a"
  }, {
    "url": "pwa-192x192.png",
    "revision": "c52058d68d3920a25a0ccb51ace9504f"
  }, {
    "url": "pwa-512x512.png",
    "revision": "273ee4f3c6fc16b9463917da39264193"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "273ee4f3c6fc16b9463917da39264193"
  }, {
    "url": "manifest.webmanifest",
    "revision": "90c026a7a38b07c12dad5c4f35842791"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
