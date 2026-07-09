<template>
  <div class="panel-tmpl-config">
    <div class="panel-tmpl-config__header">
      <AddTmplBtn @add="handleAddTmpl" />
    </div>
    <a-empty
      v-if="tmplConfig.length === 0"
      :description="$t('sys.onlineForm.pleaseAddTemplate')"
      :image="EmptyImg"
    />
    <Scrollbar v-else class="panel-tmpl-config__body">
      <component
        class="panel-tmpl-config__item"
        v-for="(tmpl, i) in tmplConfig"
        :key="tmpl.id"
        :is="type2Component[tmpl.type]"
        :value="tmpl"
        @remove="removeTmpl(i)"
      />
    </Scrollbar>
  </div>
</template>

<script lang="ts" setup name="panel-tmpl-config">
  import { ref, computed, nextTick, onBeforeMount, onMounted } from 'vue';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import AddTmplBtn from './common/add-tmpl-btn.vue';
  import { DeviceLink, DeviceLinkTmplUtil, useFormTmplConfig } from '@gct/nocode-base';
  import DeviceTmplEditor from './device-tmpl/device-tmpl-editor.vue';
  import AiTmplEditor from './ai-tmpl/ai-tmpl-editor.vue';
  import EmptyImg from '@/assets/images/empty-2.svg';
  import { Scrollbar } from '/@/components/Scrollbar';

  const type2Component = {
    [DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION]: DeviceTmplEditor,
    [DeviceLink.TmplTypeEnum.AI_OCR]: AiTmplEditor,
  };

  const c = useFormTmplConfig().injectController();

  const tmplConfig = computed(() => c.state.tmpls);

  const permissionStore = usePermissionStoreWithOut();

  /** 创建新模板 */
  const handleAddTmpl = (type: DeviceLink.TmplTypeEnum) => {
    tmplConfig.value.push(DeviceLinkTmplUtil.createTmpl(type));
  };

  /** 删除模板 */
  const removeTmpl = (i: number) => {
    tmplConfig.value.splice(i, 1);
  };

  onBeforeMount(async () => {
    await permissionStore.setIOTPermission();
  });
</script>

<style lang="less" scoped>
  .panel-tmpl-config {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 12px 0;

    &__item {
      // margin-top: 12px;

      & + & {
        margin-top: 8px;
      }
    }

    &__header {
      flex-shrink: 0;
      margin-bottom: 8px;
      padding: 0 12px;
    }

    &__body {
      flex-grow: 1;
      overflow: auto;
      padding: 4px 12px 0;
    }

    // ant组件统一压制
    --gct-ant-input-height: 26px;
    --gct-ant-font-size: 12px;
    --gct-ant-font-color: #1a1d23;

    // 继承的字体样式
    font-size: var(--gct-ant-font-size);
    color: var(--gct-ant-font-color);
    :deep(*::placeholder) {
      color: #c6c6c6;
      font-size: var(--gct-ant-font-size);
    }
    // button样式
    :deep(.ant-btn) {
      font-size: var(--gct-ant-font-size);
    }

    // select框
    :deep(.ant-select-single:not(.ant-select-customize-input) .ant-select-selector) {
      height: var(--gct-ant-input-height);
      padding-left: 8px;

      .ant-select-selection-search {
        left: 8px;
      }
    }
    :deep(
      .ant-select-single:not(.ant-select-customize-input)
        .ant-select-selector
        .ant-select-selection-search-input
    ) {
      height: calc(var(--gct-ant-input-height) - 2px);
    }

    :deep(textarea.ant-input) {
      padding-left: 8px;
      padding-right: 8px;
    }
    :deep(.ant-select) {
      font-size: var(--gct-ant-font-size);
      color: var(--gct-ant-font-color);
      .ant-select-selection-item {
        line-height: 24px;
      }

      .ant-select-arrow,
      .ant-select-clear {
        right: 8px;
      }
    }
    :deep(.ant-select-single) {
      // 带搜索的placeholder样式
      .ant-select-selector .ant-select-selection-item,
      .ant-select-selector .ant-select-selection-placeholder {
        line-height: calc(var(--gct-ant-input-height) - 2px);
        padding-right: 18px;
      }
    }
    // input框
    :deep(.ant-input-affix-wrapper) {
      padding: 4px 4px 4px 8px;
      font-size: var(--gct-ant-font-size);
      color: var(--gct-ant-font-color);
      line-height: 1;
      .ant-input {
        font-size: var(--gct-ant-font-size);
        color: var(--gct-ant-font-color);
        line-height: 1;
      }
    }
    // form-item 样式
    :deep(.ant-form-item-control-input) {
      min-height: var(--gct-ant-input-height);
    }
    // switch 样式
    :deep(.ant-switch) {
      height: 14px;
      line-height: 14px;
      min-width: 24px;
      .ant-switch-handle {
        width: 10px;
        height: 10px;
      }
      .ant-switch-inner {
        margin: 0 5px 0 18px;
      }
      &.ant-switch-checked .ant-switch-inner {
        margin: 0 18px 0 5px;
      }
      &.ant-switch-checked .ant-switch-handle {
        left: calc(100% - 12px);
      }
    }
    // 分割线样式
    :deep(.ant-divider) {
      line-height: 1;

      .ant-divider-inner-text {
        padding: 0 8px;
      }
    }
    :deep(.ant-divider-horizontal.ant-divider-with-text) {
      border-top-color: #e0e3eb;
      margin: 0;
      font-size: 12px;
      .ant-divider-inner-text {
        color: #c6c6c6;
        > i {
          font-size: var(--gct-ant-font-size);
        }
      }
    }

    // 空数据样式
    :deep(.ant-empty) {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .ant-empty-image {
        height: 114px;
      }
      .ant-empty-description {
        font-weight: 400;
        font-size: 14px;
        color: #8b8b8b;
      }
    }

    :deep(.ant-radio-wrapper) {
      font-size: var(--gct-ant-font-size);
      color: var(--gct-ant-font-color);
    }
  }
</style>
