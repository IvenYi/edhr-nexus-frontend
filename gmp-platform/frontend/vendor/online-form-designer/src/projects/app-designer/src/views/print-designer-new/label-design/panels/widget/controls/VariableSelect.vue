<template>
  <div class="select-content w-full" ref="rootRef">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ label }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <a-input-group compact>
            <a-select v-model:value="curType" :options="options" style="width: 90px" />
            <FieldCascader
              v-if="curType === CONTENT_TYPE.MODEL"
              allowClear
              expandToLeft
              valueSeparator="."
              :placeholder="$t('sys.chooseText')"
              :key="String(isFieldListReady)"
              :modelName="modelName"
              :fieldMetaList="fieldList"
              :value="currentValue"
              @labelChange="handleUpdateLabel"
              @FieldClick="handleUpdateValue"
            />
            <!-- <a-select
              v-else-if="curType === CONTENT_TYPE.LABEL_PARAMS"
              v-model:value="currentValue"
              :options="paramsData"
              allowClear
              showSearch
              style="width: 100%"
            /> -->
            <LabelParamsSelect
              v-else-if="curType === CONTENT_TYPE.LABEL_PARAMS"
              v-model="currentValue"
            />
            <a-input
              v-else
              style="width: 133px; height: 28px"
              @click="openExpress"
              :value="curexp.expression"
              :placeholder="t('sys.pageDesigner.pleaseEnterAnExpression')"
              readonly
            />
          </a-input-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="variable-select">
  import { computed, nextTick, ref } from 'vue';
  import { usePage } from '../../../hooks/usePage';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { PruneFieldMetaResponse } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { identify } from '/@/components/Expression/utils/expression';
  import { CONTENT_TYPE } from '../../../constants/CommonPrintElems';
  import { FieldCascader } from '/@/components/FieldCascader';
  import { getModelMetaInfo } from '/@/apis/gct-apaas/ModelMetaController';
  import LabelParamsSelect from '../components/label-params-select.vue';

  const { project, isEdhr } = usePage();
  const props = defineProps(['value', 'modelKey', 'type', 'options', 'label', 'exp']);
  const emit = defineEmits(['changeEvent']);
  const fieldList = ref<PruneFieldMetaResponse[]>();
  const currentLabel = ref();
  const rootRef = ref();
  const { openModal } = useExpression();
  const t = window.$t;
  const map: Map<string, any[]> = new Map();
  const isFieldListReady = ref(false);
  const modelName = ref('');

  const getFieldList = async () => {
    if (!project.value?.modelKey) {
      fieldList.value = [];
    } else {
      isFieldListReady.value = false;
      const modelKey = project.value!.modelKey!;

      const info = await getModelMetaInfo({ id: modelKey });
      modelName.value = info?.name || '';

      const res = await getFieldMetaList({ modelKey });
      isFieldListReady.value = true;
      fieldList.value = res!.filter(
        (item) => ![FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT].includes(item.type as FIELD_TYPE),
      );
    }
  };
  getFieldList();

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('changeEvent', { val });
    },
  });

  const curType = computed({
    get() {
      return props.type;
    },
    set(val) {
      emit('changeEvent', { type: val, label: '', val: '' });
    },
  });
  const curexp = computed({
    get() {
      return props.exp || {};
    },
    set(val) {
      emit('update:exp', val);
      emit('changeEvent', { exp: val });
    },
  });

  const handleUpdateLabel = async (label?: string) => {
    await nextTick();
    emit('changeEvent', { val: props.value, label });
    currentLabel.value = label;
  };

  const handleUpdateValue = async (value?: string) => {
    await nextTick();
    currentValue.value = value;
  };

  const loadOptions = async (modelKey, level = 1) => {
    if (level > props.maxLevel) {
      return [];
    }
    const items: any[] = [];
    let files: any[] = [];
    if (!map.has(modelKey)) {
      files = (await getFieldMetaList({ modelKey }))!;
      if (files && files.length > 0) {
        map.set(modelKey, files);
      } else {
        files = [];
      }
    } else {
      files = map.get(modelKey)!;
    }
    const all: Promise<void>[] = [];
    files.forEach((item) => {
      const opt: any = {
        id: item.key,
        name: item.name,
        valueType: item.type,
      };
      items.push(opt);
      if (
        (item.type === FIELD_TYPE.REF || item.type === FIELD_TYPE.RDO_REF) &&
        level <= props.maxLevel
      ) {
        const fn = async () => {
          const arr = await loadOptions(item.bindInfo, level + 1);
          if (arr && arr.length > 0) {
            opt.children = arr;
          }
        };
        all.push(fn());
      }
    });
    await Promise.all(all);
    return items;
  };

  const openExpress = async () => {
    console.log('project', project, isEdhr.value);
    const items =
      !project.value || isEdhr.value
        ? []
        : await loadOptions(project.value.modelKey! || props.modelKey);
    openModal({
      expr: curexp.value.exp,
      modelKey: isEdhr.value ? 'em_label_param' : undefined,
      mode: isEdhr.value ? ExpressionModeEnum.EDHR_LABEL_PRINT : ExpressionModeEnum.LABEL_PRINT,
      identifiers: {
        [ExpressionTabEnum.FIELD]: items,
      },
      callback: (expr, exprLabel) => {
        const items = identify(expr);
        curexp.value = {
          exp: expr,
          expression: exprLabel,
          relationColumns: items,
        };
      },
    });
  };
</script>

<style lang="less" scoped>
  :deep(.ant-input-affix-wrapper) {
    border-radius: 0 4px 4px 0;
  }

  :deep(.sub-content_inner .ant-input-group) {
    display: flex;
  }

  :deep(.sub-content_inner .gct-field-cascader-selector .ant-select-selector) {
    width: 133px !important;

    .ant-select-selection-placeholder {
      line-height: 26px;
    }
  }
</style>
