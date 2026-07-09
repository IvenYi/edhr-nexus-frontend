<template>
  <search-form :formData="form" :initData="initSearchList" @on-query="onSearch">
    <template #custom_comp="{ item, formState }">
      <a-tree-select
        v-model:value="formState[item.model]"
        show-search
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
        allow-clear
        show-arrow
        :tree-data="categoryOptions"
        :placeholder="item.placeholder || t('sys.inputTextTip', { name: item.label })"
        :fieldNames="{ children: 'child', label: 'name', value: 'id' }"
        tree-node-filter-prop="name"
        dropdownClassName="gct-custom-select-dropdown"
        @dropdownVisibleChange="onDropdownVisibleChange"
      />
    </template>
  </search-form>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getDocControlTaskTodoPageListQueryInterface } from '/@/apis/gct-apaas/DocControlTaskTodoController';
  import { message } from 'ant-design-vue';
  import SearchForm from '/@web-render/views/edhr-application/components/search-form/index.vue';
  import { getInterfaceApi } from '@gct/runtime';

  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: t('sys.edhr.controlFileName'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'select',
      label: t('sys.edhr.controlFileType'),
      id: 'controlTmplType',
      model: 'controlTmplType',
      options: [
        { label: t('sys.edhr.formTmpl'), value: 'FORM' },
        { label: t('sys.edhr.edhrTmpl'), value: 'EDHR' },
      ],
      onChange: onTypeChange,
    },
    {
      type: 'categoryTreeSelect',
      label: t('sys.edhr.subcategory'),
      id: 'categoryId',
      model: 'categoryId',
    },

    {
      type: 'input',
      label: t('sys.edhr.controlFileCode'),
      id: 'code',
      model: 'code',
      maxLength: 32,
    },
  ];

  const emit = defineEmits(['update:value', 'on-search']);
  const props = defineProps<{
    value: getDocControlTaskTodoPageListQueryInterface;
  }>();

  const categoryOptions = ref<any[]>([]);

  const form = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  const onSearch = () => {
    emit('on-search');
  };

  const getCategory = async (moduleType) => {
    categoryOptions.value = (await getInterfaceApi.getCategoryList({ moduleType })) || [];
  };

  function onTypeChange(val) {
    form.value.categoryId = undefined;
    categoryOptions.value = [];
    if (val) {
      getCategory(val === 'FORM' ? 'online_form_module' : 'edhr_module');
    }
  }

  const onDropdownVisibleChange = (visible) => {
    if (visible && !form.value.controlTmplType) {
      message.warn(`请先选择【${t('sys.edhr.controlFileType')}】`);
    }
  };
</script>
