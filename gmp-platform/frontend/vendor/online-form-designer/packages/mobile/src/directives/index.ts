/**
 * Configure and register global directives
 */
import type { App } from 'vue';

import { setupNoCopyPasteDirective } from './noCopyPaste';

export { NoCopyPaste } from './noCopyPaste';
export function setupGlobDirectives(app: App) {
  setupNoCopyPasteDirective(app);
}
