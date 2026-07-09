<template>
  <vantField :props="widget.props" :style="widget.style" @click="showPopup">
    <template #input>
      <FieldSelect v-bind="separatorAttr" v-model:value="value" v-model:showPop="showPop" />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-dynamic-form-type">
  import { computed, toRefs, toRaw, ref } from 'vue';
  import { Select } from '/@page-designer/types/mobile';
  import vantField from '../../../../__components__/vantField.vue';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  import { DYN_F_TYPE } from '../../__utils__/dynamic.enum';
  import { useReadyonly } from '../../../../../hooks/useReadyonly';
  import useDynamic from '../../__utils__/useDynamic';
  import { useI18n } from '@mobile/utils/useI18n';
  import { isNil } from 'lodash-es';

  const { t } = useI18n();

  const options = Object.values(DYN_F_TYPE).map((key) => {
    return {
      label: t(`sys.pageDesigner.dynamicFormType.${key}`),
      value: key,
    };
  });

  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);

  const { formData } = toRefs<{ [key: string]: any }>(props);

  const { fieldType, readonly, placeholder } = toRaw(props.widget.props);

  const { valueCorrect } = useDynamic();

  const showPop = ref<boolean>(false);

  const showReadonly = computed(() => useReadyonly(readonly));

  const separatorAttr = computed(() => {
    return {
      placeholder,
      readonly: showReadonly.value,
      disabled: false,
      fieldType: fieldType,
      type: props.widget.type,
      tagStyle: props.widget.style,
      options,
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
      formData.value.show_type_ = undefined;
      formData.value.value_ = undefined;
      // 切换类型的时候如果有默认值需要塞给value_
      if (
        !isNil(formData.value.default_value_) &&
        valueCorrect(formData, formData.value.default_value_)
      ) {
        formData.value.value_ = formData.value.default_value_;
      }
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

<style scoped lang="less"></style>
