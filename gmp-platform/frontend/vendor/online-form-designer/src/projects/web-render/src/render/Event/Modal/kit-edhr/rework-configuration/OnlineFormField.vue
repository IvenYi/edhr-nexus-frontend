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
    />
  </div>
</template>

<script setup lang="ts" name="gct-tmpl-tree-select">
  import { computed, toRefs, toRaw, nextTick, reactive, ref, h, watch } from 'vue';
  import { Form } from 'ant-design-vue';
  import { TmplTreeSelect } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldReadonly from '/@/projects/page-designer/src/components/widgets/web/__components__/formcomponent/field-readonly.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { uuid2 } from '/@/utils/uuid';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';
  import { ITmplTreeSelectComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import printTmplModal from '/@/projects/page-designer/src/components/widgets/web/__components__/print-tmpl-modal.vue';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';
  import { isEnableDocControl } from '/@/projects/online-form/src/views/web-render';

  const { t } = useI18n();
  // valueObjChange 值变化时提供额外完整数据
  const emit = defineEmits(['update:modelValue', 'saveTableRow', 'valueObjChange']);
  const getClassName = 'tmpl-tree-render' + uuid2(16, 16);

  const props = defineProps<{
    modelValue?: string;
    widget: TmplTreeSelect;
    formData: Object;
    enableControl?: boolean;
  }>();
  const { formData } = toRefs(props);
  const { placeholder, fieldType, field, clearable, label, fieldName } = reactive(
    props.widget.props,
  );
  const { readonly, disabled } = toRefs(props.widget.props);
  const options = ref<any[]>([]);
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

  /** 最终是否启用文控限制 */
  const finalEnableDocControl = computed(() => {
    return isEnableDocControl() && props.enableControl;
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
    if (selected) {
      selected.key = selected.id;
      selected.id = selected.refId || selected.key;
    }
    const res: any = await gct.openUtil.modal(
      printTmplModal,
      {
        className: getClassName,
        selected,
        moduleType: fieldType === FIELD_TYPE.E_DHR_TEMPLATE ? 'edhr_module' : 'online_form_module',
        isRdo: true,
        categoryTitle: '', // eDhr3.0去除左侧分类的标题
        queryParams: {
          // 添加文控参数！！！
          controlStatus: finalEnableDocControl.value ? ControlStatusEnum.CONTROLLED : undefined,
        },
      },
      {
        title: t('sys.pageDesigner.chooseTmplSth', { sth: label || fieldName }),
        width: 1100,
        height: 734,
        okText: t('sys.okText'),
        getContainer: () => document.querySelector(`.${getClassName}`),
      },
    );
    if (res.ok && res.params?.selected?.length) {
      const { selected } = res.params;
      console.log('selected', selected);
      if (!options.value.some((e) => e.refId === selected[0].id)) {
        options.value.push({ ...selected[0], refId: selected[0].id });
      }
      emit('update:modelValue', selected[0].id);

      changeSelect(selected[0].id);
      formItemContext.onFieldChange();
    }
  };

  // 选中项change
  async function changeSelect(v) {
    if (!v) {
      deselect(value.value);
    }
    const valueObj = await changeValue(v);
    /**列字段时候触发保存 */
    emit('saveTableRow');
    emit('valueObjChange', valueObj);
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

  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = optionsData.value.find((i) => i.refId === v);
    return toRaw(data);
  }
  // 清空选中项
  function deselect() {
    formData.value._DICT[field] = undefined;
  }

  async function getTmplInfo(id) {
    const res: any = await getFormRelateInfo({
      id,
      moduleType: fieldType === FIELD_TYPE.E_DHR_TEMPLATE ? 'edhr_module' : 'online_form_module',
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
