<template>
  <div class="w100% ks-row-middle">
    <div v-if="readonly">
      <taglabel
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

      <template v-if="!tagValue.length">
        {{ emptyDisplayValue }}
      </template>
    </div>
    <template v-else>
      <a-select v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
      <a-select
        v-else
        class="ks-col"
        v-model:value="value"
        style="width: 100%"
        :mode="multiple ? 'multiple' : ''"
        :options="optionsData"
        :disabled="disabled || !!useMore"
        :showArrow="false"
        allowClear
        dropdownClassName="gct-project-select-dropdown hidden"
        :placeholder="placeholder || t('sys.chooseText')"
        :fieldNames="{ label: 'fieldLabel', value: optionValueKey }"
        optionLabelProp="showTitle"
        @click="!disabled && !useMore && openModal()"
        :getPopupContainer="PopupContainer"
        @change="emit('tableSearch')"
      >
        <template #tagRender="data">
          <tag style="margin: 2px 5px 2px 0">
            <span>{{ data.option.fieldLabel }}</span>
            <span v-if="!data.value.includes(':')" class="version ml8px">默认</span>
            <IconNext
              v-if="data.closable"
              :size="15"
              :value="'icon-park:close-small'"
              :style="{
                verticalAlign: 'text-bottom',
                '--color': 'rgba(0,0,0,.45)',
                lineHeight: '1',
                marginLeft: '2px',
              }"
              @click.prevent.stop="data.onClose"
            />
          </tag>
        </template>
      </a-select>
    </template>
    <moreOption
      :disabled="disabled"
      @clear="$emit('update:modelValue', null)"
      v-model:useMore="useMore"
      v-model:ope="ope"
      :moreOptions="moreOptions"
      :label="label || fieldName"
      @change="emit('tableSearch')"
    />
  </div>
</template>

