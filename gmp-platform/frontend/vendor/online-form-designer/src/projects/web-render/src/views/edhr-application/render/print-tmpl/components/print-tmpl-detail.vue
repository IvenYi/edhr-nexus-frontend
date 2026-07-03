<template>
  <div :class="[ns.b()]" v-loading="isLoading">
    <a-tabs v-if="!isLoading" :class="[ns.e('tab')]">
      <a-tab-pane key="1" tab="流转单样式">
        <document-view :class="[ns.e('form-preview')]" v-if="tmplId" :dataId="tmplId" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup name="form-tmpl-detail">
  import { ref, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import DocumentView from '/@online-form/views/integration/apaas_dp/designer/apaas-dp-print-sheet-view.vue';

  const ns = useNamespace('form-tmpl-detail');
  const isLoading = ref(false);

  const props = withDefaults(
    defineProps<{
      tmplId: string;
    }>(),
    {},
  );

  watch(
    () => props.tmplId,
    async (value) => {
      if (!value) return;
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="scss" scoped>
  $form-tmpl-detail: ();

  @include b(form-tmpl-detail) {
    @include set-component-css-var(form-tmpl-detail, $form-tmpl-detail);
    padding: 0 16px 16px;
    position: relative;

    @include e(form-preview) {
      background-color: #e6e9ef;
    }

    @include e(tab) {
      height: 100%;
      :deep(.ant-tabs-nav) {
        margin: 0;
      }
      :deep(.ant-tabs-nav-wrap) {
        margin-left: 16px;
      }
      :deep(.ant-tabs-tab) {
        padding: 7px 0;
      }
      :deep(.ant-tabs-content) {
        height: 100%;
      }
    }
  }
</style>
