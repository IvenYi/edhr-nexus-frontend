<template>
  <div :class="[getClassName]" class="w100%">
    <div v-if="readonly">
      <FieldReadonly
        :label="tagValue"
        :type="fieldType"
        :tagWidgetStyle="widget.style"
        :isDesign="false"
        :style="{
          display: 'inline-block',
        }"
      />
      <span v-show="fieldObj?.name && !fieldObj?.version" class="gct-custom-tag ml8px">{{
        t('sys.default')
      }}</span>
    </div>
    <a-select
      v-else
      v-model:value="value"
      style="width: 100%"
      :options="optionsData"
      :disabled="disabled"
      :showArrow="false"
      :allowClear="clearable"
      dropdownClassName="gct-project-select-dropdown hidden"
      :placeholder="placeholder || t('sys.chooseText')"
      :fieldNames="{ label: 'fieldLabel', value: 'refId' }"
      optionLabelProp="showTitle"
      @click="!disabled && openModal()"
      @change="changeSelect"
      @select="selectValue"
    />
  </div>
</template>

<script setup lang="ts" name="gct-tmpl-tree-select">
  import { computed, toRefs, toRaw, nextTick, reactive, ref, h, watch } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { TmplTreeSelect } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { uuid2 } from '/@/utils/uuid';
  import { Form } from 'ant-design-vue';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';
  import { ITmplTreeSelectComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import printTmplModal from '../../__components__/print-tmpl-modal.vue';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import TmplModal from './component/tmpl-modal.vue'
  import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';
  import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';

  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const getClassName = 'tmpl-tree-render' + uuid2(16, 16);

  const props = defineProps<{
    modelValue?: string;
    widget: TmplTreeSelect;
    formData: Object;
  }>();
  const { formData } = toRefs(props);
  const {
    placeholder,
    fieldType,
    field,
    clearable,
    label,
    fieldName,
    isFilterFormType,
    formTypeList,
    dhrCategoryModule,
  } = reactive(props.widget.props);
  const { readonly, disabled } = toRefs(props.widget.props);
  const options = ref<any[]>([]);
  const Event = getPageEvent();
  const formItemContext = Form.useInjectFormItemContext();
  const fieldObj = ref<any>({});

  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return value || undefined;
    },
    set(value: string) {
      emit('update:modelValue', value || '');
      formItemContext.onFieldChange();
    },
  });

  const optionsData = computed(() => {
    const data = options.value.map((e) => {
      return {
        ...e,
        fieldLabel: `${e.name}${e.version ? ' : ' + e.version : ''}`,
        showTitle: h('div', [
          h(taglabel, {
            label: `${e.name}${e.version ? ' : ' + e.version : ''}`,
            type: fieldType,
            tagWidgetStyle: props.widget.style,
            isDesign: false,
            style: {
              display: 'inline-block',
            },
          }),
          e.version ? null : h('span', { class: 'gct-custom-tag ml8px' }, t('sys.default')),
        ]),
      };
    });
    return data;
  });

  const tagValue = computed(() => {
    if (!fieldObj.value?.name) return '';
    return `${fieldObj.value?.name}${
      fieldObj.value?.version ? ' : ' + fieldObj.value?.version : ''
    }`;
  });

  const moduleType = computed(() => {
    return fieldType === FIELD_TYPE.E_DHR_TEMPLATE
      ? (dhrCategoryModule ?? FormDesignEnum.EDHR)
      : FormDesignEnum.ONLINE_FORM;
  });

  watch(
    () => value.value,
    async () => {
      if (value.value) {
        let data = options.value.find((e) => e.refId === value.value);
        if (!data) {
          const id = value.value ? value.value.split(':')[1] || value.value.split(':')[0] : '';
          data = await getTmplInfo(id);
        }
        fieldObj.value = data;
      } else fieldObj.value = {};
    },
    {
      immediate: true,
    },
  );

  const openModal = async () => {
    const selected = await getOptionValue();
    // if (selected) {
    //   selected.key = selected.id;
    //   selected.id = selected.refId || selected.key;
    // }
    const queryParams = isFilterFormType ? { formType: formTypeList.join(',') } : {};
    if (isEnableDocControl()) {
      queryParams.controlStatus = ControlStatusEnum.CONTROLLED;
    }
    const res: any = await gct.openUtil.modal(
      TmplModal,
      {
        className: getClassName,
        selected,
        moduleType: moduleType.value,
        isRdo: true,
        queryParams,
        checkFunc: (row) => {
          // 启用文控的时候
          if (isEnableDocControl()) {
            if (row.children) {
              const defaultVersion = row.children.find((e) => !!e.default);
              return defaultVersion?.controlStatus === ControlStatusEnum.CONTROLLED;
            } else {
              return row.controlStatus === ControlStatusEnum.CONTROLLED;
            }
          }
          return true;
        },
      },
      {
        title: t('sys.pageDesigner.chooseTmplSth', { sth: label || fieldName }),
        width: 800,
        height: 734,
        okText: t('sys.okText'),
        getContainer: () => document.querySelector(`.${getClassName}`),
      },
    );
    if (res.ok && res.params?.selected) {
      const { selected: sted } = res.params;
      console.log('selected', sted);
      if (!options.value.some((e) => e.refId === sted.refId)) {
        options.value.push({ ...sted });
      }
      emit('update:modelValue', sted.refId);

      changeSelect(sted.refId);
      formItemContext.onFieldChange();
    }
  };

  // 选中项change
  async function changeSelect(v) {
    if (!v) {
      deselect(value.value);
    }
    const data = await changeValue(v);
    Event.runEventByName('onChange', props.widget.events, v, data, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }
  /**值发生变化 */
  async function changeValue(v) {
    await nextTick();
    let data = getOptionValue(v);
    formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [v]: data.fieldLabel };
    }
    return data;
  }
  /**选中后 */
  async function selectValue() {
    await nextTick();
    const modelValue = value.value,
      option = await changeValue(modelValue);
    try {
      await Event.runEventByName(
        'afterSelect',
        props.widget.events,
        modelValue,
        option,
        formData.value,
      );
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = optionsData.value.find((i) => {
      // FIX: refId赋值是在getFormRelateInfo接口返回后进行的，所以增加兼容id的情况
      const refId = i.refId || i.id;
      return refId === v;
    });
    return toRaw(data);
  }
  // 清空选中项
  function deselect(clearValue) {
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
    formData.value._DICT[field] = undefined;
  }

  async function getTmplInfo(id) {
    const res: any = await getFormRelateInfo({
      id,
      moduleType: moduleType.value,
    });
    res && options.value.push({ ...res, refId: res.baseId ? res.baseId + ':' + res.id : res.id });
    return res;
  }

  defineExpose<ITmplTreeSelectComponentExpose>({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
<style scoped lang="less"></style>
