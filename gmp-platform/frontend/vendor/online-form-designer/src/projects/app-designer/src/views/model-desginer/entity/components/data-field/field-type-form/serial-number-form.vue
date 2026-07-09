<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
    v-show="false"
  />
  <a-form-item :label="`${t('sys.model.referenceValue')}`">
    <a-checkbox v-model:checked="referenceValue">
      {{ t('sys.model.referencingDataFromOtherModels') }}
    </a-checkbox>
  </a-form-item>
  <a-form-item v-if="referenceValue === true" :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
    <DataLinkageConfig
      mode="component"
      :context="{ bindModelKey: formData.modelKey, fieldModelKey: '' }"
      v-model:items="linkageItems"
      v-model:end-data="endData"
      :max="3"
      :contentTitle="t('sys.pageDesigner.createReferenceDiagram')"
      :deleteMessage="t('sys.pageDesigner.deleteReferenceRelationship')"
    />
  </a-form-item>
  <a-form-item
    v-if="referenceValue !== true"
    :label="t('sys.model.ruleConfiguration')"
    name="ruleConfig"
    :rules="[
      {
        required: true,
        validator: serialValidator,
        trigger: ['change'],
        message: '',
      },
    ]"
  >
    <div class="serial">
      <serial-number-container
        :serialConfigValue="{ modelKey: formData.modelKey, ruleConfig: ruleConfigArr }"
        :field="formData.key"
        :isFeild="false"
        :serialValiIds="serialValiIds"
        @update:value="handleUpdate"
      />
    </div>
  </a-form-item>
</template>

