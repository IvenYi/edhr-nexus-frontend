<template>
  <div :class="ns.b()">
    <a-button type="primary" ghost class="w-full mb-4" @click="onAddNew">
      <template #icon>
        <PlusOutlined />
      </template>
      新增内置标签
    </a-button>
    <div
      v-for="tab in builtinTabs"
      :key="tab.id"
      :class="ns.e('item')"
      class="flex items-center justify-between mb-2"
    >
      <span class="flex items-center">
        <IconNext
          :value="tab.icon"
          :size="16"
          :color="tab.color ?? 'var(--ant-primary-color)'"
          class="mr-2"
        />
        {{ tab.name }}
      </span>
      <div class="ope-action">
        <i class="iconfont icon-bianji cursor-pointer mr-2 text-[#797a7d]" @click="onEdit(tab)"></i>
        <i class="iconfont icon-shanchu cursor-pointer text-[#797a7d]" @click="onDelete(tab)"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="search-tab-editor">
  import { computed, watch } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModalData, useNamespace } from '@gct/runtime';
  import { uuid2 } from '/@/utils/uuid';
  import { QueryTabModal } from '/@/components/QueryTab';

  const ns = useNamespace('search-tab-editor');

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const builtinTabs = computed(() => {
    return propValue.value.builtinTabs;
  });

  console.log('search-tab-editor', propValue.value, defProps.widget?.props);

  const editTab = async (tab) => {
    const res = await gct.openUtil.modal<IModalData>(
      QueryTabModal,
      {
        tab,
        searchWidgets: propValue.value.tabSearchWidgets,
        modelCategory: propValue.value.modeldata.modelCategory,
      },
      {
        title: '自定义查询页面',
        width: 840,
      },
    );
    if (!res.ok) {
      return;
    }
    return res.data![0];
  };

  const onAddNew = async () => {
    const newConfig: any = {
      id: uuid2(32),
      type: 'builtin',
      name: '',
      queryFields: {},
    };
    const res = await editTab(newConfig);
    if (res) {
      builtinTabs.value.push(res);
    }
  };

  const onEdit = async (tab) => {
    const res = await editTab(tab);
    if (res) {
      const index = builtinTabs.value.findIndex((e) => e.id === tab.id);
      builtinTabs.value.splice(index, 1, res);
    }
  };

  const onDelete = async (tab) => {
    const index = builtinTabs.value.findIndex((e) => e.id === tab.id);
    builtinTabs.value.splice(index, 1);
  };
</script>

<style lang="scss" scoped>
  @include b(search-tab-editor) {
    padding: 12px 0;

    @include e(item) {
      border-radius: 4px;
      background: #fafafa;
    }
  }
</style>
