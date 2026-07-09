<template>
  <!-- <a-checkable-tag
    class="align-editor-item"
    @click="propValue = i.label"
    :checked="checkedTag(i.label)"
    :key="i.label"
    v-for="i in options"
  >
    <span class="iconfont" :class="i.value"></span>
  </a-checkable-tag> -->
  <div class="align-radio-wrap">
    <a-radio-group class="align-editor-item" v-model:value="propValue" size="small">
      <a-radio-button v-for="option of options" :key="option.label" :value="option.label">
        <a-tooltip>
          <template #title>{{ t(`sys.pageDesigner.${option.label}Align`) }}</template>
          <span class="iconfont" :class="option.value"></span>
        </a-tooltip>
      </a-radio-button>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts" name="align-editor">
  import { ref, computed, reactive } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const options = computed(() => propConfig.options);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style scoped lang="less">
  // .ant-radio-group.align-editor-item {
  //   .ant-radio-button-wrapper {
  //     padding: 0;
  //     width: 48px;

  //     &:first-child {
  //       border-radius: 4px 0 0 4px;
  //     }

  //     &:last-child {
  //       border-radius: 0px 4px 4px 0;
  //     }
  //     .iconfont {
  //       display: inline-block;
  //       width: 100%;
  //       height: 100%;
  //       text-align: center;
  //     }
  //   }
  // }
  .align-radio-wrap {
    padding: 2px;
    border-radius: 4px;
    background-color: #f2f4f7;
    display: inline-block;
    font-size: 0;
    width: 100%;
    :deep(.ant-radio-group) {
      width: 100%;
      display: flex;
    }
    :deep(.ant-radio-button-wrapper) {
      flex: 1;
      border-width: 0;
      border: 0;
      background-color: transparent;
      color: #212528;
      border-radius: 2px;
      padding: 0;
      text-align: center;

      &:not(:first-child):before {
        width: 0;
      }

      & > span:not(.ant-radio-button) {
        padding: 2px;
        border-radius: 2px;
        display: inline-flex;
        line-height: 1;
        vertical-align: -2px;
        &:hover {
          background-color: #e6e9ef;
        }
      }
      &.ant-radio-button-wrapper-checked {
        background-color: #fff;
        span:last-child:hover {
          background-color: transparent;
        }
      }
    }
    :deep(
        .ant-radio-group-solid
          .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within
      ) {
      box-shadow: 0 0 0 0;
    }
    :deep(
        .ant-radio-group-solid
          .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover
      ) {
      color: #212528;
    }
    :deep(.ant-radio-group-small .ant-radio-button-wrapper) {
      height: 24px;
      line-height: 24px;
    }
    :deep(.ant-radio-button-wrapper:focus-within) {
      box-shadow: 0 0 0 0;
    }
  }
</style>
