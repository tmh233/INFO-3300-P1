"use strict";
/* global d3, console */

(function () {

  var artistData;
  var svg = d3.select("#graph")
  .append("svg")
  .attr("class", "bordered")
  .attr("width", 1500)
  .attr("height", 1250);
  var xScale = d3.scale.linear().domain([100000,5500000]).range([130, 1450]);
  var yScale = d3.scale.linear().domain([45000000,140000000]).range([1150,120]);
  var radius = d3.scale.sqrt().domain([101126,5165559]).range([5, 40]);
  var spectrum = d3.scale.linear().domain([48000000,135000000]).range(["#072C03","#2BFF10"]);
  var g = svg.append("g");
  var formatValue = d3.format(".2s");
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10).tickFormat(function(d) { return formatValue(d).replace('G', 'B'); });

  svg.append("g").attr("class", "axis")
  .attr("transform", "translate(0,1170)")
  .call(xAxis);
  svg.append("g").attr("class", "axis")
  .attr("transform", "translate(" + 75 + ",0)")
  .call(yAxis);

  svg.append("text")
  .attr("x", 700)
  .attr("y", 1225)
  .text("Followers on Spotify");

  svg.append("text")
  .attr("x", -650)
  .attr("y", 15)
  .attr("transform", "rotate(-90)")
  .text("Money Made (Millions)");

  d3.json("data/topearners.json", function(error, json) {
    if (error) return console.warn(error);
    artistData = json;

    for (var i=0;i<6;i++){
      for (var k=0;k<artistData[i][2010+i].length;k++){
        artistData.years = 2010+i;
        artistData.followers=artistData[i][2010+i][k].followers;
        artistData.moneymade=artistData[i][2010+i][k].moneymade;
        artistData.artist=artistData[i][2010+i][k].artist;

        var circles = svg.append("circle");

        circles.attr("cx", xScale(artistData.followers) )
        .attr("cy", yScale(artistData.moneymade) )
        .attr("r", radius(artistData.followers) )
        .attr("fill", spectrum(artistData.moneymade))
        .attr("opacity",0.5);

        var texts = g.append("text");
        var texts2 = g.append("text");

        texts.attr("x", xScale(artistData.followers))
        .attr("y", yScale(artistData.moneymade))
        .text(artistData.artist)
        .attr("font-size",10)
        .attr("style","text-anchor: middle");

        texts2.attr("x", xScale(artistData.followers))
        .attr("y", yScale(artistData.moneymade)+10)
        .text(artistData.years)
        .attr("font-size",10)
        .attr("style","text-anchor: middle");
      }
    }
  });

})();