var app = angular.module('hdcWaterMeter');

/**
 * Water glass directive, it creates a SVG glass filled with water. The level
 * of water 
 */
app.directive('hdcWaterGlass', ['$location', function($location){
  function link(scope, element, attrs){
    var absUrl = $location.absUrl();
    var rootElement = element[0];
    var svg = d3.select(rootElement).append('svg')
      .attr('width', (parseInt(scope.width) + 100))
      .attr('height', (parseInt(scope.height) + 100));
    var glassGroup = svg.append('g')
      .attr('transform', _.str.sprintf('translate(%s,%s)', 50, 50));
    var middleX = scope.width/2;
    var bottomY = scope.height*0.9;
    var topY = scope.height*0.1;
    var topWaterLevel = scope.height*0.2;
    var ry = topY;
    var rx = middleX;
    glassGroup.append('ellipse')
      .attr('cx', middleX)
      .attr('cy', topY)
      .attr('rx', rx)
      .attr('ry', ry)
      .style('fill', 'none')
      .style('stroke', '#000000')
      .classed('glass-top');
    glassGroup.append('ellipse')
      .attr('cx', middleX)
      .attr('cy', bottomY)
      .attr('rx', rx)
      .attr('ry', ry)
      .style('fill', 'none')
      .style('stroke', '#000000')
      .classed('glass-bottom');
    glassGroup.append('path')
      .datum([[0, bottomY], [0, topY]])
      .attr('d', d3.svg.line())
      .style('stroke', '#000000');
    glassGroup.append('path')
      .datum([[scope.width, bottomY], [scope.width, topY]])
      .attr('d', d3.svg.line())
      .style('stroke', '#000000');
    var waterLevel = bottomY - parseFloat(scope.waterLevel)*(bottomY - topWaterLevel);
    var fillPath = _.str.sprintf('M %s,%s L %s, %s A %s,%s 0 0 0 %s,%s L %s,%s A %s,%s 0 0 1 %s, %s',
        0, bottomY,
        0, waterLevel,
        rx, ry,
        scope.width, waterLevel,
        scope.width, bottomY,
        rx, ry,
        0, bottomY);
    glassGroup.append('path')
      .attr('d', fillPath)
      .attr('fill', '#0066CC')
      .attr('fill-opacity', 0.6);
    glassGroup.append('ellipse')
      .attr('cx', middleX)
      .attr('cy', waterLevel)
      .attr('rx', rx)
      .attr('ry', ry)
      .attr('stroke', '#0077CC')
      .attr('stroke-opacity', 0.4)
      .attr('fill', '#0099CC')
      .attr('fill-opacity', 0.4);
    glassGroup.append('text')
      .attr('x', 1)
      .attr('y', topWaterLevel)
      .attr('fill', 'black')
      .text('2.5 dl');
    glassGroup.append('path')
      .attr('d', _.str.sprintf('M 0,%s A %s, %s, 0 0 0 %s, %s', topWaterLevel, rx, ry, scope.width/2 , topWaterLevel + ry))
      .attr('stroke', '#000000')
      .attr('fill', 'none');
    glassGroup.append('defs')
      .append('path')
        .attr('d', _.str.sprintf('M 0,%s A %s, %s, 0 0 0 %s, %s', topWaterLevel, rx, ry, scope.width/2 , topWaterLevel + ry))
        .attr('stroke', '#000000')
        .attr('fill', 'none')
        .attr('id', 'MyPath');
  };
  return {
    restrict : 'E',
    scope : {
      width : '@',
      height : '@',
      coverHeight : '@',
      waterLevel : '@'
    },
    link : link
  };
}]);

