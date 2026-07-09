import { defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';

export const PanelDividerEditor = defineComponent({
  name: 'panel-divider-editor',
  setup() {
    const ns = useNamespace('panel-divider-editor');

    return () => {
      return <div style={{ 'border-bottom': `1px solid var(${ns.cssVarName('color-border')})` }}></div>;
    };
  },
});

export default PanelDividerEditor;
