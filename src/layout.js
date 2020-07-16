const isFunction = function(o){ return typeof o === 'function'; };
const defaults = require('./defaults');
const assign = require('./assign');
const potpackweighted = require('potpackweighted');

// constructor
// options : object containing layout options
function MultilayerLayout(options) {
  this.options = assign({}, defaults, options);
}

// runs the layout
MultilayerLayout.prototype.run = function () {
  var options = this.options;
  var layout = this;
  var runonce = false;
  var cy = options.cy; // cy is automatically populated for us in the constructor

  if (typeof MultilayerLayout.runonce == 'undefined') {
    MultilayerLayout.runonce = false;
  }
  if (!MultilayerLayout.runonce) {

    cy.style([{
      selector: "node",
      style: {
        "background-color": "#3b4252",
        label: "data(label)",
        "text-valign": "center",
        color: "#eceff4",
        "text-outline-color": "#3b4252",
        "text-outline-opacity": "0.75",
        "text-wrap": "ellipsis",
        "text-max-width": "250px",
        "text-outline-width": "2px"
      }
    }, {
      selector: "edge",
      style: {
        width: 3,
        "target-arrow-shape": "triangle",
        "line-color": "#88c0d0",
        "target-arrow-color": "#88c0d0",
        "curve-style": "taxi",
        "taxi-direction": "horizontal",
        "taxi-turn": "100%"
      }
    }]);

    // Colors for node selection
    var color = {
      node: {
        root: {
          selected: "#bf616a",
          notSelected: "#3b4252"
        },
        child: {
          selected: "#a3be8c",
          notSelected: "#3b4252"
        }
      }
    };

    var eles = options.eles;

    var getVal = function getVal(ele, val) {
      return isFunction(val) ? val.apply(ele, [ele]) : val;
    };

	var nodes = eles.nodes().sort();
    var nearest_sqrt = function nearest_sqrt(n) {
      return Math.sqrt(Math.pow(Math.round(Math.sqrt(n)), 2));
    };

    var highest_weight = function highest_weight(a, b) {
      if (b._private.data.weight == undefined) b._private.data.weight = 0;
      if (a._private.data.weight == undefined) a._private.data.weight = 0;
      return b._private.data.weight - a._private.data.weight;
    };
    //   this._private.cy.elements().roots()
    var maxWidth = 6000;
    var roots = this._private.cy.elements().roots().sort(highest_weight);
    this._private.cy.elements().scratch('moved', false);
    for (var i = 0; i < roots.size(); i++) {
      //label each successor with the id of one of it's parents
      var successors = roots[i].successors().sort(highest_weight);
      for (var j = 0; j < successors.size(); j++) {
        if (successors[j]._private.scratch.moved !== true) {
          successors[j].scratch('moved', true);
          successors[j].scratch('root', roots[i]._private.data.id); //each successor will only have 1 root recorded in scratch, even if it is successor to multiple
        }
      }
    }
    for (var i = 0; i < roots.size(); i++) {
      var successors = roots[i].successors().sort(highest_weight);
      var edges = roots[i].successors().sort(highest_weight);
      var n = 0,
          nodeCount = 0;

      for (var m = 0; m < successors.size(); m++) {
        if (successors[m]._private.group == "nodes") {
          successors[n] = successors[m];
          n++;
        } else if (successors[m]._private.group == "edges") {
          edges[n] = edges[m];
          nodeCount++;
        }
      }
      nodes = successors.slice(0, n + 1);

      edges = edges.slice(0, nodeCount + 1);
      var containInPrevRoot = function containInPrevRoot(targetID, roots) {
        for (var b = 0; b < i; b++) {
          var _successors = roots[b].successors().sort(highest_weight);
          for (var a = 0; a < _successors.size(); a++) {
            if (_successors[a]._private.data.id == targetID) {
              roots[b]._private.scratch.prevSharedNodes += 1;
              return true;
            }
          }
        }
        return false;
      };
      var sharedCount = 0;

      // If node appears in prev roots, it sets current root to node as bezier curve
      for (var x = 0; x < nodeCount; x++) {
        if (i > 0) {
          var _successors2 = roots[i - 1].successors().sort(highest_weight);
          for (var a = 0; a < _successors2.size(); a++) {
            if (_successors2[a]._private.data.id == edges[x]._private.data.target) {
              sharedCount++;
            }
          }
        }
        if (containInPrevRoot(edges[x]._private.data.target, roots)) {
          edges[x].style("curve-style", "unbundled-bezier");
        }
      }
      if (n > 0) {
        var nodesPerColumn = nearest_sqrt(n - sharedCount);
        var topLeftSuccessorY = roots[i]._private.position.y + 100;
        var topLeftSuccessorX = roots[i]._private.position.x; //nodesPerColumn is sqrt rounded down
        var j = 0;
        var row = 0;
        var firstNode = true;
        while (j < n) {
          for (var k = 0; k < nodesPerColumn && j < n; k++) {
            if (nodes[j]._private.scratch.root == roots[i]._private.data.id && !containInPrevRoot(nodes[j]._private.data.id, roots)) {
              nodes[j].position("y", topLeftSuccessorY + k * 100);
              nodes[j].position("x", topLeftSuccessorX + 200 * row);
              nodes[j].scratch("x1", topLeftSuccessorX + 200 * row); //update bodybounds));
              nodes[j].scratch("x2", topLeftSuccessorX + 200 * row); //update bodybounds));
              nodes[j].scratch("y1", topLeftSuccessorY + k * 100);
              nodes[j].scratch("y2", topLeftSuccessorY + k * 100);
              // roots[i].scratch("xMax", nodes[j]._private.position.x);
              if (firstNode) {
                //  roots[i].scratch("xMin", nodes[j]._private.position.x);
                firstNode = false;
              }
            } else {
              k--;
            }
            j++;
          }
          row++;
        }
      }
    }
    for (var i = 0; i < roots.size(); i++) //find out bounding boxes for each group of nodes
    {
	  console.log(roots[i].successors());
      //var minX = roots[i]._private.bodyBounds.x1; //initialize variables to determine bounding box for root and it's children
	  var minX = roots[i]._private.position.x - (roots[i].numericStyle('width'))/2;
      var maxX = roots[i]._private.position.x + (roots[i].numericStyle('width'))/2; //uses the root node's bounding box to start with
      var minY = roots[i]._private.position.y - (roots[i].numericStyle('height'))/2;
      var maxY = roots[i]._private.position.y - (roots[i].numericStyle('height'))/2;
      successors = roots[i].successors();
      for (var k = 0; k < successors.size(); k++) {
        if (successors[k]._private.scratch.root == roots[i]._private.data.id) //if successor has this root node recorded as 'root'  in scratch
          {
            if (successors[k]._private.scratch.x1 < minX) minX = successors[k]._private.scratch.x1;
            if (successors[k]._private.scratch.x2 > maxX) maxX = successors[k]._private.scratch.x2;
            if (successors[k]._private.scratch.y1 < minY) minY = successors[k]._private.scratch.y1;
            if (successors[k]._private.scratch.y2 > maxY) maxY = successors[k]._private.scratch.y2;
          }
      }
      roots[i].scratch('minX', minX); //add bounding box attributes to scratch for the root
      roots[i].scratch('maxX', maxX);
      roots[i].scratch('minY', minY);
      roots[i].scratch('maxY', maxY);
    }
    //curve styling here

    //Rectangle packing here
    var boxes = [];
    for (var i = 0; i < roots.size(); i++) {
      //create structure for potpack module
      boxes.push({ w: roots[i]._private.scratch.maxX - roots[i]._private.scratch.minX + 150, h: roots[i]._private.scratch.maxY - roots[i]._private.scratch.minY + 150, root: i, weight: roots[i]._private.data.weight }); //potpack reorders the list so adding indicator for original root
    }
    var _potpackweighted$defa = potpackweighted.default(boxes),
        w = _potpackweighted$defa.w,
        h = _potpackweighted$defa.h,
        fill = _potpackweighted$defa.fill;

    for (var i = 0; i < roots.size(); i++) //find out bounding boxes for each group of nodes
    {
      for (var j = 0; j < boxes.length; j++) {
        if (boxes[j].root == i) {
          var moveX = boxes[j].x - roots[i]._private.position.x;
          var moveY = boxes[j].y - roots[i]._private.position.y;
          roots[i].shift({ x: moveX, y: moveY });
          successors = roots[i].successors();
          for (var k = 0; k < successors.size(); k++) {
            if (successors[k]._private.scratch.root == roots[i]._private.data.id) //if successor has this root node recorded as 'root'  in scratch
              {
                successors[k].shift({ x: moveX, y: moveY });
              }
          }
        }
      }
    }

    //this._private.cy.fit();
  }
  MultilayerLayout.runonce = true;
  return this; // chaining
};

module.exports = MultilayerLayout;

