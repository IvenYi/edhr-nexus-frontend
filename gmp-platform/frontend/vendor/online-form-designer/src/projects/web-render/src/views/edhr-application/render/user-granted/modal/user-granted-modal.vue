<template>
  <a-form
    :class="ns.b()"
    ref="formRef"
    :model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-form-item required :label="label" name="user">
      <GrantUserSelect
        :multiple="props.action === UserGrantedAction.Add"
        v-model:value="formData.user"
        :is-granted="props.action === UserGrantedAction.Add ? false : undefined"
      />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { computed, reactive, ref, toRaw } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge, pickBy } from 'lodash-es';
  import GrantUserSelect from '../components/grant-user-select.vue';
  import { UserGrantedAction } from '../logic/constants';

  const { t } = useI18n();

  const ns = useNamespace('user-granted-modal');

  const props = withDefaults(
    defineProps<{
      data?: IData;
      shouldClose?: (data) => Promise<boolean>;
      action: UserGrantedAction;
    }>(),
    {
      data: () => ({}),
      disabledFields: () => [],
    },
  );

  const formData = reactive(
    merge(
      {
        user: '',
      },
      props.data || {},
    ),
  );

  const label = computed(() => {
    return props.action === UserGrantedAction.Add ? t('sys.user') : t('sys.edhr.assignee');
  });

  const formRef = ref<FormInstance>();

  useModal(async () => {
    await formRef.value!.validate();
    const editedData = pickBy(toRaw(formData), (v) => v !== undefined);
    let isClose = true;
    if (props.shouldClose) {
      isClose = await props.shouldClose(editedData);
    }
    return {
      ok: isClose,
      data: [editedData],
    };
  });
</script>

<style lang="scss" scoped>
  @include b(user-granted-modal) {
    padding-top: 12px;
  }
</style>
