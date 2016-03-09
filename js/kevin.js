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
  // a 394358, s B16B56
  // c C7B7B1, b
  // 
  /** Setup */
  var svg = d3
        .select("#out2")
        .append("svg")
        .attr("class", "bordered")
        .attr("width", 900)
        .attr("height", 900),

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

      artist_color = '#0b4404',
      song_color = '#22cc0d',


      text_color = '#080D16',

      padding = 84,
      padd_y = 50,

      num_positions = 1000,

      key_height = key_svg.attr('height'),
      key_rows = 2, key_cols = 4, key_padding = 12,

      key_xScale = d3.scale.linear()
              .domain([0, (key_cols - 1)])
              .range([key_padding, (key_height - key_padding)]),

      key_yScale = d3.scale.linear()
              .domain([0, (key_rows - 1)])
              .range([key_padding, (key_height - key_padding)]);

  var xScale = d3.scale.linear()
              .domain([0, num_positions])
              .range([padding, (swdth - padding)]);
  var yScale = d3.scale.linear()
              .domain([0, (rows - 1)])
              .range([padd_y, (shght - padd_y)]);

  d3.json("data/yeartrack.json", function(err, data) {
    if (err) return console.trace(err);

    // Skip 1958, we don't have the full year's data
    var year_arr = data.slice(1, -1);

    var yBands = d3.scale.ordinal()
      .domain(year_arr.map(function (year) { return year.year; }))
      .rangeBands([padd_y, shght-padd_y], 0.3);

    // Artist key 

    on_key({
      'append' : 'circle',
      'cx' : key_xScale(1),
      'cy' : key_yScale(1),
      'r'  : 10,
      'fill' : artist_color
    });

    on_key({
      'append' : 'text',
      'text-anchor' : 'start',
      'alignment-baseline' : 'ideographic',
      'text' : "# Distinct artists",
      'x' : key_xScale(2.9),
      'y' : key_yScale(1.17),
      'fill' : text_color
    });

    // Song key

    on_key({
      'append' : 'circle',
      'cx' : key_xScale(1),
      'cy' : key_yScale(0),
      'r'  : 10,
      'fill' : song_color
    });

    on_key({
      'append' : 'text',
      'text-anchor' : 'start',
      'alignment-baseline' : 'ideographic',
      'text' : "# Distinct songs",
      'x' : key_xScale(2.9),
      'y' : key_yScale(0.17),
      'fill' : text_color
    });

    // Axis

    var xAxis = d3.svg.axis()
      .scale(xScale).orient("top").ticks(3)
      .innerTickSize(5).outerTickSize(5);

    var yAxis = d3.svg.axis()
      .scale(yBands).orient("left").ticks(0)
      .innerTickSize(0)
      .outerTickSize(0);

    svg
      .append("g")
      .attr("transform", "translate(0," + (yScale(0)) + ")")
      .attr("class", "axis")
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", "translate(" + padding + ",0)")
      .attr("class", "axis")
      .call(yAxis);

    on_svg({
      'append' : 'text',
      'text-anchor' : 'start',
      'alignment-baseline' : 'ideographic',
      'text' : "Billboard lately sees more of the same songs & artists",
      'x' : xScale(630),
      'y' : yBands('2003'),
      'fill' : text_color
    });

    on_svg({
      'append' : 'text',
      'text-anchor' : 'start',
      'alignment-baseline' : 'ideographic',
      'text' : "than it did before.",
      'x' : xScale(630),
      'y' : yBands('2004'),
      'fill' : text_color
    });




    year_arr.forEach(function (year, i) {

      // All different artists that year.
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

      // Add different songs that year.
      var songs = year.songs;

      var width_for = function (x) {
        return xScale(x);
      };

      // 
      on_svg({
        'append' : 'rect',
        'x'      : padding,
        'y'      : yBands(year.year),
        'width'  : width_for(songs.length),
        'height' : yBands.rangeBand(),
        'fill'   : song_color
      });

      // 
      on_svg({
        'append' : 'rect',
        'x' : padding,
        'y' : yBands(year.year),
        'width' : width_for(artists.length),
        'height'  : yBands.rangeBand(),
        'fill' : artist_color
      });

    });
  });
})();