<template>
  <a-select
    class="custom-select-no-arrow"
    v-model:value="fieldVal"
    :placeholder="t('sys.chooseText')"
    :bordered="false"
    :showSearch="false"
    :showArrow="false"
    :allowClear="false"
    :open="false"
    :fieldNames="{ label: 'fieldName', value: 'fieldKey' }"
    :options="options"
    @click.stop="openModal()"
  />
</template>

<script setup lang="ts" name="add-field-select">
  import { computed, h, ref, toRaw, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { last, isEmpty } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useField } from './useField';
  import AddFieldModal from './add-field-modal.vue';
  import { GctDialog } from '/@/utils/Dialog';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      joinModelType: string;
      joinFormRefId: string;
      joinModelKey: string;
      actionType?: string;
      selectFieldKey: string | undefined;
      selectCascaderValue?: string | undefined;
      isShowCascader: boolean;
      filterFieldType?: FIELD_TYPE;
    }>(),
    {
      actionType: 'checkbox',
    },
  );

  const emit = defineEmits<{
    (e: 'update:selectFieldKey', value?: string): void;
    (e: 'update:selectCascaderValue', value?: string): void;
    (e: 'on-select', data: any): void;
  }>();

  const { initData, joinModelMetaMap } = useField();

  watch(
    () => props.joinModelKey,
    (newValue, oldValue) => {
      if (newValue) {
        initData(newValue, {
          joinModelType: props.joinModelType,
          joinFormRefId: props.joinFormRefId,
        });
      }
    },
    {
      immediate: true,
    },
  );

  const fieldVal = computed({
    get() {
      return props.selectFieldKey;
    },
    set(v) {
      emit('update:selectFieldKey', v);
    },
  });

  const cascaderVal = computed({
    get() {
      if (props.selectCascaderValue) {
        return props.selectCascaderValue;
      }
      return `-:${props.joinModelKey}`;
    },
    set(v) {
      emit('update:selectCascaderValue', v);
    },
  });

  const options = computed(() => {
    return getBindModelFieldList(cascaderVal.value);
  });

  function getOptionValue(v) {
    let data = options.value.find((i) => i.fieldKey === v);
    return toRaw(data);
  }

  function getBindModelFieldList(cascaderValue) {
    let bindModelKey;
    if (cascaderValue) {
      const lastPos: string = last(cascaderValue.split('$')) ?? '';
      if (lastPos) {
        const lastValue = last(lastPos.split(';'));
        if (lastValue) {
          const [_, _bindModelKey] = lastValue.split(':');
          bindModelKey = _bindModelKey;
        }
      }
    }

    if (bindModelKey) {
      const metaInfo = joinModelMetaMap.value?.[bindModelKey];
      return !isEmpty(metaInfo) ? metaInfo.fields ?? [] : [];
    }
    return [];
  }

  const openModal = async () => {
    if (!props.joinModelKey) {
      message.warn($t('sys.pageDesigner.pleaseSelectModel'));
      return;
    }

    GctDialog.open(AddFieldModal, {
      isShowCascader: props.isShowCascader,
      modelKey: props.joinModelKey,
      joinFormRefId: props.joinFormRefId,
      joinModelType: props.joinModelType,
      actionType: props.actionType,
      cascaderValue: cascaderVal.value,
      fieldSelected: fieldVal.value,
      filterFieldType: props.filterFieldType,
      callback: (result) => {
        const { cascaderSelected, fieldSelected } = result ?? {};

        if (props.actionType === 'radio') {
          const fieldKey = fieldSelected?.[0];

          if (!options.value.some((e) => e.fieldKey === fieldKey)) {
            options.value = getBindModelFieldList(cascaderSelected);
          }

          fieldVal.value = fieldKey;
          cascaderVal.value = cascaderSelected;

          const obj = {};
          if (cascaderSelected) {
            const lastPos: string = last(cascaderSelected.split('$')) ?? '';

            if (lastPos) {
              const pos = lastPos.split(';');
              if (Array.isArray(pos) && pos.length !== 0) {
                Object.assign(obj, {
                  isFieldModel: !(pos.length === 1),
                  fieldLink: pos
                    .map((p) => {
                      const [_bindFieldKey, _] = p.split(':');
                      return _bindFieldKey !== '-' ? _bindFieldKey : '';
                    })
                    .concat(fieldKey)
                    .filter((i) => i)
                    .join('.'),
                });
              }
            }
          }

          emit('on-select', { ...getOptionValue(fieldKey), ...obj });
        }
      },
    });
  };
</script>

<style scoped></style>
