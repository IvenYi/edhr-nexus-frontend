<template>
  <div class="column-setting">
    <div class="title"> 列配置 </div>
    <a-form
      :model="selectedField"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
      :key="selectedField.key"
    >
      <a-form-item label="字段KEY"> {{ selectedField.key }} </a-form-item>
      <a-form-item label="列名">
        <a-input v-model:value="selectedField.aliasName" style="width: 30%" />
      </a-form-item>
      <a-form-item label="列宽">
        <a-input v-model:value="selectedField.columnWidth" style="width: 30%" />
      </a-form-item>
      <a-form-item label="是否必填">
        <a-checkbox v-model:checked="required" :disabled="selectedField.columnDisabled" />
      </a-form-item>
      <template
        v-if="
          selectedField.type === FIELD_TYPE.USER_MULTI || selectedField.type === FIELD_TYPE.USER
        "
      >
        <a-form-item label="人员重名关联字段" required>
          <a-select v-model:value="userRelationColumn" style="width: 120px">
            <template v-for="item in userFields" :key="item.key">
              <a-select-option :value="item.key">{{ item.name }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <div class="tips">
          <a-row :gutter="24">
            <a-col :span="4" class="label">填写说明:</a-col>
            <a-col :span="20" class="content">
              <div
                >人员重名填写规则“【{{
                  userRelationColumnFieldName
                }}】姓名”,多人用“；”分割，例如："张三;【1001】李四"</div
              >
            </a-col>
          </a-row>
        </div>
      </template>
      <template v-if="selectedField.type === FIELD_TYPE.ORG_MULTI">
        <div class="tips">
          <a-row :gutter="24">
            <a-col :span="4" class="label">注意事项:</a-col>
            <a-col :span="20">
              <div>
                <div>1.部门根据全路径匹配</div>
                <div>2.多个部门用";"或者"；"分割</div>
                <div>例：XXX公司/销售部/销售一部;XXX公司/总经办</div>
              </div>
            </a-col>
          </a-row>
        </div>
      </template>
      <template v-if="selectedField.type === FIELD_TYPE.ENUM">
        <a-descriptions
          :column="1"
          :labelStyle="{ color: '#ff4d4f', justifyContent: 'flex-end', flex: 4 }"
          :contentStyle="{ color: '#ff4d4f', flex: 20 }"
          size="small"
        >
          <a-descriptions-item :label="t('sys.appDesigner.note')">{{
            t('sys.appDesigner.enumNoteTipOne')
          }}</a-descriptions-item>
        </a-descriptions>
      </template>
      <template v-if="selectedField.type === FIELD_TYPE.ENUM_MULTI">
        <a-descriptions
          :column="1"
          :labelStyle="{ color: '#ff4d4f', justifyContent: 'flex-end', flex: 4 }"
          :contentStyle="{ color: '#ff4d4f', flex: 20 }"
          size="small"
        >
          <a-descriptions-item :label="t('sys.appDesigner.note')">{{
            t('sys.appDesigner.enumNoteTipTwo')
          }}</a-descriptions-item>
        </a-descriptions>
      </template>
      <template v-if="selectedField.type === FIELD_TYPE.DECIMAL">
        <a-form-item label="保留小数位数">
          <a-input v-model:value="selectedField.digits" style="width: 30%" />
        </a-form-item>
      </template>
      <template v-if="selectedField.type === FIELD_TYPE.DATE">
        <a-form-item label="日期格式">
          <a-select
            v-model:value="selectedField.dateFormat"
            :options="DateOptions"
            style="width: 30%"
          />
        </a-form-item>
        <a-form-item v-if="selectedField.dateFormat === 'custom'" label="自定义格式">
          <a-input v-model:value="selectedField.dateFormat" style="width: 240px" />
        </a-form-item>
      </template>
      <template v-if="selectedField.type === FIELD_TYPE.DATE_TIME">
        <a-form-item label="日期格式">
          <a-select
            ref="select"
            v-model:value="selectedField.dateFormat"
            style="width: 240px"
            :options="DateTimeOptions"
          />
        </a-form-item>
        <template v-if="selectedField.dateFormat === 'custom'">
          <a-form-item label="自定义格式">
            <a-input v-model:value="selectedField.dateFormat" style="width: 240px" />
          </a-form-item>
        </template>
      </template>
      <template
        v-if="selectedField.type === FIELD_TYPE.REF || selectedField.type === FIELD_TYPE.REF_MULTI"
      >
        <a-form-item
          required
          label="关联字段导入"
          v-if="dataTplInfo.type !== 'EXPORT' && selectedField.key !== 'parent_id_'"
        >
          <a-select
            v-model:value="selectedField.relationColumns"
            style="width: 65%"
            mode="multiple"
            :maxTagCount="5"
            :maxTagTextLength="6"
          >
            <template v-for="item in relationFields" :key="item.id">
              <a-select-option :value="item.key">{{ item.name }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item
          label="关联模型显示规则"
          v-if="dataTplInfo.type === 'EXPORT' && selectedField.key !== 'parent_id_'"
        >
          <expression-item :selectedField="selectedField" @regular-exp="setRegularExp" />
        </a-form-item>
        <a-form-item
          label="字段分隔符"
          v-if="dataTplInfo.type !== 'EXPORT' && selectedField.relationColumns.length > 1"
        >
          <a-input v-model:value="selectedField.fieldDelimiter" style="width: 65%" />
        </a-form-item>
        <div
          class="tips"
          v-if="
            selectedField.type === FIELD_TYPE.REF &&
            selectedField.relationColumns.length > 1 &&
            dataTplInfo.type !== 'EXPORT'
          "
        >
          <a-row :gutter="24">
            <a-col :span="4" class="label">填写格式:</a-col>
            <a-col :span="20" style="padding-left: 0">
              <div class="mb-24px">请以“#”作为分隔符连接所选字段，例如：“客户编号#客户名称” </div>
            </a-col>
          </a-row>
        </div>
        <a-form-item v-if="selectedField.type === FIELD_TYPE.REF_MULTI" label="数据分隔符">
          <a-input v-model:value="selectedField.dataDelimiter" style="width: 30%" />
        </a-form-item>
        <div class="tips" v-if="selectedField.type === FIELD_TYPE.REF_MULTI">
          <a-row :gutter="24">
            <a-col :span="4" class="label">填写格式:</a-col>
            <a-col :span="20" style="padding-left: 0">
              <div class="mb-24px"
                >请以“#”作为分隔符连接所选字段，以“；”作为数据分割符连接数据，支持中引文符号。例如:客户编号#客户名称;客户编号#客户名称
              </div>
            </a-col>
          </a-row>
        </div>
      </template>
      <template v-if="selectedField.type === FIELD_TYPE.BOOLEAN">
        <a-form-item label="值定义">
          <template v-for="item in selectedField.valueMap" :key="item">
            <a-descriptions :colon="false" :labelStyle="{ alignSelf: 'center' }">
              <a-descriptions-item :label="Ch_BoolType[item.value]">
                <a-input v-model:value="item.comment" style="width: 128px" />
              </a-descriptions-item>
            </a-descriptions>
          </template>
        </a-form-item>
      </template>
      <template v-if="selectedField.key === 'parent_id_'">
        <a-form-item label="父节点识别字段" :required="true" name="treeNodeColumnField">
          <a-select v-model:value="selectedField.treeNodeColumnField" style="width: 240px">
            <a-select-option v-for="item in treenodeFileds" :key="item.id" :value="item.key">{{
              item.aliasName
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="父节点路径分割" :required="true" name="dataDelimiter">
          <a-input v-model:value="selectedField.dataDelimiter" style="width: 180px" />
        </a-form-item>
        <div class="tips">
          <a-row :gutter="24">
            <a-col :span="4" class="label">注意事项:</a-col>
            <a-col :span="20" style="padding-left: 0">
              <div class="mb-24px">
                以“名称”作为节点字段，以“/”作为路径分隔。例：名称001/名称002/名称003
              </div>
            </a-col>
          </a-row>
        </div>
      </template>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import type { SelectProps } from 'ant-design-vue';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useFieldData } from '../hooks/useFieldData';
  import ExpressionItem from '../components/expression-item.vue';
  import { ExcelTmplResponse } from '/@/apis/gct-apaas/model';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { getPlatUserField } from '/@/apis/gct-platform/PlatformConfigController';
  import type { UserFieldMeta } from '/@/apis/gct-platform/model';

  const { t } = useI18n();

  const { fields } = useFieldData();

  const Ch_BoolType = {
    TRUE: t('sys.boolTrue'),
    FALSE: t('sys.boolFalse'),
  };

  const props = defineProps<{
    fieldId: string;
    dataTplInfo: ExcelTmplResponse;
  }>();

  const userFields = ref<UserFieldMeta[]>([]);
  getPlatUserField().then((res) => {
    userFields.value = res!;
    if (
      !userRelationColumn.value &&
      (selectedField.value.type === FIELD_TYPE.USER_MULTI ||
        selectedField.value.type === FIELD_TYPE.USER)
    ) {
      // userRelationColumn.value = userFields.value[0].key;
    }
  });
  const userRelationColumn = computed({
    get() {
      console.log('selectedField.value.relationColumns', selectedField.value.relationColumns);
      return (selectedField.value.relationColumns ?? [])[0];
    },
    set(value) {
      selectedField.value.relationColumns = [value];
    },
  });
  const userRelationColumnFieldName = computed(() => {
    if (!userRelationColumn.value) return '';
    return userFields.value.find((item) => item.key === userRelationColumn.value)?.name;
  });

  const relationFields = ref();

  const treenodeFileds = computed(() => {
    if (!fields.value) return [];
    return fields.value.filter((item) => item.createType === 'USER_DEFINED');
  });

  const selectedField = computed(() => {
    console.log(fields.value, props.fieldId);
    if (!fields.value) return {};
    return fields.value.find((f) => f.id == props.fieldId);
  });

  watch(
    () => selectedField.value.key,
    () => {
      getRelationColumns();
      if (
        (selectedField.value.type === FIELD_TYPE.USER_MULTI ||
          selectedField.value.type === FIELD_TYPE.USER) &&
        !userRelationColumn.value
      ) {
        userRelationColumn.value = userFields.value[0].key;
      }
    },
  );

  const setRegularExp = ({ expr, exprInEditor }) => {
    selectedField.value.regularExp = expr;
    selectedField.value.regularExpForShow = exprInEditor;
  };

  const DateOptions = ref<SelectProps['options']>([
    {
      label: '年',
      value: 'yyyy',
    },
    {
      label: '年-月',
      value: 'yyyy-MM',
    },
    {
      label: '年-月-日',
      value: 'yyyy-MM-dd',
    },
    {
      label: '自定义',
      value: 'custom',
    },
  ]);

  const DateTimeOptions = [
    {
      label: '年-月-日 时:分',
      value: 'yyyy-MM-dd HH:mm',
    },
    {
      label: '年-月-日 时:分:秒',
      value: 'yyyy-MM-dd HH:mm:ss',
    },
    {
      label: '自定义',
      value: 'custom',
    },
  ];

  const getRelationColumns = async () => {
    const bindInfo = selectedField.value.bindInfo;
    if (
      bindInfo &&
      selectedField.value.type !== FIELD_TYPE.ENUM &&
      selectedField.value.type !== FIELD_TYPE.ENUM_MULTI
    ) {
      relationFields.value = await getFieldMetaList({ modelKey: bindInfo });
    }
  };

  const required = computed({
    get() {
      return selectedField.value.required === 1;
    },
    set(v) {
      selectedField.value.required = v === true ? 1 : 0;
    },
  });
  onMounted(() => {
    getRelationColumns();
  });
</script>

<style lang="less" scoped>
  .column-setting {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;

    .title {
      display: flex;
      align-items: center;
      padding-top: 14px;
      padding-bottom: 12px;
      padding-left: 16px;
      font-size: 16px;
      font-weight: bold;

      &::before {
        content: ' ';
        height: 12px;
        padding-right: 6px;
        border-left: 3px solid var(--ant-primary-color);
      }
    }

    .tips {
      color: #ff4d4f;

      .label {
        padding-right: 0 !important;
        text-align: right;
      }

      .content {
        padding-left: 6px !important;
      }
    }

    .wranning {
      margin-top: 8px;
      color: #ff4d4f;
    }
  }
</style>
