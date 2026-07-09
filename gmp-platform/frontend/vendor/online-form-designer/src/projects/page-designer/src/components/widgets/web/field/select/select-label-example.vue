<!-- eDHR记录本标签需求，后续如果平台上了标签需求，代码可以删除后同步到eDHR -->
<template>
  <div :title="title">
    <label-example v-for="item in options" :widget="widget" :formData="item" />
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed, watch, ref } from 'vue';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import LabelExample from '../input/label-example.vue';
  import { Input } from '/@page-designer/types/web';
  import { EntityModelCategoryEnum } from '@gct/runtime';

  const props = defineProps<{
    modelValue?: string;
    widget: Input;
    needRequest: boolean;
    title: string;
  }>();

  const { bindModelKey } = reactive(props.widget.props);

  const currentValue = computed(() => {
    const value = props.modelValue || undefined;
    return Array.isArray(value) ? value : value?.split(',').filter(Boolean) || [];
  });

  const options = ref([]);

  watch(
    () => currentValue.value,
    async (v) => {
      if (v && Array.isArray(v) && v.length && props.needRequest) {
        const res222: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            bsKey: 'listByIds',
            modelKey: bindModelKey!,
            modelCategory: EntityModelCategoryEnum.ENTITY,
          },
          { ids: v.join(',') },
        );

        options.value = res222.data ?? [];
      }
    },
    {
      immediate: true,
    },
  );
</script>

<style scoped lang="less"></style>
