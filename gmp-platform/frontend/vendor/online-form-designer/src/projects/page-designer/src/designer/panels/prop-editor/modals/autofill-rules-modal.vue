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
        <a-col :span="11">{{ filedTitle }}</a-col>
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
              <!-- <a-col :span="1" class="rule-flex-col">
              <i class="iconfont icon-drag cursor-move text-[#C3C3C3]" style="font-size: 18px"></i>
            </a-col> -->
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
                  >
                    <!-- <template #option="{ label, type }">
                      <span class="field-icon">
                        <i
                          :class="['iconfont', FieldIconMap[type || 'text'] || 'icon-zidingyi']"
                        ></i>
                      </span>
                      {{ label }}
                    </template> -->
                  </a-select>
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
                  >
                    <!-- <a-select-option
                      v-for="field in getFieldMappingType(element.fromField)"
                      :key="field.id"
                      :value="field.key"
                    >
                      <span class="atuofill-field-icon">
                        <i
                          :class="[
                            'iconfont',
                            FieldIconMap[field?.type || 'text'] || 'icon-zidingyi',
                          ]"
                        ></i>
                      </span>
                      {{ field.name }}</a-select-option
                    > -->
                  </a-select>
                  <!-- <i
                    class="iconfont icon-shanchu2 text-[#797A7D] error-gct-hover cursor-pointer"
                    @click="removeRule(index)"
                  ></i> -->
                </a-form-item>
              </a-col>
              <a-col :span="1" class="rule-flex-col">
                <i
                  v-show="formState.rules.length > 1"
                  class="iconfont icon-shanchu2 text-[#797A7D] error-gct-hover cursor-pointer"
                  @click="removeRule(index)"
                ></i>
                <!-- <a-button type="link" @click="removeRule(index)">{{ t('sys.delete') }}</a-button> -->
              </a-col>
            </a-row>
          </template>
        </draggable>
        <!-- <a-row v-for="(rule, index) in formState.rules" :key="index" :gutter="[16, 16]">
        <a-col :span="10">
          <a-form-item
            label=" "
            :name="['rules', index, 'fromField']"
            :rules="[{ required: true }]"
          >
            <a-select v-model:value="rule.fromField">
              <a-select-option v-for="field in bindFiledList" :key="field.id" :value="field.key">{{
                field.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label=" " :name="['rules', index, 'toField']" :rules="[{ required: true }]">
            <a-select v-model:value="rule.toField">
              <a-select-option
                v-for="field in allFieldInFormWithout"
                :key="field.id"
                :value="field.key"
                >{{ field.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-button type="link" @click="removeRule(index)">{{ t('sys.delete') }}</a-button>
        </a-col>
      </a-row> -->
      </a-form>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, toRaw, h } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { FormComponents } from '/@page-designer/enum';
  import { cloneDeep } from 'lodash-es';
  import { buildShortUUID } from '/@/utils/uuid';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import draggable from 'vuedraggable';
  import { transformMappingField4Auto } from '/@page-designer/schema/field/form/utils';
  import { FieldIconMap } from '@gct/runtime';

  const filedTitle = ref('');
  const { selectedWidget } = useSelectedWidget();
  const { t } = useI18n();
  const autofillForm = ref();
  const emit = defineEmits(['ok', 'register']);
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
  const fieldTypes = ref<FIELD_TYPE[]>([]);

  const excludeFieldType = [
    FIELD_TYPE.EXPRESSION,
    FIELD_TYPE.AGG,
    FIELD_TYPE.LABEL_TEMPLATE,
    FIELD_TYPE.SERIAL,
    FIELD_TYPE.EXPRESSION_CONDITION,
    FIELD_TYPE.BOOLEAN,
    FIELD_TYPE.SIGNATURE,
    'online_form',
  ];

  //弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    if (visible) {
      allFieldInFormWithout.value =
        (
          await getFieldMetaList({
            modelKey: selectedWidget.value.props!.modelKey,
          })
        )?.filter((d) => d.createType !== 'SYSTEM') || [];
      if (selectedWidget.value.type === FormComponents.UploadFile) {
        fieldTypes.value = [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.USER,
          FIELD_TYPE.USER_MULTI,
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.DATE,
          FIELD_TYPE.TIME,
        ];
      } else {
        fieldTypes.value = Object.values(FIELD_TYPE);
      }
      allFieldInFormWithout.value = allFieldInFormWithout.value.filter((item) =>
        fieldTypes.value.includes(item.type!),
      );
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
    /**
     * 枚举特殊处理（自定义枚举值一致）
     */
    if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(record?.type)) {
      if (record.specificConfig?.customEnumConfig?.enabled) {
        list = list.filter((i) => {
          if (!i.specificConfig?.customEnumConfig?.enabled) {
            return false;
          }
          const arr1 = record.specificConfig?.customEnumConfig?.values;
          const arr2 = i.specificConfig?.customEnumConfig?.values;
          return compareArrays(arr1, arr2);
        });
      } else {
        list = list.filter((i) => !i.specificConfig?.customEnumConfig?.enabled);
      }
    }
    return list.map((i) => ({ ...i, label: selrender(i), value: i.key }));
  };

  function compareArrays(arr1, arr2) {
    return arr1.toString() === arr2.toString();
  }

  const [registerInner, { closeModal }] = useModalInner(
    async (data: { rules: Rules['rules']; widget: LowCodeWidget.BasicSchema }) => {
      data && onDataReceive({ rules: data.rules, widget: data.widget });
    },
  );
  const onDataReceive = async ({
    rules,
    widget,
  }: {
    rules: Rules['rules'];
    widget: LowCodeWidget.BasicSchema;
  }) => {
    filedTitle.value = `${t('sys.pageDesigner.targetField')}（${
      [
        MaterialEnum.MaterialFormField,
        MaterialEnum.MaterialSubTableField,
        MaterialEnum.MaterialSubTableModalField,
      ].includes(widget.materialType!)
        ? t('sys.pageDesigner.fieldInForm')
        : t('sys.pageDesigner.fieldInTable')
    }）`;
    formState.rules = cloneDeep(rules);
    if (formState.rules?.length == 0) {
      formState.rules.push({
        fromField: undefined,
        toField: undefined,
      });
    }
    const filedList = bindFiledListByFieldType[widget.type];
    if (filedList) {
      bindFiledList.value = filedList;
    } else {
      //为其他组件时需要查询字段
      bindFiledList.value =
        (
          await getFieldMetaList({
            modelKey: selectedWidget.value.props!.bindModelKey,
          })
        )
          ?.filter((d) => d.createType !== 'SYSTEM')
          ?.filter((i) => !excludeFieldType.includes(i.type!)) || [];
    }
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

  /**
   * 特殊组件的配置项
   */
  const bindFiledListByFieldType = {
    //为人员选择组件时 [姓名、账号、手机号、工号、生日、邮箱、主部门、直属上级]
    [FormComponents.Userpicker]: [
      { id: buildShortUUID(), key: 'fullname', name: t('sys.fullname'), type: 'text' },
      { id: buildShortUUID(), key: 'username', name: t('sys.userName'), type: 'text' },
      { id: buildShortUUID(), key: 'mobile', name: t('sys.phone'), type: 'integer' },
      { id: buildShortUUID(), key: 'empNo', name: t('sys.empNo'), type: 'text' },
      { id: buildShortUUID(), key: 'birthday', name: t('sys.birthday'), type: 'date' },
      { id: buildShortUUID(), key: 'email', name: t('sys.email'), type: 'text' },
      { id: buildShortUUID(), key: 'masterOrgId', name: t('sys.org.mainOrg'), type: 'org' },
      { id: buildShortUUID(), key: 'managerId', name: t('sys.org.manager'), type: 'user' },
    ],
    [FormComponents.Department]: [
      //为部门选择组件时 [名称、部门负责人principal]
      { id: buildShortUUID(), key: 'name', name: t('sys.name'), type: 'text' },
      {
        id: buildShortUUID(),
        key: 'principalUserId',
        name: t('sys.pageDesigner.dept') + t('sys.principal'),
        type: 'user',
      },
    ],
    [FormComponents.UploadFile]: [
      //为附件组件时 [名称]
      {
        id: buildShortUUID(),
        key: 'name',
        name: t('sys.pageDesigner.fieldCmp.attachment') + t('sys.name'),
        type: 'text',
      },
      {
        id: buildShortUUID(),
        key: 'size',
        name: t('sys.pageDesigner.fieldCmp.attachment') + t('sys.size'),
        type: 'text',
      },
      {
        id: buildShortUUID(),
        key: 'type',
        name: t('sys.pageDesigner.fieldCmp.attachment') + t('sys.format'),
        type: 'text',
      },
      { id: buildShortUUID(), key: 'uploader', name: t('sys.uploader'), type: 'user' },
      { id: buildShortUUID(), key: 'uploadTime', name: t('sys.uploadTime'), type: 'date_time' },
    ],
    [FormComponents.ESOP]: [
      {
        id: buildShortUUID(),
        key: 'name',
        name: t('sys.pageDesigner.fieldCmp.attachment') + t('sys.name'),
        type: 'text',
      },
      {
        id: buildShortUUID(),
        key: 'size',
        name: t('sys.pageDesigner.fieldCmp.attachment') + t('sys.size'),
        type: 'text',
      },
      {
        id: buildShortUUID(),
        key: 'type',
        name: t('sys.pageDesigner.fieldCmp.attachment') + t('sys.format'),
        type: 'text',
      },
      { id: buildShortUUID(), key: 'uploader', name: t('sys.uploader'), type: 'user' },
      { id: buildShortUUID(), key: 'uploadTime', name: t('sys.uploadTime'), type: 'date_time' },
    ],
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
