<template>
  <ModalWrapper :opts="modalOptions" :class="['parse-rule-modal']" :do-ok="doOk">
    <div :class="['parse-rule-modal__content']">
      <a-form-item
        class="parse-rule-modal__rule w-425px"
        :label="$t('sys.edhr.mcTable.parseRule') + '：'"
        name="parsingRuleId"
      >
        <RdoTreeSelect
          :model-value="formState.parsingRuleId"
          @update:model-value="onRuleChange"
          modelKey="em_barcode_parsing_rules"
        />
      </a-form-item>
      <div class="parse-rule-modal__subtitle">{{ $t('sys.onlineForm.fieldMapping') }}</div>
      <div class="parse-rule-modal__map">
        <a-form ref="formRef" :model="formState" layout="vertical">
          <div class="parse-rule-modal__row" v-for="(item, i) in formState.fillMapArr" :key="i">
            <a-form-item
              class="parse-rule-modal__barcodeField"
              :name="['fillMapArr', i, 'barcodeField']"
              :inline="false"
              required
              :label="$t('sys.onlineForm.barcodeField')"
            >
              <a-select
                v-model:value="item.barcodeField"
                :placeholder="$t('sys.chooseText')"
                :options="ruleFieldOptions"
              />
            </a-form-item>
            <div class="parse-rule-modal__divider">
              <i class="gct-iconfont icon-lianjie"></i>
            </div>
            <a-form-item
              class="parse-rule-modal__formFields"
              :name="['fillMapArr', i, 'formFields']"
              :inline="false"
              required
              :label="$t('sys.onlineForm.formFields')"
            >
              <FormFieldSelect
                :subModelKey="subModelKey"
                :multiple="true"
                v-model="item.formFields"
              />
            </a-form-item>
            <div class="parse-rule-modal__actions">
              <i
                @click="removeField(i)"
                class="parse-rule-modal__remove-btn iconfont icon-shanchu1"
                :title="$t('sys.delete')"
              ></i>
            </div>
          </div>
          <a-button class="parse-rule-modal__add-btn" type="link" @click="addFieldMap">
            <i class="iconfont icon-tianjia"></i>
            {{ $t('sys.onlineForm.addFieldMapping') }}
          </a-button>
        </a-form>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="parse-rule-modal">
  import { reactive, computed, watch, onMounted, ref, toRaw } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';
  import { ParseRuleProps } from '/@online-form/views/designer/types/cell-widget';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import RdoTreeSelect from '/@web-render/views/edhr-application/components/rdo-tree-select/rdo-tree-select.vue';
  import { FormFieldSelect } from '/@online-form/components/form-field';
  import { FormModelController, getParseRuleConfig, useFormModel } from '@gct/nocode-base';
  import { cloneDeep } from 'lodash-es';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    title: $t('sys.onlineForm.barcodeParsing'),
    width: 800,
  });

  const props = defineProps<{
    modal: IModal;
    config?: ParseRuleProps;
    subModelKey?: string;
    formModelController: FormModelController;
  }>();

  useFormModel().provideController(props.formModelController);

  const formRef = ref();

  const formState = reactive<ParseRuleProps>(cloneDeep(props.config) || {});
  const ruleFieldOptions = ref<any[]>([]);

  const initRuleFieldOptions = async (id) => {
    if (!id) {
      ruleFieldOptions.value = [];
      return;
    }

    const config = await getParseRuleConfig(id);
    if (!config) {
      ruleFieldOptions.value = [];
      return;
    }

    ruleFieldOptions.value = config.fieldList.map((field) => {
      return {
        label: field.alias ?? $t(`sys.edhr.labelConfigFields.${field.type}`),
        value: field.key,
      };
    });
  };

  const onRuleChange = (rule?: string) => {
    if (rule === formState.parsingRuleId) {
      return;
    }
    formState.parsingRuleId = rule;
    formState.fillMapArr = [];
    initRuleFieldOptions(rule);
  };

  const addFieldMap = () => {
    if (!formState.fillMapArr) {
      formState.fillMapArr = [];
    }
    formState.fillMapArr.push({});
  };

  const removeField = (index) => {
    formState.fillMapArr?.splice(index, 1);
  };

  onMounted(() => {
    initRuleFieldOptions(formState.parsingRuleId);
  });

  const doOk = async () => {
    await formRef.value.validate();
    console.log($t('sys.appDesigner.ok'));
    return {
      ok: true,
      data: cloneDeep(toRaw(formState)),
    };
  };
</script>

<style lang="less" scoped>
  .parse-rule-modal {
    &__content {
      padding: 20px 35px 0;
      min-height: 310px;
      max-height: 600px;
      overflow: auto;
    }

    &__rule {
      width: 355px;
      margin-bottom: 18px;
    }

    &__subtitle {
      font-weight: 500;
      font-size: 16px;
      margin-bottom: 14px;
    }

    &__map {
      background: #f9fafb;
      border-radius: 4px 4px 4px 4px;
      border: 1px dashed #e0e3eb;
      padding: 12px;
      font-size: 12px;
      margin-bottom: 14px;
      :deep(.ant-form-item) {
        margin-bottom: 0;
      }
    }

    &__row {
      display: flex;
      margin-bottom: 4px;
    }

    &__barcodeField,
    &__formFields {
      flex: 1 1 0%;
      width: 1px;
    }

    &__divider {
      width: 32px;
      text-align: center;
      color: #c6c6c6;
      padding-top: 37px;
      > .iconfont {
        font-size: 16px;
      }
    }

    &__actions {
      width: 39px;
      .parse-rule-modal__remove-btn {
        cursor: pointer;
        font-size: 12px;
        color: #a6a6a6;
        display: inline-block;
        padding-top: 37px;
        margin-left: 18px;
        display: inline-block;
      }
    }

    &__add-btn {
      font-size: 12px;
      padding: 0;
      height: 30px;
      .iconfont {
        font-size: 8px;
        vertical-align: middle;
        margin-bottom: 3px;
        margin-right: 8px;
        display: inline-block;
      }
    }
  }
</style>
