<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-gc-import-button">
  import { ref, inject, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ExportButton } from '/@page-designer/types/web';
  import {
    transformSourceData,
    transformData,
  } from '/@page-designer/components/widgets/hooks/utils';
  import baseButton from '../../__components__/base_button.vue';

  const props = defineProps<{ widget: ExportButton }>();
  const { templateKey, model, timeout, batchImport } = props.widget.props;
  const tableEvent = inject<any>('tableEvent', {});
  const Event = getPageEvent();
  const loading = ref(false);
  const importBody = reactive({
    tmplKey: templateKey,
    modelKey: model,
    timeout,
    batchImport,
  });

  async function onclick() {
    loading.value = true;
    try {
      await Event.runEventByName('beforeImport', props.widget.events);
      if (tableEvent.getImportParames) {
        const data = tableEvent.getImportParames();
        Object.assign(importBody, data);
      }
      Event.context.$importDataForModal(importBody, {
        onSuccess({
          okData = [],
          updateData = [],
          dict = {},
          duplicateKeyUpdate = 0,
          updateStrategy = false,
        } = {}) {
          loading.value = false;
          try {
            tableEvent.afterImport &&
              tableEvent.afterImport((child) => {
                /**子表导入回调函数逻辑 */
                const addList = transformSourceData(okData, dict);
                const updateList = updateData;
                if (duplicateKeyUpdate == 0) {
                  //新增
                  return [...child, ...addList];
                }
                if (duplicateKeyUpdate == 1) {
                  //新增及更新
                  const data = updateListByExcle(child, updateList, updateStrategy, dict);
                  return [...data, ...addList];
                }
                if (duplicateKeyUpdate == 2) {
                  //仅更新数据
                  return updateListByExcle(child, updateList, updateStrategy, dict);
                }
              });
            Event.runEventByName('afterImport', props.widget.events);
          } catch (error) {}
        },
        onError() {
          loading.value = false;
        },
      });
    } catch (error) {}

    loading.value = false;
  }
  /**更新子表數據 */
  function updateListByExcle(child, updateList, updateStrategy, dict) {
    return child.map((i) => {
      if (!i.deleted_ && i.id_) {
        const newRow = updateList.find((u) => u.id_ === i.id_);
        if (newRow) {
          return updateStrategyBycallback(i, newRow, updateStrategy, dict);
        }
      }
      return i;
    });
  }
  function updateStrategyBycallback(row, newRow, updateStrategy, dict) {
    const data = { ...row };
    for (let key in newRow) {
      if (key !== '_ROW_NO_' && key !== '_ACTION_KEY_' && key !== 'id_') {
        let newValue = newRow[key];
        if (updateStrategy || (!updateStrategy && newValue !== null && newValue !== '')) {
          data[key] = newValue;
          const { _DICT } = transformData(newRow, dict) || {};
          console.log(_DICT);
          const dictValue = _DICT?.[key];
          if (dictValue) {
            data._DICT[key] = dictValue;
          }
        }
      }
    }
    /**清空vxetable 渲染标识 */
    data._X_ROW_KEY = undefined;
    return data;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
