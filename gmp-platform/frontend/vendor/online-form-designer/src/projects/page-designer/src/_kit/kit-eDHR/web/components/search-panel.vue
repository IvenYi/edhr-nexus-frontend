<template>
  <div class="search-panel round-2xl p-2 bg-gray-100 mb-4">
    <a-form ref="searchForm" :model="searchFormData">
      <a-row :gutter="8">
        <a-col :span="6" v-for="field in searchWidgets" :key="field.id">
          <a-form-item :label="field.alias" :name="field.props.field">
            <FieldWidget :widget="field" :mode="props.mode" :rowValue="searchFormData" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <div class="search-panel-buttons flex gap-2 ml-2">
            <a-button @click="onReset">{{ $t('sys.resetText') }}</a-button>
            <a-button type="primary" @click="onSearch">{{ $t('sys.queryText') }}</a-button>
          </div>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import FieldWidget from './field-widget.vue';
  import { IOrderManage } from '../order-manage/schema';
  import { ITaskManage } from '../task-manage/schema';

  const props = defineProps<{
    mode: 'design' | 'render';
    widget: IOrderManage | ITaskManage;
  }>();

  const emits = defineEmits<{
    (e: 'search', params: any): void;
    (e: 'reset'): void;
  }>();

  const searchForm = ref();
  const searchFormData: any = ref({});

  const searchWidgets = computed(() => {
    return (props.widget?.children?.[0] ?? []).map((f) => {
      return {
        ...f,
        props: {
          ...f.props,
          readonly: false,
        },
      };
    });
  });

  function onReset() {
    searchForm.value.resetFields();
    emits('reset');
  }

  function onSearch() {
    const searchData = {};
    searchWidgets.value.forEach((f) => {
      if (searchFormData.value[f.props.field]) {
        searchData[f.props.field] = searchFormData.value[f.props.field];
      }
    });
    emits('search', searchData);
  }
</script>

<style lang="less" scoped>
  .search-panel {
    :deep(.ant-form-item) {
      margin-bottom: 0 !important;
      padding: 8px 0 !important;
    }

    &-buttons {
      padding: 8px 0 !important;
    }
  }
</style>
