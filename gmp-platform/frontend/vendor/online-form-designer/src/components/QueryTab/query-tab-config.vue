<template>
  <div :class="ns.b()">
    <a-button type="primary" ghost class="w-full mb-4" @click="onAddNew">
      <template #icon>
        <PlusOutlined />
      </template>
      {{ $t('sys.edhr.queryDefinitionPage') }}
    </a-button>

    <div class="query-config-wrapper">
      <div v-for="tab in _tabConfigs" :key="tab.id" class="flex items-center justify-between mb-2">
        <a-checkbox
          :class="ns.e('checkbox')"
          :checked="!_config.hiddenTabs?.includes(tab.id)"
          @update:checked="(checked) => onChecked(checked, tab.id)"
        >
          <IconNext
            :value="tab.icon"
            :size="16"
            :color="tab.color ?? 'var(--ant-primary-color)'"
            class="mr-2"
          />
          <span :class="ns.e('item-name')" :title="tab.name">
            {{ tab?.i18n ? $t(JSON.parse(tab.i18n)?.name) : tab.name }}
          </span>
        </a-checkbox>
        <div class="ope-action" v-if="tab.type !== QueryTabType.BUILTIN">
          <i
            class="iconfont icon-bianji cursor-pointer mr-2 text-[#797a7d]"
            @click="onEdit(tab)"
          ></i>
          <i class="iconfont icon-shanchu cursor-pointer text-[#797a7d]" @click="onDelete(tab)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="query-tab-config">
  import { computed, createVNode, reactive } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { QueryTabController } from './logic';
  import { IQueryTab, IQueryTabConfig } from './types';
  import { cloneDeep } from 'lodash-es';
  import { uuid2 } from '/@/utils/uuid';
  import { QueryTabType } from './constants';
  import { taroEnvModule } from '@visactor/vtable/es/vrender';

  const ns = useNamespace('query-tab-config');

  const props = defineProps<{
    config: IQueryTabConfig;
    controller: QueryTabController;
  }>();

  const _config = reactive<IQueryTabConfig>(cloneDeep(props.config));
  const _tabConfigs = computed(() => {
    return [...props.controller.opts.builtinTabs, ..._config.customTabs];
  });

  const onChecked = (checked, id) => {
    if (checked) {
      _config.hiddenTabs = _config.hiddenTabs.filter((e) => e !== id);
    } else {
      _config.hiddenTabs.push(id);
    }
  };

  const onAddNew = async () => {
    const newConfig: IQueryTab = {
      id: uuid2(32),
      type: QueryTabType.CUSTOM,
      name: '',
      queryFields: {},
    };
    const res = await props.controller.editTab(newConfig);
    if (res) {
      _config.customTabs.push(res);
    }
  };

  const onEdit = async (tab) => {
    const res = await props.controller.editTab(tab);
    if (res) {
      const index = _config.customTabs.findIndex((e) => e.id === tab.id);
      _config.customTabs.splice(index, 1, res);
    }
  };

  const onDelete = async (tab) => {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        title: createVNode('span', { style: 'color:#797a7d;' }, $t('sys.sureToDo')),
        onOk: () => {
          resolve(true);
        },
        onCancel: () => {
          reject(false);
        },
      });
    });
    const index = _config.customTabs.findIndex((e) => e.id === tab.id);
    _config.customTabs.splice(index, 1);
  };

  useModal(async () => {
    return {
      ok: true,
      data: [cloneDeep(_config)],
    };
  });
</script>

<style lang="scss" scoped>
  @include b(query-tab-config) {
    padding: 24px;

    :deep(.ant-checkbox) {
      top: 0;
    }
    :deep(.ant-checkbox-wrapper) {
      width: 1px;
      flex-grow: 1;
      flex-shrink: 1;
      > span:last-child {
        width: 1px;
        flex-grow: 1;
        flex-shrink: 1;
        display: inline-flex;
        align-items: center;
      }
    }

    @include e(item-name) {
      width: 1px;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
      text-wrap: nowrap;
      text-overflow: ellipsis;
    }
  }
</style>