app.directive('hdcDateSeries', function(){
  function link(scope, element, attrs){
    // Retrieve required isolated scope parameters
    var rootElement = element[0];
    var data = scope.data;
    var width = parseFloat(scope.width);
    var height = parseFloat(scope.height);

    // Retrieve optional isolated scope parameters, and set the defaults
    var margins       = scope.margins || {};
    margins.left      = parseFloat(margins.left   || 50);
    margins.right     = parseFloat(margins.right  || 20);
    margins.top       = parseFloat(margins.top    || 10);
    margins.bottom    = parseFloat(margins.bottom || 25);
    margins.middle    = parseFloat(margins.middle || 25);

    var heightFocus   = parseFloat(scope.heightFocus || 
                          (0.6*height - margins.top));
    var heightCtx     = parseFloat(scope.heightCtx || 
                          (0.4*height - margins.bottom - margins.middle));
    var interpolate = scope.interpolate || "linear";

    var innerWidth = width - margins.left - margins.right,
        topCtx = heightFocus + margins.top + margins.middle;
    var xFocus  = d3.time.scale().range([0, innerWidth]),
        xCtx    = d3.time.scale().range([0, innerWidth]),
        yFocus  = d3.scale.linear().range([heightFocus, 0]),
        yCtx    = d3.scale.linear().range([heightCtx, 0]);

    var xAxisFocus  = d3.svg.axis().scale(xFocus).orient("bottom").ticks(5),
        xAxisCtx    = d3.svg.axis().scale(xCtx).orient("bottom").ticks(5),
        yAxisFocus  = d3.svg.axis().scale(yFocus).orient("left");

    var svg = d3.select(rootElement).append("svg")
                  .attr("width", width)
                  .attr("height", height);

    var focus = svg.append("g")
                    .attr("class", "date-series-focus")
                    .attr("transform", "translate(" + margins.left + "," +
                                                      margins.top + ")");

    var context = svg.append("g")
                    .attr("class", "date-series-context")
                    .attr("transform", "translate(" + margins.left + "," +
                                                      topCtx + ")");

    var brush = d3.svg.brush()
                      .x(xCtx)
                      .on("brush", brushed);

    var focusLine = d3.svg.line()
                          .interpolate(interpolate)
                          .x(function(d) { return xFocus(d.datetime); })
                          .y(function(d) { return yFocus(d.value); });

    var contextArea = d3.svg.area()
                      .interpolate(interpolate)
                      .x(function(d) { return xCtx(d.datetime); })
                      .y0(heightCtx)
                      .y1(function(d) { return yCtx(d.value); });

    var focusPointSymbol = d3.svg.symbol();

    svg.append("defs").append("clipPath")
         .attr("id", "clip" + d3.select(rootElement).attr('id'))
       .append("rect")
         .attr("width", innerWidth)
         .attr("height", heightFocus);

    focus.append("path")
      .attr("class", "date-series-line")
      .style("clip-path", "url(#clip" + d3.select(rootElement).attr('id') + ")")
      .style("stroke", "blue")
      .style("fill", "none");

    focus.append("g")
      .attr("class", "date-series-x date-series-axis")
      .attr("transform", "translate(0," + heightFocus + ")");

    focus.append("g")
      .attr("class", "date-series-y date-series-axis");

    context.append("path")
      .attr("class", "date-series-area")
      .style("fill", "blue");

    context.append("g")
      .attr("class", "date-series-x date-series-axis")
      .attr("transform", "translate(0," + heightCtx + ")");

    context.append("g")
      .attr("class", "date-series-x date-series-brush");

    focus.append("g")
      .attr("class", "date-series-point");

    scope.$watch('data', function(newValue, oldValue){
      data = scope.data;
      drawData();
    });

    function drawData(){
      if(scope.data){
        xFocus.domain(d3.extent(data.map(function(d) { return d.datetime; })));
        yFocus.domain(d3.extent(data.map(function(d) { return d.value; })));
        xCtx.domain(xFocus.domain());
        yCtx.domain(yFocus.domain());
        focus.select(".date-series-line")
          .datum(data)
          .attr("d", focusLine);
        focus.select(".date-series-x.date-series-axis")
          .call(xAxisFocus);
        focus.select(".date-series-y.date-series-axis")
          .call(yAxisFocus);
        context.select(".date-series-area")
          .datum(data)
          .attr("d", contextArea);
        context.select(".date-series-x.date-series-axis")
          .call(xAxisCtx);
        context.select(".date-series-x.date-series-brush")
            .call(brush)
          .selectAll("rect")
            .attr("height", heightCtx)
            .style("fill-opacity", ".125");
        updateDataSymbols();
      }
    };

    function brushed() {
      xFocus.domain(brush.empty() ? xCtx.domain() : brush.extent());
      focus.select(".date-series-line").attr("d", focusLine);
      focus.select(".date-series-x.date-series-axis").call(xAxisFocus);
      updateDataSymbols();
    };
    
    function updateDataSymbols(){
      focus.select(".date-series-point")
        .selectAll("path")
          .remove();
      focus.select(".date-series-point")
        .selectAll("path")
          .data(data.filter(function(d){
            return xFocus.domain()[0] <= d.datetime && xFocus.domain()[1] >= d.datetime;
          }))
          .enter().append("path")
            .attr("transform", function(d) { 
              return "translate(" + xFocus(d.datetime) + "," 
                                  + yFocus(d.value) + ")"; })
            .style("fill", "#1A044B")
            .style("stroke", "#BDAAE7")
            .style("stroke-width", "1.5")
            .attr("d", focusPointSymbol);
    };
  };

  return {
    restrict : 'E',
    scope : {
      data : '=',
      width: '@',
      height: '@',
      xticks : '@',
      yticks : '@',
      interpolate : '@'
    },
    link : link
  };
});