# Examples

This directory contains example projects demonstrating how to use `ol-contextmenu` in different scenarios.

## Available Examples

### 1. CDN Example (`contextmenu.html`)

**Best for**: Quick start, no build tools required

This example shows how to use `ol-contextmenu` with CDN-hosted libraries. It demonstrates:
- Basic menu item setup with callbacks
- Menu items with icons
- Submenus (nested menu items)
- Separators
- Dynamic menu updates based on context
- Feature detection at click location
- Custom data propagation to callbacks

**How to run**:
1. Open `contextmenu.html` in a web browser
2. Right-click anywhere on the map to see the context menu
3. Right-click on a marker to see a different menu

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

