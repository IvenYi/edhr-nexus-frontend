<template>
  <van-field
    :class="[
      ns.b(),
      ns.m(type),
      ns.is('first-in-row', props.isFirstInRow),
      ns.is('more-options', showMoreOptions),
    ]"
    colon
    label-align="right"
    :disabled="localDisabled"
    :style="{
      // 实际宽度需要 +6 来适配 vant 呈现
      '--van-field-label-width': props.labelWidth > 0 ? `${props.labelWidth + 6}px` : 'auto',
    }"
    v-model="rangeValue"
    :name="widget.id"
    :rules="rules"
  >
    <template #label>
      <span :class="ns.e('label')">
        {{ computedLabel }}
      </span>
    </template>
    <template #input>
      <span :class="ns.e('editor')">
        <component
          :disabled="localDisabled"
          :readonly="readonly"
          v-model="modelValue"
          :is="renderRef"
          :widget="widget"
          :modelCategory="modelCategory"
          :formData="formData"
        />
      </span>
      <moreOption
        v-if="showMoreOptions"
        :moreOptions="moreOptions"
        v-model:useMore="useMore"
        v-model:ope="ope"
        :fieldType="fieldType"
        :disabled="disabled"
        @change="modelValue = null"
      />
    </template>
  </van-field>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, computed, reactive, toRefs, withDefaults } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { SearchWidgets } from '/@page-designer/types/pad/search-widget-types';
  import { useI18n } from '@mobile/utils/useI18n';
  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';
  import moreOption from '../more_option.vue';

  const ns = useNamespace('pad-search-field-render');

  const SearchInput = defineAsyncComponent(() => import('./search_input.vue'));
  const SearchNumber = defineAsyncComponent(
    () => import('./components/search-render-numeric/search-render-numeric'),
  );
  const SearchSelect = defineAsyncComponent(
    () => import('./components/search-render-select/search-render-select'),
  );
  const SearchBoolean = defineAsyncComponent(() => import('./search_boolean'));
  const SearchDate = defineAsyncComponent(
    () => import('./components/search-render-date/search-render-date'),
  );

  const WidgetsMap = {
    SearchInput,
    SearchSwitch: SearchBoolean,
    SearchSelect,
    // 人员选择
    SearchUserSelect: SearchSelect,
    // 部门选择
    SearchSelectDepartment: SearchSelect,
    // 版本选择
    SearchRdoSelect: SearchSelect,
    // 事务
    SearchTransaction: SearchSelect,
    // 打印机
    SearchTmplTreeSelect: SearchSelect,
    // 标签设计
    SearchPrinter: SearchSelect,
    SearchNumberInput: SearchNumber,
    SearchStringNumberInput: SearchNumber,
    SearchDateTime: SearchDate,
    SearchDate,
    SearchTime: SearchDate,
  };

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      value: any;
      widget: SearchWidgets;
      modelCategory: string;
      formData: IData;
      labelWidth: number;
      isFirstInRow: boolean;
      rules: any;
    }>(),
    { labelWidth: 0, isFirstInRow: false },
  );

  const emit = defineEmits(['update:value']);

  const { type, i18n } = reactive(props.widget);
  useDependency(props.widget as any, {});
  const { label, readonly, disabled, fieldName, moreOptions, useMore, ope, fieldType } = toRefs(
    props.widget.props,
  );

  /* eslint-disable */
  const showMoreOptions = computed(() => {
    return moreOptions && moreOptions.value && moreOptions.value.length > 0 && !readonly.value;
  });

  const localDisabled = computed(() => {
    return disabled.value || (useMore && !!useMore?.value);
  });
  /* eslint-enable */ // 重新开启校验

  const renderRef = computed(() => {
    return WidgetsMap[type];
  });

  const modelValue = computed<any>({
    get() {
      return props.value;
    },
    set(value) {
      emit('update:value', value);
    },
  });

  const rangeValue = computed(() => props.value);

  const computedLabel = computed(() => {
    return i18n?.label ? t(i18n.label) : label.value || fieldName?.value;
  });
</script>

<style lang="scss">
  @include b(pad-search-field-render) {
    --van-field-label-color: #{getCssVar(color-text, 1)};

    @include e(label) {
      color: #{getCssVar(color-text, 1)};
    }

    @include when(first-in-row) {
      padding-left: 0 !important;
    }

    @include when(more-options) {
      @include e(editor) {
        width: calc(100% - 40px);
        margin-right: 4px;
      }
    }

    @include e(label) {
      padding-top: 5px;
      font-size: 15px;
    }

    @include e(editor) {
      --editor-height: 36px;
      --editor-font-size: 15px;
      --editor-font-color: var(--gct-color-text-1);
      --editor-placeholder-color: var(--gct-color-text-6);
      --editor-bg-color: var(--gct-color-bg-3);
      --editor-border-radius: 4px;
      --editor-padding: 12px;

      width: 100%;
      min-height: 36px;
      border-radius: 4px;

      .pad-search-editor {
        display: flex;
        align-items: center;
        height: var(--editor-height);
        padding: 0 var(--editor-padding);
        border-radius: var(--editor-border-radius);
        background-color: var(--editor-bg-color);
        color: var(--editor-font-color);
        font-size: var(--editor-font-size);

        &::placeholder {
          color: var(--editor-placeholder-color);
          font-size: var(--editor-font-size);
        }

        &.is-disabled {
          --editor-bg-color: #e6e9ef;
          --editor-placeholder-color: var(--gct-color-text-7);

          border: 1px solid var(--gct-color-bg-5);
          cursor: default;

          .gct-iconfont {
            opacity: 0.5;
          }
        }
      }

      .van-field {
        padding: 0;
      }
    }

    flex-wrap: nowrap;
    margin: 6px 0;
    padding: 0;
    padding-left: 24px;
    color: #{getCssVar(color-text, 1)};

    .van-field__label {
      padding-top: 7px;
      font-size: 15px;
    }

    .van-field__value {
      width: calc(100% - var(--van-field-label-width) - 12px);
      word-wrap: normal;
    }
  }
</style>

<style scoped lang="less">
  :deep(.custom-cell-title) {
    box-sizing: border-box;
    flex: none;
    width: var(--van-field-label-width);
    margin-right: var(--van-field-label-margin-right);
    color: var(--van-field-label-color);
    text-align: left;
    word-wrap: break-word;
  }

  :deep(.van-field__value) {
    height: auto !important;
  }

  :deep(.van-cell__right-icon) {
    display: flex;
    align-items: center;
    height: auto;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    line-height: inherit;
  }

  :deep(.van-field__value:has(div.van-field__error-message)) {
    // .gct-search-render-range-field__start .pad-search-editor,
    .gct-search-render-range-field__end .pad-search-editor {
      border: 1px solid #f54547;
    }
  }
</style>
