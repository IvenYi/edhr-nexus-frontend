<template>
  <EmptyPage @search="onSearch" />
</template>

<script lang="ts" setup name="user-select">
  import { i18n } from '@mobile/locales/setupI18n';

  import EmptyPage from '../../produce/new/empty-page.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const { t } = i18n.global;

  const onSearch = (name) => {
    router.push({
      name: 'edhr-rework-run',
      query: {
        id: name,
      },
    });
  };
</script>

<style lang="less" scoped></style>