<script lang="ts" setup name="serial_number">
  import { WritableComputedRef, computed, reactive, unref, watch, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SerialListType, TypeEnum } from '../../../constant/serial';
  import { FieldFormState } from '../../../types/entity';
  import { UniqueConstraintType } from '@/enums/appEnum';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { buildShortUUID } from '/@/utils/uuid';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import { DataLinkageConfig } from '@/projects/page-designer/src/views/data-linkage-config/data-linkage-config';
  import SerialNumberContainer from './serial-number-container.vue';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const serialValiIds = ref<any[]>();

  const serialValidator = () => {
    serialValiIds.value = ruleConfigArr.value?.map((i) => i.id) || [];
    for (let i = 0; i < ruleConfigArr.value.length; i++) {
      if (ruleConfigArr.value[i].type === TypeEnum.INCREASE) {
        const { padding, step } = ruleConfigArr.value[i].config;
        if (!(padding && step)) {
          return Promise.reject(
            t('sys.pageDesigner.increaseValiText', { sth: t('sys.model.ruleConfiguration') }),
          );
        }
      } else if (ruleConfigArr.value[i].type === TypeEnum.FIXED) {
        if (!ruleConfigArr.value[i].config.value) {
          return Promise.reject(
            t('sys.pageDesigner.fixedValiText', { sth: t('sys.model.ruleConfiguration') }),
          );
        }
      } else if (ruleConfigArr.value[i].type === TypeEnum.PLACEHOLDER) {
        if (!ruleConfigArr.value[i].config.modelKey) {
          return Promise.reject(
            t('sys.pageDesigner.placeholderValiText', { sth: t('sys.model.ruleConfiguration') }),
          );
        }
      } else if (ruleConfigArr.value[i].type === TypeEnum.DATE) {
        if (
          ruleConfigArr.value[i].config.patternType === 'CUSTOM' &&
          !ruleConfigArr.value[i].config.pattern
        ) {
          return Promise.reject(
            t('sys.pageDesigner.dateCustomValiText', { sth: t('sys.model.ruleConfiguration') }),
          );
        }
      }
    }
    return Promise.resolve();
  };

  const emit = defineEmits(['update:formState', 'register']);

  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} as any },
    boolSupportTree: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState as any);

  const initData = () => {
    const data = {
      required: 1,
      uniqueConstraint: {
        type: UniqueConstraintType.GLOBAL,
        fieldKeys: undefined,
      },
      specificConfig: {
        ruleConfig: [
          {
            id: buildShortUUID(),
            type: TypeEnum.INCREASE,
            config: {
              minLength: 4,
              from: 1,
              padding: '0',
              step: 1,
            },
          },
        ],
      },
    };
    return data;
  };

  // 引用值判断
  const referenceValue = computed({
    get() {
      return formData.specificConfig.ruleType === 'REF';
    },
    set(val: any) {
      if (val === true) {
        formData.specificConfig.ruleType = 'REF';
        formData.specificConfig.ruleConfig = {
          nodes: [],
          designJson: {
            configs: [
              {
                id: null,
                label: null,
                modelCategory: '',
                modelKey: formData.modelKey,
                refModelCategory: '',
                refModelKey: formData.modelKey,
                value: null,
              },
            ],
          },
          fieldKey: '',
        };
      } else {
        formData.specificConfig.ruleType = '';
        formData.specificConfig.ruleConfig = [
          {
            id: buildShortUUID(),
            type: TypeEnum.INCREASE,
            config: {
              minLength: 4,
              from: 1,
              padding: '0',
              step: 1,
            },
          },
        ];
      }
    },
  });

  const linkageItems = computed<any>({
    get() {
      return formData.specificConfig.ruleConfig!.designJson?.configs;
    },
    set(val: any) {
      Object.assign(formData.specificConfig.ruleConfig!.designJson!, { configs: val });
      if (formData.specificConfig.ruleConfig!.designJson) {
        const { configs } = formData.specificConfig.ruleConfig!.designJson;
        formData.specificConfig.ruleConfig!.nodes = [];
        if (configs) {
          configs.forEach((item, i) => {
            if (i === 0) {
              return;
            }
            if (item.reverse) {
              formData.specificConfig.ruleConfig!.nodes.push({
                modelKey: item.refModelKey,
              });
              formData.specificConfig.ruleConfig!.nodes.push({
                modelKey: item.modelKey,
                fieldKey: item.value,
                direction: 'backward',
              });
            } else {
              formData.specificConfig.ruleConfig!.nodes.push({
                modelKey: item.modelKey,
                fieldKey: item.value,
                direction: 'forward',
              });
            }
          });
        }
      }
    },
  });

  const endData = computed<any>({
    get() {
      return formData.specificConfig.ruleConfig!.designJson?.endData;
    },
    set(val: any) {
      Object.assign(formData.specificConfig.ruleConfig!.designJson, { endData: val });
      if (formData.specificConfig.ruleConfig!.designJson) {
        const { endData } = formData.specificConfig.ruleConfig!.designJson;
        if (endData) {
          formData.specificConfig.ruleConfig!.fieldKey = endData.value;
        } else {
          formData.specificConfig.ruleConfig!.fieldKey = '';
        }
      }
    },
  });

  const ruleConfigArr: WritableComputedRef<Array<SerialListType>> = computed({
    get() {
      return formData.specificConfig?.ruleConfig ?? [];
    },
    set(arr) {
      formData.specificConfig.ruleConfig = [...arr];
    },
  });

  watch(
    () => formData,
    (val) => {
      emit('update:formState', reactive(val));
    },
    { deep: true },
  );

  const serialModalOk = (config) => {
    if (
      !config.isEdit &&
      config.type === 'increase' &&
      unref(ruleConfigArr).findIndex((rule) => rule.type === 'increase') > -1
    ) {
      createMessage.warning(t('sys.appDesigner.increaseRepeat'));
      return;
    }
    if (config.isEdit) {
      ruleConfigArr.value = unref(ruleConfigArr).map((rule) => {
        if (rule.id == config.id) {
          return { ...config };
        }
        return rule;
      });
    } else {
      ruleConfigArr.value = [...unref(ruleConfigArr), config];
    }
  };

  const handleUpdate = (val) => {
    const { ruleConfig } = val;
    ruleConfigArr.value = [...ruleConfig];
  };

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped>
  .serial {
    .actions {
      margin-right: 10px;
    }
    .container {
      min-height: 120px;
      margin-top: 8px;
      border: 1px solid #fafafa;
      border-radius: 2px;
      .title {
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        padding-left: 14px;
        background-color: #fafafa;
      }
    }
  }
</style>
