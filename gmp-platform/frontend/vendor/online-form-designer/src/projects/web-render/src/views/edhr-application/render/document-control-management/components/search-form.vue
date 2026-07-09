<template>
  <div class="content-top bg-[#F7F8FA] p16px mb16px">
    <a-form>
      <a-row :gutter="[16, 16]">
        <a-col :span="8">
          <a-form-item :label="$t('sys.edhr.controlFileName')">
            <a-input
              v-model:value="form.name"
              type="text"
              allow-clear
              :placeholder="$t('sys.inputTextTip', { name: $t('sys.edhr.controlFileName') })"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="$t('sys.edhr.controlFileType')">
            <a-select
              v-model:value="form.controlTmplType"
              :placeholder="$t('sys.chooseTextTip', { name: $t('sys.edhr.controlFileType') })"
              allow-clear
              style="width: 100%"
              @change="onTypeChange"
            >
              <a-select-option value="FORM">{{ $t('sys.edhr.formTmpl') }}</a-select-option>
              <a-select-option value="EDHR">{{ $t('sys.edhr.edhrTmpl') }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="$t('sys.edhr.subcategory')">
            <a-tree-select
              v-model:value="form.categoryId"
              show-search
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              allow-clear
              show-arrow
              :tree-data="categoryOptions"
              :placeholder="$t('sys.chooseTextTip', { name: $t('sys.edhr.subcategory') })"
              :fieldNames="{ children: 'child', label: 'name', value: 'id' }"
              tree-node-filter-prop="name"
              dropdownClassName="gct-custom-select-dropdown"
              @dropdownVisibleChange="onDropdownVisibleChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="$t('sys.edhr.controlFileCode')">
            <a-input
              v-model:value="form.code"
              type="text"
              allow-clear
              :placeholder="
                $t('sys.inputTextTip', {
                  name: $t('sys.edhr.controlFileCode'),
                })
              "
            />
          </a-form-item>
        </a-col>
        <a-col :span="8" :offset="8" class="text-right">
          <a-form-item>
            <a-button class="ml4px mr-12px" @click="onReset">
              {{ $t('sys.reset') }}
            </a-button>
            <a-button type="primary" @click="onSearch">
              {{ $t('sys.queryText') }}
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { getDocControlTaskTodoPageListQueryInterface } from '/@/apis/gct-apaas/DocControlTaskTodoController';
  import { getInterfaceApi } from '@gct/runtime';
  import { message } from 'ant-design-vue';

  const emit = defineEmits(['update:value', 'on-search', 'on-reset']);
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
    emit('on-search', form.value);
  };

  const onReset = () => {
    form.value = {};
    emit('on-reset');
  };

  const getCategory = async (moduleType) => {
    categoryOptions.value = (await getInterfaceApi.getCategoryList({ moduleType })) || [];
  };

  const onTypeChange = (val) => {
    form.value.categoryId = undefined;
    categoryOptions.value = [];
    if (val) {
      getCategory(val === 'FORM' ? 'online_form_module' : 'edhr_module');
    }
  };

  const onDropdownVisibleChange = (visible) => {
    if (visible && !form.value.controlTmplType) {
      message.warn(`请先选择【${$t('sys.edhr.controlFileType')}】`);
    }
  };
</script>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
