<template>
  <div class="operation-list-render">
    <div class="font-bold mb-2">{{ title }}</div>

    <a-input-search
      :placeholder="$t('sys.edhr.inputKeywordSearch')"
      style="margin-bottom: 10px"
      v-model:value="searchValue"
      @search="handleSearch"
      allow-clear
    />

    <div v-for="item in listData" :key="item.id_">
      <div
        class="flex items-center justify-between p-2 my-2 cursor-pointer"
        :class="{ 'active-item': enableHighlight && selectedId === item.id_ }"
        :style="getItemStyle(item)"
        @click="handleClick(item)"
      >
        <div class="item-name" style="color: var(--ant-primary-color)" :title="item.name_">{{
          item.name_
        }}</div>
        <slot name="rightExtra"> </slot>
      </div>
    </div>

    <slot name="footer"> </slot>
  </div>
</template>

<script setup lang="ts" name="operation-list-render">
  import { ref, reactive, toRef, watch, computed, onMounted } from 'vue';
  import { IOperationList } from './schema';
  import { getPageEvent } from '../../../../components/widgets/hooks/hooks';
  import { cloneDeep } from 'lodash-es';

  const Event = getPageEvent();

  const defProps = defineProps<{
    widget: IOperationList;
  }>();

  const activeStyle = {
    'box-shadow': '0px 0px 3px var(--ant-primary-color)',
  };
  const { title, autoQuery, enableHighlight } = reactive(defProps.widget.props);

  const searchValue = ref('');
  const listData = ref<any[]>([]);
  let copyData: any[] = [];
  const selectedId = ref<string | null>(null);

  function handleClick(item) {
    if (enableHighlight) {
      selectedId.value = item.id_;
    }
    Event.runEventByName('rowClickEvent', defProps.widget.events, item);
  }

  function getItemStyle(item) {
    if (item.configured) {
      return activeStyle;
    }
    return '';
  }

  function handleSearch() {
    listData.value = copyData.filter((option) => {
      if (!searchValue.value) return true;
      return option.name_.includes(searchValue.value);
    });
  }

  async function getData(params?) {
    const res = await Event.context.$httpBizService(
      { action: 'listAll', key: 'em_operation' },
      {
        query: {
          ...params,
        },
      },
    );
    listData.value = res.data;
    copyData = cloneDeep(res.data);
    Event.runEventByName('loadedEvent', defProps.widget.events, listData.value);
  }

  onMounted(() => {
    console.log('OperationList', 'getData');
    if (autoQuery) {
      getData();
    }
  });

  defineExpose({
    reload(params?) {
      getData(params);
    },
    reset() {
      listData.value = [];
    },
    setDataSource(data) {
      listData.value = data;
      copyData = cloneDeep(data);
      Event.runEventByName('loadedEvent', defProps.widget.events, listData.value);
    },
    setActiveItems(ids: string[]) {
      listData.value.forEach((op) => {
        op.configured = ids.includes(op.id_);
      });
      copyData.forEach((op) => (op.configured = ids.includes(op.id_)));
    },
    setSelectedId(id: string) {
      selectedId.value = id;
    },
    getSelectedId() {
      return selectedId.value;
    },
  });
</script>

<style lang="less" scoped>
  .operation-list-render {
    .right-status {
      width: 20px;
      height: 20px;
      line-height: 20px;
      font-size: 12px;
      text-align: center;
      border-radius: 50%;
      background: green;
      color: #fff;
    }

    .item-name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .active-item {
      background-color: var(--vxe-table-row-current-background-color);
    }
  }
</style>
