<template>
  <div class="h100%">
    <BizTree
      ref="bizTreeRef"
      :tree-data="treeData"
      :opeWidget="opeWidget"
      :headerWidget="headerWidget"
      :batchWidget="batchWidget"
      @nodeSelect="onNodeSelect"
    >
      <template #opeBtns="{ data }">
        <RenderTableColunmButtons
          v-if="opeWidget?.children?.length > 0 && data.data"
          :tableForm="data.data"
          :buttons="opeWidget.children"
          :visible-buttons="opeWidget.value?.props?.visibleButtons || 1"
        />
      </template>
    </BizTree>
  </div>
</template>

<script setup lang="ts" name="gct-category-tree">
  import { ref, computed, toRaw, nextTick } from 'vue';
  import { type ICategoryTree } from './schema';
  import BizTree from './components/biz-tree.vue';
  import { RenderTableColunmButtons } from './components/render-table-buttons/render-table-column-buttons';
  import { useTableEvents } from './components/transformHooks';
  import { getPageEvent } from '../../../../components/widgets/hooks/hooks';
  import { NodeItem } from './components/types';

  const props = defineProps<{ widget: ICategoryTree }>();

  const treeData = ref<NodeItem[]>([]);
  const Event = getPageEvent();
  const reload = ref<Function>(() => {});
  const bizTreeRef = ref();

  const { model, modeldata } = toRaw(props.widget.props);

  useTableEvents({
    Event,
    deleteDataByids,
    model,
  });

  const opeWidget = computed(() => {
    const w = props.widget?.children[0] || {};
    console.log('opeWidget', w);
    return w;
  });

  const headerWidget = computed(() => {
    const w = props.widget?.children[1] || {};
    return w;
  });

  const batchWidget = computed(() => {
    const w = props.widget?.children[2] || {};
    return w;
  });

  const setValue = (data: NodeItem[]) => {
    treeData.value = data;
    nextTick(() => {
      // 展开所有
      bizTreeRef.value?.expandAll();
    });
  };

  /**根据数据id删除数据 */
  async function deleteDataByids(ids: string[] = []) {
    //删除普通表格逻辑
    await Event.context.$httpBizService(
      { key: model, action: 'removeByIds', modelCategory: modeldata?.modelCategory },
      { ids: ids.join(',') },
    );
  }

  const setReload = (func: Function) => {
    reload.value = func;
  };

  async function onNodeSelect(data: NodeItem) {
    console.log('onNodeSelect', data);
    await Event.runEventByName('onNodeSelect', props.widget.events, data);
  }

  defineExpose({
    setValue,
    setReload,
    reload,
    getSelectedNode: () => {
      return bizTreeRef.value?.getSelectedNode();
    },
  });
</script>

<style scoped lang="less"></style>
