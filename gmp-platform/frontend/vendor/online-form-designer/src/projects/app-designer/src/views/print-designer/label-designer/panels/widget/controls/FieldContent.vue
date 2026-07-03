<template>
  <div class="select-content w-full" ref="rootRef">
    <div class="setting-row">
      <!-- <div class="sub-title" :style="{ width: '26px' }"></div> -->
      <div class="sub-content">
        <FieldSearchCascader
          ref="fieldSearchRef"
          v-model:value="currentValue"
          :modelKey="project.modelKey"
          :rootRef="rootRef"
          @update:value="updateValue"
          style="width: 100%"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="field-content">
  import { computed, nextTick, ref } from 'vue';
  import { usePage } from '../../../hooks/usePage';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { PruneFieldMetaResponse } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { FieldSearchCascader } from '/@/components/FieldSearchCascader';

  const { project } = usePage();
  const props = defineProps(['value']);
  const emit = defineEmits(['changeEvent']);
  const fieldList = ref<PruneFieldMetaResponse[]>();
  const fieldSearchRef = ref();
  const currentLabel = ref();
  const rootRef = ref();

  const getFieldList = async () => {
    if (!project.value?.modelKey) {
      fieldList.value = [];
    } else {
      const res = await getFieldMetaList({ modelKey: project.value!.modelKey! });
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
      emit('changeEvent', { val, label: currentLabel.value });
    },
  });

  const updateValue = async (val) => {
    await nextTick();
    currentLabel.value = fieldSearchRef.value.fieldCascaderName;
    currentValue.value = val;
  };
</script>

<style lang="less" scoped></style>
