let defaults = {
  nodeXSep: 200, // the X axis space between adjacent nodes in the same rank
  nodeYSep: 100, // the Y axis space between adjacent nodes in the same rank
  groupSep: 150, // the space between adjacent parent/children groups
  layoutWidth: 6000, //the maximum width of the layout
  weightFunction: function (a, b) {if(b == undefined && a == undefined) return 0; if (b._private.data.weight == undefined) b._private.data.weight = 0; if (a._private.data.weight == undefined) a._private.data.weight = 0; return b._private.data.weight - a._private.data.weight;}, //formula applied to each node to organize them by weight.  currently has error checking to avoid undefined errors.
  ready: function ready() {}, // on layoutready
  stop: function stop() {} // on layoutstop
};

module.exports = defaults;
