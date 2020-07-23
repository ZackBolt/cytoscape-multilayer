(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("potpackweighted"));
	else if(typeof define === 'function' && define.amd)
		define(["potpackweighted"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeMultilayer"] = factory(require("potpackweighted"));
	else
		root["cytoscapeMultilayer"] = factory(root["potpackweighted"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isFunction = function isFunction(o) {
  return typeof o === 'function';
};
var defaults = __webpack_require__(2);
var assign = __webpack_require__(1);
var potpackweighted = __webpack_require__(4);

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

    var nodes = eles.nodes().sort(highest_weight);
    var nearest_sqrt = function nearest_sqrt(n) {
      return Math.sqrt(Math.pow(Math.round(Math.sqrt(n)), 2));
    };

    var highest_weight = function highest_weight(a, b) {
      if (b._private.data.weight == undefined) b._private.data.weight = 0;
      if (a._private.data.weight == undefined) a._private.data.weight = 0;
      return b._private.data.weight - a._private.data.weight;
    };
    //   this._private.cy.elements().roots()
    var maxWidth = options.layoutWidth;
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
              nodes[j].position("y", topLeftSuccessorY + k * options.nodeYSep);
              nodes[j].position("x", topLeftSuccessorX + options.nodeXSep * row);
              nodes[j].scratch("x1", topLeftSuccessorX + options.nodeXSep * row); //update bodybounds));
              nodes[j].scratch("x2", topLeftSuccessorX + options.nodeXSep * row); //update bodybounds));
              nodes[j].scratch("y1", topLeftSuccessorY + k * options.nodeYSep);
              nodes[j].scratch("y2", topLeftSuccessorY + k * options.nodeYSep);
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
      //var minX = roots[i]._private.bodyBounds.x1; //initialize variables to determine bounding box for root and it's children
      var minX = roots[i]._private.position.x - roots[i].numericStyle('width') / 2;
      var maxX = roots[i]._private.position.x + roots[i].numericStyle('width') / 2; //uses the root node's bounding box to start with
      var minY = roots[i]._private.position.y - roots[i].numericStyle('height') / 2;
      var maxY = roots[i]._private.position.y - roots[i].numericStyle('height') / 2;
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
      boxes.push({ w: roots[i]._private.scratch.maxX - roots[i]._private.scratch.minX + options.groupSep, h: roots[i]._private.scratch.maxY - roots[i]._private.scratch.minY + options.groupSep, root: i, weight: roots[i]._private.data.weight }); //potpack reorders the list so adding indicator for original root
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = {
  nodeXSep: 200, // the X axis space between adjacent nodes in the same rank
  nodeYSep: 100, // the Y axis space between adjacent nodes in the same rank
  groupSep: 150, // the space between adjacent parent/children groups
  layoutWidth: 6000, //the maximum width of the layout
  ready: function ready() {}, // on layoutready
  stop: function stop() {} // on layoutstop
};

module.exports = defaults;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'multilayer', impl); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ })
/******/ ]);
});