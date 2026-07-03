<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
  >
    <image-cell-comp-field
      v-if="!signatures.length"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      label="添加签名"
    />
    <SignEditor
      v-else
      class="mobile-sign-render"
      :readonly="true"
      v-model:items="signatures"
      :multiple="true"
      :signatureType="signatureType"
      :signShowType="signDisplayStyle"
      :signTimeType="signTimeType"
      :signatureNumber="signatureNumber"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-sign-render">
  import { computed, reactive } from 'vue';
  import {
    SignatureNumberTypeEnum,
    useNocodeFormWidget,
    useWidgetStaticAttrs,
    type ISign,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import { SignEditor } from '../../_common_';
  import ImageCellCompField from '../../_common_/base-cell-comp-field/image-cell-comp-field.vue';

  const props = defineProps<{
    modelValue?: string;
    widget: ISign;
    formData: any;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { showDisabled } = useWidgetStaticAttrs(props.widget);

  const {
    signatureType,
    signDisplayStyle,
    signTimeType,
    signatureNumber = SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
  } = reactive(props.widget.props);

  const signatures = computed<any[]>({
    get: () => (props.modelValue ? JSON.parse(props.modelValue) : []),
    set: (v) => {
      const modelValue = v.length ? JSON.stringify(v) : '';
      emit('update:modelValue', modelValue);
    },
  });
</script>
<style lang="less" scoped>
  @signature-size: 75px;
  .mobile-sign-render.sign-preview {
    --sign-preview-img-width: var(--cmp-width, @signature-size);
    --sign-preview-img-height: 100%;
    display: inline-flex;
    overflow: visible;
    :deep(.sign-preview-item) {
      display: inline-flex;
      border-radius: 2px;
      // width: var(--cmp-width, 75px);
      height: 100%;
      .van-image {
        border: none;
      }
    }
  }
</style>
