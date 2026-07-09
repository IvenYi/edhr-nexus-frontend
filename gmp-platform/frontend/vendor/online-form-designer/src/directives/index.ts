/**
 * Configure and register global directives
 */
import type { App } from 'vue';
import { setupPermissionDirective } from './permission';
import { setupLoadingDirective } from './loading';
import { setupEllipsisDirective } from './ellipsis';
import { setupdragResizeDirective } from './dragResize';
import { setupHighlightDirective } from './highlightDirective';
import { setupNoCopyPasteDirective } from './noCopyPaste';
import { setupEllipsisTitleDirective } from './ellipsisTitle';

export { NoCopyPaste } from './noCopyPaste';
export function setupGlobDirectives(app: App) {
  setupPermissionDirective(app);
  setupLoadingDirective(app);
  setupEllipsisDirective(app);
  setupdragResizeDirective(app);
  setupHighlightDirective(app);
  setupNoCopyPasteDirective(app);
  setupEllipsisTitleDirective(app);
}
