<template>
  <div v-if="readonly">
    <FieldReadonly
      :label="tagValue"
      :type="fieldType"
      :tagWidgetStyle="widget.style"
      :isDesign="false"
    />
    <span v-show="fieldObj?.name && !fieldObj?.version" class="gct-custom-tag ml8px"
      >{{ t('sys.default') }}
    </span>
  </div>

  <a-select
    v-else
    v-model:value="value"
    style="width: 100%"
    :options="optionsData"
    :disabled="disabled"
    :showArrow="false"
    :allowClear="true"
    dropdownClassName="gct-project-select-dropdown hidden"
    :placeholder="placeholder || t('sys.chooseText')"
    :fieldNames="fieldNames"
    optionLabelProp="showTitle"
    @click="openModal()"
    @change="changeSelect"
    @select="selectValue"
  />
</template>
<script name="gct-label-template-ref" setup lang="ts">
  import { ref, toRefs, nextTick, computed, h, toRaw, watch } from 'vue';
  import { Form } from 'ant-design-vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IDocumentTemplateRefComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import printTmplModal from '../../__components__/print-tmpl-modal.vue';
  import { getPrintDesignerInfo } from '/@/apis/gct-apaas/PrintDesignerController';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: LowCodeWidget.FieldSchema;
      formData: { _DICT: any; [key: string]: any };
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      // getPopupContainer: (triggerNode) => triggerNode.parentNode,
    },
  );

  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const { getValue, setValue } = useFormWidget(props, emit);
  const { formData } = toRefs(props);
  const Event = getPageEvent();
  const { readonly, placeholder, fieldType, field, disabled, label, fieldName } = toRefs(
    props.widget.props,
  );
  const options = ref<any[]>([]);
  const fieldNames = ref({ label: 'fieldLabel', value: 'id' });
  const fieldObj = ref<any>({});
  const formItemContext = Form.useInjectFormItemContext();

  const value = computed({
    get() {
      return props.modelValue ?? undefined;
    },
    set(value) {
      emit('update:modelValue', value ?? null);
      formItemContext.onFieldChange();
    },
  });

  // const tree2list = (arr: any) => {
  //   let cloneTree = JSON.parse(JSON.stringify(arr));
  //   function iteration(tree: any, level: any) {
  //     let temp: any = [];
  //     for (const i of tree) {
  //       i.level = level;
  //       temp.push(i);
  //       if (i.children?.length) {
  //         temp = [...temp, ...iteration(i.children, level + 1)];
  //       }
  //     }
  //     return temp;
  //   }
  //   return iteration(cloneTree, 1);
  // };

  // const treeSelectAtrr = computed(() => {
  //   let attr: TreeSelectProps = {
  //     multiple: false,
  //     allowClear: true,
  //     showCheckedStrategy: TreeSelect.SHOW_ALL,
  //     treeCheckable: false,
  //     treeCheckStrictly: false,
  //     treeNodeLabelProp: 'name',
  //     treeNodeFilterProp: 'name',
  //   };
  //   return attr;
  // });

  // const treeOptions = computed(() => {
  //   const list = treeData.value?.map((i) => {
  //     const children = i?.children.map((v) => {
  //       return {
  //         ...v,
  //         label: i.name,
  //         title: () =>
  //           h('div', { class: 'tree-item' }, [
  //             h('span', { class: 'tree-item-name', title: v.name }, v.name),
  //             i.id
  //               ? h(
  //                   'span',
  //                   { class: ['tree-item-label', i.id !== '_SYS_' ? 'custom-label' : ''] },
  //                   i.id == '_SYS_' ? `${t('sys.pageDesigner.system')}` : `${t('sys.customize')}`,
  //                 )
  //               : null,
  //           ]),
  //       };
  //     });
  //     return {
  //       ...i,
  //       label: i.name,
  //       children,
  //       selectable: false,
  //       disabled: true,
  //       title: i.name,
  //     };
  //   });
  //   return list;
  // });

  const optionsData = computed(() => {
    const data = options.value.map((e) => {
      return {
        ...e,
        fieldLabel: `${e.name}${e.version ? ' : ' + e.version : ''}`,
        showTitle: h('div', [
          h(FieldReadonly, {
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

  const openModal = async () => {
    const res: any = await gct.openUtil.modal(
      printTmplModal,
      {
        selected: await getOptionValue(),
        moduleType: PrintTypeEnum.RECEIPT,
        isRdo: true,
      },
      {
        title: t('sys.pageDesigner.chooseTmplSth', { sth: label.value || fieldName }),
        width: 1100,
        height: 734,
        okText: t('sys.okText'),
        wrapClassName: 'vxe-table--ignore-clear',
      },
    );
    if (res?.ok && res?.params?.selected?.length) {
      const { selected } = res.params;
      if (!options.value.some((e) => e.id === selected[0].id)) {
        options.value.push({ ...selected[0] });
      }
      emit('update:modelValue', selected[0].id);
      changeSelect(selected[0].id);
      formItemContext.onFieldChange();
    }
  };

  watch(
    () => value.value,
    async () => {
      if (value.value) {
        let data = options.value.find((e) => e.id === value.value);
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

  const tagValue = computed(() => {
    const { name, version } = fieldObj.value;
    return name ? name + (version ? ':' + version : '') : '';
  });

  function deselect(clearValue) {
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
  }

  async function changeSelect(v) {
    if (!v) {
      deselect(value.value);
    }
    const data = await changeValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    emit('saveTableRow');
  }

  /**
   * 值发生变化
   */
  async function changeValue(v) {
    await nextTick();
    let data = getOptionValue(v);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data && value.value) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = {
        [value.value]: data.label,
      };
    }
    return data;
  }

  /**
   * 选中后
   */
  async function selectValue() {
    const options = getOptionValue(value.value);
    try {
      await Event.runEventByName(
        'afterSelect',
        props.widget.events,
        value.value,
        options,
        formData.value,
      );
    } catch (error) {
      changeSelect(value.value);
    }
  }

  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = options.value.find((i) => i.id === v);
    if (data) {
      const parent = options.value.find((e) => e.id === data?.key);
      data.categoryId = parent?.categoryId || data.categoryId;
    }
    return toRaw(data);
  }

  async function getTmplInfo(id) {
    const res: any = await getPrintDesignerInfo({
      id,
      moduleType: PrintTypeEnum.RECEIPT,
    });
    res && options.value.push({ ...res, id: res.baseId ? res.baseId + ':' + res.id : res.id });
    return res;
  }

  defineExpose<IDocumentTemplateRefComponentExpose>({ getValue, setValue });
</script>

<style lang="less">
  .document-template-dropdown {
    padding: 8px;

    .ant-select-tree-node-content-wrapper {
      padding: 0;
    }

    .ant-select-tree-treenode-disabled .ant-select-tree-node-content-wrapper {
      color: inherit;
      cursor: pointer;
    }

    .ant-select-tree-switcher .ant-select-tree-switcher-icon {
      font-size: 12px;
      vertical-align: middle;
    }

    .ant-select-tree-treenode {
      .ant-select-tree-indent {
        width: 0;
      }
    }

    .ant-select-tree-node-content-wrapper:has(.tree-item) {
      min-height: 22px;
      line-height: 22px;
    }

    .tree-item {
      display: flex;

      .tree-item-name {
        flex: 1;
        padding-right: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tree-item-label {
        margin-left: auto;
        padding: 0 6px;
        border-radius: 4px;
        background: #eff3fa;
        color: var(--ant-primary-color);

        &.custom-label {
          background: #def8e2;
          color: #309c41;
        }
      }
    }
  }
</style>
