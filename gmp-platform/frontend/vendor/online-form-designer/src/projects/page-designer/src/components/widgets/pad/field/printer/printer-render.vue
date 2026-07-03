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
  import { ref, computed, toRefs, nextTick, reactive, onBeforeMount, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Printer } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import Taglabel from '../../__components__/taglabel.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { FieldSchema } from '/@/projects/page-designer/src/hooks/getFieldSchema';
  import { IMobPrinterComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import {
    useSelectByField,
    useLinkageFieldByRule,
  } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
  import { useQueryfilter } from '/@page-designer/components/widgets/hooks/listhook';

  const layout: any = inject('form-layout', {});
  const selectValue = ref<any>({});
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
    modeldata,
    showSearch,
    bindModelKey,
    selectOption,
    datafilter,
    exp,
    searchField,
  } = reactive(props.widget.props);
  const { checkedLinkRefData } = useLinkageFieldByRule(props, props.formData, {
    Event,
  });

  const queryfilter = useQueryfilter(datafilter);
  const checkeOpts = ref();

  // 父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory;
  const fieldConfig = {
    modelKey,
    fieldKey: field,
    fieldType,
    modelCategory,
    refModelKey: bindModelKey,
  };
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
    if (fieldValue.value) {
      const { options } = await getOptionsByIds([fieldValue.value]);
      checkeOpts.value = options[0];
    }

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

    if (checkeOpts.value) {
      return checkeOpts.value.dftPrintInfo?.label || checkeOpts.value.label || undefined;
    }

    if (selectOption && selectOption.length && isOrgin.value) {
      // isOrgin.value = false;
      return selectOption
        .map((item) => `${item?.label || item?.name}${item.active ? '' : '(离线)'}`)
        .join(',');
    }
    console.log('fieldInfo.value', fieldInfo.value);
    return fieldInfo.value ? fieldInfo.value.defaultValueTips[0] + '(离线)' : '';
  });

  const handleClear = () => {
    emit('update:modelValue', null);
    Event.runEventByName('afterClear', props.widget.events, null, null, formData.value);
    fieldValue.value = null;
    formData.value._DICT[field] = undefined;
  };

  // 新的选择器功能
  const { openSelect, getOptionsByIds, getOptions } = useSelectByField(fieldConfig, {
    searchable: showSearch,
    title: label || fieldName,
    queryData: {
      query: queryfilter.query,
      exp: queryfilter.getExp(exp),
    },
    config: { searchField },
  });

  const openView = async () => {
    if (showDisabled.value || showReadonly.value) return;
    await checkedLinkRefData();
    // 使用新的选择器
    openSelect({
      value: fieldValue.value,
    }).then(async ({ options, values }) => {
      fieldValue.value = values;
      selectValue.value = options;
      checkeOpts.value = options;
      await nextTick();

      // 触发变更事件
      Event.runEventByName(
        'onChange',
        props.widget.events,
        fieldValue.value,
        options,
        formData.value,
      );
      // 处理数据填充
      await changeNode(fieldValue.value);
    });
  };

  async function changeNode(value) {
    !!formData.value._DICT || (formData.value._DICT = {});
    if (fieldLabel.value) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [value]: fieldLabel.value };
    }

    if (!enableAutofill) return;
    //数据填充
    const info = await Event.context.$httpBizService(
      {
        action: 'rdoGetVersionById',
        key: bindModelKey!,
        modelCategory: modelCategory,
      },
      {
        id: value,
        includeSubModel: 1,
      },
    );
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = info?.data?.[fromField];
    });
  }

  defineExpose<IMobPrinterComponentExpose>({
    reload: getOptions,
    getValue() {
      return props.modelValue;
    },
    setValue(v) {
      fieldValue.value = v;
      getOptionsByIds([v]).then((res) => {
        selectValue.value = res[0];
      });
    },
  });
</script>
<style scoped lang="less"></style>
