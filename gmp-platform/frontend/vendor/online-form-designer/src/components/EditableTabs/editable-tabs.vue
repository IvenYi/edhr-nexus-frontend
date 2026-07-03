<template>
  <div class="editable-tabs">
    <a-tabs
      v-model:activeKey="_activeKey"
      ref="tabsRef"
      type="editable-card"
      @edit="handleTabsEdit"
      :destroyInactiveTabPane="destroyInactiveTabPane"
      :hideAdd="hideAdd"
    >
      <template v-for="tab in tabs" :key="tab.id">
        <a-tab-pane :closable="deletable">
          <template #tab>
            <span class="flex items-center">
              <IconNext
                v-if="tab.icon"
                :value="tab.icon"
                :size="16"
                :color="tab.color ?? 'var(--ant-primary-color)'"
                class="mr-2"
              />
              <span class="tab-name" :title="tab?.i18n ? $t(JSON.parse(tab.i18n)?.name) : tab.name">
                <!-- {{ tab.name }} -->
                {{ tab?.i18n ? $t(JSON.parse(tab.i18n)?.name) : tab.name }}
              </span>
              <span v-if="!isNil(tab.count)" class="ml-2">{{ tab.count }}</span>
            </span>
          </template>

          <slot name="tabContent" :tab="tab"></slot>
        </a-tab-pane>
      </template>

      <template #rightExtra>
        <slot name="rightExtra"></slot>
      </template>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { IconNext } from '/@/components/Icon';
  import { IEditableTab } from './types';
  import { isNil } from 'lodash-es';

  const props = withDefaults(
    defineProps<{
      activeKey?: string;
      tabs: IEditableTab[];
      /** 显示添加标签按钮 */
      hideAdd?: boolean;
      /** 显示每个标签的删除按钮 */
      deletable?: boolean;
      /** 是否在pane隐藏的时候销毁 */
      destroyInactiveTabPane?: boolean;
    }>(),
    {
      hideAdd: false,
      deletable: false,
      destroyInactiveTabPane: false,
    },
  );

  const emit = defineEmits<{
    /** 更新激活的标签页标识 */
    (e: 'update:activeKey', value?: string): void;
    /** 点击添加标签页图标 */
    (e: 'add'): void;
    /** 删除某个标签页 */
    (e: 'remove', value: string): void;
  }>();

  const _activeKey = computed({
    get() {
      return props.activeKey;
    },
    set(v) {
      emit('update:activeKey', v);
    },
  });

  function handleTabsEdit(...args) {
    console.log('TabsEdit', args);
    const [key, action] = args;
    if (action === 'remove') {
      emit('remove', key);
    } else if (action === 'add') {
      emit('add');
    }
  }

  defineExpose({});
</script>

<style lang="less" scoped>
  .editable-tabs {
    --editable-tabs-tab-name-width: 150px;
    :deep(.ant-tabs-nav-list) {
      align-items: center;
    }

    :deep(.ant-tabs-tab) {
      padding: 12px 16px;
      border: none !important;
      border-bottom: 1px solid #e8ebf0 !important;
      background-color: #fff;

      .tab-name {
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        max-width: var(--editable-tabs-tab-name-width);
      }
    }

    :deep(.ant-tabs-tab-active) {
      border-bottom: 2px solid var(--ant-primary-color) !important;
    }

    :deep(.ant-tabs-nav-add),
    :deep(.ant-tabs-nav-operations .ant-tabs-nav-add) {
      align-self: center;
      min-width: 24px;
      height: 24px;
      // 不能加margin否则ant计算添加按钮出现的逻辑判断不准
      padding: 0 4px;
      border: none;
      outline: none;
      background-color: var(--ant-primary-1);
      color: var(--ant-primary-color);
      line-height: 24px;
    }

    :deep(.ant-tabs-top > .ant-tabs-nav) {
      margin: 0;
    }
  }
</style>
