<template>
  <FieldRadio
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :options="cmpOptions"
    :onChange="onChange"
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
    <template #extra>
      <div class="introduce-fields-wrapper">
        <template v-if="renderIntroduce && renderIntroduce.length">
          <div
            class="introduce-field-item"
            v-for="fieldWidget in renderIntroduce"
            :key="fieldWidget.id"
          >
            <widget-component
              :key="fieldWidget.id"
              :widget="fieldWidget"
              :formData="formData"
              :subtableFieldId="subtableFieldId"
              :realRowIndex="realRowIndex"
              :pageRowIndex="pageRowIndex"
              :childSubTableDataIndex="childSubTableDataIndex"
              :isField="true"
            />
          </div>
        </template>
        <div v-else class="empty">暂无引用字段</div>
      </div>
    </template>
  </FieldRadio>
</template>

<script setup lang="ts" name="online-form-switch-field-render">
  import { reactive, ref, computed } from 'vue';
  import {
    BindCmpStyleEnum,
    BooleanShowMode,
    renderUtils,
    useNocodeFormWidget,
    type ISwitch,
  } from '@gct/nocode-base';
  import WidgetComponent from '../../_common_/widget-component.vue';
  import { FieldRadio, FieldTypeIcon } from '../../_common_';

  import { useMobileAttrs } from '../../../hooks';

  const props = defineProps<{
    modelValue?: string;
    widget: ISwitch;
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

  const { onChange } = useNocodeFormWidget(props, emit);

  const {
    fieldType,
    showFieldName,
    placeholder,
    showRequired,
    showDisabled,
    showReadonly,
    options,

    bindCompStyleType,
  } = useMobileAttrs(props.widget);

  const { displayMode } = reactive(props.widget.props);

  const value = computed({
    get() {
      return renderUtils.getBoolValue(props.modelValue);
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const cmpOptions = computed(() => {
    if (bindCompStyleType === BindCmpStyleEnum.CMP_SELECT_LIST) {
      return options;
    }
    switch (displayMode) {
      case BooleanShowMode.Both:
        return options;
      case BooleanShowMode.OnlyTrue:
        return options.filter((item: any) => item.value);
      case BooleanShowMode.OnlyFalse:
        return options.filter((item: any) => !item.value);
      default:
        return options;
    }
  });

  const renderIntroduce = computed(() => {
    const result = options.find((item) => item.value === renderUtils.getBoolValue(value.value));
    if (result && result.refFields) {
      return result && result.refFields;
    }
    return undefined;
  });
</script>
<style lang="less" scoped>
  .introduce-fields-wrapper {
    width: calc(100% + 24px);
    background: rgba(0, 0, 0, 0.05);
    margin-top: 12px;
    border-radius: 3px;
    margin-left: -12px;
    margin-right: -12px;
    padding: 6px 4px;

    .empty {
      padding: 12px;
      color: rgba(0, 0, 0, 0.35);
      text-align: center;
    }

    .van-field {
      border-radius: 4px !important;
    }

    .introduce-field-item + .introduce-field-item {
      margin-top: 8px;
    }
  }
</style>
