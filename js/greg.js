"use strict";
/* global d3, console */

(function () {

  var artistData;
  var svg = d3.select("#graph")
  .append("svg")
  .attr("class", "bordered")
  .attr("width", 960)
  .attr("height", 800);
  var padd_x = 80;
  var padd_y = 100;
  var xScale = d3.scale.log().domain([300000,9000000]).range([padd_x , svg.attr('width') - padd_x]);
  var yScale = d3.scale.log().domain([30000000,200000000]).range([svg.attr('height') - padd_y, padd_y-20 ]);
  var radius = d3.scale.sqrt().domain([101126,5165559]).range([5, 40]);
  var spectrum = d3.scale.linear().domain([48000000,135000000]).range(["#072C03","#2BFF10"]);
  var g = svg.append("g");
  var formatValue = d3.format(".2s");
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(7).tickFormat(function(d) { return formatValue(d).replace('G', 'B'); });
  var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10 , d3.format(",d")).tickFormat(function(d) { return formatValue(d).replace('G', 'B'); });

  svg.append("g").attr("class", "axis")
  .attr("transform", "translate(0,"+ 720 +")")
  .call(xAxis);
  svg.append("g").attr("class", "axis")
  .attr("transform", "translate(" + padd_x + ",0)")
  .call(yAxis);

  svg.append("text")
  .attr("x", 450)
  .attr("y", 780)
  .text("Followers on Spotify");

  svg.append("text")
  .attr("x", -450)
  .attr("y", 20)
  .attr("transform", "rotate(-90)")
  .text("Money Made (Millions)");

  d3.json("data/topearners.json", function(error, json) {
    if (error) return console.warn(error);
    artistData = json;

      for (var k=0;k<artistData[5][2015].length;k++){
        artistData.years = 2015;
        artistData.followers=artistData[5][2015][k].followers;
        artistData.moneymade=artistData[5][2015][k].moneymade;
        artistData.artist=artistData[5][2015][k].artist;

        var circles = svg.append("circle");

        circles.attr("cx", xScale(artistData.followers) )
        .attr("cy", yScale(artistData.moneymade) )
        .attr("r", radius(artistData.followers) )
        .attr("fill", spectrum(artistData.moneymade))
        .attr("opacity",0.5);

        var texts = g.append("text");

        texts.attr("x", xScale(artistData.followers))
        .attr("y", yScale(artistData.moneymade))
        .text(artistData.artist)
        .attr("font-size",10)
        .attr("style","text-anchor: middle");

      }
  });

})();