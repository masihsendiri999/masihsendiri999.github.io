/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
function createDB() {
  idb.open('products', 1, function(upgradeDB) {
    var store = upgradeDB.createObjectStore('cars', {
      keyPath: 'id'
    });
    store.put({name: 'Dodge Challeger SRT Demon v3',
    id: 'cch-blk-ma',
    price: 45000,
    color: 'red',
    engine: 'V8 6.2 L',
    description: 'American Muscle still alive',
    quantity: 3});
    store.put({name: 'Toyota Sprinter Trueno AE 86',
    id: 'ddd-tyt-sp',
    price: 15000,
    color: 'white',
    engine: 'Inline 12valve DOHC 1.3 L',
    description: 'Drifting King a.k.a DK cars stay strong',
    quantity: 1});
    store.put({name: 'Bugati Veyron',
    id: 'fgh-bgt-vey',
    price: 999000,
    color: 'blue',
    engine: 'V16',
    description: 'The Best Monster Super Sport Car this year',
    quantity: 2});
  });
}
function readDB() {
  idb.open('products', 1).then(function(db) {
    var tx = db.transaction(['beverages'], 'readonly');
    var store = tx.objectStore('beverages');
    return store.getAll();
  }).then(function(items) {
    // Use beverage data
  });
}
function cacheAssets() {
  return caches.open('cache-v1')
  .then(function(cache) {
    return cache.addAll([
      '.',
      'style/main.css',
      'style/temp.css',
      'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
      'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
      'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
      'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
      'images/',
      'index.html',
      'modernizr-custom.js',
      'pages/offline.html',
      'pages/404.html',
      'images/2018-Dodge-Challenger-SRT1600.jpg',
      'images/2018-Dodge-Challenger-SRT1000.jpg',
      'images/2018-Dodge-Challenger-SRT800.jpg',
      'images/2018-Dodge-Challenger-SRT500.jpg',
    ]);
  });
}

(function() {
  'use strict';
  

  var filesToCache = [
    '.',
    'style/main.css',
    'style/temp.css',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
    'images/',
    'index.html',
    'modernizr-custom.js',
    'pages/offline.html',
    'pages/404.html',
    'images/2018-Dodge-Challenger-SRT1600.jpg',
    'images/2018-Dodge-Challenger-SRT1000.jpg',
    'images/2018-Dodge-Challenger-SRT800.jpg',
    'images/2018-Dodge-Challenger-SRT500.jpg',

  ];


  var staticCacheName = 'cache-page-two2';

  self.addEventListener('install', function(event) {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
      caches.open(staticCacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache, cacheAssets());
      })
    );
  });

  self.addEventListener('fetch', function(event) {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request).then(function(response) {
          if (response.status === 404) {
            return caches.match('pages/404.html');
          }
          return caches.open(staticCacheName).then(function(cache) {
            if (event.request.url.indexOf('test') < 0) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          });
        });
      }).catch(function(error) {
        console.log('Error, ', error);
        return caches.match('pages/offline.html');
      })
    );
  });

  self.addEventListener('activate', function(event) {
    event.waitUntil(
      createDB()
    );
    console.log('Activating new service worker...');

    var cacheWhitelist = [staticCacheName];

    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

})();
