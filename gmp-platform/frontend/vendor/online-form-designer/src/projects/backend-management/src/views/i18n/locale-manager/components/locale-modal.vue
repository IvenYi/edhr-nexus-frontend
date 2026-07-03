<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.i18n.addLanguage')"
    centered
    width="700px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="localeFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.i18n.languageIdentification')"
        name="id"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.id"
          :showSearch="true"
          :filter-option="(input: string, option: any) => {
              return option.language.indexOf(input.toLowerCase()) >= 0;
            }"
        >
          <a-select-option
            v-for="locale in notConfiguredLocale"
            :key="locale.id"
            :value="locale.id"
            :language="locale.language"
            >{{ locale.language }}</a-select-option
          >
        </a-select>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';
  import { useI18n } from 'vue-i18n';
  //store
  const localeStore = useLocaleStoreWithOut();
  const { t } = useI18n();
  //Form
  const localeFormRef = ref<FormInstance>();
  const formState = reactive({
    id: '',
  });
  //Modal
  const [registerInner, { closeModal }] = useModalInner();
  const handleOk = () => {
    localeFormRef.value?.validate().then(async () => {
      await localeStore.updateLocale(formState.id, {
        configured: 1,
      });
      closeModal();
    });
  };
  const handleClose = () => {
    localeFormRef.value?.resetFields();
  };
  const notConfiguredLocale = computed(() => {
    return localeStore.localeList.filter((d) => {
      return d.configured === 0;
    });
  });
</script>

<style scoped></style>
