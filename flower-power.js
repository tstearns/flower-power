// Copyright 2016 Taylor Stearns
// See LICENSE for MIT license, and README.md for instructions.

document.onkeydown=function(e){
  // default to "Alt-F" to add a flower
  if(e.which == 70 && e.altKey == true) {
     renderNewFlower();
     return false;
  }
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(randomRange(min, max));
}
function randomBool() {
  return randomInt(0,2) === 1;
}

function deform(data, center, nodeSize, nodeCount) {
  for (var i=0; i<data.length; i++) {
    var xScale = randomRange(.7 + .2 * (10-nodeCount), 1 + .2 * (10-nodeCount));
    var yScale = randomRange(.9, 1.4);

    data[i].x *= xScale;
    data[i].y *= yScale;

    data[i].x *= nodeSize;
    data[i].y *= nodeSize;

    data[i].x += center.x;
    data[i].y += center.y;
  }
}

function deformSymmetric(data, center, nodeSize, nodeCount) {
  for (var i=1; i<data.length/2; i++) {
    var xScale = randomRange(.4 + .2 * (10-nodeCount), 1 + .2 * (10-nodeCount));
    var yScale = randomRange(.9, 1.4);

    data[i].x *= xScale;
    data[i].y *= yScale;
    data[(data.length-i)].x *= xScale;
    data[(data.length-i)].y *= yScale;

    data[i].x *= nodeSize;
    data[i].y *= nodeSize;
    data[(data.length-i)].x *= nodeSize;
    data[(data.length-i)].y *= nodeSize;
  }

  for (var i=0; i<data.length; i++) {
    data[i].x += center.x;
    data[i].y += center.y;
  }
}

function genPetalFill(moreRed, moreGreen) {
  var petalR = moreRed ? randomInt(200, 255) : randomInt(17, 120);
  var petalG = moreGreen ? randomInt(150,petalR) : randomInt(17, 100);
  var petalB = Math.max(17, 255-petalR);

  var petalFill = "#" + petalR.toString(16) + petalG.toString(16) + petalB.toString(16);
  return petalFill;
}

function genLeafFill() {
  var leafR = randomInt(17,90);
  var leafB = randomInt(17,70);
  var leafG = randomInt(Math.max(leafR, leafB),170);

  var leafFill = "#" + leafR.toString(16) + leafG.toString(16) + leafB.toString(16);
  return leafFill;
}

function renderNewFlower() {
  var leafData = [ { "x": 0,  "y": 0},
                   { "x": 10,  "y": 5},
                   { "x": 15,  "y": 20},
                   { "x": 10,  "y": 40},
                   { "x": 5,  "y": 40},
                   { "x": 0,  "y": 50},
                   { "x": 0,  "y": 50},
                   { "x": -5,  "y": 40},
                   { "x": -10,  "y": 40},
                   { "x": -15,  "y": 20},
                   { "x": -10, "y": 5}];

  var petalLayers = randomInt(1,4);
  var petalData = [];

  for (var i=0; i<petalLayers; i++) {
    petalData.push([ { "x": 0,  "y": 0},
                   { "x": 5,  "y": 5},
                   { "x": 5,  "y": 10},
                   { "x": 15,  "y": 30},
                   { "x": 15,  "y": 40},
                   { "x": 1,  "y": 40},
                   { "x": -1,  "y": 40},
                   { "x": -15,  "y": 40},
                   { "x": -15,  "y": 30},
                   { "x": -5,  "y": 10},
                   { "x": -5, "y": 5}]);
  }

  // make the entire page into an svg container.
  var svgBackground = d3.select("body").append("svg")
                                      .attr("width", "100%")
                                      .attr("height", "100%")
                                      .attr("style", "position:absolute; background:#eeeeee; opacity:0.1");
  var svgContainer = d3.select("body").append("svg")
                                      .attr("width", "100%")
                                      .attr("height", "100%")
                                      .attr("style", "position:absolute;");
  var svgDom = svgContainer[0][0];

  // random seeds
  var center = {"x": randomRange(20, svgDom.clientWidth), "y": randomRange(20, svgDom.clientHeight)};
  var petalSize = randomRange(1, 3);
  var centerSize = petalSize * randomRange(2, 8);
  var petalCount = randomInt(4 + (3-petalSize), 10);
  var petalRotation = 360.0/petalCount * (randomBool() ? 1.0 : -1.0);

  var leafCount = randomInt(6, 9);
  var leafSize = petalSize + randomRange(0,0.5);
  var leafRotation = 360.0/leafCount * (randomBool() ? 1.0 : -1.0);
  var leafRotationOffset = randomInt(0, 60);
  var centerOn = randomBool();

  // print our random values for debugging.
  console.log("petalSize", petalSize, "petalCount", petalCount, "center", centerOn && centerSize, "petalLayers", petalLayers);

  var layerSize = petalSize;
  for (var i=0; i<petalLayers; i++) {
    // each petal layer is independently deformed.
    deformSymmetric(petalData[i], center, layerSize, petalCount);

    // make each subsequent layer slightly smaller than the previous.
    layerSize *= randomRange(0.5, 0.8);
  }

  // now deform the leaves, which are not deformed symmetrically the way the petals are.
  deform(leafData, center, leafSize, leafCount);

  var centerG = randomInt(200,255);
  var centerR = randomInt(centerG,255);
  var centerB = randomInt(17,19);
  var centerFill = "#" + centerR.toString(16) + centerG.toString(16) + centerB.toString(16);

  var moreRed = randomBool() || randomBool();
  var moreGreen = moreRed && randomBool() && randomBool();

  // each petal gets a random fill color, but all petals use a similar palette,
  // as controlled by moreRed and/or moreGreen.
  var petalFill = [];
  for (var i=0; i<petalLayers; i++) {
    petalFill[i] = genPetalFill(moreRed, moreGreen);
  }

  var leafFill = genLeafFill();

  var centerBackground = svgContainer.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', centerSize+1)
        .attr('fill', leafFill)
        .attr('stroke', "black");

  var bezRender = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("basis-closed");

  for (var i=0; i<leafCount; i++) {
    for (var j=0; j<leafData.length; j++) {
      leafData[j].x += randomRange(-petalSize, petalSize);
      leafData[j].y += randomRange(-petalSize, petalSize);
    }

    var rot = (i*leafRotation) + leafRotationOffset;
    var leafRender = svgContainer.append("path")
            .attr("d", bezRender(leafData))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", leafFill)
            .attr("transform",
                  "rotate(" + rot + ", " + center.x + ", " + center.y + ")");
  }

  for (var layer=0; layer<petalLayers; layer++) {
    var petalRotationOffset = randomInt(0, 180);
    var perturbScale = petalSize*2.0/(layer+1);

    for (var i=0; i<petalCount; i++) {
      // slightly perturb each petal differently.
      for (var j=0; j<petalData.length; j++) {
        petalData[layer][j].x += randomRange(-perturbScale, perturbScale);
        petalData[layer][j].y += randomRange(-perturbScale, perturbScale);
      }

      var rot = (i*petalRotation) + petalRotationOffset;

      var petalRender = svgContainer.append("path")
              .attr("d", bezRender(petalData[layer]))
              .attr("stroke", "black")
              .attr("stroke-width", 2)
              .attr('fill', petalFill[layer])
              .attr("transform",
                    "rotate(" + rot + ", " + center.x + ", " + center.y + ")");
    }
  }

  if (centerOn) {
    var centerCircle = svgContainer.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', centerSize)
        .attr('fill', centerFill)
        .attr('stroke', "black");
  }
}
