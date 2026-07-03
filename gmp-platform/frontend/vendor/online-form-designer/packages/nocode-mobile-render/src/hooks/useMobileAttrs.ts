import { useWidgetStaticAttrs } from '@gct/nocode-base';
import { computed } from 'vue';

export function useMobileAttrs(widget) {
  const result = useWidgetStaticAttrs(widget);
  const { showDisplayStatus } = result;

  /** 是否显示只读态（即非编辑态） */
  const showReadonly = computed(() => {
    return (
      showDisplayStatus.value === 'readonly-text' ||
      showDisplayStatus.value === 'readonly-component'
    );
  });

  return {
    ...result,
    /** 是否显示只读态（即非编辑态） */
    showReadonly,
  };
}
