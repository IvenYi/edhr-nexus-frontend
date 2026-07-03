import { App } from 'vue';

import ColorEditor from './color-editor/color-editor.vue';
import LengthUnitEditor from './length-unit-editor/length-unit-editor.vue';

export default {
  install(app: App) {
    app.component('ColorEditor', ColorEditor);
    app.component('LengthUnitEditor', LengthUnitEditor);
  },
};
