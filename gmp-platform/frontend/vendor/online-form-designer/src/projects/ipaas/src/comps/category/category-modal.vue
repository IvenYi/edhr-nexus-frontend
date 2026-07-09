<template>
  <div :class="ns.b()">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
    >
      <a-form-item :label="$t('sys.onlineForm.parentCategoryName')" name="parentId">
        <CategorySelect
          v-model:value="formData.parentId"
          :module="module"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.onlineForm.parentCategoryName') })"
          :hiddenNodeKeys="[data.id]"
        />
      </a-form-item>
      <a-form-item
        :label="`${t('sys.category')}${t('sys.name')}`"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formData.name"
          show-count
          :maxlength="32"
          :placeholder="t('sys.pleaseInputSth', { sth: `${t('sys.category')}${t('sys.name')}` })"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="category-modal">
  import { reactive, ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, useNamespace } from '@gct/runtime';
  import { pickBy } from 'lodash-es';
  import CategorySelect from './category-select.vue';
  import { CategoryModuleEnum } from './constant';

  const ns = useNamespace('category-modal');

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      data?: IData;
      module: CategoryModuleEnum;
    }>(),
    {
      data: () => ({}),
    },
  );

  const formData = reactive({ ...props.data });
  if (formData.parentId === 'ROOT') {
    formData.parentId = undefined;
  }

  const formRef = ref<FormInstance>();

  useModal(async () => {
    await formRef.value!.validate();
    const editedData = pickBy(formData, (v) => v !== undefined);
    return {
      ok: true,
      data: [editedData],
    };
  });
</script>

<style lang="scss" scoped>
  @include b(category-modal) {
    padding-top: 12px;
  }
</style>
