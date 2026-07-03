<template>
  <div class="button-size-wrap">
    <a-radio-group v-model:value="propValue" size="small" button-style="solid">
      <a-radio-button v-for="option of options" :key="option.value" :value="option.value">
        {{ t(option.label) }}
      </a-radio-button>
    </a-radio-group>
  </div>
</template>
<script setup lang="ts" name="radio-bgc-editor">
  import { ref, computed, reactive } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const options = computed(() => {
    if (propConfig.filterFn && typeof propConfig.filterFn === 'function') {
      return propConfig.filterFn(propConfig.options);
    }
    return propConfig.options;
  });
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>
<style lang="scss" scoped>
  .button-size-wrap {
    width: 100%;
    padding: 2px;
    border-radius: 4px;
    background-color: #f2f4f7;
    display: inline-block;
    :deep(.ant-radio-group) {
      width: 100%;
      display: flex;
    }
    :deep(.ant-radio-button-wrapper) {
      border-width: 0;
      border: 0;
      background-color: transparent;
      color: #212528;
      border-radius: 2px;
      padding: 0;
      flex: 1;
      text-align: center;

      &:not(:first-child):before {
        width: 0;
      }

      span:last-child {
        padding: 4px;
        border-radius: 2px;
        display: inline-flex;
        line-height: 1;
        vertical-align: -1px;
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
  }
</style>
