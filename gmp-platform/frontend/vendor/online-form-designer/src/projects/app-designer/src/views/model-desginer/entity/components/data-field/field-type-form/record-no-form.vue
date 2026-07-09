<template>
  <a-form-item :name="['specificConfig', 'refRecordNo']" :label="t('sys.model.fieldAttr')">
    <a-radio-group
      v-model:value="formData.specificConfig.refRecordNo"
      :options="options"
      :disabled="isEdit"
    />
    <div class="absolute mt-4px leading-none">{{
      formData.specificConfig.refRecordNo === 0
        ? '全局唯一，不允许填重复的值；表单主模型中该字段只能添加一个，不能添加在子模型中；用于标识表单的唯一性'
        : '允许填重复的值，表单查看时可通过该字段链接至另一份“记录单号”值相同的表单中'
    }}</div>
  </a-form-item>
  <a-form-item
    v-if="formData.specificConfig.refRecordNo === 0"
    class="pt12px"
    :name="['specificConfig', 'signGenerate']"
    :label="t('sys.model.identificationGenerationMethod')"
  >
    <a-radio-group
      v-model:value="formData.specificConfig.signGenerate"
      :options="generateOptions"
      :disabled="isEdit"
    />
  </a-form-item>
  <a-form-item
    :name="['specificConfig', 'snRuleId']"
    :label="t('sys.model.serial_number_rule')"
    v-if="
      formData.specificConfig.refRecordNo === 0 &&
      formData.specificConfig.signGenerate === RecordNoGenerateEnum.SN_RULE
    "
  >
    <a-tree-select
      virtual
      v-model:value="formData.specificConfig.snRuleId"
      style="width: 100%"
      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
      :placeholder="t('sys.chooseText')"
      allow-clear
      v-model:treeExpandedKeys="treeExpandedKeys"
      :tree-data="rdoData"
      :fieldNames="{ children: '__CHILDREN__', key: 'id_', value: 'id_' }"
      showSearch
      @search="searchRdo"
      :filterTreeNode="false"
    >
      <template #title="item">
        <!-- 由于tree-select的title插槽会被引用到选中项的回显中，所以只能在插槽中selected判断是下拉框还是选中项的回显 -->
        <div v-if="!Object.prototype.hasOwnProperty.call(item, 'selected')">
          <template v-if="item.__LABEL__">
            {{ item.__ROOT_LABEL__ ? `${item.__ROOT_LABEL__}:${item.__LABEL__}` : item.__LABEL__ }}
            <!-- <span v-if="!item.__ROOT_LABEL__" class="gct-custom-tag ml8px">
            {{ $t('sys.default') }}</span
          > -->
          </template>
          <template v-else>
            <!-- 回填的时候查询不到兜底 -->
            {{ rdoLabel }}
          </template>
        </div>
        <div v-else>
          <span> {{ item.__LABEL__ }}</span>
          <span v-if="item.default_" class="gct-custom-tag ml8px"> {{ $t('sys.default') }}</span>
        </div>
      </template>
    </a-tree-select>
  </a-form-item>
</template>

<script setup lang="ts" name="record_no">
  import { PropType, reactive, watch, computed, ref, onMounted } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { refRecordNoOptions, generateRecordNoOptions } from '../../../constant/index';
  import { FormInstance } from 'ant-design-vue';
  import { RecordNoGenerateEnum } from '@gct/runtime';
  import {
    postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  import { validateCaseCfg } from '@gct/flow/src/plugins/bpmn/utils/node-validator';

  const { t } = useI18n();
  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    isSubModel: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    boolSupportTree: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState);
  const rdoLabel = ref();
  const treeExpandedKeys = ref([]);
  const rdoData = ref([]);
  const initData = () => {
    return {
      specificConfig: {
        refRecordNo: props.isSubModel ? 1 : 0,
        signGenerate: RecordNoGenerateEnum.HANDLE,
        snRuleId: undefined,
      },
    };
  };

  const options = computed(() => {
    return refRecordNoOptions?.map((item: any) => {
      return {
        ...item,
        disabled: props.isSubModel && item.value === 0 ? true : false,
      };
    });
  });
  const generateOptions = computed(() => {
    return generateRecordNoOptions?.map((item: any) => {
      return {
        ...item,
        disabled: props.isSubModel && item.value === 0 ? true : false,
      };
    });
  });
  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );
  watch(
    () => formData.specificConfig.refRecordNo,
    (val) => {
      if (val === 1) {
        formData.specificConfig.signGenerate = RecordNoGenerateEnum.HANDLE;
      }
    },
  );
  async function fetchRdoData(name_?: string) {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_sn_rule',
        bsKey: 'rdoListByPage',
      },
      {
        pageSize: 200,
        pageNo: 1,
        query: {
          'name_.like': name_,
          'operating_state_.eq': true,
          'create_type_.eq': 'BUILTIN',
        },
      },
    );
    treeExpandedKeys.value = [];
    rdoData.value =
      res.data?.map((i) => {
        const __CHILDREN__ =
          i.__CHILDREN__?.map((j: any) => {
            const id_ = `${i.id_}:${j.id_}`;
            return { ...j, __ROOT_LABEL__: i.__LABEL__, id_ };
          }) || [];
        treeExpandedKeys.value.push(i.id_);
        return { ...i, __CHILDREN__ };
      }) || [];
    // console.log(rdoData.value, treeExpandedKeys.value);
  }
  async function getRdoListByIds(id: string) {
    if (!id) return;
    const res =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionByRefIdsWithParent',
          modelKey: 'em_sn_rule',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { foreignFields: [] },
        {
          refIds: id,
          includeDeleted: 1,
        },
      )) || {};
    const rdoInfo = res?.data?.[0];
    if (!rdoInfo) return;
    const __ROOT_LABEL__ = rdoInfo.__LABEL__;
    if (id.includes(':')) {
      const __VERSION_LABEL__ = rdoInfo.__CHILDREN__[0]?.__LABEL__ || '';
      rdoLabel.value = `${__ROOT_LABEL__}:${__VERSION_LABEL__}`;
    } else {
      rdoLabel.value = __ROOT_LABEL__;
    }
  }
  async function searchRdo(str) {
    fetchRdoData(str);
  }
  defineExpose({
    initData,
  });
  onMounted(() => {
    fetchRdoData();
    getRdoListByIds(formData.specificConfig.snRuleId);
  });
</script>

<style scoped></style>
