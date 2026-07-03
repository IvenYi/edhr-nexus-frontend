import { App } from 'vue';

import BorderEditor from './style/border-editor/border-editor.vue';
import SpacingEditor from './style/spacing-editor/spacing-editor.vue';
import PositionEditor from './style/position-editor/position-editor.vue';
import FontEditor from './style/font-editor/font-editor.vue';

export default {
  install(app: App) {
    app.component('BorderEditor', BorderEditor);
    app.component('SpacingEditor', SpacingEditor);
    app.component('PositionEditor', PositionEditor);
    app.component('FontEditor', FontEditor);
  },
};
