<template>
  <a-select
    v-model:value="value"
    :options="paramsData"
    allowClear
    showSearch
    :placeholder="$t('sys.chooseText')"
    optionFilterProp="label"
    style="width: 100%"
    @change="handleChange"
  />
</template>
<script setup lang="ts" name="label-params-select">
  import { onMounted, ref } from 'vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{
    modelValue?: string;
  }>();

  const emit = defineEmits(['update:modelValue', 'change', 'changeEvent']);

  const value = ref(props.modelValue ?? undefined);

  // 标签参数模型的数据
  const paramsData = ref<Array<{ label: string; value: string; [key: string]: any }>>([]);

  onMounted(async () => {
    paramsData.value = await getParamsList();
  });

  function handleChange(val) {
    emit('update:modelValue', val);
    emit(
      'change',
      val,
      paramsData.value.find((item) => item.value === val),
    );
    emit('changeEvent', { val, label: paramsData.value.find((item) => item.value === val)?.label });
  }

  async function getParamsList() {
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_label_param',
        modelCategory: 'entity',
      },
      {},
      {
        sorts: [
          {
            sortField: 'create_time_',
            sortType: 'desc',
          },
        ],
      },
    );

    const data = (res?.data || []).map((item) => ({
      value: item.id_,
      label: item.name_,
      _item: item,
      id: item.id_,
      name: item.name_,
      type: item.type_,
    }));
    return data;
  }

  defineExpose({
    /**
     * 获取选项数据（如果为空则重新加载）
     */
    getOptions: async () => {
      if (!paramsData.value.length) return await getParamsList();
      return paramsData.value;
    },
    /**
     * 直接获取 paramsData 的当前值
     * @returns 标签参数模型的数据数组
     */
    getParamsData: () => paramsData.value,
  });
</script>
<style lang="less" scoped></style>
