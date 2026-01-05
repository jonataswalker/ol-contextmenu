# 🗺️ OpenLayers Context Menu

> A customizable, feature-rich context menu extension for OpenLayers maps

<p align="center">
    <a href="https://github.com/jonataswalker/ol-contextmenu/actions/workflows/ci.yml">
        <img src="https://github.com/jonataswalker/ol-contextmenu/actions/workflows/ci.yml/badge.svg?branch=master" alt="Build Status">
    </a>
    <a href="https://www.npmjs.com/package/ol-contextmenu">
        <img src="https://img.shields.io/npm/v/ol-contextmenu.svg" alt="npm version">
    </a>
    <a href="https://img.shields.io/npm/dm/ol-contextmenu">
        <img alt="npm downloads" src="https://img.shields.io/npm/dm/ol-contextmenu">
    </a>
    <a href="https://github.com/jonataswalker/ol-contextmenu/blob/master/LICENSE">
        <img src="https://img.shields.io/npm/l/ol-contextmenu.svg" alt="MIT License">
    </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/jonataswalker/ol-contextmenu/screenshot/images/anim.gif" alt="Context Menu Demo" />
</p>

**Quick Links:** [Demo](#-demo) • [Installation](#-installation) • [Quick Start](#-quick-start) • [API](#-api) • [TypeScript](#-typescript) • [Examples](#-examples)

---

## ✨ Features

- 🎯 **Easy Integration** - Works seamlessly with OpenLayers 7.x - 10.x
- 🎨 **Fully Customizable** - Control width, icons, styles, and appearance
- 🔗 **Nested Submenus** - Unlimited nesting levels for complex menu structures
- 📦 **Zero CSS Dependencies** - Styles are bundled inline (since v6.0)
- 🎪 **Event-Driven** - React to `beforeopen`, `open`, and `close` events
- 🌐 **Multiple Trigger Types** - Context menu, click, or double-click
- 📱 **Viewport-Aware** - Automatically repositions to stay visible at screen edges
- 💪 **TypeScript Support** - Full type definitions included out of the box
- ⚡ **Lightweight** - Minimal footprint with only one dependency (`tiny-emitter`)
- ✅ **Well Tested** - 191 tests covering all functionality

## 🎪 Demo

**Try it live:**
- 🎮 [CodeSandbox](https://codesandbox.io/s/openlayers-custom-context-menu-5s99kb?file=/src/index.js) - Interactive demo with full source
- 📝 [JSFiddle](https://jsfiddle.net/jonataswalker/ooxs1w5d/) - Quick playground
- 💻 [Local Examples](./examples) - Webpack, Vite, and CDN examples

## 📦 Installation

**npm (Recommended):**
```bash
npm install ol ol-contextmenu
```

**CDN:**
```html
<script src="https://cdn.jsdelivr.net/npm/ol-contextmenu"></script>
```

**Requires:** OpenLayers 7.0.0 or higher

📖 See [Getting Started Guide](docs/getting-started.md) for detailed installation instructions and setup.

## 🚀 Quick Start

```javascript
import ContextMenu from 'ol-contextmenu';

const contextmenu = new ContextMenu({
    width: 170,
    defaultItems: true, // Includes Zoom In/Zoom Out
    items: [
        {
            text: 'Center map here',
            callback: (obj, map) => {
                map.getView().setCenter(obj.coordinate);
            },
        },
        {
            text: 'Add a Marker',
            icon: 'img/marker.png',
            callback: addMarker,
        },
        '-', // Separator
    ],
});

map.addControl(contextmenu);
```

📖 See [Getting Started Guide](docs/getting-started.md) for complete setup instructions and [Examples](docs/examples.md) for advanced patterns.

## 📖 Documentation

- **[Getting Started](docs/getting-started.md)** - Installation and basic setup
- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[TypeScript Guide](docs/typescript.md)** - TypeScript usage and type definitions
- **[Examples & Recipes](docs/examples.md)** - Common patterns and code examples
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## 📘 TypeScript

Full TypeScript support with comprehensive type definitions included:

```typescript
import ContextMenu, { type Item } from 'ol-contextmenu';

const items: Item[] = [
    {
        text: 'Center map here',
        callback: (obj, map) => {
            map.getView().setCenter(obj.coordinate);
        },
    },
];

const contextmenu = new ContextMenu({ width: 170, items });
```

📖 See the [TypeScript Guide](docs/typescript.md) for complete type definitions and usage patterns.

## 🎯 API

### Constructor

```javascript
new ContextMenu(options)
```

**Options:**
- `width` (number, default: `150`) - Menu width in pixels
- `defaultItems` (boolean, default: `true`) - Include default Zoom In/Out items
- `items` (Item[], default: `[]`) - Array of menu items
- `eventType` (string, default: `'contextmenu'`) - Event type to trigger menu

### Methods

- `clear()` - Remove all items
- `close()` - Close menu programmatically
- `extend(items)` - Add multiple items
- `push(item)` - Add single item
- `pop()` / `shift()` - Remove items
- `getDefaultItems()` - Get default items array
- `isOpen()` - Check if menu is open
- `enable()` / `disable()` - Control menu state

### Events

- `beforeopen` - Fired before menu opens
- `open` - Fired when menu opens
- `close` - Fired when menu closes

📖 See [API Reference](docs/api-reference.md) for complete documentation with examples.

## 🎨 Examples

- **[Examples & Recipes](docs/examples.md)** - Common patterns and code examples
- **[Local Examples](./examples)** - Complete working projects:
  - [CDN Example](./examples/contextmenu.html) - No build tools required
  - [Webpack Example](./examples/my-project-with-webpack) - Integration with Webpack
  - [Vite Example](./examples/my-project-with-vite) - Modern setup with Vite + TypeScript

## 🔧 Troubleshooting

Common issues:
- **Menu doesn't appear:** Ensure `map.addControl(contextmenu)` is called
- **Menu cut off:** Update to v5.5.0+ for automatic viewport positioning
- **TypeScript errors:** Use `import ContextMenu, { type Item } from 'ol-contextmenu'`

📖 See the [Troubleshooting Guide](docs/troubleshooting.md) for detailed solutions and common issues.

## 🌍 Browser Support

Modern browsers supporting ES6+:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 🤝 Contributing

Contributions are welcome! We appreciate:
- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- ✨ Code contributions

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/jonataswalker/ol-contextmenu.git
cd ol-contextmenu

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
```

## 📄 License

MIT © [Jonatas Walker](https://github.com/jonataswalker)

## 🙏 Acknowledgments

Built with ❤️ for the [OpenLayers](https://openlayers.org/) community.

Special thanks to all [contributors](https://github.com/jonataswalker/ol-contextmenu/graphs/contributors) who have helped improve this project.

---

<p align="center">
  <sub>Made with ❤️ by the community</sub>
</p>
