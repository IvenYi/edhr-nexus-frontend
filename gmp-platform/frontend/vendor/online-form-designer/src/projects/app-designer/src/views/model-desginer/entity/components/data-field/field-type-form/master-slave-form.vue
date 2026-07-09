<template>
  <a-form-item
    :label="t('sys.model.childModel')"
    name="bindInfo"
    :rules="[{ required: true, message: `${t('sys.chooseText')}${t('sys.model.childModel')}` }]"
  >
    <a-select
      v-model:value="formData.bindInfo"
      :disabled="isEdit"
      :placeholder="t('sys.chooseText')"
      :showSearch="true"
      optionFilterProp="fieldName"
    >
      <a-select-opt-group v-for="(group, index) in modelList" :key="index">
        <template #label>
          <span>
            {{ group.name }}
          </span>
        </template>
        <a-select-option
          v-for="model in group.children"
          :key="model.key"
          :value="model.key"
          :fieldName="model.name"
          >{{ model.name }}</a-select-option
        >
      </a-select-opt-group>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="master_slave">
  import { onMounted, PropType, reactive, ref, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { getCategoryGetListRdoOrNdo } from '/@/apis/gct-apaas/CategoryController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const { t } = useI18n();

  const emit = defineEmits(['update:formState']);
  const { formState, isEdit } = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
  });
  const formData = reactive<FieldFormState>(formState);
  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  const modelList = ref<CategoryCompleteResponse[]>([]);

  const getMasterSlaveList = async () => {
    const res = await getFieldMetaList({
      keyword: '',
      modelKey: formState.modelKey,
      includeProcess: false,
    });
    const list = res?.filter((i) => i.type === FIELD_TYPE.MASTERSLAVE).map((v) => v.bindInfo);
    return list;
  };

  onMounted(async () => {
    const excludes = await getMasterSlaveList();
    //获取实体类型
    getCategoryGetListRdoOrNdo({
      type: 'NDO,BASE,TREE,DYNAMIC_FORM,TXN_EXT',
      modelMetaId: formState.modelKey,
    }).then((res) => {
      modelList.value = res?.filter((d) => {
        d.children = d.children?.filter((e) => {
          return (
            (e.key !== formState.modelKey && e.subModel === 1 && !excludes?.includes(e.key)) ||
            isEdit
          );
        });
        return d.children!.length;
      });
    });
  });

  watch(
    () => formData.bindInfo,
    async (modelKey) => {
      const model = modelList.value
        .filter((el) => {
          return el.children?.some((d) => d.key == modelKey);
        })[0]
        .children?.find((d) => d.key == modelKey);
      formData.refModelType = model?.type;
    },
  );
</script>

<style lang="less" scoped></style>
