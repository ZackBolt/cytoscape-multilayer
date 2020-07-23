let defaults = {
  nodeXSep: 200, // the X axis space between adjacent nodes in the same rank
  nodeYSep: 100, // the Y axis space between adjacent nodes in the same rank
  groupSep: 150, // the space between adjacent parent/children groups
  layoutWidth: 6000, //the maximum width of the layout
  ready: function ready() {}, // on layoutready
  stop: function stop() {} // on layoutstop
};

module.exports = defaults;
