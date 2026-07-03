<template>
  <a-form-item
    :label="t('sys.model.refModel')"
    name="bindInfo"
    :rules="[
      {
        required: true,
      },
    ]"
  >
    <a-select
      v-model:value="formData.bindInfo"
      :disabled="isEdit"
      :placeholder="t('sys.chooseText')"
      :showSearch="true"
      optionFilterProp="fieldName"
    >
      <a-select-opt-group v-for="(group, index) in modelList" :key="index">
        <template #label>
          <span>
            {{ group.name }}
          </span>
        </template>
        <a-select-option
          :disabled="model.key === formState.modelKey"
          v-for="model in group.children"
          :key="model.key"
          :value="model.key"
          :fieldName="model.name"
          >{{ model.name }}</a-select-option
        >
      </a-select-opt-group>
    </a-select>
    <div v-show="formData.bindInfo" style="margin-top: 8px">
      <span class="mr10px">{{ t('sys.displayField') }}：版本名称</span>
      <span class="primary-gct" style="cursor: pointer" @click="onConfigRule">
        <span class="iconfont icon-shezhi primary-gct config-icon"></span>
        {{
          formData.specificConfig?.displayRule?.exp
            ? t('sys.model.editDisplayRule')
            : t('sys.model.configDisplayRule')
        }}
      </span>
    </div>
  </a-form-item>
  <FieldDisplayRuleModal :fieldType="formData.type" @register="register" @ok="handleOk" />
</template>

<script setup lang="ts" name="rdo_ref">
  import { computed, PropType, reactive, ref, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import type { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import FieldDisplayRuleModal from '../../../components/field-display-rule-modal.vue';
  import { getCategoryGetListRdoOrNdo } from '/@/apis/gct-apaas/CategoryController';

  const { t } = useI18n();
  const [register, { openModal: openRuleModal }] = useModal();

  const emit = defineEmits(['update:formState']);
  const { formState, isEdit } = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
  });
  const formData = reactive<FieldFormState>(formState);
  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  const modelList = ref<CategoryCompleteResponse[]>([]);
  //获取实体类型
  getCategoryGetListRdoOrNdo({ type: 'RDO,WORKFLOW' }).then((res) => {
    modelList.value = res?.filter((e) => e.children?.length) || [];
  });

  const displayField = computed(() => {
    const tempArr = ref<any[]>([]);

    modelList.value.forEach((e) => {
      tempArr.value = [...tempArr.value, ...(e.children || [])];
    });

    return formData.bindInfo && modelList.value.length
      ? tempArr.value.filter((e) => e.key === formData.bindInfo)[0]?.displayFieldName
      : '';
  });
  const onConfigRule = () => {
    openRuleModal(true, {
      bindInfo: formData.bindInfo,
      displayRule: formData.specificConfig.displayRule,
    });
  };
  const handleOk = (data) => {
    formData.specificConfig.displayRule = data.displayRule;
  };
</script>

<style lang="less" scoped></style>
