<template>
  <div class="h32px">
    <widgets
      v-model:value="value"
      :widget="widget"
      v-if="columnWidget.props.embeddedSearch && widget"
      @tableSearch="emit('search')"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import widgets from '/@page-designer/components/widgets/web/other/query/component/search_fields/index.vue';

  import { ColumnTable } from '/@page-designer/types/web';

  const props = defineProps<{
    /**加载 */
    columnWidget: ColumnTable;
    queryData: object;
  }>();
  const queryData = ref(props.queryData);
  const widget = props.columnWidget.children?.[0] || '';
  const emit = defineEmits(['search']);
  const value = computed({
    get() {
      return queryData.value[widget.id!];
    },
    set(value) {
      queryData.value[widget.id!] = value;
    },
  });
</script>
<style scoped lang="less"></style>
