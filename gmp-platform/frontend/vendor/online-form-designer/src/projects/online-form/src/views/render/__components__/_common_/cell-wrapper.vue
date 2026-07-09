<template>
  <span
    :class="['cell-wrapper-container', showDisplayStatus]"
    :style="[containerStyles]"
    :title="targetFieldId"
  >
    <i
      v-if="annotationInfo?.showValidatorClass"
      class="validator-icon"
      :data-ann="annotationInfo?.annFieldId"
      @click.stop="(e) => setSelectValidatorId(e, dataRelationShip)"
    ></i>
    <template v-if="prefix">{{ prefix }}</template>
    <template v-if="showReadonlyText">
      <ReadOnlyText
        :class="annotationInfo?.annClassList"
        :readonlyText="readonlyText"
        :type="fieldType"
        :nullValSymbol="nullValSymbol"
        :style="contentStyles"
        :renderScript="renderScript"
        @click.stop="setSelectAnnotationId(annotationInfo?.annFieldId, dataRelationShip)"
      />
      <slot name="readonlyIntroduce"></slot>
    </template>
    <slot v-else></slot>
    <template v-if="suffix">{{ suffix }}</template>
  </span>
</template>

<script setup lang="ts" name="cell-wrapper">
  import { reactive, computed, h } from 'vue';
  import { omit, pick, isEmpty, mapValues } from 'lodash-es';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import ReadOnlyText from './ReadOnlyText.vue';
  import {
    useWidgetStaticAttrs,
    setSelectAnnotationId,
    setSelectValidatorId,
  } from '@gct/nocode-base';
  import type { BaseCoreComponent } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: any;
    widget: BaseCoreComponent.BasicSchema;
    formData: any;
    callback?: Function;
    /** 角标组件 */
    renderScript?: any;
    /** 批注类名 */
    annotationInfo?: any;
  }>();

  const { nullValSymbol, prefix, suffix } = reactive(props.widget.props);

  const { targetFieldId, fieldType, showDisplayStatus, dataRelationShip } = useWidgetStaticAttrs(
    props.widget,
  );

  // 静态定义样式
  const containerStyles: any = omit(props.widget.style, ['textAlign', 'verticalAlign']); // 字体样式
  const contentStyles = mapValues(
    pick(props.widget.style, ['fontSize', 'whiteSpace', 'wordBreak']),
    (o, k) => {
      if (k === 'wordBreak' && o === 'break-all') {
        return 'break-word';
      }
      return o;
    },
  ); // 字体样式

  const showReadonlyText = computed(() => {
    if (
      [
        FIELD_TYPE.SIGNATURE,
        FIELD_TYPE.REPORTER,
        FIELD_TYPE.IMAGE,
        FIELD_TYPE.ATTACHMENT,
        FIELD_TYPE.WAREHOUSE_MANAGER,
      ].includes(fieldType!) &&
      !isEmpty(props.modelValue)
    ) {
      return false;
    }
    return showDisplayStatus.value === 'readonly-text';
  });

  const readonlyText = computed(() => {
    let textValue =
      props.formData?._DICT?.[targetFieldId]?.[props.modelValue ?? ''] ||
      props.formData?.[targetFieldId] ||
      props.modelValue;

    textValue = Array.isArray(textValue) ? textValue.join() : textValue;

    return props.callback ? props.callback(textValue) : textValue;
  });
</script>

<style scoped lang="less">
  .cell-wrapper-container {
    /** 默认字体大小12px */
    font-size: var(--size, 12px);
    // line-height: 1.25;
    line-height: 1.5715;

    /** 默认不换行+空格保留 */
    white-space: pre;

    &.readonly-component {
      pointer-events: none;
    }

    .validator-icon {
      position: absolute;
      z-index: 1;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-top: 10px solid red;
      border-left: 10px solid transparent;
      cursor: pointer;
      pointer-events: all;
    }

    &.annotation-mark {
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgb(255 0 0 / 12%);
        cursor: pointer;
      }

      &.annotation-select {
        &::after {
          content: '';
          position: absolute;
          z-index: 1;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-top: 12px solid red;
          border-left: 12px solid transparent;
          cursor: pointer;
          pointer-events: all;
        }
      }
    }
  }
</style>
