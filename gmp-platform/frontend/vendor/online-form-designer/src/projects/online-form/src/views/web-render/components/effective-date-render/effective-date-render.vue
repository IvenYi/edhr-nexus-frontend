<template>
  <span :class="ns.b()">
    {{ effectiveDate || t('sys.edhr.processChoice.effectType.0') }}
  </span>
</template>

<script lang="ts" setup name="effective-date-render">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { getDocControlStartedInfo } from '/@/apis/gct-apaas/DocControlStartedController';
  import { useI18n } from 'vue-i18n';

  const ns = useNamespace('effective-date-render');

  const props = defineProps<{
    approvalControlId: string;
  }>();

  const { t } = useI18n();

  const approvalControlInfo = ref<any>();

  const effectiveDate = computed(() => {
    return approvalControlInfo.value?.effectiveDate;
  });

  watch(
    () => props.approvalControlId,
    async (id) => {
      if (!id) return;
      approvalControlInfo.value = await getDocControlStartedInfo({ id });
    },
    {
      immediate: true,
    },
  );

  // onMounted(async () => {
  //   approvalControlInfo.value = await getDocControlStartedInfo({ id: props.approvalControlId });
  // });
</script>

<style lang="scss" scoped>
  $effective-date-render: ();

  @include b(effective-date-render) {
    @include set-component-css-var(effective-date-render, $effective-date-render);

    @include m(uncontrolled) {
      color: #8f8f8f;
    }
  }
</style>
