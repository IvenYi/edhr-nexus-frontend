<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.pageDesigner.addRule')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-button
      type="link"
      @click="addRule"
      style="margin-bottom: 10px; padding-left: 60px; margin-top: 4px"
    >
      <i class="iconfont icon-chuangjian mr8px" style="vertical-align: -1px"></i>
      {{ t('sys.pageDesigner.fillRules') }}
    </a-button>
    <div class="pl-70px pr-60px">
      <a-row :gutter="4" style="margin-bottom: 4px; color: #c3c3c3; padding: 0 10px">
        <a-col :span="9">{{ t('sys.pageDesigner.valueSource') }}</a-col>
        <a-col :span="4" />
        <a-col :span="11">{{
          `${t('sys.pageDesigner.targetField')}（${t('sys.pageDesigner.onlineFormFieldInForm')}）`
        }}</a-col>
      </a-row>
      <a-form
        ref="autofillForm"
        :model="formState"
        :wrapper-col="{ span: 24 }"
        autocomplete="off"
        hide-required-mark
        :colon="false"
      >
        <draggable
          :list="formState.rules"
          handle=".cursor-move"
          drag-class="drawing-drag"
          item-key="id"
        >
          <template #item="{ element, index }">
            <a-row :gutter="4" :key="index" class="rule-item">
              <a-col :span="9">
                <!-- 填充字段 -->
                <a-form-item
                  label=""
                  :name="['rules', index, 'fromField']"
                  :rules="[
                    {
                      required: true,
                      message: t('sys.chooseTextTip', {
                        name: t('sys.field'),
                      }),
                    },
                  ]"
                >
                  <a-select
                    v-model:value="element.fromField"
                    :placeholder="$t('sys.chooseText') + $t('sys.field')"
                    :filter-option="filterOption"
                    showSearch
                    :options="
                      bindFiledList.map((i) => ({ ...i, label: selrender(i), value: i.key }))
                    "
                    option-label-prop="label"
                    @change="() => (element.toField = null)"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4"
                ><span class="form-table-label">{{
                  $t('sys.pageDesigner.valueFillTip')
                }}</span></a-col
              >
              <a-col :span="10">
                <!-- 被填充字段 -->
                <a-form-item
                  label=""
                  :name="['rules', index, 'toField']"
                  :rules="[
                    {
                      required: true,
                      message: t('sys.chooseTextTip', {
                        name: t('sys.field'),
                      }),
                    },
                  ]"
                >
                  <a-select
                    v-model:value="element.toField"
                    :placeholder="$t('sys.chooseText') + $t('sys.field')"
                    :filter-option="filterOption"
                    showSearch
                    :options="getFieldMappingType(element.fromField)"
                    option-label-prop="label"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="1" class="rule-flex-col">
                <i
                  v-show="formState.rules.length > 1"
                  class="iconfont icon-shanchu2 text-[#797A7D] error-gct-hover cursor-pointer"
                  @click="removeRule(index)"
                ></i>
              </a-col>
            </a-row>
          </template>
        </draggable>
      </a-form>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, toRaw, h } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { cloneDeep } from 'lodash-es';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import draggable from 'vuedraggable';
  import { transformMappingField4Auto } from '/@page-designer/schema/field/form/utils';
  import { FieldIconMap } from '@gct/runtime';

  const { t } = useI18n();

  const props = defineProps<{
    refModelKey: string;
    modelKey: string;
  }>();

  const emit = defineEmits(['ok', 'register']);

  const autofillForm = ref();

  const formState = reactive<Rules>({
    rules: [
      {
        fromField: undefined,
        toField: undefined,
      },
    ],
  });
  const bindFiledList = ref<FieldMetaDTO[]>([]);
  const allFieldInFormWithout = ref<FieldMetaDTO[]>([]);

  const excludeFieldType = [
    FIELD_TYPE.IMAGE,
    FIELD_TYPE.ATTACHMENT,
    FIELD_TYPE.SERIAL,
    FIELD_TYPE.MASTERSLAVE,
    FIELD_TYPE.ENUM,
    FIELD_TYPE.ENUM_MULTI,
    FIELD_TYPE.REF,
    FIELD_TYPE.REF_MULTI,
    FIELD_TYPE.RDO_REF,
    FIELD_TYPE.EXPRESSION,
    FIELD_TYPE.EXPRESSION_CONDITION,
    FIELD_TYPE.AGG,
    FIELD_TYPE.ESOP,
    FIELD_TYPE.TRANSACTION,
    FIELD_TYPE.LABEL_TEMPLATE,
    FIELD_TYPE.LABEL_TEMPLATE_REF,
    FIELD_TYPE.DOCUMENT_TEMPLATE,
    FIELD_TYPE.SERIALRULE,
    FIELD_TYPE.PRINTER,
    FIELD_TYPE.MESSAGE_TMPL,
    FIELD_TYPE.RANGE_USER,
    FIELD_TYPE.SIGNATURE,
    FIELD_TYPE.ONLINE_FORM_TEMPLATE,
    FIELD_TYPE.E_DHR_TEMPLATE,
    FIELD_TYPE.DATA_TABLE_FORMULA,
    FIELD_TYPE.READONLYCMP,
    FIELD_TYPE.BOOLEAN,
  ];

  //弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    if (visible) {
      allFieldInFormWithout.value =
        (
          await getFieldMetaList({
            modelKey: props.modelKey,
          })
        )?.filter((d) => d.createType !== 'SYSTEM') || [];
    }
  };

  const getFieldMappingType = (fromField) => {
    const record: any = bindFiledList.value.find((i) => i.key === fromField);
    const fieldConfig = transformMappingField4Auto(record?.type);
    let list = allFieldInFormWithout.value.filter((v) => fieldConfig?.filterArr?.includes(v.type));
    if (fieldConfig?.equal !== undefined && fieldConfig?.equal) {
      list = list.filter((i) => i.bindInfo === record?.bindInfo);
    }

    if ([FIELD_TYPE.TEXT, FIELD_TYPE.LONG_TEXT].includes(record?.type)) {
      list = list.filter((i) => !['ref_model_key_', 'ref_field_key_'].includes(i.key!));
    }

    return list.map((i) => ({ ...i, label: selrender(i), value: i.key }));
  };

  const [registerInner, { closeModal }] = useModalInner(async (data: { rules: Rules['rules'] }) => {
    data && onDataReceive({ rules: data.rules });
  });
  const onDataReceive = async ({ rules }: { rules: Rules['rules'] }) => {
    formState.rules = cloneDeep(rules);
    if (formState.rules?.length == 0) {
      formState.rules.push({
        fromField: undefined,
        toField: undefined,
      });
    }

    bindFiledList.value =
      (
        await getFieldMetaList({
          modelKey: props.refModelKey,
        })
      )
        ?.filter((d) => d.createType !== 'SYSTEM')
        ?.filter((i) => !excludeFieldType.includes(i.type!)) || [];
  };
  const removeRule = (index) => {
    formState.rules.splice(index, 1);
  };
  const addRule = () => {
    formState.rules.push({
      fromField: undefined,
      toField: undefined,
    });
  };
  const handleClose = () => {
    formState.rules = [
      {
        fromField: undefined,
        toField: undefined,
      },
    ];
    // autofillForm.value?.resetFields();
    closeModal();
  };
  const handleOk = async () => {
    try {
      if (
        formState.rules.length > 1 ||
        formState.rules[0].fromField ||
        formState.rules[0].toField
      ) {
        await autofillForm.value!.validate();
        emit('ok', { ...toRaw(formState) });
      }

      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  const filterOption = (input: string, option: any) => {
    return option.name.includes(input?.trim());
  };

  const selrender = (item) => {
    return () =>
      h('span', { class: 'atuofill-field-icon' }, [
        h('i', { class: ['iconfont', FieldIconMap[item.type] || 'text'] }),
        item.name,
      ]);
  };
</script>

<script lang="ts">
  interface Rules {
    rules: {
      fromField?: string;
      toField?: string;
    }[];
  }
</script>

<style lang="scss" scoped>
  .rule-item {
    background: #f2f4f7;
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
  }
  .rule-flex-col {
    display: inline-flex;
    justify-content: center;

    .iconfont {
      position: relative;
      top: 3px;
    }
  }
  .form-table-label {
    display: inline-block;
    width: 100%;
    text-align: center;
    line-height: 32px;
  }

  :deep(.ant-select-selection-item .atuofill-field-icon) {
    .iconfont {
      color: var(--ant-primary-color);
      font-size: 14px !important;
      margin-right: 4px;
    }
  }
  :deep(.ant-select-single.ant-select-open .ant-select-selection-item .atuofill-field-icon) {
    .iconfont {
      color: unquote('rgba(from var(--ant-primary-color) rgb / 30%)');
    }
  }
</style>
<style lang="scss">
  .ant-select-dropdown .ant-select-item-option-content .atuofill-field-icon {
    .iconfont {
      color: var(--ant-primary-color);
      font-size: 14px !important;
      margin-right: 4px;
    }
  }
</style>
