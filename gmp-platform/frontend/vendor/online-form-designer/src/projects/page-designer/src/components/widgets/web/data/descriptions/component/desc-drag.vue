<template>
  <div>
    <draggable
      class="ant-row"
      :list="children"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      :animation="300"
      item-key="id"
    >
      <template #item="{ element, index }">
        <a-col :span="getItemSpan()">
          <widget-wrapper
            :key="widget.id"
            :widget="element"
            :parent-list="children"
            :parent-widget="widget"
            :index-of-parent-list="index"
          >
            <component :is="widgetEntry" :widget="element" v-slot="slotData">
              <component
                :is="getAsyncWidget(element)"
                :widget="element"
                v-bind="slotData || {}"
              />
            </component>
          </widget-wrapper>
        </a-col>
      </template>
    </draggable>
  </div>
</template>
<script setup lang="ts" name="descriptions-drag">
  import { computed } from 'vue';
  import draggable from 'vuedraggable';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

  const { getAsyncWidget, widgetEntry } = useDesigner();

  const props = defineProps({
    children: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: [],
    },
    widget: {
      type: Object as LowCodeWidget.BasicSchema,
      default: () => {},
    },
    group: {
      type: String,
      default: 'gct',
    },
    styleProp: {
      type: Object,
    },
  });

  const column = computed(() => {
    return props.widget.props.column || 1;
  });

  const getItemSpan = (span?) => {
    // span是单独设置一项所占的列数，后期可兼容单独设置每项所占的列数
    let spanNum: number = 24 / column.value;
    console.log('span', spanNum, span, column.value);
    return (span ? (span > column.value ? column.value : span) : 1) * spanNum;
  };
</script>
<style lang="less" scoped></style>
