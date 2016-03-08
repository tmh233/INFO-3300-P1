"use strict";
/* global d3, console, appended_to */

/**
 * First graph 1958-08-09 - 2016-03-05
 */

Array.prototype.last = function() {
  return this.length === 0 ? null : this[this.length - 1];
};

Array.prototype.first = function() {
  return this.length === 0 ? null : this[0];
};

(function () { /** to keep our global scope clean. */

  /** Setup */
  var svg  = d3
        .select("#out1")
        .append("svg")
        .attr("width", 960)
        .attr("height", 180),

      swdth = svg.attr('width'),
      shght = svg.attr('height'),

      on_svg = appended_to(svg),

      padding = 25,

      start_date = new Date('1958-08-09'),
      end_date   = new Date('2016-03-05');

  console.log(start_date, end_date);



  var xScale = d3.time.scale()
              .domain([start_date, end_date])
              .range([padding, (swdth - padding)]);
  var yScale = d3.scale.linear()
              .domain([100, 0])
              .range([(shght - padding), padding]);

  var xAxis = d3.svg.axis()
    .scale(xScale).orient("bottom").ticks(10);

  var yAxis = d3.svg.axis()
    .scale(yScale).orient("left").ticks(5);
  
  svg
    .append("g")
    .attr("transform", "translate(0," + (svg.attr('height') - padding) + ")")
    .attr("class", "axis")
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", "translate(" + padding + ",0)")
    .attr("class", "axis")
    .call(yAxis);


  // on_svg({
  //   'append' : 'circle',
  //   'cx'     : xScale(new Date('2006-01-05')),
  //   'cy'     : yScale(30),
  //   'r'      : 3,
  //   'fill'   : '#FF3300',
  //   'stroke' : '#BB2200',
  //   'stroke-width' : '1px'
  // });


  d3.json("data/artisttrack.json", function(err, artist_arr) {
    if (err) return console.trace(err);

    var artist_arr = artist_arr.slice(0, 1);

    var colors = ['#2F1022', '#2F1222','#492832','#F28','#2909A1','#FFF','#AAA','#333','#222','#111'];

    console.log(artist_arr)

    artist_arr.forEach(function (artist, i) {

      // First ever artist ranking
      var first = new Date(artist.ranks.first().first().date);
      var last  = new Date(artist.ranks.last().last().date);

      // console.log(artist)
      // console.log(yScale(artist.top))


      on_svg({
        'append' : 'rect',
        'x' : xScale(first),
        'y' : yScale(artist.top),
        'width' : xScale(last) - xScale(first),
        'height' : yScale(100) - yScale(artist.top), 
        'stroke' : 'black',
        'stroke-width' : 1,
        'fill' : colors[i],
        'opacity': 0.4
      });

      on_svg({
        'append' : 'text',
        'x' : xScale(first),
        'y' : yScale(artist.top) + 10 * i,
        'text' : artist.artist,
        'fill' : colors[i]
        // 'width' : xScale(last) - xScale(first),
        // 'height' : yScale(100) - yScale(artist.top), 
        // 'stroke' : 'red',
        // 'stroke-width' : 2,
        // 'fill' : 'none',
        // 'opacity': 1
      });

      artist.ranks.forEach(function (rank_group) {
        rank_group.map(function (rank) {
          rank.date = new Date(rank.date);
          return rank;
        });

        var line = d3.svg.line()
            .x(function(rank) { return xScale(rank.date); })
            .y(function(rank) { return yScale(rank.rank); })
            // .interpolate("basis");

        on_svg({
          'append' : 'path',
          'd' : line(rank_group),
          'stroke' : 'red',
          'stroke-width' : 0.5,
          'fill' : 'none',
          'opacity': 1
        });

        var first = new Date(rank_group.first().date);
        var last  = new Date(rank_group.last().date);
        var top   = new Date(rank_group.reduce(function (acc, rank) {
          return rank.rank < acc ? rank.rank : acc;
        }, 100));

        var height = yScale(100) - yScale(top);

        on_svg({
          'append' : 'rect',
          'x' : xScale(first),
          'y' : yScale(top),
          'width' : xScale(last) - xScale(first),
          'height' : yScale(100) - yScale(top), 
          'stroke' : 'black',
          'stroke-width' : 1,
          'fill' : colors[i],
          'opacity': 0.4
        });


      })

     

    });
  });
})();

