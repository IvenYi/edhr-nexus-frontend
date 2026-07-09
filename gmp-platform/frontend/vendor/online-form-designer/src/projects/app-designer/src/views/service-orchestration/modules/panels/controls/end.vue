<template>
  <a-form-item :label="t('输出参数')" name="return">
    <a-radio-group v-model:value="formState.return" name="return">
      <a-radio :value="false">无参数</a-radio>
      <a-radio :value="true">参数</a-radio>
    </a-radio-group>
  </a-form-item>

  <a-form-item v-show="formState.return" :label="t('输出变量')" name="returnIdentifier">
    <a-select v-model:value="formState.returnIdentifier">
      <a-select-option v-for="item in soDataObject.variables" :key="item.name" :value="item.name">
        {{ item.name }}
      </a-select-option>
    </a-select>
  </a-form-item>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useModal } from '/@/components/Modal';
  import { useSOInstance } from '../../../hooks/useSOInstance';
  // import ParameterStructModal from '../modals/parameter-struct-modal.vue';

  const { t } = useI18n();
  // const [register, { openModal }] = useModal();

  const { soDataObject } = useSOInstance();

  const props = defineProps({
    formState: {
      type: Object,
      default: () => ({}),
    },
  });

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      Object.assign(props.formState, value);
    },
  });
</script>

<style lang="less" scoped></style>
