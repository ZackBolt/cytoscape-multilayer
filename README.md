cytoscape-multilayer
================================================================================
## Description

This is a layout extension for [Cytoscape.js](https://github.com/cytoscape/cytoscape.js).

The `multilayer` layout organises the graph using a DAG (directed acyclic graph) system, written by [Zachary Bolt](https://ualr.edu/computerscience/zachary-bolt-b-sc-graduate-assistant-lecturer/).  It is especially suitable for DAGs and trees with large numbers of children.  For more information, please refer to its [Dagre's documentation](https://github.com/cpettitt/dagre).
It has been structured to also group children into boxes and add a maximum width for the graph.

## Dependencies

 * Cytoscape.js ^3.2.0
 * potpackweighted ^1.0.2


## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-multilayer`,
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import cytoscape from 'cytoscape';
import multilayer from 'cytoscape-multilayer';

cytoscape.use( multilayer );
```

CommonJS require:

```js
let cytoscape = require('cytoscape');
let multilayer = require('cytoscape-multilayer');

cytoscape.use( multilayer ); // register extension
```

AMD:

```js
require(['cytoscape', 'cytoscape-multilayer'], function( cytoscape, multilayer ){
  multilayer( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API
These are a holdover from templating this project from cytoscape-dagre module and are currently NON FUNCTIONING.  
Call the layout, e.g. `cy.layout({ name: 'multilayer', ... }).run()`, with options:

```js
var defaults = {
  // multilayer algo options, uses default value on undefined
  nodeSep: undefined, // the separation between adjacent nodes in the same rank
  edgeSep: undefined, // the separation between adjacent edges in the same rank
  rankSep: undefined, // the separation between adjacent nodes in the same rank
  rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
  ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
  minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
  edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

  // general layout options
  fit: true, // whether to fit to viewport
  padding: 30, // fit padding
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
  animate: false, // whether to transition the node positions
  animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
  ready: function(){}, // on layoutready
  stop: function(){} // on layoutstop
};
```


## Build targets

* `npm run test` : Run Mocha tests in `./test`
* `npm run build` : Build `./src/**` into `cytoscape-multilayer.js`
* `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
* `npm run dev` : Automatically build on changes with live reloading with webpack dev server
* `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.

## Development usage from another package

* `cd my-other-package`
* `npm install --save <path-to-cytoscape-multilayer>`

  This creates a link in `my-other-package` to the local version of `cytoscape-multilayer`.

* Modify `cytoscape-multilayer` to add features/fix bugs
* `npm run build`

  To rebuild the `cytoscape-multilayer.js` library - `my-other-package` automatically picks up the updated library.

* Alternatively run `npm run watch` in `cytoscape-multilayer.js` to automatically rebuild on every file save.

## Publishing instructions

This project is set up to automatically be published to npm.  To publish:

1. Build the extension : `npm run build:release`
1. Commit the build : `git commit -am "Build for release"`
1. Bump the version number and tag: `npm version major|minor|patch`
1. Push to origin: `git push && git push --tags`
1. Publish to npm: `npm publish .`
