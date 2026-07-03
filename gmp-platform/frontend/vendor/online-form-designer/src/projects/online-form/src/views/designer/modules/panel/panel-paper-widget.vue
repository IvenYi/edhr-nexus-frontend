<template>
  <div class="p-12px">
    <div class="text-12px font-500">{{ $t('sys.onlineForm.componentProperties') }}</div>

    <form-item :label="$t('sys.cardDesign.cfg_form.component_type')">
      <span class="color-[#212528] text-12px pl-6px">{{ widgetConfig?.name }}</span>
    </form-item>

    <div class="mt-12px">
      <component
        v-if="widgetConfig"
        :is="widgetPropMap[widgetConfig.type]"
        :widget="widgetConfig"
        :disabled="sheetReadonly"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { asyncImportWidgetProp } from '/@online-form/views/designer/modules/widget-prop';

  const props = defineProps<{
    position?: 'paper' | 'header' | 'footer';
  }>();

  const { paper, panelData, sheetReadonly } = useSpreadSheet();

  const widgetPropMap = asyncImportWidgetProp();

  const widgetConfig = computed({
    get() {
      if (props.position === 'paper') {
        return paper.value.paperWidgets?.find((w) => w.id === panelData.refId);
      } else if (props.position === 'header') {
        return paper.value.paperHeaderWidgets?.find((w) => w.id === panelData.refId);
      } else {
        return paper.value.paperFooterWidgets?.find((w) => w.id === panelData.refId);
      }
    },
    set(value) {
      const list =
        props.position === 'paper'
          ? paper.value.paperWidgets
          : props.position === 'header'
            ? paper.value.paperHeaderWidgets
            : paper.value.paperFooterWidgets;
      const widget = list?.find((w) => w.id === panelData.refId);
      if (!widget) return;
      Object.assign(widget, value);
    },
  });
</script>

<style></style>
