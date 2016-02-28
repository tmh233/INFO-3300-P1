"use strict";
/* global d3, console, appended_to */

/**
 * Utility functions
 */

/** Applies styles in an object to a d3 element */
var apply_style = function (acc, obj) {
  return Object.keys(obj).reduce(function (acc, key) {
    return acc.style(key, obj[key]);
  }, acc);
};

/** d3 canvas -> Options object -> appended d3 element */
window.appended_to = function (svg) {
  return function (obj) {
    return Object.keys(obj).reduce(function (acc, key) {
      if (key == 'append') return acc;
      if (key == 'call')   return acc.call(obj[key]);
      if (key == 'text')   return acc.text(obj[key]);
      if (key == 'style')  return apply_style(acc, obj[key]);
      return acc.attr(key, obj[key]);
    }, svg.append(obj.append));
  };
};

// For reducing
function BucketObject () {}
BucketObject.prototype.map = function(cb) {
  var self = this;
  return Object.keys(this).map(function (key) {
    return cb(self[key], key);
  });
};


/**
 * Graph: Charts yoy 1959 - 2015
 */

(function () { /** to keep our global scope clean. */

  /** Setup */
  var svg = d3
        .select("#out2")
        .append("svg")
        .attr("width", 960)
        .attr("height", 1080),

      key_svg = d3
        .select("#out2key")
        .append("svg")
        .attr("width", '100%')
        .attr("height", 50),

      on_svg  = appended_to(svg),
      on_key  = appended_to(key_svg),

      swdth   = svg.attr('width'),
      shght   = svg.attr('height'),

      rows    = 8,
      cols    = 8,

      artist_color = '#394358',
      song_color = '#B16B56',

      padding = 85,

      key_height = key_svg.attr('height'),
      key_rows = 2, key_cols = 4, key_padding = 10,

      key_xScale = d3.scale.linear()
              .domain([0, (key_cols - 1)])
              .range([key_padding, (key_height - key_padding)]),

      key_yScale = d3.scale.linear()
              .domain([0, (key_rows - 1)])
              .range([key_padding, (key_height - key_padding)]);

  var xScale = d3.scale.linear()
              .domain([0, (cols - 1)])
              .range([padding, (swdth - padding)]);
  var yScale = d3.scale.linear()
              .domain([0, (rows - 1)])
              .range([padding, (shght - padding)]);


  d3.json("data/yeartrack.json", function(err, year_arr) {
    if (err) return console.trace(err);

    // Skip 1958, we don't have the full year's data
    var year_arr = year_arr.slice(1, -1);

    // Artist key 

    on_key({
      'append' : 'circle',
      'cx' : key_xScale(1),
      'cy' : key_yScale(0),
      'r'  : 10,
      'fill' : artist_color
    });

    on_key({
      'append' : 'text',
      'text-anchor' : 'start',
      'alignment-baseline' : 'ideographic',
      'text' : "# Distinct artists",
      'x' : key_xScale(2.9),
      'y' : key_yScale(0),
      'fill' : '#C7B7B1'
    });

    // Song key

    on_key({
      'append' : 'circle',
      'cx' : key_xScale(1),
      'cy' : key_yScale(1),
      'r'  : 10,
      'fill' : song_color
    });

    on_key({
      'append' : 'text',
      'text-anchor' : 'start',
      'alignment-baseline' : 'ideographic',
      'text' : "# Distinct songs",
      'x' : key_xScale(2.9),
      'y' : key_yScale(1),
      'fill' : '#C7B7B1'
    });




    year_arr.forEach(function (year, i) {

      var artists = year.songs
        .reduce(function (acc, song) {
          var id = song.artist;
          if (!acc[id]) acc[id] = [];
          acc[id].push(song);
          return acc;
  
        }, new BucketObject())
        .map(function (artist_songs_arr, artist) {
          return {
            artist: artist,
            songs: artist_songs_arr
          };
        });

      var label_offset = 0.40;

      var rfora = function(a){
        return a; //50 * (Math.sqrt(a/Math.PI));
      };

      // Songs circle
      on_svg({
        'append' : 'circle',
        'cx' : xScale(i % cols),
        'cy' : yScale(i / cols),
        'r'  : rfora(year.songs.length) / 20,
        'fill' : song_color
      });

      // Song count
      on_svg({
        'append' : 'text',
        'text-anchor' : 'end',
        'alignment-baseline' : 'ideographic',
        'text' : "" + year.songs.length + "/",
        'x' : xScale(i % cols),
        'y' : yScale((i / cols) + label_offset),
        'fill' : song_color //tinycolor(song_color).darken(12).toString()
      });

      // Artists circle
      on_svg({
        'append' : 'circle',
        'cx' : xScale(i % cols),
        'cy' : yScale(i / cols),
        'r'  : rfora(artists.length) / 20,
        'fill' : artist_color
      });

      // artist count
      on_svg({
        'append' : 'text',
        'text' : "/" + artists.length,
        'x' : xScale(i % cols),
        'y' : yScale((i / cols) + label_offset),
        'text-anchor' : 'start',
        'alignment-baseline' : 'ideographic',
        'fill' : artist_color //tinycolor(artist_color).lighten(12).toString()
      });

      // year text
      on_svg({
        'append' : 'text',
        'text' : year.year,
        'text-anchor' : 'middle',
        'alignment-baseline' : 'ideographic',
        'x' : xScale(i % cols),
        'y' : yScale((i / cols) + label_offset + 0.11),
        'fill' : '#C7B7B1'
      });

    });
  });
})();