<template>
  <vantField
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    :isLink="!fieldValue"
    clearable
    readonly
    @click="openView"
    @clearValue="handleClear"
  >
    <template #input v-if="fieldValue">
      <taglabel v-if="showReadonly" v-bind="separatorAttr" />
      <van-cell
        v-else
        :is-link="!fieldValue"
        :border="false"
        style="padding: 0; background: transparent"
      >
        <template #value>
          <taglabel
            :disabled="showDisabled"
            :type="fieldType"
            :label="fieldLabel || placeholder || t('sys.chooseText')"
            :showTagStyle="!!fieldValue"
            :tagWidgetStyle="widget.style"
            :style="
              fieldValue
                ? ''
                : {
                    color: 'var(--van-gray-5)',
                    paddingLeft: layout?.inputBg ? '12px' : '',
                    fontSize: '14px',
                  }
            "
          />
        </template>
      </van-cell>
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-department">
  import { ref, computed, toRefs, toRaw, nextTick, reactive, onBeforeMount, inject } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Printer } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { createTreePopup } from '../../__components__/treePopup';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import Taglabel from '../../__components__/taglabel.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { FieldSchema } from '/@/projects/page-designer/src/hooks/getFieldSchema';
  import { IMobPrinterComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const layout: any = inject('form-layout', {});

  const { t } = i18n.global;
  const fieldInfo = ref();
  const props = defineProps<{ modelValue?: string; widget: Printer; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const isOrgin = ref(true);
  const Event = getPageEvent();
  const { formData } = toRefs(props);
  const {
    bindCompStyleType,
    fieldType,
    placeholder,
    fieldName,
    label,
    field,
    modelKey,
    selectOption,
  } = reactive(props.widget.props);

  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const { openTreePopup } = createTreePopup({
    showSearch: true,
    options: options,
    disabledOk: (data) => {
      const { checkedData } = data;
      if (
        !checkedData ||
        (checkedData.type === PrintResourceEnum.INTERNET_PRINT &&
          (checkedData.parentId === 'ROOT' || !checkedData.parentId))
      ) {
        return true;
      }
      return false;
    },
    showTag: (data) => {
      return data.defaultPrint === '是';
    },
  });

  // onBeforeMount(async () => {
  //   getAsyncOptions({ selectType: bindCompStyleType, id: 'printer' });
  // });

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed<boolean>(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      label: fieldLabel.value,
    };
  });

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          return props.modelValue;
        },
        set(value: string[]) {
          emit('update:modelValue', value);
        },
      })
    : ref();

  onBeforeMount(async () => {
    await nextTick();
    await getAsyncOptions({ selectType: bindCompStyleType, id: 'printer' });
    await getExistPrinter();
  });
  async function getExistPrinter() {
    if (selectOption && selectOption.length) {
      selectOption.forEach((item) => {
        item.active = 0;
      });
      selectOption.forEach((opt, idx) => {
        options.value.forEach((i) => {
          if (opt.value === i.value) {
            opt.active = 1;
          }
        });
      });
    }
    const config = await FieldSchema.getConfigByField(modelKey, field);
    fieldInfo.value = config;
  }

  const fieldLabel = computed(() => {
    if (!fieldValue.value) return '';
    const formDICT = formData.value._DICT[field];
    if (formDICT && formDICT[fieldValue.value]) return formDICT[fieldValue.value];

    const data = getOptionValue();
    if (data.id) {
      return data.dftPrintInfo?.label || data.label || undefined;
    }

    if (selectOption && selectOption.length && isOrgin.value) {
      // isOrgin.value = false;
      return selectOption
        .map((item) => `${item?.label || item?.name}${item.active ? '' : '(离线)'}`)
        .join(',');
    }

    return fieldInfo.value ? fieldInfo.value.defaultValueTips[0] + '(离线)' : '';
  });

  const handleClear = () => {
    emit('update:modelValue', null);
    Event.runEventByName('afterClear', props.widget.events, null, null, formData.value);
    fieldValue.value = null;
    formData.value._DICT[field] = undefined;
  };

  /**
   * 获取选中的options
   */
  function getOptionValue(v = fieldValue.value) {
    let data: any = options.value.find((i: any) => i.value === v);
    if (!data) {
      if (!options.value || !options.value.length) {
        getAsyncOptions({ selectType: bindCompStyleType, id: 'printer' });
      }
      data = options.value.find((i: any) => i.value === v) || {};
    }
    return toRaw(data);
  }

  /**值发生变化 */
  async function changeFormData(data) {
    await nextTick();
    !!formData.value._DICT[field] || (formData.value._DICT[field] = {});
    /**填充翻译后的值 */
    formData.value._DICT[field] = {
      [fieldValue.value]: data.dftPrintInfo?.label || data.label || undefined,
    };
  }

  const openView = () => {
    if (showDisabled.value || showReadonly.value) return;
    getAsyncOptions({ selectType: bindCompStyleType, id: 'printer' });
    openTreePopup({
      ids: props.modelValue,
      title: label || fieldName,
      type: 'single',
      saved: async (id, data) => {
        isOrgin.value = false;
        changeFormData(data);
        fieldValue.value = id;
        await nextTick();
        Event.runEventByName('onChange', props.widget.events, data.value, data, formData.value);
      },
    });
  };

  defineExpose<IMobPrinterComponentExpose>({
    getValue() {
      return props.modelValue;
    },
    setValue(v) {
      fieldValue.value = v;
    },
  });
</script>
<style scoped lang="less"></style>
