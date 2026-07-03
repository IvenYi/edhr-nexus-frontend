<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="(isEdit ? t('sys.edit') : t('sys.new')) + t('sys.constraint')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      class="gct-constraint-form"
      ref="formRef"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.pageDesigner.constraintType')"
        name="type"
        class="constraint-type"
      >
        <a-radio-group v-model:value="formState.type" @change="handleChangeType">
          <a-radio value="GLOBAL_UNIQUE" v-if="!isRodOrWorkflow">
            {{ t('sys.uniqueConstraint') }}
          </a-radio>
          <a-radio value="NOT_NULL">{{ t('sys.notNullConstraint') }}</a-radio>
        </a-radio-group>
        <div class="constraint-type-description">
          {{
            formState.type === 'GLOBAL_UNIQUE'
              ? '约束列（一个字段或者一组字段）的数据与其它行的数据相比是唯一的不能重复，但是允许为空值'
              : '约束列包含的字段的值不允许同时为空'
          }}
        </div>
      </a-form-item>
      <a-form-item
        v-if="showConstraintRange"
        :label="t('sys.pageDesigner.constraintRange')"
        name="type"
        class="constraint-type"
      >
        <a-radio-group v-model:value="formState.treeType" @change="handleChangeType">
          <a-radio value="LEVEL_UNIQUE">{{ t('sys.levelUnique') }}</a-radio>
          <a-radio value="GLOBAL_UNIQUE">{{ t('sys.globalUnique') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label="t('sys.pageDesigner.constraintFields')"
        name="fieldKeys"
        :rules="[{ required: true }]"
      >
        <a-select
          optionFilterProp="name"
          :fieldNames="{ label: 'name', value: 'key' }"
          :value="formState.fieldKeys"
          style="width: 100%"
          mode="multiple"
          :maxTagCount="5"
          :maxTagTextLength="6"
          @change="handleChangeFileKeys"
          :showArrow="true"
          :placeholder="t('sys.chooseText')"
          :options="options"
        >
          <!-- <template v-for="item in options" :key="item.id">
            <a-select-option :value="item.key">{{ item.name }}</a-select-option>
          </template> -->
        </a-select>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { putModelMetaConstantByModelKey } from '/@/apis/gct-apaas/ModelMetaController';
  import { cloneDeep, isNil } from 'lodash-es';

  const props = defineProps<{
    modelKey: string;
  }>();
  const emit = defineEmits(['refresh']);
  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });

  const formState = reactive({
    type: 'GLOBAL_UNIQUE',
    fieldKeys: [],
    treeType: 'LEVEL_UNIQUE',
  });

  const formRef = ref();
  const options = ref([]);
  const constraintData = ref([]);
  const editIndex = ref(null);
  const modelType = ref('');
  const isTree = ref(false);

  const onDeactivated = (data) => {
    getFiledMeta();
    const { rowData, model, index } = data;
    isTree.value = model?.type === EntityModelTypeEnum.TREE;
    if (rowData) {
      formState.type = rowData.type;
      formState.fieldKeys = rowData.fieldKeys;
      editIndex.value = index;
      if (isTree.value && formState.type !== 'NOT_NULL') {
        formState.type = 'GLOBAL_UNIQUE';
        formState.treeType = rowData.type;
      }
    }
    constraintData.value = model?.constraint || [];
    modelType.value = model?.type;

    if (isRodOrWorkflow.value) {
      formState.type = 'NOT_NULL';
    }
  };

  const isEdit = computed(() => {
    return !isNil(editIndex.value);
  });

  const showConstraintRange = computed(() => {
    return isTree?.value && formState.type === 'GLOBAL_UNIQUE';
  });

  const isRodOrWorkflow = computed(() => {
    return [EntityModelTypeEnum.RDO, EntityModelTypeEnum.WORKFLOW].includes(modelType.value);
  });

  const handleChangeType = () => {
    formState.fieldKeys = [];
    if (!showConstraintRange.value) {
      formState.treeType = 'LEVEL_UNIQUE';
    }
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    editIndex.value = null;
    constraintData.value = [];
    options.value = [];
    closeModal();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const constraint = cloneDeep(constraintData.value);
      let data = {
        type: formState.type,
        fieldKeys: formState.fieldKeys,
      };
      if (showConstraintRange.value) {
        data.type = formState.treeType;
      }
      if (!isEdit.value) {
        constraint.push(data);
      } else {
        Object.assign(constraint[editIndex.value], data);
      }

      const path = {
        modelKey: props.modelKey,
      };
      await putModelMetaConstantByModelKey(
        path,
        { constraint },
        {
          transferToConfig: { headers: { operateType: isEdit.value ? 'UPDATE' : 'INSERT' } },
        },
      );

      if (isEdit.value) {
        // 编辑
        message.success('编辑成功');
      } else {
        // 新建
        message.success('新建成功');
      }
      emit('refresh');
      closeModal();
    });
  };

  const handleChangeFileKeys = (val) => {
    if (val.length > 3) return;
    formState.fieldKeys = val;
  };

  const getFiledMeta = async () => {
    const res = await getFieldMetaList({ modelKey: props.modelKey! });
    options.value =
      res?.filter((d) => {
        return (
          [CreateType.USER_DEFINED, CreateType.BUILTIN].includes(d.createType!) &&
          [
            FIELD_TYPE.TEXT,
            FIELD_TYPE.LONG_TEXT,
            FIELD_TYPE.INTEGER,
            FIELD_TYPE.LONG,
            FIELD_TYPE.DOUBLE,
            FIELD_TYPE.DECIMAL,
            FIELD_TYPE.BOOLEAN,
            FIELD_TYPE.DATE,
            FIELD_TYPE.TIME,
            FIELD_TYPE.DATE_TIME,
            FIELD_TYPE.REF,
            FIELD_TYPE.ENUM,
            FIELD_TYPE.USER,
            FIELD_TYPE.ORG,
            FIELD_TYPE.RDO_REF,
            FIELD_TYPE.TRANSACTION,
          ].includes(d.type!)
        );
      }) || [];
  };
</script>

<style lang="less">
  .gct-constraint-form {
    .constraint-type {
      .ant-form-item-control {
        padding-top: 6px;

        .constraint-type-description {
          margin-top: 6px;
          color: #c3c3c3;
          font-size: 12px;
        }
      }
    }
  }
</style>
