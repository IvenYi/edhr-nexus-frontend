<template>
  <vantField
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :is-link="!fieldText"
    readonly
    clearable
    @click="openView"
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="fieldText">
      <taglabel v-bind="separatorAttr" />
      <van-tag
        v-if="selectValue?.children?.length"
        color="#E0E3EB"
        plain
        class="ml6px bg-[#F9FAFB]!"
      >
        <span class="text-[#5A5F6B] p2px">
          {{ $t('sys.default') }}
        </span>
      </van-tag>
    </template>
  </vantField>
</template>

<script name="gct-tmpl-tree-select" setup lang="ts">
  import { ref, computed, watch, toRaw, toRef, nextTick, toRefs, inject, onBeforeMount } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Select } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { useDisabled } from '../../../hooks/useReadyonly';
  import { useFiledLabels } from '/@page-designer/components/widgets/pad/__components__';
  import {
    drawerSelectorInstance,
    CategoryModuleEnum,
  } from '@mobile/InstanceComponent/edhr-tmpl-picker';
  import { FIELD_TYPE } from '@gct/runtime';

  const layout: any = inject('form-layout', {});
  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const selectMap = {
    [FIELD_TYPE.E_DHR_TEMPLATE]: {
      moduleType: CategoryModuleEnum.EDHR,
      title: '选择eDHR模版',
    },
    [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
      moduleType: CategoryModuleEnum.ONLINE_FORM,
      title: '选择在线表单模版',
    },
  };
  const { title, moduleType } = selectMap[props.widget.props.fieldType] || {};
  const { openPicker } = drawerSelectorInstance({
    title,
    moduleType,
  });
  const Event = getPageEvent();
  const { field, fieldType } = toRaw(props.widget.props);

  const { formData } = toRefs(props);

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const { labelArr } = useFiledLabels(props);

  const selectValue = ref<any>({});
  const fieldText = toRef(() => {
    if (selectValue.value.name) {
      return selectValue.value.version
        ? `${selectValue.value.name}:${selectValue.value.version}`
        : selectValue.value.name;
    }
    return (labelArr.value || []).join('，');
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: fieldText.value || '',
    };
  });

  async function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = '';
  }

  const fieldValue = computed<any>({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  function deselect(clearValue) {
    selectValue.value = {};
    Event.runEventByName('afterClear', props.widget.events, clearValue, selectValue.value);
    formData.value._OPCT[field] = undefined;
    formData.value._DICT[field] = undefined;
  }

  async function openView() {
    selectValue.value = await openPicker(fieldValue.value);
    fieldValue.value = selectValue.value?.children
      ? selectValue.value?.id
      : `${selectValue.value?.baseId}:${selectValue.value?.id}`;
    console.log(selectValue.value);
  }

  onBeforeMount(async () => {});
  defineExpose<IMobRdoSelectComponentExpose>({
    getValue() {
      return fieldValue.value;
    },
    setValue(v) {
      fieldValue.value = v;
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-item) {
    .version {
      display: none;
    }
  }

  .ant-select-tree-title {
    .name {
      display: none;
    }
  }
</style>
<style lang="less" scoped>
  .rdo-select-wrap {
    &::after {
      content: ' ';
      position: absolute;
      right: var(--van-padding-md);
      bottom: 0;
      left: var(--van-padding-md);
      box-sizing: border-box;
      transform: scaleY(0.5);
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  :deep(.van-cell__right-icon) {
    padding: v-bind("layout.inputBg?'10px 0':''");
    line-height: inherit;
  }
</style>
