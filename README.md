# cytoscape-dagre-multi

modification of cytoscape-dagre to allow multilevel formatting
In order to create your own build first NPM install in the folder that contains cytoscape-dagre-multi.js
Then use npm run build
Once it generates a new cytoscape-dagre-multi.js, open it and add the following line of code to line 84
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
Save and you can now copy over the existing cytoscape-dagre-multi.js file in the appropriate /node_modules/ folder
