<template>
  <div class="display-editor flex justify-between">
    <div
      :class="[
        'display-editor__item',
        'p-8px',
        'rounded-4px',
        { 'display-editor__item-checked': opt.value === propValue },
      ]"
      v-for="(opt, index) in options"
      :value="opt.value"
      :key="index"
      @click.stop="handleClick(opt.value)"
    >
      <div class="top px-5px rounded-t-2px">
        <SvgIcon style="width: 48px" name="shuxian" />
      </div>
      <div class="flex display-name p-4px text-12px rounded-b-2px items-center justify-start">
        <SvgIcon class="icon opacity-50" size="12" :name="opt.icon" />
        <span class="name" :class="[opt.icon, opt.label ? '!text-12px' : '']">{{
          t(opt.label ?? '')
        }}</span>
        <span class="more ml-auto" v-if="opt.value === 'more'">{{
          t('sys.pageDesigner.more')
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="radio-display-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { computed } from 'vue';
  import type { SelectProps } from 'ant-design-vue';
  import { SvgIcon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const defProps = defineProps(props);
  const propConfig = defProps.propConfig as SelectProps;
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const options = computed(() => propConfig.options);

  const handleClick = (val) => {
    propValue.value = val;
  };
</script>

<style lang="less" scoped>
  .display-editor {
    &__item {
      cursor: pointer;
      width: calc(50% - 8px);
      background: #fff;
      border: 1px solid #e8ebf0;
      .top {
        height: 16px;
        background: #e6e9ef;
      }
      .display-name {
        height: 20px;
        line-height: 20px;
        background: #f7f8fa;
        .name {
          zoom: 0.8;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .more {
          zoom: 0.8;
          color: var(--ant-primary-color);
        }
      }
      &:hover,
      &-checked {
        background: #f7f8fa;
        .display-name {
          background: #fff;
          .icon {
            opacity: 1;
          }
        }
      }
      &-checked {
        border-color: var(--ant-primary-color);
      }
    }
  }
</style>
