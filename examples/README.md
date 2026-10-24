# Examples

This directory contains example projects demonstrating how to use `ol-contextmenu` in different scenarios.

## Available Examples

### 1. Script-tag Example (`contextmenu.html`)

**Best for**: Quick start without a bundler

This example loads OpenLayers from a CDN and `ol-contextmenu` from this repository's build output (`../dist/ol-contextmenu.iife.js`). It demonstrates:
- Basic menu item setup with callbacks
- Menu items with icons
- Submenus (nested menu items)
- Separators
- Dynamic menu updates based on context
- Feature detection at click location
- Custom data propagation to callbacks

**How to run**:
1. Build the library once from the repository root: `npm install && npm run build`
2. Open `contextmenu.html` in a web browser
3. Right-click anywhere on the map to see the context menu
4. Right-click on a marker to see a different menu

In your own page, load the published build instead of `../dist`:
`<script src="https://cdn.jsdelivr.net/npm/ol-contextmenu"></script>`

**Key concepts demonstrated**:
- Creating a context menu with custom items
- Using the `open` event to dynamically change menu items
- Detecting features at the click location
- Passing custom data to callback functions

### 2. Webpack Example (`my-project-with-webpack/`)

**Best for**: Projects using Webpack as a bundler

This example demonstrates how to integrate `ol-contextmenu` in a Webpack-based project with ES6 modules. It shows:
- ES6 module imports
- Multi-level nested submenus
- Using `defaultItems` option
- `beforeopen` event handling
- CSS imports with Webpack

See the [Webpack example README](./my-project-with-webpack/README.md) for detailed setup instructions.

### 3. Vite Example (`my-project-with-vite/`)

**Best for**: Modern projects using Vite with TypeScript

This example shows how to use `ol-contextmenu` in a Vite + TypeScript project. It demonstrates:
- TypeScript type imports
- Type-safe callback functions
- Module bundling with Vite
- CSS imports with Vite

See the [Vite example README](./my-project-with-vite/README.md) for detailed setup instructions.

## Next Steps

- Check out the [main README](../README.md) for complete API documentation
- Explore the source code to see how different features are implemented
- Try modifying the examples to add your own menu items and callbacks

