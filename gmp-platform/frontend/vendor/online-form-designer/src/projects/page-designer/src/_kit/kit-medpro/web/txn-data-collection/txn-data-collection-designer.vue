<template>
  <label v-if="widget.props?.displayLabelText">{{ widget.props?.label }}</label>
  <FileList
    :fileData="groupData"
    :showType="showType"
    :isDesign="true"
    @update:showType="updateType"
  />
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { ref } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import FileList from './components/file-list.vue';

  defineProps(widgetProps);
  const showType = ref<'Card' | 'List'>('Card');

  const groupData = ref([
    {
      name: '数据采集1',
      type: 'dataCollection',
      status: 'initial',
    },
    {
      name: '数据采集2',
      type: 'dataCollection',
      status: 'submitted',
    },
    {
      name: '电子表单1',
      type: 'onlineForm',
      status: 'stash',
    },
  ]);

  const updateType = (value) => {
    showType.value = value;
  };
</script>

<style lang="less" scoped></style>
