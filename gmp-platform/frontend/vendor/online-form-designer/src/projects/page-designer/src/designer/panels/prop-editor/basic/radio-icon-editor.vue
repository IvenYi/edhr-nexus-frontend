<template>
  <a-radio-group v-model:value="propValue" class="radio-icon-editor" size="small">
    <a-radio-button v-for="(opt, index) in options" :value="opt.value" :key="index">
      <span class="iconfont" :class="[opt.icon, opt.label ? '!text-14px' : '']">{{
        $t(opt.label ?? '')
      }}</span>
    </a-radio-button>
  </a-radio-group>
</template>

<script setup lang="ts" name="radio-icon-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';
  import type { SelectProps } from 'ant-design-vue';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const propConfig = defProps.propConfig as SelectProps;
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const options = computed(() => propConfig.options);
</script>

<style lang="less" scoped>
  .radio-icon-editor {
    background: #f0f0f0;
    border-radius: 4px;
    width: 100%;
    display: flex;
    padding: 2px;

    .ant-radio-button-wrapper {
      flex: 1;
      border: none;
      background-color: transparent;
      text-align: center;
      color: #8f8f8f;
      line-height: 26px;

      &:not(:first-child):before {
        display: none;
      }

      &-checked {
        background-color: #fff;
        border-radius: 2px;
        color: #474747;

        &:not(.ant-radio-button-wrapper-disabled):hover {
          color: #474747;
        }
      }
    }
  }
</style>
