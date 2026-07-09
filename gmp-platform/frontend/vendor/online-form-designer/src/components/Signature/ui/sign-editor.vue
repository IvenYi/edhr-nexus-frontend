<template>
  <div :class="[ns.b(), disabled && ns.m('disabled'), readonly && ns.m('readonly')]">
    <div v-if="showAdd" :class="ns.e('add')" @click="addSign()">
      <i class="iconfont icon-dianziqianmingdd" style="font-size: 20px; height: 22px"></i>
      <div class="mt8px">{{ t('sys.pageDesigner.clickToAddSignature') }}</div>
    </div>
    <SignPreview
      v-if="images.length"
      :items="images"
      :forbidden-remove="readonly || disabled"
      :signatureType="signatureType"
      @remove="onRemove"
    />
  </div>
</template>

<script lang="ts" setup name="sign-editor">
  import { SignatureTypeEnum, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { SignInfo } from '../types';
  import { computed } from 'vue';
  import { openSignModal } from '../logic';
  import SignPreview from './sign-preview.vue';
  import { SignMode } from '../constant';

  const ns = useNamespace('sign-editor');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value?: SignInfo;
      items?: SignInfo[];
      multiple?: boolean;
      readonly?: boolean;
      disabled?: boolean;
      signatureType?: SignatureTypeEnum;
      defaultSignMode?: SignMode;
      hiddenSignMode?: boolean;
    }>(),
    {
      multiple: false,
      readonly: false,
      disabled: false,
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
    // 只读和单选时不显示添加按钮
    return !(props.readonly || (props.multiple === false && images.value.length));
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
    });
    if (signInfo) {
      if (props.multiple) {
        const newItems = [...images.value, signInfo];
        emit('update:items', newItems);
      } else {
        emit('update:value', signInfo);
      }
      emit('add', signInfo);
    }
  };
</script>

<style lang="scss" scoped>
  $sign-editor: (
    height: auto,
  );

  @include b(sign-editor) {
    @include set-component-css-var(sign-editor, $sign-editor);
    height: getCssVar(sign-editor, height);
    display: flex;
    flex-wrap: wrap;
    row-gap: 8px;
    column-gap: 8px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }

    @include e(add) {
      color: #797a7d;
      width: 120px;
      height: 68px;
      background-color: #f7f8fa;
      border: 1px dashed getCssVar(input-border-color);
      border-radius: 2px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      cursor: pointer;
      &.disabled {
        color: #c3c3c3;
        cursor: not-allowed;
      }
    }

    @include m(disabled) {
      @include e(add) {
        color: #c3c3c3;
        cursor: not-allowed;
      }
    }
  }
</style>
