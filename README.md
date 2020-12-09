cytoscape-multilayer
================================================================================
## Description

This is a layout extension for [Cytoscape.js](https://github.com/cytoscape/cytoscape.js).

The `multilayer` layout organises the graph using a DAG (directed acyclic graph) system, written by [Zachary Bolt](https://ualr.edu/computerscience/zachary-bolt-b-sc-graduate-assistant-lecturer/). Contributions from [Caleb Chase] (http://www.linkedin.com/in/calebchase03) and [Mark Barnes] (https://www.linkedin.com/in/mark-barnes-243b1529/) . It is especially suitable for DAGs and trees with large numbers of children.  For more information, please refer to its [Dagre's documentation](https://github.com/cpettitt/dagre).
It has been structured to also group children into boxes and add a maximum width for the graph.  In addition this accepts compound nodes.  The first child of a compound node parent will float above the rest.  Adjust the nodeXSep and nodeYSep options to fit.

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
Call the layout, e.g. `cy.layout({ name: 'multilayer', ... }).run()`, with options:

```js
var defaults = {
  // multilayer algo options, uses default value on undefined
  nodeXSep: 200, // the X axis space between adjacent nodes in the same rank
  nodeYSep: 100, // the Y axis space between adjacent nodes in the same rank
  groupSep: 150, // the space between adjacent parent/children groups
  layoutWidth: 6000, //the maximum width of the layout
  weightFunction: function (a, b) {if(b == undefined && a == undefined) return 0; if (b._private.data.weight == undefined) b._private.data.weight = 0; if (a._private.data.weight == undefined) a._private.data.weight = 0; return b._private.data.weight - a._private.data.weight;}, //formula applied to each node to organize them by weight.  currently has error checking to avoid undefined errors.
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
