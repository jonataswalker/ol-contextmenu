# Vite Example

This example demonstrates how to integrate `ol-contextmenu` in a modern project using **Vite** as a build tool with **TypeScript** support.

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (version 8 or higher)

## Installation

1. Navigate to this directory:
   ```bash
   cd examples/my-project-with-vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   This will install:
   - `ol-contextmenu` (linked from the parent directory)
   - `ol` (OpenLayers)
   - Vite and TypeScript

## Running the Example

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

This will start a local development server (usually at `http://localhost:5173`). The page will automatically reload when you make changes.

### Production Build

Build the project for production:

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

## Key Concepts Demonstrated

This example shows:

- **TypeScript Integration**: Type-safe usage of `ol-contextmenu` with TypeScript
- **Type Imports**: How to import TypeScript types from the library
- **ES6 Modules**: Modern JavaScript module syntax
- **Vite Bundling**: Fast development and optimized production builds
- **CSS Bundling**: CSS is automatically bundled into the JavaScript (no separate CSS import needed)
- **Multi-level Nested Submenus**: Creating complex menu structures
- **Default Items**: Using built-in Zoom In/Out items
- **Event Handling**: Type-safe event listeners

## Project Structure

```
my-project-with-vite/
├── src/
│   ├── main.ts          # Main application code (TypeScript)
│   ├── style.css        # Custom styles (ol-contextmenu CSS is bundled in JS)
│   └── vite-env.d.ts    # Vite type definitions
├── index.html           # HTML entry point
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration (if present)
└── package.json         # Dependencies and scripts
```

## Code Highlights

### TypeScript Type Imports

```typescript
import type { Item, SingleItem, CallbackObject, ItemWithNested } from 'ol-contextmenu'
```

These types help ensure type safety when creating menu items and callbacks.

### Type-Safe Callback Functions

```typescript
function center(obj: CallbackObject) {
    // obj.coordinate is typed as [number, number]
    // obj.pixel is typed as [number, number]
    // obj.data is typed as any (or your custom type)
}
```

### CSS Bundling

CSS is automatically bundled into the JavaScript when you import `ol-contextmenu`. No separate CSS import is needed. The CSS will be automatically injected into the page when the JavaScript loads.

### Creating Typed Menu Items

```typescript
const actionsSubmenuItems: SingleItem[] = [
    {
        callback: marker,
        icon: pinIcon,
        text: 'Add a Marker',
    },
]

const firstLevelSubmenu: ItemWithNested = {
    icon: listIcon,
    items: [actionsSubmenu, ...actionsItems],
    text: 'Some Actions',
}
```

Using TypeScript types ensures your menu items are correctly structured.

## TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better autocomplete in your IDE
- **Documentation**: Types serve as inline documentation
- **Refactoring**: Safer code changes with type checking

## Next Steps

- Modify `src/main.ts` to add your own menu items
- Experiment with different TypeScript types
- Add your own custom types for menu item data
- Check out the [Webpack example](../my-project-with-webpack/) for ES6 JavaScript
- See the [CDN example](../README.md) for a simpler setup

## Troubleshooting

**Type errors**: Make sure you've built `ol-contextmenu` in the parent directory first (`npm run build`).

**Dev server won't start**: Check that all dependencies are installed and the parent package is built.

**CSS not loading**: CSS is automatically bundled into the JavaScript. If styles aren't appearing, check the browser console for errors.

**TypeScript errors**: Run `npm run build` to see detailed TypeScript error messages.

