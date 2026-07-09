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
    <div class="flex">
      <a-form-item-rest>
        <a-select
          v-if="isInOnlineForm"
          :disabled="isEdit"
          v-model:value="modelType"
          style="width: 120px; margin-right: 4px"
          @change="handlerChangeModelType"
        >
          <a-select-option value="sys">系统</a-select-option>
          <a-select-option value="onlineForm">在线表单</a-select-option>
        </a-select>
      </a-form-item-rest>
      <a-select
        v-model:value="formData.bindInfo"
        :disabled="isEdit"
        :placeholder="t('sys.chooseText')"
        :showSearch="true"
        v-if="modelType === 'sys'"
        optionFilterProp="fieldName"
      >
        <a-select-opt-group v-for="(group, index) in modelList" :key="index">
          <template #label>
            <span>
              {{ group.name }}
            </span>
          </template>
          <a-select-option
            v-for="model in group.children"
            :key="model.key"
            :value="model.key"
            :fieldName="model.name"
            >{{ model.name }}</a-select-option
          >
        </a-select-opt-group>
      </a-select>
      <a-select
        v-model:value="formData.bindInfo"
        :disabled="isEdit"
        :placeholder="t('sys.chooseText')"
        :showSearch="true"
        v-else
        optionFilterProp="fieldName"
      >
        <a-select-option
          v-for="model in modelList"
          :key="model.id"
          :value="model.id"
          :fieldName="model.name"
          >{{ model.name }}</a-select-option
        >
      </a-select>
    </div>
    <div v-show="formData.bindInfo" style="margin-top: 8px">
      <span v-show="displayField" class="mr10px"
        >{{ t('sys.displayField') }}：{{ displayField }}</span
      >
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
  <a-form-item
    v-if="FIELD_TYPE.REF_MULTI === formData.type"
    :name="['specificConfig', 'codeVisibleNum']"
    :label="t('sys.model.codeDisplayNumber')"
  >
    <a-input-number
      v-model:value="formData.specificConfig.codeVisibleNum"
      :min="8"
      :max="20"
      :precision="0"
      placeholder="8"
      @blur="
        () => {
          if (!formData.specificConfig.codeVisibleNum) formData.specificConfig.codeVisibleNum = 8;
        }
      "
      style="width: 50% !important"
    />
    <div class="mt-2 text-sm text-zinc-400">
      {{ t('sys.model.codeDisplayNumberTip') }}
    </div>
  </a-form-item>
  <!-- <field-display-rule :source="formData.bindInfo" v-model:value="formData.displayRule" /> -->
  <FieldDisplayRuleModal :fieldType="formData.type" @register="register" @ok="handleOk" />
</template>

<script setup lang="ts" name="ref">
  import { PropType, reactive, ref, watch, computed, inject, onMounted } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { CategoryCompleteResponse, ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import FieldDisplayRule from '../components/field-display-rule.vue';
  import { getCategoryGetListRdoOrNdo } from '/@/apis/gct-apaas/CategoryController';
  import { getModelMetaList } from '/@/apis/gct-apaas/ModelMetaController';
  import FieldDisplayRuleModal from '../../../components/field-display-rule-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { getFormRelatePageListAllModelKey } from '/@/apis/gct-apaas/FormRelateController';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const { t } = useI18n();
  const isInOnlineForm = inject<boolean>('isInOnlineForm', false);

  const emit = defineEmits(['update:formState']);
  const { formState, isEdit } = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
  });

  const getCodeVisibleNum = () => {
    if (formState.specificConfig?.codeVisibleNum) {
      return formState.specificConfig?.codeVisibleNum;
    }
    if (formState?.id) {
      return 8;
    } else {
      return 12;
    }
  };

  const formData = reactive<FieldFormState>(
    Object.assign(formState, {
      specificConfig: {
        ...formState.specificConfig,
        codeVisibleNum: getCodeVisibleNum(),
      },
    }),
  );
  console.log('formState', formState);
  const modelType = ref('');

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  const modelList = ref<CategoryCompleteResponse[]>([]);

  watch(
    modelType,
    (val) => {
      if (val === 'sys') {
        //获取实体类型
        getCategoryGetListRdoOrNdo({ type: 'NDO,BASE,TREE,TXN_EXT' }).then((res) => {
          modelList.value = res?.filter((e) => e.children?.length) || [];
        });
      } else if (val === 'onlineForm') {
        getFormRelatePageListAllModelKey({
          pageNo: 1,
          pageSize: -1,
        }).then((res) => {
          modelList.value = res?.data || [];
        });
      }
    },
    {
      immediate: true,
    },
  );

  const models = ref<ModelMetaResponse[]>([]);
  //获取实体类型
  getModelMetaList({}).then((res) => {
    models.value = res || [];
  });
  watch(
    () => formData.bindInfo,
    async (modelKey) => {
      if (modelType.value === 'sys') {
        const model = models.value.find((d) => d.key == modelKey);
        formData.refModelType = model?.type;
      } else {
        formData.refModelType = 'BASE';
      }
      formData.specificConfig.displayRule = {};
    },
  );

  const displayField = computed(() => {
    const tempArr = ref<any[]>([]);
    if (modelType.value === 'sys') {
      modelList.value.forEach((e) => {
        tempArr.value = [...tempArr.value, ...(e.children || [])];
      });
    } else {
      tempArr.value = [...modelList.value];
    }
    return formData.bindInfo && modelList.value.length
      ? tempArr.value.filter((e) => e.key === formData.bindInfo)[0]?.displayFieldName
      : '';
  });

  const handlerChangeModelType = () => {
    formData.bindInfo = '';
  };

  // const handleModelSelect = (val, option) => {
  //   displayField.value = option.fieldName;
  // };

  const [register, { openModal: openRuleModal }] = useModal();

  const onConfigRule = () => {
    openRuleModal(true, {
      bindInfo: formData.bindInfo,
      displayRule: formData.specificConfig.displayRule,
    });
  };
  const handleOk = (data) => {
    formData.specificConfig.displayRule = data.displayRule;
  };

  onMounted(() => {
    modelType.value = isInOnlineForm ? 'onlineForm' : 'sys';
    if (formState.id) {
      if (formState.refModelSource === 'USER_DEFINED') {
        modelType.value = 'onlineForm';
      } else {
        modelType.value = 'sys';
      }
    }
  });
</script>

<style lang="less" scoped>
  .config-icon {
    position: relative;
    top: 1px;
    line-height: 1;
  }
</style>
