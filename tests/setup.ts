/**
 * Test setup file to ensure CSS is loaded in test environments.
 * Since CSS is now bundled into the JavaScript, importing the main module
 * will trigger the CSS injection code from vite-plugin-css-injected-by-js.
 *
 * This ensures that CSS styles are available for all tests that need them.
 */
import '../src/main.ts'
