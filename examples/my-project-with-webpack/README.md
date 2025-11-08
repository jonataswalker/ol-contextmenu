# Webpack Example

This example demonstrates how to integrate `ol-contextmenu` in a project using **Webpack** as a module bundler with ES6 modules.

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (version 8 or higher)

## Installation

1. Navigate to this directory:
   ```bash
   cd examples/my-project-with-webpack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   This will install:
   - `ol-contextmenu` (linked from the parent directory)
   - `ol` (OpenLayers)
   - Webpack and related build tools

## Running the Example

1. Build the project:
   ```bash
   npm run build
   ```

   This creates a bundled JavaScript file in the `dist/` directory.

2. Open `index.html` in a web browser.

   You can use a simple HTTP server if needed:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server (if installed)
   npx http-server
   ```

   Then navigate to `http://localhost:8000` in your browser.

## Key Concepts Demonstrated

This example shows:

- **ES6 Module Imports**: How to import `ol-contextmenu` and OpenLayers using ES6 syntax
- **CSS Imports**: How to import the required CSS file in a Webpack project
- **Multi-level Nested Submenus**: Creating submenus within submenus
- **Default Items**: Using the `defaultItems` option to include built-in Zoom In/Out items
- **Event Handling**: Using the `beforeopen` event to intercept menu opening
- **Webpack Configuration**: How to configure Webpack to handle CSS files and external dependencies

## Project Structure

```
my-project-with-webpack/
├── src/
│   ├── index.js      # Main application code
│   └── style.css     # Custom styles
├── dist/             # Built files (generated)
├── index.html        # HTML entry point
├── webpack.config.js # Webpack configuration
└── package.json      # Dependencies and scripts
```

## Code Highlights

### Importing the Library

```javascript
import ContextMenu from 'ol-contextmenu'
import 'ol-contextmenu/ol-contextmenu.css'
```

### Creating Nested Submenus

The example demonstrates creating submenus with multiple levels:
- First level: "Some Actions"
  - Second level: "Some more Actions"
    - Third level: Individual action items

### Using Default Items

```javascript
const contextmenu = new ContextMenu({
    defaultItems: true, // Includes Zoom In/Out items
    items: [...],
})
```

### Event Handling

```javascript
contextmenu.on('beforeopen', (evt) => {
    // Called before the menu opens
    // Can be used to conditionally enable/disable the menu
})
```

## Next Steps

- Try modifying the menu items in `src/index.js`
- Add your own callback functions
- Experiment with different menu configurations
- Check out the [Vite example](../my-project-with-vite/) for TypeScript support
- See the [CDN example](../README.md) for a simpler setup without build tools

## Troubleshooting

**Build fails**: Make sure you've run `npm install` in the parent directory first to build `ol-contextmenu`.

**Menu doesn't appear**: Check the browser console for errors. Make sure the CSS file is being loaded correctly.

**Icons don't show**: The example uses CDN-hosted icons. If they don't load, check your internet connection or replace with local icon files.

