<template>
  <a-select
    class="custom-select-no-arrow"
    v-model:value="currentValue"
    :placeholder="$t('sys.onlineForm.pleaseSelectBuiltInParameter')"
    :bordered="false"
    :showSearch="false"
    :showArrow="false"
    :allowClear="false"
    :open="false"
    :fieldNames="{ label: 'paramName', value: 'paramKey' }"
    :options="dataSource"
    @click.stop="openModal()"
  />
</template>

<script setup lang="ts" name="add-builtin-param-select">
  import { computed, h, ref, toRaw, watch } from 'vue';
  import { GctDialog } from '/@/utils/Dialog';
  import AddBuiltinParamModal from './add-builtin-param-modal.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const props = withDefaults(
    defineProps<{
      value: string | undefined;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'change', value?: string, index?: number): void;
  }>();

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  const dataSource = computed(() => {
    const { appInfo } = useAppInfoStore();

    return (
      appInfo?.onlineFormBuiltinParamList?.map((item) => {
        return {
          key: item.key,
          paramName: item.name,
          paramKey: item.key,
          fieldType: item.type,
        };
      }) ?? []
    );
  });

  const openModal = async () => {
    GctDialog.open(AddBuiltinParamModal, {
      paramSelected: currentValue.value,
      dataSource: dataSource.value,
      callback: (result) => {
        console.log('result', result);
        const { paramSelected } = result ?? {};

        currentValue.value = paramSelected?.[0];
        emit('change', paramSelected?.[0], 0);
      },
    });
  };
</script>
