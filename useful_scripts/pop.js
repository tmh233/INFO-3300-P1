"use strict";
/* global console, JSON, require */
var spotify = require('spotify');

var arr = ["The Rolling Stones","U2","Kenny Chesney","Green Day","The Eagles","Paul McCartney","Celine Dion","50 Cent","Dave Matthews Band","Elton John","Tim McGraw","Rascal Flatts","Madonna","Barbra Streisand ","Bon Jovi","Nickelback","Jay-Z","P Diddy","The Police","Beyonce","Toby Keith","Justin Timberlake","Van Halen","Genesis","Gwen Stefani","Bruce Springsteen","Coldplay","AC/DC","Eagles","Britney Spears","Jay Z","Lady Gaga","Black Eyed Peas & Coldplay & Toby Keith (Tie)","Michael Buble","The Black Eyed Peas","Justin Bieber","Dave Matthews band","Dr. Dre","Roger Waters","Take That","Paul McCartney & Taylor Swift (Tie)","Justin Bieber & Toby Keith (Tie)","Taylor Swift","One Direction","Calvin Harris","Katy Perry","Garth Brooks","Fleetwood Mac"]
.reduce(function (acc, x) {
  if (acc.indexOf(x) < 0) acc.push(x);
  return acc;
}, [])
.map(function (artist) {
  return new Promise(function (res, rej) {
    spotify.search({ type: 'artist', query: artist }, function (err, data) {
        if (err) {
          rej(err);
        }
        else { res(data); }
    });
  })
  .catch(console.trace);
});

Promise.all(arr).then(function (searches) {
  return searches.map(function (search) {
    if (search.artists.items.length === 0) {
      console.log('No results for', search.artists.href)
      return null
    }
    return {
      aritst : search.artists.items[0].name,
      followers: search.artists.items[0].followers.total
    };
  });
})
.then(function (artists) {
  console.log(JSON.stringify(artists));
})
.catch(console.trace)

 
/* A search looks like:

{ artists:
   { href: 'https://api.spotify.com/v1/search?query=U2&offset=0&limit=20&type=artist',
     items:
      [ [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object] ],
     limit: 20,
     next: null,
     offset: 0,
     previous: null,
     total: 14 } }

where [Object] is

{ external_urls: { spotify: 'https://open.spotify.com/artist/51Blml2LZPmy7TTiAg47vQ' },
  followers: { href: null, total: 1264603 },
  genres: [],
  href: 'https://api.spotify.com/v1/artists/51Blml2LZPmy7TTiAg47vQ',
  id: '51Blml2LZPmy7TTiAg47vQ',
  images:
   [ { height: 1281,
       url: 'https://i.scdn.co/image/56b6cf38f0ebc5386efb482f181267c560768ad4',
       width: 1000 },
     { height: 820,
       url: 'https://i.scdn.co/image/f74a87e99d896fdfdf0b92fc6ba5e7c8475d33ce',
       width: 640 },
     { height: 256,
       url: 'https://i.scdn.co/image/bbf6684084d0f444b92789abcdb66bb16c7d2c43',
       width: 200 },
     { height: 82,
       url: 'https://i.scdn.co/image/df145cf2cbb2e59a055ef07c53b25c7d37e46a05',
       width: 64 } ],
  name: 'U2',
  popularity: 79,
  type: 'artist',
  uri: 'spotify:artist:51Blml2LZPmy7TTiAg47vQ' }

 */

 
