<template>
  <div v-if="readonly" :title="selectedVal?.fieldLabel">{{ selectedVal?.fieldLabel }}</div>
  <a-select
    v-else
    v-model:value="value"
    style="width: 100%"
    :options="optionsData"
    :disabled="disabled"
    :showArrow="false"
    :allowClear="true"
    :fieldNames="{ label: 'fieldLabel', value: 'id' }"
    :size="size"
    dropdownClassName="gct-project-select-dropdown hidden"
    :placeholder="$t('sys.chooseText')"
    @click="openModal()"
  />
</template>
<script setup lang="ts">
  import { computed, onMounted, ref, toRaw, watch } from 'vue';
  import { getPrintDesignerInfo } from '/@/apis/gct-apaas/PrintDesignerController';
  import labelTmplModal from '/@page-designer/components/widgets/web/__components__/print-tmpl-modal.vue';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const props = defineProps<{
    modelValue?: string;
    templateType?: string;
    size?: string;
    disabled?: boolean;
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:modelValue', 'update:templateType', 'change']);
  const options = ref<any[]>([]);
  const value = ref(props.modelValue);


  const optionsData = computed(() => {
    const data = options.value.map((e) => {
      return {
        ...e,
        fieldLabel: `${e.name}${e.version ? ' : ' + e.version : ''}`,
      };
    });
    return data;
  });

  const selectedVal = computed(() => {
    console.log('com--------', options.value, optionsData.value, value.value)
    return optionsData.value.find((i) => i.id === value.value);
  });

  onMounted(async () => {
    if (value.value) {
      let data = options.value.find((e) => e.id === value.value);
      if (!data) {
        const id = value.value.split(':')[1] || value.value.split(':')[0];
        const res: any = await getTmplInfo(id);
        if (!props.templateType) {
          emit('update:templateType', res.printType);
        }
      }
    }
  });

  watch(
    () => value.value,
    (val) => {
      emit('update:modelValue', val);
    },
  );

  const openModal = async () => {
    const res: any = await gct.openUtil.modal(
      labelTmplModal,
      {
        selected: await getOptionValue(),
        moduleType: PrintTypeEnum.LABEL,
        isRdo: true,
        btwForceVisible: true,
      },
      {
        title: $t('sys.pageDesigner.chooseTmplSth', {
          sth: $t('sys.pageDesigner.labelTemplateRef'),
        }),
        width: 1100,
        height: 734,
        okText: $t('sys.okText'),
        wrapClassName: 'vxe-table--ignore-clear',
      },
    );
    if (res.ok && res.params?.selected?.length) {
      const { selected } = res.params;
      // btw 标签的 version 只在模版转换保存数据时写死为 1，使用时不展示
      selected.forEach((o) => {
        if (getIsBtwLabel(o)) {
          o.id = `${o.baseId}:${o.id}`; // 强制带上 baseId
          o.version = ''; // 手动清空
        }
      });
      value.value = selected[0].id;
      emit('update:templateType', selected[0].printType);
      emit('change', value.value, selected[0]);
      if (!options.value.some((e) => e.id === selected[0].id)) {
        options.value.push({ ...selected[0] });
      }
    }
  };

  async function getTmplInfo(id) {
    const res: any = await getPrintDesignerInfo({
      id,
      moduleType: PrintTypeEnum.LABEL,
    });
    res && options.value.push({ ...res, id: res.baseId ? res.baseId + ':' + res.id : res.id });
    return res;
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

  function getIsBtwLabel(label: any) {
    if (!label?.printType) return false;
    return label.printType === 'btw';
  }
</script>
<style lang="less" scoped></style>
