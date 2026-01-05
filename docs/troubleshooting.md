# Troubleshooting

Common issues and solutions for `ol-contextmenu`.

## Installation Issues

### Cannot find module 'ol-contextmenu'

**Symptoms:**
```
Error: Cannot find module 'ol-contextmenu'
```

**Solutions:**

1. **Verify installation:**
   ```bash
   npm list ol-contextmenu
   ```

2. **Reinstall the package:**
   ```bash
   npm install ol-contextmenu
   ```

3. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### TypeScript cannot find types

**Symptoms:**
```
Could not find a declaration file for module 'ol-contextmenu'
```

**Solutions:**

Type definitions are included since v6.0. Make sure you're on the latest version:

```bash
npm install ol-contextmenu@latest
```

If the issue persists, check your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "moduleResolution": "node",
        "esModuleInterop": true
    }
}
```

## Display Issues

### Menu doesn't appear

**Symptoms:**
- Right-clicking does nothing
- No context menu visible

**Solutions:**

1. **Verify the control is added to the map:**
   ```javascript
   map.addControl(contextmenu);
   ```

2. **Check if menu is disabled:**
   ```javascript
   contextmenu.enable(); // Re-enable if needed
   ```

3. **Verify event type:**
   ```javascript
   const contextmenu = new ContextMenu({
       eventType: 'contextmenu', // Default
   });
   ```

4. **Check browser console for errors**

5. **Ensure OpenLayers version compatibility:**
   ```bash
   npm list ol
   # Should be 7.0.0 or higher
   ```

---

### Menu appears cut off at viewport edges

**Symptoms:**
- Menu is partially hidden at screen edges
- Bottom or right side of menu is cut off

**Solution:**

Update to v5.5.0 or higher (automatic viewport positioning):

```bash
npm install ol-contextmenu@latest
```

The menu now automatically repositions to stay within viewport bounds.

---

### Styles are missing or incorrect

**Symptoms:**
- Menu appears unstyled
- CSS classes not applied

**Solutions:**

1. **Verify you're on v6.0+** (CSS is bundled):
   ```bash
   npm list ol-contextmenu
   ```

2. **Remove old CSS imports:**
   ```diff
   - import 'ol-contextmenu/dist/ol-contextmenu.css'; // Remove this
   ```

3. **Clear build cache:**
   ```bash
   rm -rf dist/
   npm run build
   ```

4. **Check for CSS conflicts** in browser DevTools

## Functional Issues

### Callbacks not firing

**Symptoms:**
- Menu items don't respond to clicks
- Callback functions never execute

**Solutions:**

1. **Verify callback syntax:**
   ```javascript
   // ✅ Correct
   {
       text: 'Test',
       callback: (obj, map) => {
           console.log('Clicked!');
       }
   }

   // ❌ Wrong - missing parameters
   {
       text: 'Test',
       callback: () => {
           console.log('Clicked!');
       }
   }
   ```

2. **Check for JavaScript errors** in console

3. **Ensure item has callback:**
   ```javascript
   // Separators don't have callbacks
   '-' // This is correct

   // Items need callbacks
   { text: 'Test', callback: fn } // Needs callback
   ```

---

### Menu closes immediately

**Symptoms:**
- Menu opens and closes instantly
- Can't click menu items

**Solutions:**

1. **Check for conflicting click handlers:**
   ```javascript
   // Avoid stopPropagation on map clicks
   map.on('click', (evt) => {
       // Don't stopPropagation here
   });
   ```

2. **Verify beforeopen handler:**
   ```javascript
   contextmenu.on('beforeopen', (evt) => {
       // Don't call closeMenu() here
       // Don't disable() immediately
   });
   ```

---

### Dynamic menus not updating

**Symptoms:**
- Menu items don't change based on context
- Same items always show

**Solutions:**

1. **Clear menu before updating:**
   ```javascript
   contextmenu.on('beforeopen', (evt) => {
       contextmenu.clear(); // Important!
       contextmenu.extend(newItems);
   });
   ```

2. **Use correct event:**
   ```javascript
   // ✅ Use beforeopen for menu changes
   contextmenu.on('beforeopen', updateMenu);

   // ❌ Don't use open (too late)
   // contextmenu.on('open', updateMenu);
   ```

## TypeScript Issues

### Import errors

**Symptoms:**
```typescript
Module '"ol-contextmenu"' has no exported member 'ContextMenu'
```

**Solution:**

Use correct import syntax:

```typescript
// ✅ Correct - default import
import ContextMenu from 'ol-contextmenu';

// ❌ Wrong - named import
// import { ContextMenu } from 'ol-contextmenu';
```

---

### Type errors with items

**Symptoms:**
```typescript
Type '{ text: string; }' is missing the following properties: callback
```

**Solution:**

Provide type annotations:

```typescript
import { type Item, type SingleItem } from 'ol-contextmenu';

// Option 1: Type the array
const items: Item[] = [
    { text: 'Test', callback: (obj, map) => {} }
];

// Option 2: Type individual items
const item: SingleItem = {
    text: 'Test',
    callback: (obj, map) => {}
};
```

## Performance Issues

### Menu opens slowly

**Symptoms:**
- Delay before menu appears
- Laggy interaction

**Solutions:**

1. **Optimize beforeopen handler:**
   ```javascript
   // ❌ Slow - recalculating every time
   contextmenu.on('beforeopen', (evt) => {
       const items = expensiveCalculation();
       contextmenu.extend(items);
   });

   // ✅ Fast - calculate once
   const items = expensiveCalculation();
   contextmenu.on('beforeopen', (evt) => {
       contextmenu.extend(items);
   });
   ```

2. **Reduce number of items** (use submenus for large lists)

3. **Avoid DOM operations in callbacks:**
   ```javascript
   // ❌ Slow
   callback: () => {
       document.querySelectorAll('.heavy-selector').forEach(/* ... */);
   }

   // ✅ Fast
   callback: () => {
       cachedElements.forEach(/* ... */);
   }
   ```

## Browser-Specific Issues

### Menu doesn't work in Safari

**Symptoms:**
- Works in Chrome/Firefox but not Safari

**Solutions:**

1. **Check Safari version** (modern versions only)
2. **Verify ES6 support** (Safari 10+)
3. **Check for polyfills needed**

---

### Browser context menu still appears

**Symptoms:**
- Both custom and browser context menus show

**Solution:**

This is expected behavior. The library prevents default for `contextmenu` events, but some browsers may still show their menu. This is handled correctly by the library.

## Build Issues

### Webpack build errors

**Symptoms:**
```
Module parse failed: Unexpected token
```

**Solution:**

Update Webpack config to handle ES modules:

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                include: /node_modules\/ol-contextmenu/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
```

---

### Vite build errors

**Solution:**

Vite should work out of the box. If you encounter issues:

```javascript
// vite.config.js
export default {
    optimizeDeps: {
        include: ['ol-contextmenu']
    }
};
```

## Getting More Help

If your issue isn't covered here:

1. **Search existing issues:**
   [GitHub Issues](https://github.com/jonataswalker/ol-contextmenu/issues)

2. **Check the examples:**
   [Examples Directory](../examples)

3. **Review the API documentation:**
   [API Reference](./api-reference.md)

4. **Create a new issue:**

   When creating an issue, please include:
   - ol-contextmenu version
   - OpenLayers version
   - Browser and version
   - Minimal reproduction example
   - Error messages
   - What you've tried

   [Create Issue](https://github.com/jonataswalker/ol-contextmenu/issues/new)

## See Also

- [Getting Started](./getting-started.md)
- [API Reference](./api-reference.md)
- [Migration Guide](./migration.md)
