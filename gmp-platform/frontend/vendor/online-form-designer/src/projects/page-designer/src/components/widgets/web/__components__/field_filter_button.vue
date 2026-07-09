<template>
  <a-popover trigger="click" placement="bottomLeft" v-model:visible="visible">
    <template #title>
      <div class="ks-row-middle">
        <div class="ks-col">
          <a-checkbox v-model:checked="allChecked"> 全部 </a-checkbox>
        </div>
        <a-button size="small" type="link" @click="submit"> 确定 </a-button>
      </div>
    </template>
    <template #content>
      <draggable
        item-key="id"
        :list="plainOptions"
        handle=".mover"
        :animation="200"
        chosen-class="drawing-chosen"
        drag-class="drawing-drag"
        style="height: 220px; overflow: auto"
      >
        <template #item="{ element }">
          <div class="ks-row-middle">
            <a-checkbox v-model:checked="element.show" class="ks-col">
              {{ element.label }}
            </a-checkbox>
            <DragOutlined class="table-column-drag-icon mr4px mover cursor-pointer primary-gct" />
          </div>
        </template>
      </draggable>
    </template>
    <a-tooltip :title="t('sys.pageDesigner.filterItemsManage')" placement="bottom">
      <slot name="btn">
        <span class="iconfont icon-shezhi cursor-pointer"></span>
      </slot>
    </a-tooltip>
  </a-popover>
</template>

<script setup lang="ts">
  import { ref, onMounted, toRefs, computed, toRef, toRaw, watch } from 'vue';
  import draggable from 'vuedraggable';
  import { useStorage } from '@vueuse/core';
  import { sortBy, cloneDeep } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUserStore } from '/@/store/modules/user';

  const { t } = useI18n();

  const userStore = useUserStore();

  interface cacheMaps {
    sort: number;
    show: boolean;
    id: string;
  }
  const visible = ref(false);
  const emit = defineEmits(['changeColumsByIds']);
  const props = defineProps<{ cacheKey: string; columns: any[] }>();
  const { cacheKey } = toRaw(props);
  const { columns } = toRefs(props);
  const plainOptions = ref<cacheMaps[]>([]);

  const cacheState = useStorage<{ [key: string]: cacheMaps }>(
    `${userStore?.getUserInfo?.userId}_${cacheKey}`,
    () => {
      return columns.value.reduce((total, curr, index) => {
        total[curr.id] = { sort: index, show: true };
        return total;
      }, {});
    },
  );
  const mapState = toRef(() =>
    columns.value.reduce((total, curr) => {
      total[curr.id] = curr.props.label;
      return total;
    }, {}),
  );

  watch(visible, (v) => {
    v && transformColumns();
  });
  watch(
    columns,
    () => {
      transformColumns();
      changecolumns();
    },
    {
      immediate: true,
    },
  );
  function transformColumns() {
    plainOptions.value = sortBy(
      columns.value.map((i) => {
        let id = i.id;
        let cache = cacheState.value[id] || { show: true };
        return { label: mapState.value[id], ...cache, id };
      }),
      'sort',
    );
  }
  const allChecked = computed({
    get() {
      return plainOptions.value.every((i) => i.show);
    },
    set(value) {
      plainOptions.value.forEach((i) => (i.show = value));
    },
  });
  function submit() {
    visible.value = false;
    cacheState.value = plainOptions.value.reduce((total, curr, index) => {
      total[curr.id] = { sort: index, show: curr.show };
      return total;
    }, {});
    changecolumns();
  }
  function changecolumns() {
    let list = plainOptions.value.filter((i) => i.show).map((i) => i.id);
    emit('changeColumsByIds', list);
  }
</script>
<style scoped lang="less">
  .iconfont {
    line-height: 1;
  }
</style>
