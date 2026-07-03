<template>
  <a-input-group compact>
    <a-select
      :style="{
        width: width + 'px',
      }"
      v-model:value="val"
      :options="items"
      size="small"
      @focus="onFocus"
    />
    <a-select
      v-if="val === KeyMode.TRANSACTION"
      :style="{ width: `calc(100% - ${width}px)` }"
      v-model:value="val2"
      :options="items2"
      size="small"
      @focus="onFocus2"
      allowClear
    />
    <a-select
      v-else
      v-model:value="val2"
      :style="{ width: `calc(100% - ${width}px)` }"
      :options="optionsData"
      size="small"
      :showArrow="false"
      dropdownClassName="gct-project-select-dropdown hidden"
      :placeholder="t('sys.chooseText')"
      :fieldNames="{ label: 'fieldLabel', value: 'id' }"
      optionLabelProp="showTitle"
      @click="openModal()"
      @change="changeSelect"
    />
  </a-input-group>
</template>
<script setup lang="ts" name="label-rdo-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref, Ref, toRaw, h, watch } from 'vue';
  import { KeyMode } from '@gct/runtime';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import labelTmplModal from '../../../../components/widgets/web/__components__/print-tmpl-modal.vue';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { getPrintDesignerInfo } from '/@/apis/gct-apaas/PrintDesignerController';

  const { t } = useI18n();

  const defProps = defineProps(props);
  const { options, options2, width = 80, moduleType } = defProps.propConfig;

  const items: Ref<any[]> = ref(Array.isArray(options) ? options : []);
  const items2: Ref<any[]> = ref(Array.isArray(options2) ? options2 : []);

  const optionRdo = ref<any[]>([]);
  const [name, name2] = (defProps.propName as IData).list?.split(';') || [];
  const { propValue: value } = usePropEditor(name, defProps.changeCallback);
  const { propValue: value2 } = usePropEditor(name2, defProps.changeCallback);

  const val = computed({
    get() {
      return value.value;
    },
    async set(val) {
      if (val === KeyMode.TRANSACTION) {
        onFocus2();
      }
      value.value = val;
      value2.value = null;
    },
  });

  async function getTmplInfo(id) {
    const res: any = await getPrintDesignerInfo({
      id,
      moduleType: moduleType || PrintTypeEnum.LABEL,
    });

    const rdoId = [res.baseId, res.id].filter(Boolean).join(':');
    const isBtwLabel = ['iplb_', 'plb_'].some((p) => res.key.startsWith(p));
    const _id = isBtwLabel ? res.id : rdoId;

    if (res) {
      optionRdo.value.push({ ...res, id: _id });
    }

    return res;
  }
  const optionsData = computed(() => {
    const data = optionRdo.value.map((e) => {
      return {
        ...e,
        fieldLabel: e.name,
        showTitle: h('div', [
          h(taglabel, {
            label: e.name,
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

  const val2 = computed({
    get() {
      if (val.value === KeyMode.TRANSACTION) {
        onFocus2();
      }
      return value2.value || undefined;
    },
    set(val) {
      value2.value = val;
    },
  });

  watch(
    () => value2.value,
    async () => {
      if (value2.value) {
        let data = optionRdo.value.find((e) => e.id === value2.value);
        if (!data) {
          const id = value2.value ? value2.value.split(':')[1] || value2.value.split(':')[0] : '';
          data = await getTmplInfo(id);
        }
      }
    },
    {
      immediate: true,
    },
  );

  async function changeSelect(v) {
    if (!v) {
      getOptionValue(v);
    }
  }

  const openModal = async () => {
    const res: any = await gct.openUtil.modal(
      labelTmplModal,
      {
        selected: getOptionValue(),
        moduleType: moduleType || PrintTypeEnum.LABEL,
        printMode: defProps.widget?.props.printMode,
        isAll: true,
        isRdo: false,
      },
      {
        title: t('sys.pageDesigner.chooseTmplSth', { sth: t('sys.pageDesigner.labelTemplateRef') }),
        width: 1100,
        height: 734,
        okText: t('sys.okText'),
      },
    );
    if (res.ok && res.params?.selected?.length) {
      const { selected } = res.params;
      if (!optionRdo.value.some((e) => e.id === selected[0].id)) {
        optionRdo.value.push({ ...selected[0] });
      }
      val2.value = selected[0].id;
      changeSelect(selected[0].id);
    }
  };

  /**
   * 获取选中的options
   */
  function getOptionValue(v = val2.value) {
    let data = optionRdo.value.find((i) => i.id === v);
    return toRaw(data);
  }

  const onFocus = async () => {
    if (options) {
      if (Array.isArray(options)) {
        items.value = options;
      } else {
        items.value = await options(defProps.widget);
      }
    }
    items.value.forEach((item) => {
      item.label = t(item.label);
    });
  };

  onFocus();

  const onFocus2 = async () => {
    if (options2) {
      if (Array.isArray(options2)) {
        items2.value = options2.filter((item) => {
          return item.label && item.label.includes(val.value);
        });
      } else {
        items2.value = await options2(
          defProps.widget,
          val.value,
          items.value.find((item) => item.value === val.value),
        );
      }
    }
    items2.value.forEach((item) => {
      item.label = t(item.label);
    });
  };
</script>
<style lang="less" scoped></style>
