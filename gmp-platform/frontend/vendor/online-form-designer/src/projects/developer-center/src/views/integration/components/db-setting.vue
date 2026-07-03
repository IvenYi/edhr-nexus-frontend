<template>
  <a-form-item
    :label="t('sys.integration.ds.address')"
    name="ip"
    :rules="[
      { required: true, whitespace: true },
      // {
      //   pattern:
      //     /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/,
      //   message: t('sys.pleaseInputValidSth', {
      //     sth: t('sys.integration.ds.address'),
      //   }),
      // },
    ]"
  >
    <a-input v-model:value="formState.ip" show-count :maxlength="64" />
  </a-form-item>

  <a-form-item :label="t('sys.integration.ds.port')" name="port" :rules="[{ required: true }]">
    <a-input-number
      v-model:value="formState.port"
      show-count
      :maxlength="5"
      :step="1"
      :precision="0"
  /></a-form-item>

  <a-form-item
    :label="t('sys.integration.db.name')"
    name="dbName"
    :rules="[{ required: true, whitespace: true }]"
  >
    <a-input v-model:value="formState.dbName" show-count :maxlength="32" />
  </a-form-item>

  <a-form-item
    :label="t('sys.integration.db.username')"
    name="userName"
    :rules="[{ required: true, whitespace: true }]"
  >
    <a-input v-model:value="formState.userName" show-count :maxlength="32" />
  </a-form-item>

  <a-form-item
    :label="t('sys.password')"
    name="password"
    :rules="[{ required: true, whitespace: true }]"
  >
    <a-input-password
      v-model:value="formState.password"
      show-count
      :maxlength="256"
      autocomplete="new-password"
    />
  </a-form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { DataSourceDetailRequest } from '/@/apis/gct-platform/model';

  const props = defineProps<{
    data: Partial<DataSourceDetailRequest>;
  }>();

  const { t } = useI18n();

  const formState = computed({
    get() {
      return props.data;
    },
    set(value) {
      Object.assign(props.data, value);
    },
  });
</script>

<style></style>
