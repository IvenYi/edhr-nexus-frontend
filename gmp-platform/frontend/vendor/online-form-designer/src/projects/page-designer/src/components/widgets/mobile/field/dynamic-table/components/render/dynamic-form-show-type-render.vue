<template>
  <vantField :props="widget.props" :style="widget.style" @click="showPopup">
    <template #input>
      <FieldSelect v-bind="separatorAttr" v-model:value="value" v-model:showPop="showPop" />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-dynamic-show-type">
  import { computed, toRefs, toRaw, ref } from 'vue';
  import { Select } from '/@page-designer/types/mobile';
  import vantField from '../../../../__components__/vantField.vue';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  import { DYN_DISPLAY_OPTS } from '../../__utils__/dynamic.enum';
  import { useReadyonly } from '../../../../../hooks/useReadyonly';
  import { useI18n } from '@mobile/utils/useI18n';

  const { t } = useI18n();

  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();

  const emit = defineEmits(['update:modelValue']);

  const { formData } = toRefs<{ [key: string]: any }>(props);

  const { fieldType, readonly, placeholder } = toRaw(props.widget.props);

  const showPop = ref<boolean>(false);

  const showReadonly = computed(() => useReadyonly(readonly));

  const options = computed(() => {
    return (DYN_DISPLAY_OPTS[formData.value.type_ ?? ''] ?? []).map((key) => {
      return {
        label: t(`sys.pageDesigner.${key}`),
        value: key,
      };
    });
  });

  const separatorAttr = computed(() => {
    return {
      placeholder,
      readonly: showReadonly.value,
      disabled: false,
      fieldType: fieldType,
      type: props.widget.type,
      tagStyle: props.widget.style,
      options: options.value,
      multiple: false,
      supportTree: false,
      useSwitchComp: true,
    };
  });

  const value = computed<any>({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const showPopup = () => {
    if (!showReadonly.value) {
      showPop.value = true;
    }
  };

  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>

<style scoped lang="less">
  .title {
    position: relative;
    z-index: 1;
    top: 0;
    width: 100%;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  .shadow-top {
    box-shadow: 0 -1px 4px 0 rgb(0 0 0 / 12%);
  }

  .option-container {
    min-height: 200px;
  }

  .is-active {
    color: var(--van-primary-color);
  }

  .border-r {
    border-right: 1px solid var(--van-cell-border-color);
  }

  .border-b {
    position: relative;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  :deep(.van-cell) {
    &::after {
      right: 0;
      left: 0;
    }
  }

  :deep(.van-search) {
    padding: 14px 16px;

    &.border-all {
      .van-search__content {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }

    .van-search__content {
      &:focus {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }
  }
</style>
