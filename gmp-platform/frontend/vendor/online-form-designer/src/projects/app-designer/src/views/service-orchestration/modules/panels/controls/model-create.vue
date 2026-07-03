<template>
  <a-form-item :label="t('模型')" name="model">
    <a-select v-model:value="formState.model">
      <a-select-opt-group v-for="mc in categoryModels" :key="mc.id" :label="mc.name">
        <a-select-option v-for="m in mc.children" :value="m.key" :key="m.key">{{
          m.name
        }}</a-select-option>
      </a-select-opt-group>
    </a-select>
  </a-form-item>

  <a-form-item :label="t('模型赋值')" name="modelAssignment">
    <a-button :disabled="!formState.model" type="primary" block @click="handleModelAssign"
      >点击赋值</a-button
    >
  </a-form-item>

  <a-form-item :label="t('输出变量')" name="returnToIdentifier">
    <a-select v-model:value="formState.returnToIdentifier">
      <!-- <a-select-option /> -->
      <a-select-option v-for="item in soDataObject.variables" :key="item.name" :value="item.name">
        {{ item.name }}
      </a-select-option>
    </a-select>
  </a-form-item>

  <model-assign-modal @register="register" />
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';

  import { useSOInstance } from '../../../hooks/useSOInstance';
  import { useModelFields } from '../../../hooks/useModelFields';

  import ModelAssignModal from '../../modals/model-assign-modal.vue';

  // import { useModal } from '/@/components/Modal';
  // import { ModelSubmitReturnOptions } from '../../constants';
  // import ParameterStructModal from '../modals/parameter-struct-modal.vue';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const { soDataObject } = useSOInstance();
  const { categoryModels } = useModelFields();

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

  const handleModelAssign = () => {
    openModal(true, {
      data: props.formState.modelAssignment,
      model: props.formState.model,
      callback: (data) => {
        console.log(data);
        Object.assign(props.formState, {
          modelAssignment: data,
        });
      },
    });
  };
</script>

<style lang="less" scoped></style>
