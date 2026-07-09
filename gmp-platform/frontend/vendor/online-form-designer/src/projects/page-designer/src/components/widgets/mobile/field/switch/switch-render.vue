<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    :widget-type="widget.type"
    @click="showPopup"
    :formData="formData"
    :useSwitchComp="useSwitchComp"
  >
    <template #input>
      <van-switch
        v-if="BindCmpStyleEnum.CMP_BOOLEAN === bindCompStyleType"
        v-bind="separatorAttr"
        v-model="value"
        size="16px"
        @change="onChange"
      >
        <template #node v-if="dynOptions && !useSwitchComp">
          <div class="switch-text">
            {{ checkedValue }}
          </div>
        </template>
      </van-switch>
      <component
        v-else
        :is="cmp[bindCompStyleType ?? '']"
        v-bind="separatorAttr"
        v-model:value="value"
        v-model:showPop="showPop"
        @change="onChange"
      />
    </template>
  </vantField>
</template>

<script name="gct-switch" setup lang="ts">
  import { ref, computed, reactive, onBeforeMount, toRef, toRefs } from 'vue';
  import { Switch } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';

  import { useAsyncOptions } from '/@page-designer/components/widgets/hooks/hooks';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { IMobSwitchComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const props = defineProps<{
    modelValue?: any;
    widget: Switch;
    useSwitchComp?: boolean;
    dynOptions?: any[];
    formData: any;
  }>();

  const {
    checkedChildren,
    unCheckedChildren,
    fieldType,
    field,
    modelKey,
    readonly,
    disabled,
    customOptions,
  } = reactive(props.widget.props);

  const bindCompStyleType = toRef(() => props.widget.props.bindCompStyleType);

  const emit = defineEmits(['update:modelValue']);
  const { onChange, getValue, setValue } = useFormWidget(props, emit);

  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);

  const showPop = ref<boolean>(false);

  onBeforeMount(() => {
    if (!props.useSwitchComp) {
      getAsyncOptions({ fieldKey: field, modelKey });
    }
  });

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    const res = {};
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_BOOLEAN) {
      Object.assign(res, {
        class: showReadonly.value ? 'mobile-field-boolean--readyonly' : '',
        // todo tangjian 移动端主题色
        // activeColor: '#0DAA9C',
      });
    }
    return {
      checkedChildren,
      unCheckedChildren,
      readonly: showReadonly.value,
      disabled: showDisabled.value,
      fieldType: fieldType,
      tagStyle: props.widget.style,
      options: customOptions ? customOptions : props.dynOptions ? props.dynOptions : options.value,
      multiple: false,
      useSwitchComp: props.useSwitchComp,
      ...res,
    };
  });

  const getBoolValue = (val) => {
    if (val === 'true' || val === 'false') {
      return JSON.parse(val);
    }
    if (val === undefined || val === null || isNaN(parseInt(val))) {
      return Boolean(val);
    }

    return Boolean(parseInt(val));
  };

  const value = props.widget.props.field
    ? computed({
        get() {
          if (props.useSwitchComp) {
            return props.modelValue;
          }
          return getBoolValue(props.modelValue);
        },
        set(value) {
          emit('update:modelValue', value);
        },
      })
    : ref(getBoolValue(props.widget.props.defaultValue));

  // 用于表单校验的字段
  const validateField = computed(() => {
    return value.value;
  });

  const showPopup = () => {
    if (
      !(showReadonly.value || showDisabled.value) &&
      BindCmpStyleEnum.CMP_SELECT_LIST === bindCompStyleType?.value
    ) {
      showPop.value = true;
    }
  };

  const checkedValue = computed(() => {
    console.log('separatorAttr.value.options', separatorAttr.value.options, value.value);
    return separatorAttr.value.options.find((item) => {
      return item.value === value.value;
    })?.label;
  });

  defineExpose<IMobSwitchComponentExpose>({ getValue, setValue });
</script>

<style scoped lang="less">
  .van-switch.mobile-field-boolean--readyonly {
    pointer-events: none;

    // &.van-switch--on {
    //   background-color: rgb(13 170 156 / 50%) !important;
    // }
  }

  :deep(.van-field__body) {
    // background-color: var(--cel);
  }

  .switch-text {
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    width: 100%;
    height: 100%;
    line-height: 16px;
  }
  :deep(.van-cell__right-icon) {
    height: 32px;
  }
</style>
