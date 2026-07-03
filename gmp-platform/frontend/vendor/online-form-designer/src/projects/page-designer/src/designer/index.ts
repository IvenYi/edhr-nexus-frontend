import { App } from 'vue';
import DragWidgetGroup from './stage/drag/drag-widget-group.vue';
import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';

export default {
  install(app: App) {
    app.component('DragWidgetGroup', DragWidgetGroup);
    app.component('WidgetWrapper', WidgetWrapper);
  },
};
