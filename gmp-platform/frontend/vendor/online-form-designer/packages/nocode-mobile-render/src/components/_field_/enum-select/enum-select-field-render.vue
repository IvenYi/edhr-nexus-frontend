<template>
  <FieldSelect
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :options="filterShowOptions"
    :multiple="multiple"
    label-key="text"
    is-select
    :onChange="onChange"
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
    <template #extra>
      <div class="introduce-fields-wrapper">
        <template v-if="renderIntroduces && renderIntroduces.length">
          <template v-for="introducesItem in renderIntroduces">
            <div class="introduce-item">
              <div class="introduce-field-item title">{{ introducesItem.text }}</div>

              <template
                v-if="introducesItem && introducesItem.refFields && introducesItem.refFields.length"
              >
                <div
                  class="introduce-field-item"
                  v-for="fieldWidget in introducesItem.refFields"
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
              <div v-else class="in-empty">暂无引用字段</div>
            </div>
          </template>
        </template>
        <div v-else class="empty">暂无引用字段</div>
      </div>
    </template>
  </FieldSelect>
</template>

<script setup lang="ts" name="online-form-enum-select-field-render">
  import { computed } from 'vue';
  import { has } from 'lodash-es';
  import { FIELD_TYPE } from '@gct/runtime';
  import { renderUtils, useNocodeFormWidget, type IEnumSelect } from '@gct/nocode-base';
  import WidgetComponent from '../../_common_/widget-component.vue';
  import { FieldSelect, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

  const props = defineProps<{
    modelValue?: string;
    widget: IEnumSelect;
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

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const { onChange } = useNocodeFormWidget(props, emit);

  const {
    fieldType,
    placeholder,
    showFieldName,
    showRequired,
    showDisabled,
    showReadonly,
    options,
  } = useMobileAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.ENUM_MULTI || fieldType === FIELD_TYPE.OPTION_MULTI;

  const filterShowOptions = computed(() => {
    return options.filter((item) => {
      if (has(item, 'display')) {
        return item.display;
      }
      return true;
    });
  });

  const renderIntroduces = computed(() => {
    return renderUtils.getSelectOptions({
      value: value.value,
      multiple,
      options,
      key: 'refFields',
    }).selectOptions;
  });
</script>

<style lang="less" scoped>
  .introduce-fields-wrapper {
    width: calc(100% + 24px);
    margin-top: 12px;
    margin-left: -12px;
    margin-right: -12px;

    .empty,
    .in-empty {
      color: rgba(0, 0, 0, 0.35);
      text-align: center;
    }

    .empty {
      padding: 18px 12px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.05);
    }

    .in-empty {
      padding: 12px;
    }

    .van-field {
      border-radius: 4px !important;
    }

    .introduce-item {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
      padding: 6px 4px;
    }

    .introduce-item + .introduce-item {
      margin-top: 4px;
    }

    .title {
      padding: 4px 8px;
      border-bottom: 1px solid #dcdee0;
    }

    .introduce-field-item + .introduce-field-item {
      margin-top: 8px;
    }
  }
</style>
