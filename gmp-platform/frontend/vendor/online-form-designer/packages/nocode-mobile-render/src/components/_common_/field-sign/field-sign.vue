<template>
  <NocodeField
    :class="['field-sign']"
    :label="label"
    v-bind="$attrs"
    :clearable="false"
    :disabled="disabled"
    label-align="top"
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
    <template #input>
      <SignEditor
        :class="['sign-editor']"
        :disabled="disabled"
        v-model:items="signatures"
        :multiple="true"
        :hiddenSignMode="true"
        :defaultSignMode="SignMode.PASSWORD"
        :isShowSignature="isShowSignature"
        :signatureType="signatureType"
        :signShowType="signShowType"
        :signTimeType="signTimeType"
        @add="handleAdd"
      />
    </template>
  </NocodeField>
</template>

<script lang="ts" setup name="field-sign">
  import { computed } from 'vue';
  import NocodeField from '../nocode-field/nocode-field.vue';
  import { SignatureNumberTypeEnum, SignatureTimeTypeEnum } from '@gct/nocode-base';
  import { SignatureTypeEnum, SignEditor, SignInfo, SignMode, SignShowTypeEnum } from '../sign';

  const props = withDefaults(
    defineProps<{
      label?: string;
      disabled?: boolean;
      modelValue?: string;
      /** 签名格式 */
      signatureType?: SignatureTypeEnum;
      /** 签名人数 */
      signatureNumber?: SignatureNumberTypeEnum;
      /** 签名显示方式 */
      signShowType?: SignShowTypeEnum;
      /** 签名日期配置 */
      signTimeType: SignatureTimeTypeEnum;
    }>(),
    {
      signatureNumber: SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void;
    (e: 'add', val: SignInfo): void;
  }>();

  const signatures = computed<any[]>({
    get: () => (props.modelValue ? JSON.parse(props.modelValue) : []),
    set: (value) => {
      const modelValue = value.length ? JSON.stringify(value) : '';
      emit('update:modelValue', modelValue);
    },
  });

  const isShowSignature = computed(() => {
    return (
      props.signatureNumber === SignatureNumberTypeEnum.SIGNATURE_MULTIPLE ||
      (props.signatureNumber === SignatureNumberTypeEnum.SIGNATURE_SINGLE &&
        !signatures.value.length)
    );
  });

  const handleAdd = (signature: SignInfo) => {
    emit('add', signature);
  };
</script>

<style lang="less" scoped>
  .field-sign {
    :deep(.sign-editor-add) {
      width: 102px;
      height: 62px;
      font-size: 12px;
      > .iconfont {
        font-size: 18px;
        height: 20px;
      }
      > div {
        margin-top: 4px;
      }
    }
    :deep(.sign-preview) {
      --sign-preview-img-width: 102px;
      --sign-preview-img-height: 62px;
    }
  }
</style>
