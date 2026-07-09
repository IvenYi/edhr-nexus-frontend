<template>
  <SignPreview
    :class="[disabled && 'sign-editor--disabled', readonly && 'sign-editor--readonly']"
    :items="images"
    :forbidden-remove="readonly || disabled"
    :signatureType="signatureType"
    :signTimeType="signTimeType"
    :signShowType="signShowType"
    @remove="onRemove"
  >
    <template #addSignBtn>
      <div v-if="showAdd" class="sign-editor__add-wrapper" @click="addSign()">
        <slot name="default">
          <div class="sign-editor-add">
            <i class="iconfont icon-dianziqianmingdd"></i>
            <div class="mt8px">{{ t('sys.pageDesigner.clickToAddSignature') }}</div>
          </div>
        </slot>
      </div>
    </template>
  </SignPreview>
</template>

<script lang="ts" setup name="sign-editor">
  import { computed } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { SignatureTimeTypeEnum } from '@gct/nocode-base';
  import { openSignModal } from '../logic';
  import SignPreview from './sign-preview.vue';
  import { SignMode, SignShowTypeEnum, SignatureTypeEnum } from '../constant';
  import type { SignInfo } from '../types';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      value?: SignInfo;
      items?: SignInfo[];
      multiple?: boolean;
      readonly?: boolean;
      disabled?: boolean;
      isShowSignature?: boolean;
      /** 签名显示样式 */
      signatureType?: SignatureTypeEnum;
      /** 签名日期处理方式 */
      signTimeType?: SignatureTimeTypeEnum;
      /** 签名显示方式(水平或垂直) */
      signShowType?: SignShowTypeEnum;
      /** 签名模式 */
      defaultSignMode?: SignMode;
      /** 是否隐藏签名模式切换 */
      hiddenSignMode?: boolean;
      openMode: 'popup' | 'dialog';
      /** 是否禁用用户名 */
      disableUserName?: boolean;
    }>(),
    {
      multiple: false,
      readonly: false,
      disabled: false,
      isShowSignature: true,
      openMode: 'popup',
      defaultSignMode: SignMode.PASSWORD,
      signShowType: SignShowTypeEnum.VERTICAL,
      signTimeType: SignatureTimeTypeEnum.FOLLOW_SIGNATURE,
      disableUserName: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: SignInfo | undefined): void;
    (e: 'update:items', items: SignInfo[] | undefined): void;
    (e: 'remove', val: SignInfo): void;
    (e: 'add', val: SignInfo): void;
  }>();

  // 维护本地列表数组
  const images = computed(() => {
    if (props.multiple) {
      return props.items || [];
    } else {
      return props.value ? [props.value] : [];
    }
  });

  const showAdd = computed(() => {
    if (props.readonly) {
      return false;
    }
    if (!props.isShowSignature) {
      return false;
    }
    // 只读和单选时不显示添加按钮
    return !(props.multiple === false && images.value.length);
  });

  /** 删除 */
  const onRemove = (val: SignInfo) => {
    if (props.multiple) {
      const newItems = images.value.filter((item) => item !== val);
      emit('update:items', newItems);
    } else {
      emit('update:value', undefined);
    }
    emit('remove', val);
  };

  const addSign = async () => {
    if (props.disabled || props.readonly) {
      return;
    }
    const signInfo = await openSignModal({
      defaultSignMode: props.defaultSignMode,
      hiddenSignMode: props.hiddenSignMode,
      openMode: props.openMode,
      disableUserName: props.disableUserName ?? false,
    });

    if (signInfo) {
      const newSignature: any = {
        ...signInfo,
        type: props.signatureType,
      };
      if (props.multiple) {
        const newItems = [...images.value, newSignature];
        emit('update:items', newItems);
      } else {
        emit('update:value', newSignature);
      }
      emit('add', newSignature);
    }
  };
</script>

<style lang="less" scoped>
  .sign-editor {
    .sign-editor-add {
      color: #797a7d;
      width: 120px;
      height: 68px;
      background-color: #f7f8fa;
      border: 1px dashed rgba(0, 0, 0, 0.15);
      border-radius: 2px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      cursor: pointer;
      .iconfont {
        height: 20px;
        font-size: 20px;
      }
    }

    &.sign-editor--disabled {
      .sign-editor-add {
        cursor: not-allowed;
        color: rgba(0, 0, 0, 0.15);
        border-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
</style>
