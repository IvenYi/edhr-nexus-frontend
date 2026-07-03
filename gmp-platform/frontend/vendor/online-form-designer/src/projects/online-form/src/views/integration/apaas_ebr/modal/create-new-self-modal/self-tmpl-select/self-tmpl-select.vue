<template>
  <a-select
    :class="[ns.b()]"
    ref="refSelect"
    v-model:value="localVal"
    :placeholder="placeholder"
    :showSearch="true"
    :options="optionsData"
    :showArrow="false"
    :allowClear="true"
    :disabled="disabled"
    :mode="props.multiple ? 'multiple' : undefined"
    optionLabelProp="showTitle"
    dropdownClassName="gct-project-select-dropdown hidden"
    @click="openModal()"
  />
</template>

<script lang="ts" setup name="self-tmpl-select">
  import { useNamespace } from '@gct/runtime';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { computed, h, ref, toRaw, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';
  import formTmplModal from './form-tmpl-modal.vue';

  import { Form } from 'ant-design-vue';
  import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';
  import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';

  const { t } = useI18n();

  const ns = useNamespace('self-tmpl-select');
  const formItemContext = Form.useInjectFormItemContext();
  /** 触发ant的表单项校验 */
  const triggerValidate = () => {
    formItemContext.onFieldChange();
  };

  const props = withDefaults(
    defineProps<{
      value?: string | string[];
      type: FormDesignEnum;
      /** 作为主键的key */
      keyField?: string;
      /** 为true的时候选中父会抛出它的默认子的id */
      notEmitParent?: boolean;
      disabledKeys?: string[];
      enableControl?: boolean;
      disabled?: boolean;
      /** 是否多选 */
      multiple?: boolean;
      /** 是否父和子互斥选择，同一个父的子互斥选择 */
      exclusiveCheck?: boolean;
      placeholder?: string;
      selfTmplId: string;
    }>(),
    {
      value: undefined,
      notEmitParent: true,
      enableControl: false,
      multiple: false,
      keyField: 'refId',
      selfTmplId: '',
    },
  );

  /** 最终是否启用文控限制 */
  const finalEnableDocControl = computed(() => {
    return isEnableDocControl() && props.enableControl;
  });

  const emit = defineEmits<{
    (e: 'update:value', value?: string | string[]): void;
    (e: 'select', value?: IData | IData[]): void;
  }>();

  const refSelect = ref();
  /** 数据对应显示的标题 */
  const dataTitle = computed(() => {
    return FormDesignEnum.ONLINE_FORM === props.type
      ? t('sys.pageDesigner.fieldCmp.online_form')
      : t('sys.edhr.edhrTemplate');
  });
  const localVal = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
      setTimeout(() => {
        triggerValidate();
      }, 100);
    },
  });

  const typeName = computed(() => {
    return FormDesignEnum.ONLINE_FORM === props.type
      ? t('sys.pageDesigner.fieldCmp.online_form')
      : t('sys.edhr.edhrTemplate');
  });

  const placeholder = computed(() => {
    return props.placeholder || t('sys.chooseTextTip', { name: typeName.value });
  });

  // 关联表单下拉框
  const _options = ref<any[]>([]);
  /** 下拉组件的选项数据 */
  const optionsData = computed(() => {
    const data = _options.value.map((e) => {
      return {
        value: e[props.keyField],
        label: `${e.name}${e.version ? ' : ' + e.version : ''}`,
        showTitle: h('div', [
          h(
            'span',
            {
              style: {
                display: 'inline-block',
              },
            },
            [`${e.name}${e.version ? ' : ' + e.version : ''}`],
          ),
          e.version ? null : h('span', { class: 'gct-custom-tag ml8px' }, t('sys.default')),
        ]),
      };
    });
    return data;
  });

  /** 格式化单条数据 */
  const formatData = (data) => {
    if (!data.refId) {
      // 没有refId的补充refId
      data.refId = data.baseId ? data.baseId + ':' + data.id : data.id;
    }
    return data;
  };

  /** 补全回显用缺失的选项数据 */
  const computedOptions = async (selectedKeys: string[]) => {
    const optionKeys = _options.value.map((e) => e[props.keyField]);
    const missingKeys = selectedKeys.filter((key) => !optionKeys.includes(key));
    const addOptions = await Promise.all(
      missingKeys.map(async (key) => {
        let id = key;
        if (props.keyField === 'refId') {
          // 从refId中取id
          id = key.split(':')[1] || key.split(':')[0];
        }
        const res = await getFormRelateInfo({
          id: id,
          moduleType: props.type,
        });
        return formatData(res);
      }),
    );
    _options.value = [..._options.value, ...addOptions];
  };

  // 回显选项的逻辑用于显示文本
  watch(
    () => localVal.value,
    async (v) => {
      if (v) {
        computedOptions(props.multiple ? (v as string[]) : [v as string]);
      }
    },
    {
      immediate: true,
    },
  );

  /** 选中的数据集合 */
  const selectedOptions = computed(() => {
    if (!localVal.value) {
      return undefined;
    }
    const keys = props.multiple ? (localVal.value as string[]) : [localVal.value as string];
    const options = keys
      .map((key) => {
        let find = _options.value.find((i) => i[props.keyField] === key);
        if (!find) {
          console.warn('选项未找到key' + key + '对应的数据');
        }
        return toRaw(find);
      })
      .filter(Boolean);
    return options;
  });

  const openModal = async () => {
    if (props.disabled) return;

    const res = await gct.openUtil.modal(
      formTmplModal,
      {
        selected: props.multiple ? selectedOptions.value : selectedOptions.value?.[0],
        moduleType: props.type,
        disabledKeys: props.disabledKeys,
        multiple: props.multiple,
        exclusiveCheck: props.exclusiveCheck,
        selfTmplId: props.selfTmplId,
        checkFunc: (row) => {
          // 启用文控的时候
          if (finalEnableDocControl.value) {
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
        title: t('sys.pleaseSelectSth', { sth: dataTitle.value }),
        width: props.multiple ? 1100 : 800,
        height: 500,
        okText: t('sys.okText'),
        getContainer: () => refSelect.value.$el.closest('ant-modal-mask') || document.body,
      },
    );
    if (res.ok && res.params?.selected) {
      const { selected } = res.params;
      // 单选
      if (!props.multiple) {
        let selectedVersion = selected;
        if (props.notEmitParent) {
          // 选中父的时候把默认版本的子作为最终结果选中
          selectedVersion = selected.children?.find((e) => e.default) || selected;
        }
        console.log('selectedVersion', selectedVersion);
        if (!_options.value.some((e) => e[props.keyField] === selectedVersion[props.keyField])) {
          _options.value.push({ ...selectedVersion });
        }
        localVal.value = selectedVersion[props.keyField];
        emit('select', selectedVersion);
      } else {
        // 多选
        selected.forEach((e) => {
          if (!_options.value.some((i) => i[props.keyField] === e[props.keyField])) {
            _options.value.push({ ...e });
          }
        });
        localVal.value = selected.map((e) => e[props.keyField]);
        emit('select', selected);
      }
    }
  };
</script>

<style lang="scss" scoped>
  $self-tmpl-select: (
    height: auto,
  );

  @include b(self-tmpl-select) {
    @include set-component-css-var(self-tmpl-select, $self-tmpl-select);
    height: getCssVar(self-tmpl-select, height);
  }
</style>
