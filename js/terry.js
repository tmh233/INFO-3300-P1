"use strict";
/* global d3, console, topojson */

(function () {

  /** Terry's scripts */
    d3.select(window).on("resize", throttle);

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 9])
        .on("zoom", move);


    var width = 960;
    var height = width / 2;

    var topo,projection,path,svg,g;

    var graticule = d3.geo.graticule();

    var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");

    var setup = function (width,height){

      projection = d3.geo.kavrayskiy7 ()
        .translate([(width/2), (height/2)])
        .scale(width / 6);

      path = d3.geo.path().projection(projection);

      svg = d3.select("#container").append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("class", 'bordered')
          .call(zoom)
          .append("g");

      g = svg.append("g");

    };


    setup(width,height);
    draw();



    var move = function () {

      var t = d3.event.translate;
      var s = d3.event.scale; 
      // zscale = s;
      var h = height/4;


      t[0] = Math.min(
        (width/height)  * (s - 1), 
        Math.max( width * (1 - s), t[0] )
      );

      t[1] = Math.min(
        h * (s - 1) + h * s, 
        Math.max(height  * (1 - s) - h * s, t[1])
      );

      zoom.translate(t);
      g.attr("transform", "translate(" + t + ")scale(" + s + ")");

      //adjust the country hover stroke width based on zoom level
      d3.selectAll(".country").style("stroke-width", 1.5 / s);

    };

    var throttle = function () {
      var throttleTimer;
      window.clearTimeout(throttleTimer);
        throttleTimer = window.setTimeout(function() {
          redraw();
        }, 200);
    };

    var data2 = [
      {name:"United Kingdom", country_code: 826, rank: 1},{name:"United States", country_code: 840, rank: 2},{name:"Sweden", country_code: 752, rank: 3},
      {name:"Canada", country_code: 124, rank: 4},{name:"Germany", country_code: 276, rank: 5},{name:"South Korea", country_code: 410, rank: 6},
      {name:"Australia", country_code: 36, rank: 7},{name:"Italy", country_code: 380, rank: 8},
      {name:"Ireland", country_code: 372, rank: 9},{name:"Jamaica", country_code: 388, rank: 10},
      {name:"India", country_code: 356, rank: 11},{name:"Mexico", country_code: 484, rank: 12},{name:"France", country_code: 250, rank: 13},
      {name:" Japan", country_code: 392, rank: 14},{name:"Finland", country_code: 246, rank: 15},
      {name:"Spain", country_code: 724, rank: 16},{name:"Russia", country_code: 643, rank: 17},
      {name:"Philippines", country_code: 608, rank: 18},{name:"Romania", country_code: 642, rank: 19},
      {name:"Ukraine", country_code: 804, rank: 20}
    ];


      // var countries = topojson.feature(world, world.objects.countries).features;

      // svg.selectAll(".country")
      //     .data(countries)
      //   .enter().insert("path", ".graticule")
      //     .attr("class", "country")
      //     .attr("d", path)
      //     .style("fill", function(d, i) { return 'red'; });

  function draw() {

    d3.json("world-map.json", function(json) {
      //Merge the rank in data2 and GeoJSON in a single array
      //Loop through once for each "rank" data value
      for (var i = 0; i < data2.length; i++) {
          //Grab country name
          var data2CountryCode = data2[i].country_code;
          //Grab data value, and convert from string to float
          var datarank = +data2[i].rank;
          //Find the corresponding country inside the GeoJSON
          for (var j = 0; j < json.features.length; j++) {

              //We'll check the official ISO country code
              var jsonCountryCode = json.features[j].properties.un_a3;

              if (data2CountryCode == jsonCountryCode) {
                  //Copy the data2 rank value into the GeoJSON, with the name "color"
                  json.features[j].properties.color = datarank;
                  //Stop looking through the JSON
                  break;
              }
          }
      }
    
      var colors = ["Lime","GreenYellow","LawnGreen","LightGreen","LimeGreen","Green",
      "DarkGreen","Yellow","Gold","GoldenRod","DarkGoldenRod","Orange","DarkOrange",
      "Coral","Red","OrangeRed","Tomato","Crimson","DarkRed","Brown"];
      
      var color_scale = d3.scale.quantize().range(colors)
        .domain([(d3.min(data2, function(d) { return d.rank; })),
                 (d3.max(data2, function(d) { return d.rank; }))]); 
      
      // svg.append("path")
      //    .datum(graticule)
      //    .attr("class", "graticule")
      //    .attr("d", path);
      
      // g.append("path")
      //  .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
      //  .attr("class", "equator")
      //  .attr("d", path);
      
      var country = g.selectAll(".country")
        .data(json.features) //in my example, json.features
        .enter()
        .append("path")
        .attr("d", path)

        .on("click", function(d){
          console.log("Population for " + d.properties.name + " is " + 
                       d.properties.pop_est + " as of " + d.properties.lastcensus);
        })
        .style("fill", function(d) {

          if (d.properties.name === 'Antarctica') return 'none';
      
          //Get data value
          var value = d.properties.color;
          if (value) {
            //If value exists…
            return color_scale(value);
          } else {
            return 'black';
            //do nothing, leave country as is
          }
      
        });
          
      var offsetL = document.getElementById('container').offsetLeft-20;
      var offsetT = document.getElementById('container').offsetTop-10;
      
      //modified to display rank of country, if it has one, if not, doesnt display any rank
      country
        .on("mousemove", function(d) {
          var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        
           if (d.properties.color) {
            tooltip.classed("hidden", false)
                 .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
           .html(d.properties.name + " " + "Rank" + " " + d.properties.color);
           }
           else {
            tooltip.classed("hidden", false)
                 .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
           .html(d.properties.name); 
           }
          })
          .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true);
        }); 
    });

  }


})();