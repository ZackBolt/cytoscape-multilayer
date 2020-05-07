(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("dagre"), require("potpack"));
	else if(typeof define === 'function' && define.amd)
		define(["dagre", "potpack"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeDagreMulti"] = factory(require("dagre"), require("potpack"));
	else
		root["cytoscapeDagreMulti"] = factory(root["dagre"], root["potpack"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
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
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isFunction = function isFunction(o) {
  return typeof o === 'function';
};
var defaults = __webpack_require__(2);
var assign = __webpack_require__(1);
var dagre = __webpack_require__(4);
var potpack = __webpack_require__(5);

// constructor
// options : object containing layout options
function DagreLayout(options) {
  this.options = assign({}, defaults, options);
}

// runs the layout
DagreLayout.prototype.run = function () {
  var options = this.options;
  var layout = this;

  var cy = options.cy; // cy is automatically populated for us in the constructor
  var eles = options.eles;

  var getVal = function getVal(ele, val) {
    return isFunction(val) ? val.apply(ele, [ele]) : val;
  };

  var bb = options.boundingBox || { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
  if (bb.x2 === undefined) {
    bb.x2 = bb.x1 + bb.w;
  }
  if (bb.w === undefined) {
    bb.w = bb.x2 - bb.x1;
  }
  if (bb.y2 === undefined) {
    bb.y2 = bb.y1 + bb.h;
  }
  if (bb.h === undefined) {
    bb.h = bb.y2 - bb.y1;
  }

  var g = new dagre.graphlib.Graph({
    multigraph: true,
    compound: true
  });

  var gObj = {};
  var setGObj = function setGObj(name, val) {
    if (val != null) {
      gObj[name] = val;
    }
  };

  setGObj('nodesep', options.nodeSep);
  setGObj('edgesep', options.edgeSep);
  setGObj('ranksep', options.rankSep);
  setGObj('rankdir', options.rankDir);
  setGObj('ranker', options.ranker);

  g.setGraph(gObj);

  g.setDefaultEdgeLabel(function () {
    return {};
  });
  g.setDefaultNodeLabel(function () {
    return {};
  });

  // add nodes to dagre
  var nodes = eles.nodes();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var nbb = node.layoutDimensions(options);

    g.setNode(node.id(), {
      width: nbb.w,
      height: nbb.h,
      name: node.id()
    });

    // console.log( g.node(node.id()) );
  }

  // set compound parents
  for (var _i = 0; _i < nodes.length; _i++) {
    var _node = nodes[_i];

    if (_node.isChild()) {
      g.setParent(_node.id(), _node.parent().id());
    }
  }

  // add edges to dagre
  var edges = eles.edges().stdFilter(function (edge) {
    return !edge.source().isParent() && !edge.target().isParent(); // dagre can't handle edges on compound nodes
  });
  for (var _i2 = 0; _i2 < edges.length; _i2++) {
    var edge = edges[_i2];

    g.setEdge(edge.source().id(), edge.target().id(), {
      minlen: getVal(edge, options.minLen),
      weight: getVal(edge, options.edgeWeight),
      name: edge.id()
    }, edge.id());

    // console.log( g.edge(edge.source().id(), edge.target().id(), edge.id()) );
  }

  dagre.layout(g);

  var gNodeIds = g.nodes();
  for (var _i3 = 0; _i3 < gNodeIds.length; _i3++) {
    var id = gNodeIds[_i3];
    var n = g.node(id);

    cy.getElementById(id).scratch().dagre = n;
  }

  var dagreBB = void 0;

  if (options.boundingBox) {
    dagreBB = { x1: Infinity, x2: -Infinity, y1: Infinity, y2: -Infinity };
    nodes.forEach(function (node) {
      var dModel = node.scratch().dagre;

      dagreBB.x1 = Math.min(dagreBB.x1, dModel.x);
      dagreBB.x2 = Math.max(dagreBB.x2, dModel.x);

      dagreBB.y1 = Math.min(dagreBB.y1, dModel.y);
      dagreBB.y2 = Math.max(dagreBB.y2, dModel.y);
    });

    dagreBB.w = dagreBB.x2 - dagreBB.x1;
    dagreBB.h = dagreBB.y2 - dagreBB.y1;
  } else {
    dagreBB = bb;
  }

  var constrainPos = function constrainPos(p) {
    if (options.boundingBox) {
      var xPct = dagreBB.w === 0 ? 0 : (p.x - dagreBB.x1) / dagreBB.w;
      var yPct = dagreBB.h === 0 ? 0 : (p.y - dagreBB.y1) / dagreBB.h;

      return {
        x: bb.x1 + xPct * bb.w,
        y: bb.y1 + yPct * bb.h
      };
    } else {
      return p;
    }
  };

  var nearest_sqrt = function nearest_sqrt(n) {
    return Math.sqrt(Math.pow(Math.round(Math.sqrt(n)), 2));
  };

  nodes.layoutPositions(layout, options, function (ele) {
    ele = (typeof ele === 'undefined' ? 'undefined' : _typeof(ele)) === "object" ? ele : this;
    var dModel = ele.scratch().dagre;

    return constrainPos({
      x: dModel.x,
      y: dModel.y
    });
  });
  //   this._private.cy.elements().roots()
  var maxWidth = 6000;
  var roots = this._private.cy.elements().roots();
	/* //enable to utilize taxi style layout
	this._private.cy.style()
  .selector('edge')
    .style({
      'curve-style': 'taxi',
	  'direction': 'upward'
    })
	.update() // indicate the end of your new stylesheet so that it can be updated on elements
;
	*/
  this._private.cy.elements().scratch('moved', false);
  for (var i = 0; i < roots.size(); i++) {
    //don't allow the roots to move as successors
    roots[i].scratch('moved', true);
  }for (var i = 0; i < roots.size(); i++) {
    //label each successor with the id of one of it's parents
    var successors = roots[i].successors();
    if (successors.size() > 0) {
      for (var k = 0; k < successors.size(); k++) {
        if (successors[k]._private.scratch.moved !== true) {
          successors[k].scratch('moved', true);
          successors[k].scratch('root', roots[i]._private.data.id); //each successor will only have 1 root recorded in scratch, even if it is successor to multiple
        }
      }
    }
  }

  for (var i = 0; i < roots.size(); i++) {
    var successors = roots[i].successors();
    if (successors.size() > 0) {
      var nodesPerColumn = nearest_sqrt(successors.size());
      var topLeftSuccessorY = roots[i]._private.position.y + nodesPerColumn * 20;
      var topLeftSuccessorX = roots[i]._private.position.x - 45 * (successors.size() / nodesPerColumn); //nodesPerColumn is sqrt rounded down
      var j = 0;
      var row = 0;
      while (j < successors.size()) {
        for (var k = 0; k < nodesPerColumn && j < successors.size(); k++) {
          if (successors[j]._private.scratch.root == roots[i]._private.data.id) {
            successors[j].position('y', topLeftSuccessorY + k * 45);
            successors[j].position('x', topLeftSuccessorX + 130 * row);
            successors[j].scratch('x1', topLeftSuccessorX + 130 * row - 16); //update bodybounds));
            successors[j].scratch('x2', topLeftSuccessorX + 130 * row + 16); //update bodybounds));
            successors[j].scratch('y1', topLeftSuccessorY + k * 45 - 16);
            successors[j].scratch('y2', topLeftSuccessorY + k * 45 + 16);
          }
          j++;
        }
        row++;
      }
    }
  }

  //console.log(roots);

  console.log(roots);
  for (var i = 0; i < roots.size(); i++) //find out bounding boxes for each group of nodes
  {
    var minX = roots[i]._private.bodyBounds.x1; //initialize variables to determine bounding box for root and it's children
    var maxX = roots[i]._private.bodyBounds.x2; //uses the root node's bounding box to start with
    var minY = roots[i]._private.bodyBounds.y1;
    var maxY = roots[i]._private.bodyBounds.y2;
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
  //Rectangle packing here
  var boxes = [];
  for (var i = 0; i < roots.size(); i++) {
    //create structure for potpack module
    boxes.push({ w: roots[i]._private.scratch.maxX - roots[i]._private.scratch.minX, h: roots[i]._private.scratch.maxY - roots[i]._private.scratch.minY, root: i }); //potpack reorders the list so adding indicator for original root
  }

  var _potpack$default = potpack.default(boxes),
      w = _potpack$default.w,
      h = _potpack$default.h,
      fill = _potpack$default.fill;

  console.log(boxes);

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
  return this; // chaining
};

module.exports = DagreLayout;

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
  // dagre algo options, uses default value on undefined
  nodeSep: undefined, // the separation between adjacent nodes in the same rank
  edgeSep: undefined, // the separation between adjacent edges in the same rank
  rankSep: undefined, // the separation between adjacent nodes in the same rank
  rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
  ranker: undefined, // Type of algorithm to assigns a rank to each node in the input graph.
  // Possible values: network-simplex, tight-tree or longest-path
  minLen: function minLen(edge) {
    return 1;
  }, // number of ranks to keep between the source and target of the edge
  edgeWeight: function edgeWeight(edge) {
    return 1;
  }, // higher weight edges are generally made shorter and straighter than lower weight edges

  // general layout options
  fit: true, // whether to fit to viewport
  padding: 30, // fit padding
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
  animate: false, // whether to transition the node positions
  animateFilter: function animateFilter(node, i) {
    return true;
  }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  transform: function transform(node, pos) {
    return pos;
  }, // a function that applies a transform to the final node position
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

  cytoscape('layout', 'dagre', impl); // register with cytoscape.js
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

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ })
/******/ ]);
});