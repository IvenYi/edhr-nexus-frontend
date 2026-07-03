<template>
  <div
    v-for="(i, index) in action.getActions"
    :key="i.id"
    class="inline-block table-actionItem"
    :style="{
      '--fontColor': i.props.fontColor,
      '--backgroundColor': i.props.backgroundColor,
    }"
  >
    <Divider type="vertical" class="action-divider" v-if="!!index" />
    <getTableAction
      v-if="i.type === FormComponents.OpeButton"
      :action="i"
      @runEvent="runEvent(i)"
    />
    <getNewTableAction v-else :action="i" @runEvent="runEvent(i)" />
  </div>
  <a-dropdown v-if="!!action.getDropdownList.length" trigger="click">
    <a class="ant-dropdown-link whitespace-nowrap" @click.prevent>
      <!-- {{ t('sys.component.table.more') }} -->
      <MoreOutlined class="icon-more"
    /></a>
    <template #overlay v-if="showmore">
      <a-menu>
        <a-menu-item v-for="(i, index) in action.getDropdownList" :key="index">
          <getPopAction :action="i" @runEvent="runEvent(i)" />
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script setup lang="ts">
  import { OperateButton } from '/@page-designer/types/web';
  import { computed, ref } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { getTableAction, getPopAction, getNewTableAction } from './opeAction.tsx';
  import { FormComponents } from '/@/projects/page-designer/src/enum';
  import { Divider } from 'ant-design-vue';
  const emit = defineEmits(['runEvent']);
  const props = defineProps<{
    buttonOptions: OperateButton[];
    visibleButtons: number;
    showmore: boolean;
  }>();
  const action = computed(() => {
    let getDropdownList = cloneDeep(props.buttonOptions) || [];
    let getActions = getDropdownList.splice(0, props.visibleButtons);
    return { getActions, getDropdownList };
  });
  function runEvent(value: OperateButton) {
    emit('runEvent', value.props);
  }
</script>
<style scoped lang="less">
  :deep(.ant-btn) {
    &.btn-font-color {
      color: var(--fontColor) !important;
    }

    &.btn-bg-style {
      border-color: var(--backgroundColor) !important;
      background: var(--backgroundColor) !important;
    }

    &.btn-border-style {
      border-color: var(--backgroundColor) !important;
      background: transparent;
    }
  }
</style>
