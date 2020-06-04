const isFunction = function(o){ return typeof o === 'function'; };
const defaults = require('./defaults');
const assign = require('./assign');
const dagre = require('dagre');
const potpack = require('potpack');

// constructor
// options : object containing layout options
function DagreLayout( options ){
  this.options = assign( {}, defaults, options );
}

// runs the layout
DagreLayout.prototype.run = function(){
  var options = this.options;
  var layout = this;
  var runonce = false;
  var cy = options.cy; // cy is automatically populated for us in the constructor
  if( typeof DagreLayout.runonce == 'undefined' ) {
        DagreLayout.runonce = false;
    }
  if (!DagreLayout.runonce)
  {
  
          cy.style([
          {
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
          },
          {
            selector: "edge",
            style: {
              width: 3,
              "target-arrow-shape": "triangle",
              "line-color": "#88c0d0",
              "target-arrow-color": "#88c0d0",
              "curve-style": "taxi",
              "taxi-direction": "vertical",
              "taxi-turn": "100%"
            }
          }
        ]);

        // Colors for node selection
        let color = {
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

  const nearest_sqrt = n => Math.sqrt(Math.pow(Math.round(Math.sqrt(n)), 2));

  nodes.layoutPositions(layout, options, function (ele) {
    ele = typeof ele === "object" ? ele : this;
    var dModel = ele.scratch().dagre;

    return constrainPos({
      x: dModel.x,
      y: dModel.y
    });
  });
  //   this._private.cy.elements().roots()
	var maxWidth = 6000;
	var roots = this._private.cy.elements().roots();
	
	this._private.cy.elements().scratch('moved', false);
	for (var i = 0; i < roots.size();i++) //don't allow the roots to move as successors
		roots[i].scratch('moved', true);
	
	for (var i = 0; i < roots.size(); i++) { //label each successor with the id of one of it's parents
      var successors = roots[i].successors();       
		if (successors.size() > 0){
			for (var k = 0; k < successors.size(); k++) {
				if (successors[k]._private.scratch.moved !== true) {
					successors[k].scratch('moved', true);
					successors[k].scratch('root', roots[i]._private.data.id); //each successor will only have 1 root recorded in scratch, even if it is successor to multiple
				}
			}
		}
	}
  //caleb's code here
          for (var i = 0; i < roots.size(); i++) {
          var successors = roots[i].successors();
          var edges = roots[i].successors();
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
          var containInPrevRoot = (targetID, roots) => {
            for (var b = 0; b < i; b++) {
              let successors = roots[b].successors();
              for (var a = 0; a < successors.size(); a++) {
                if (successors[a]._private.data.id == targetID) {
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
              let successors = roots[i - 1].successors();
              for (var a = 0; a < successors.size(); a++) {
                if (
                  successors[a]._private.data.id ==
                  edges[x]._private.data.target
                ) {
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
            var topLeftSuccessorX = roots[i]._private.position.x;			//nodesPerColumn is sqrt rounded down
            var j = 0;
            var row = 0;
            var firstNode = true;
            while (j < n) {
              for (var k = 0; k < nodesPerColumn && j < n; k++) {
                if (
                  nodes[j]._private.scratch.root == roots[i]._private.data.id &&
                  !containInPrevRoot(nodes[j]._private.data.id, roots)
                ) {
                  nodes[j].position("y", topLeftSuccessorY + k * 100);
                  nodes[j].position("x", topLeftSuccessorX + 200 * row);
                  nodes[j].scratch("x1", topLeftSuccessorX + 200 * row); //update bodybounds));
                  nodes[j].scratch("x2", topLeftSuccessorX + 200 * row); //update bodybounds));
                  nodes[j].scratch("y1", topLeftSuccessorY + k * 100);
                  nodes[j].scratch("y2", topLeftSuccessorY + k * 100);
                  roots[i].scratch("xMax", nodes[j]._private.position.x);
				  nodes[j].style("taxi-turn", 200*row + "px");
                  if (firstNode) {
                    roots[i].scratch("xMin", nodes[j]._private.position.x);
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
		
		//caleb's code ends
/*  for (var i = 0; i < roots.size(); i++)
	{
    var successors = roots[i].successors();
    if (successors.size()>0)
    {
      var nodesPerColumn = nearest_sqrt(successors.size());
      var topLeftSuccessorY = roots[i]._private.position.y + nodesPerColumn*20;
      var topLeftSuccessorX = roots[i]._private.position.x - (45*(successors.size()/nodesPerColumn)); //nodesPerColumn is sqrt rounded down
      var j = 0;
      var row = 0;
      while (j<successors.size())
      {
        for (var k = 0; k < nodesPerColumn && (j<successors.size()); k++)
        {
			if(successors[j]._private.scratch.root == roots[i]._private.data.id)
			{
				successors[j].position('y', topLeftSuccessorY + k*45);
				successors[j].position('x', topLeftSuccessorX + (130*row));
				successors[j].scratch('x1', (topLeftSuccessorX + (130*row) - 16)); //update bodybounds));
				successors[j].scratch('x2', (topLeftSuccessorX + (130*row) + 16)); //update bodybounds));
				successors[j].scratch('y1', (topLeftSuccessorY + k*45 - 16));
				successors[j].scratch('y2', (topLeftSuccessorY + k*45 + 16));
			}
          j++;
        }
        row++;
      }
    }
  }
  */
  
     //console.log(roots);

	//console.log(roots);
	for (var i = 0; i < roots.size(); i++) //find out bounding boxes for each group of nodes
	{
		var minX = roots[i]._private.bodyBounds.x1; //initialize variables to determine bounding box for root and it's children
		var maxX = roots[i]._private.bodyBounds.x2; //uses the root node's bounding box to start with
		var minY = roots[i]._private.bodyBounds.y1;
		var maxY = roots[i]._private.bodyBounds.y2;
		successors = roots[i].successors();
		for (var k = 0; k < successors.size(); k++)
		{
			if (successors[k]._private.scratch.root == roots[i]._private.data.id) //if successor has this root node recorded as 'root'  in scratch
			{
				if (successors[k]._private.scratch.x1 < minX)
					minX = successors[k]._private.scratch.x1;
				if (successors[k]._private.scratch.x2 > maxX)
					maxX = successors[k]._private.scratch.x2;
				if (successors[k]._private.scratch.y1 < minY)
					minY = successors[k]._private.scratch.y1;
				if (successors[k]._private.scratch.y2 > maxY)
					maxY = successors[k]._private.scratch.y2;
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
	for (var i = 0; i < roots.size(); i++) { //create structure for potpack module
		boxes.push({w: (roots[i]._private.scratch.maxX - roots[i]._private.scratch.minX) + 150, h: (roots[i]._private.scratch.maxY - roots[i]._private.scratch.minY) + 150, root: i}); //potpack reorders the list so adding indicator for original root
		}
		
	
	const {w, h, fill} = potpack.default(boxes);
	//console.log(boxes);	
	
	for (var i = 0; i < roots.size(); i++) //find out bounding boxes for each group of nodes
	{
		for (var j = 0; j < boxes.length; j++)
			if(boxes[j].root == i)
			{
				var moveX = boxes[j].x - roots[i]._private.position.x;
				var moveY = boxes[j].y - roots[i]._private.position.y;
				roots[i].shift({ x: moveX, y: moveY });
				successors = roots[i].successors();
				for (var k = 0; k < successors.size(); k++)
				{
					if (successors[k]._private.scratch.root == roots[i]._private.data.id) //if successor has this root node recorded as 'root'  in scratch
					{
						successors[k].shift({ x: moveX, y: moveY });
					}
				}
			}
	}

  //this._private.cy.fit();
  }
  DagreLayout.runonce = true;
  return this; // chaining
};

module.exports = DagreLayout;
