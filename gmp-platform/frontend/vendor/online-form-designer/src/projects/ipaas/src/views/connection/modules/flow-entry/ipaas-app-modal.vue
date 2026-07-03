<template>
  <div class="p-16px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="$t('sys.ipaas.appName')" name="name" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.name"
          show-count
          :maxlength="32"
          :placeholder="t('sys.pleaseInputSth', { sth: `${t('sys.category')}${t('sys.name')}` })"
        />
      </a-form-item>

      <a-form-item :label="$t('sys.ipaas.appBrand')" name="brand" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.brand"
          show-count
          :maxlength="32"
          :placeholder="t('sys.pleaseInputSth', { sth: `${t('sys.category')}${t('sys.name')}` })"
        />
      </a-form-item>

      <a-form-item :label="$t('sys.ipaas.appVersion')" name="version" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.version"
          show-count
          :maxlength="32"
          :placeholder="t('sys.pleaseInputSth', { sth: `${t('sys.category')}${t('sys.name')}` })"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="category-info">
  import { reactive, ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModal, useModal } from '@gct/runtime';
  import type { FlowAppReq } from '/@/apis/gct-ipaas/model/index';
  import { pick } from 'lodash-es';
  import { postCategoryApp, putAppById } from '/@/apis/gct-ipaas/IpaasCategoryController';

  const { t } = useI18n();

  const props = defineProps<{
    isEdit: boolean;
    context: IParams;
    modal: IModal;
  }>();

  console.log(props);

  const formRef = ref<FormInstance>();
  const formState = reactive<FlowAppReq & { id?: string }>({
    name: '',
    brand: '',
    version: '',
  });

  onMounted(() => {
    if (props.context) {
      Object.assign(formState, props.context);
    }
  });

  async function onSave() {
    try {
      await formRef.value?.validate();

      const data = pick(formState, ['name', 'version', 'brand']);

      if (props.isEdit) {
        await putAppById({ id: formState.id! }, data);
      } else {
        await postCategoryApp(data);
      }

      message.success(t('sys.operationSuccess'));

      return {
        ok: true,
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  }

  useModal(onSave);
</script>

<style scoped></style>
