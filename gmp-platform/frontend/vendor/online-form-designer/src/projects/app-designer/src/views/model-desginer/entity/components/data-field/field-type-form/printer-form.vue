<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    v-show="!isCustom"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'type']" v-show="false">
    <a-input :value="formData.defaultValue.type" />
  </a-form-item>
  <a-form-item
    v-show="!isCustom"
    :label="`${t('sys.defaultValue')}`"
    :name="['defaultValue', 'value']"
  >
    <a-tree-select
      v-model:value="showValue"
      show-search
      style="width: 100%"
      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
      dropdown-class-name="gct-custom-select-dropdown"
      :placeholder="t('sys.chooseText')"
      allow-clear
      tree-default-expand-all
      :tree-data="printOptions"
      tree-node-filter-prop="label"
      @change="printerChange"
    >
      <template #title="item">
        <div
          v-if="item.name && !Object.prototype.hasOwnProperty.call(item, 'selected')"
          class="gct-text-overflow"
        >
          {{ item.dftPrintInfo?.name || item.name }}
        </div>
        <a-row v-else-if="item.name" :gutter="4">
          <a-col
            :span="item.defaultPrint === '是' ? 18 : 24"
            class="gct-text-overflow"
            :title="item.name"
            >{{ item.name }}</a-col
          >
          <a-col :span="item.defaultPrint === '是' ? 6 : 0">
            <a-tag color="processing">{{ t('sys.default') }}</a-tag>
          </a-col>
        </a-row>
        <span v-else>{{ showValue }}</span>
      </template>
    </a-tree-select>
  </a-form-item>
</template>

<script setup lang="ts" name="printer">
  import { PropType, reactive, watch, onMounted, ref } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import { FormInstance } from 'ant-design-vue';
  import { isEmpty } from 'lodash-es';
  import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';

  const { t } = useI18n();
  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    // 是否是自定义字段，设计器-表单中使用
    isCustom: { type: Boolean, default: false },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState);

  let printOptions = ref<any[]>([]);

  const showValue = ref();

  watch(
    () => formData,
    (val) => {
      emit('update:formState', reactive(val));
    },
    { deep: true },
  );

  const printerChange = (value, option) => {
    formData.defaultValue.value = value;
    formData.defaultValue.name = option && option.length ? option[0] : '';
  };

  watch(
    () => formData.defaultValue.value,
    (value) => {
      if (isEmpty(value)) {
        formData.defaultValue.type = FieldDefaultValueTypeEnum.NONE;
      } else {
        formData.defaultValue.type = FieldDefaultValueTypeEnum.FIXED;
      }
    },
  );

  onMounted(async () => {
    await getPrinterData();
    await getShowValue();
  });

  const getPrinterData = async () => {
    // 后端返回的字段中没有可以作为唯一标识的字段，所以，将name和id用‘&’拼在一起作为唯一标识
    const data: any[] = (await getPrintPrintDropdownList()) || [];
    printOptions.value = data.map((i) => {
      const dftInfo =
        (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
        undefined;
      return {
        ...i,
        value: i.printKey,
        name: i.name,
        label: i.name,
        disabled: i.type === PrintResourceEnum.INTERNET_PRINT,
        dftPrintInfo: i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo ? dftInfo : undefined,
        children: i.printChildNode
          ? i.printChildNode.map((e) => {
              if (e.printKey === formData.defaultValue.value) {
                showValue.value = e.printKey;
              }

              return {
                ...e,
                value: e.printKey,
                label: e.name,
              };
            })
          : [],
      };
    });
  };

  const getShowValue = () => {
    showValue.value = showValue.value
      ? showValue.value
      : formData.defaultValue.value
        ? formData.defaultValueTips[0] + '(离线)'
        : undefined;
  };
</script>

<style lang="less" scoped></style>