<script setup lang="ts" name="gct-tmpl-tree-select">
  import { computed, toRefs, toRaw, reactive, ref, h, watch } from 'vue';
  import { SearchTmplTreeSelect } from '/@page-designer/types/web';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TmplModal from '/@/projects/page-designer/src/components/widgets/web/field/tmpl-tree-select/component/tmpl-modal.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  // import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import moreOption from '../../more_option.vue';
  import { isMultipleOperator } from '@gct/runtime';
  import { PrintTypeEnum, FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import printTmplModal from '../../../../../__components__/print-tmpl-modal.vue';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import tag from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/tag.vue';
  import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants/index';
  import { isEnableDocControl } from '/@/projects/online-form/src/views/web-render/hooks/useControl';

  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue', 'saveTableRow', 'tableSearch', 'gctsearch']);

  const props = defineProps<{
    modelValue?: string;
    widget: SearchTmplTreeSelect;
  }>();
  const PopupContainer = getParentPopupContainer(props);
  const {
    readonly,
    disabled,
    useMore,
    ope,
    placeholder,
    fieldType,
    moreOptions,
    ignoreOptions,
    label,
    fieldName,
  } = toRefs(props.widget.props);

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const options = ref<any[]>([]);
  const fieldObj = ref<any>({});
  const multiple = isMultipleOperator(ope.value);

  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return value || undefined;
    },
    set(value: string) {
      emit('update:modelValue', value || []);
    },
  });

  const isOnlineForm = computed(() => {
    return [FIELD_TYPE.ONLINE_FORM_TEMPLATE, FIELD_TYPE.E_DHR_TEMPLATE].includes(fieldType.value);
  });

  const optionValueKey = computed(() => {
    return isOnlineForm.value ? 'refId' : 'id';
  });

  const optionsData = computed(() => {
    const data = options.value.map((e) => {
      return {
        ...e,
        fieldLabel: `${e.name}${e.version ? ' : ' + e.version : ''}`,
        // showTitle: h('div', [
        //   h(taglabel, {
        //     label: `${e.name}${e.version ? ' : ' + e.version : ''}`,
        //     type: fieldType?.value,
        //     tagWidgetStyle: props.widget.style,
        //     isDesign: false,
        //     style: {
        //       display: 'inline-block',
        //     },
        //   }),
        // ]),
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

  const ignoreCase = computed(() => {
    return ignoreOptions?.value?.[0] === 'ignoreCase' ? 1 : 0;
  });

  // watch(
  //   () => value.value,
  //   async () => {
  //     if (value.value) {
  //       let data = options.value.find((e) => e.id === value.value);
  //       if (!data) data = await getTmplInfo(value.value);
  //       fieldObj.value = data;
  //     } else fieldObj.value = {};
  //   },
  //   {
  //     immediate: true,
  //   },
  // );
  /** 获取类型 */
  function moduleType(fieldType) {
    if (fieldType === FIELD_TYPE.E_DHR_TEMPLATE) {
      return FormDesignEnum.EDHR;
    }
    if (fieldType === FIELD_TYPE.LABEL_TEMPLATE_REF) {
      return PrintTypeEnum.LABEL;
    }
    // if (fieldType === FIELD_TYPE.DOCUMENT_TEMPLATE) {
    //   return PrintTypeEnum.RECEIPT;
    // }
    return FormDesignEnum.ONLINE_FORM;
  }

  /** 获取title */
  function moduleTitle(fieldType) {
    if (fieldType === FIELD_TYPE.E_DHR_TEMPLATE) {
      // FIX: eDHR3.0调整（经确认后进行修改，全平台应用将保持一致！！！）
      return 'DHR';
    }
    if (fieldType === FIELD_TYPE.LABEL_TEMPLATE_REF) {
      return t('sys.pageDesigner.label');
    }
    // if (fieldType === FIELD_TYPE.DOCUMENT_TEMPLATE) {
    //   return t('sys.pageDesigner.document');
    // }
    return t('sys.pageDesigner.fieldCmp.online_form');
  }

  const openPaasModal = async () => {
    const res: any = await gct.openUtil.modal(
      printTmplModal,
      {
        selected: getOptionValue(),
        moduleType: moduleType(fieldType?.value),
        multiple: multiple,
        isRdo: true,
        ignoreCase: ignoreCase?.value,
      },
      {
        title: t('sys.pageDesigner.chooseTmplSth', { sth: moduleTitle(fieldType?.value) }),
        width: 1100,
        height: 734,
        okText: t('sys.okText'),
      },
    );
    if (res.ok && res.params?.selected) {
      console.log('ok----', res.params.selected, multiple);
      const { selected } = res.params;
      selected.forEach((e) => {
        if (!options.value.find((f) => f.id === e.id)) {
          options.value.push(e);
        }
      });
      value.value = multiple ? selected.map((e) => e.id) : selected[0].id;
      // emit('update:modelValue', selected);
      // emit('gctsearch');
      // emit('tableSearch');
    }
  };

  const openOnlineFormModal = async () => {
    const queryParams = {};
    if (isEnableDocControl()) {
      queryParams.controlStatus = ControlStatusEnum.CONTROLLED;
    }
    const res: any = await gct.openUtil.modal(
      TmplModal,
      {
        selected: getOptionValue(),
        moduleType: moduleType(fieldType?.value),
        multiple: multiple,
        isRdo: true,
        ignoreCase: ignoreCase?.value,
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
        title: t('sys.pageDesigner.chooseTmplSth', { sth: moduleTitle(fieldType?.value) }),
        width: 1100,
        height: 734,
        okText: t('sys.okText'),
      },
    );
    if (res.ok && res.params?.selected) {
      console.log('ok----', res.params.selected, multiple);
      const { selected } = res.params;
      selected.forEach((e) => {
        if (!options.value.find((f) => f.refId === e.refId)) {
          options.value.push(e);
        }
      });
      value.value = multiple ? selected.map((e) => e.refId) : selected[0].refId;
      // emit('update:modelValue', selected);
      // emit('gctsearch');
      // emit('tableSearch');
    }
  };

  const openModal = () => {
    if (isOnlineForm.value) openOnlineFormModal();
    else openPaasModal();
  };
  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = options.value.filter((e) => v && v.includes(e[optionValueKey.value] || e.id));
    return toRaw(data);
  }
  // async function getTmplInfo(id) {
  //   const res = await getFormRelateInfo({
  //     id,
  //     moduleType: fieldType === FIELD_TYPE.E_DHR_TEMPLATE ? 'edhr_module' : 'online_form_module',
  //   });
  //   res && options.value.push(res);
  //   return res;
  // }

  watch(
    () => props.modelValue,
    (newArr) => {
      // 支持选项回显名称（仅edhr和表单模版）
      const _moduleType = moduleType(fieldType?.value);
      if (![FormDesignEnum.EDHR, FormDesignEnum.ONLINE_FORM].includes(_moduleType)) {
        return;
      }
      if (Array.isArray(newArr) && newArr?.length) {
        const hasIds = options.value.map((e) => e[optionValueKey.value]);
        const missingIds = newArr
          .filter((id) => !hasIds.includes(id))
          .map((id) => (id.includes(':') ? id.split(':')[1] : id));
        console.log('missingIds', missingIds);
        Promise.all(
          missingIds.map(async (id) => {
            const res = await getFormRelateInfo({ id, moduleType: _moduleType });
            if (res) {
              options.value.push({
                ...res,
                [optionValueKey.value]: res.baseId ? `${res.baseId}:${res.id}` : res.id,
              });
            }
          }),
        );
      }
    },
    {
      immediate: true,
    },
  );

  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
<style scoped lang="less">
  .version {
    color: var(--ant-primary-color);
  }
</style>
