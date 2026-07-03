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

  <a-form-item :label="t('模型变量')" name="modelRefer">
    <a-select v-model:value="formState.modelRefer">
      <a-select-option v-for="item in soDataObject.variables" :key="item.name" :value="item.name">
        {{ item.name }}
      </a-select-option>
    </a-select>
  </a-form-item>

  <a-form-item :label="t('输出内容')" name="modelSubmitReturn">
    <a-select v-model:value="formState.modelSubmitReturn">
      <a-select-option
        v-for="item in ModelSubmitReturnOptions"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </a-select-option>
    </a-select>
  </a-form-item>

  <a-form-item
    v-show="formState.modelSubmitReturn !== ModelSubmitReturnEnum.NONE"
    :label="t('输出到变量')"
    name="returnToIdentifier"
  >
    <a-select v-model:value="formState.returnToIdentifier">
      <a-select-option v-for="item in soDataObject.variables" :key="item.name" :value="item.name">
        {{ item.name }}
      </a-select-option>
    </a-select>
  </a-form-item>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModelSubmitReturnOptions } from '../../../constants';
  import { ModelSubmitReturnEnum } from '../../../types';
  import { useSOInstance } from '../../../hooks/useSOInstance';
  import { useModelFields } from '../../../hooks/useModelFields';

  // import ParameterStructModal from '../modals/parameter-struct-modal.vue';
  const { soDataObject } = useSOInstance();
  const { categoryModels } = useModelFields();

  const { t } = useI18n();
  // const [register, { openModal }] = useModal();

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
