<template>
  <div class="select-content w-full">
    <div class="setting-row">
      <!-- <div class="sub-title" :style="{ width: '26px' }"></div> -->
      <div class="sub-content">
        <FieldCascader
          allowClear
          expandToLeft
          valueSeparator="."
          :placeholder="$t('sys.pleaseSelectSth')"
          :key="String(isFieldListReady)"
          :modelName="fieldModelName"
          :fieldMetaList="fieldList"
          :value="currentValue"
          @labelChange="handleUpdateLabel"
          @FieldClick="handleUpdateValue"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="field-content">
  import { computed, nextTick, ref } from 'vue';
  import { usePage } from '../../../hooks/usePage';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { getModelMetaInfo } from '/@/apis/gct-apaas/ModelMetaController';
  import { PruneFieldMetaResponse } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { FieldCascader } from '/@/components/FieldCascader';

  const { project } = usePage();
  const props = defineProps(['value', 'modelKey']);
  const emit = defineEmits(['changeEvent']);
  const fieldList = ref<PruneFieldMetaResponse[]>();
  const fieldModelName = ref('');
  const currentLabel = ref();
  const isFieldListReady = ref(false);

  const getFieldList = async () => {
    if (!project.value?.modelKey) {
      fieldList.value = [];
    } else {
      isFieldListReady.value = true;

      const modelKey = project.value!.modelKey!;

      const res = await getModelMetaInfo({ id: modelKey });

      fieldModelName.value = res?.name || '';

      getFieldMetaList({ modelKey })
        .then((res) => {
          fieldList.value = res!.filter(
            (item) => ![FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT].includes(item.type as FIELD_TYPE),
          );
        })
        .finally(() => {
          isFieldListReady.value = false;
        });
    }
  };

  getFieldList();

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('changeEvent', { val, label: currentLabel.value });
    },
  });

  const handleUpdateLabel = async (label?: string) => {
    await nextTick();
    currentLabel.value = label;
  };

  const handleUpdateValue = async (value?: string) => {
    await nextTick();
    currentValue.value = value;
  };
</script>

<style lang="less" scoped>
  .gct-field-cascader-selector {
    width: 100%;
  }

  :deep(.ant-select-selection-placeholder) {
    line-height: 26px !important;
  }
</style>
