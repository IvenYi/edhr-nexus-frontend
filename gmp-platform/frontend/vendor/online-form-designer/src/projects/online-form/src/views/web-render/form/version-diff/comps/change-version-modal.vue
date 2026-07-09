<template>
  <div class="py24px px70px">
    <a-form ref="formRef" :model="form">
      <a-form-item
        :label="$t('sys.webRender.baseVersion')"
        name="baseVersionId"
        :rules="[{ required: true, message: $t('sys.chooseText') }]"
      >
        <a-select
          v-model:value="form.baseVersionId"
          :options="baseOptions"
          :fieldNames="{ value: 'id', label: 'version' }"
          showSearch
          showArrow
          allowClear
        />
      </a-form-item>
      <a-form-item
        :label="$t('sys.webRender.compareVersion')"
        name="compareVersionId"
        :rules="[{ required: true, message: $t('sys.chooseText') }]"
      >
        <a-select
          v-model:value="form.compareVersionId"
          :options="compareOptions"
          :fieldNames="{ value: 'id', label: 'version' }"
          showSearch
          showArrow
          allowClear
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { IModal, useModal } from '@gct/runtime';
  import { ref, computed, onMounted } from 'vue';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';

  const props = defineProps<{
    modal: IModal;
    data: {
      baseVersion: OnlineFormTmplResponse;
      compareVersion: OnlineFormTmplResponse;
    };
    options: OnlineFormTmplResponse[];
  }>();

  const formRef = ref();
  const form = ref<{ baseVersionId?: string; compareVersionId?: string }>({});

  const baseOptions = computed(() => {
    return props.options?.filter((item) => item.id !== form.value.compareVersionId) || [];
  });

  const compareOptions = computed(() => {
    return props.options?.filter((item) => item.id !== form.value.baseVersionId) || [];
  });

  onMounted(() => {
    form.value = {
      baseVersionId: props.data?.baseVersion.id,
      compareVersionId: props.data?.compareVersion.id,
    };
  });

  useModal(async () => {
    await formRef.value?.validate();
    return {
      ok: true,
      data: {
        baseVersion: props.options.find((item) => item.id === form.value.baseVersionId),
        compareVersion: props.options.find((item) => item.id === form.value.compareVersionId),
      },
    };
  });
</script>
<style lang="less" scoped></style>
