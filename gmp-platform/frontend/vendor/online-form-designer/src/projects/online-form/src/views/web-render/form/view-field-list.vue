<template>
  <a-form
    ref="tableFormRef"
    :model="tableData"
    layout="inline"
    :label-col="{ span: 0 }"
    autocomplete="off"
  >
    <basic-table
      class="field-table"
      ref="tableRef"
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      row-key="id"
      :columns="columns"
      :dataSource="tableData"
      :pagination="false"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'enabled'">
          <a-switch
            v-model:checked="record.enabled"
            @change="
              (checked) => {
                handleCheck(!!checked, record);
              }
            "
          />
        </template>
        <template v-if="column.key === 'key'">
          <a-form-item
            v-if="record.enabled"
            class="field-form-item"
            :rules="[{ required: true }, { validator: validateSpecialCharacters }]"
            :label="t('sys.component.dataConnection.fieldAlias')"
            :name="[index, 'key']"
          >
            <a-input
              v-model:value="record.key"
              :allowClear="false"
              :maxlength="32"
              :placeholder="
                t('sys.pleaseInputSth', { sth: t('sys.component.dataConnection.fieldAlias') })
              "
            />
          </a-form-item>
          <span v-else></span>
        </template>
        <template v-if="column.key === 'name'">
          <a-form-item
            v-if="record.enabled"
            class="field-form-item"
            :rules="[{ required: true }]"
            :label="t('sys.component.dataConnection.fieldName')"
            :name="[index, 'name']"
          >
            <a-input
              v-model:value="record.name"
              :allowClear="false"
              :maxlength="32"
              :placeholder="
                t('sys.pleaseInputSth', { sth: t('sys.component.dataConnection.fieldName') })
              "
            />
          </a-form-item>
          <span v-else></span>
        </template>
        <template v-if="column.key === 'type'">
          <a-form-item
            v-if="record.enabled"
            class="field-form-item"
            :rules="[{ required: true }]"
            :label="t('sys.component.dataConnection.fieldType')"
            :name="[index, 'type']"
          >
            <a-select
              style="width: 100%"
              :placeholder="
                t('sys.pleaseSelectSth', {
                  sth: t('sys.component.dataConnection.fieldType'),
                })
              "
              v-model:value="record.type"
            >
              <a-select-option v-for="item in fieldOptions" :value="item.key" :key="item.key">{{
                t(item.i18n)
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <span v-else></span>
        </template>
      </template>
    </basic-table>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, onBeforeMount, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getSetFieldColumns } from '../constant';
  import { BasicTable } from '/@/components/Table';
  import { getFiledOptionsByDb, SystemFieldKeyMap } from '../constant';
  import { postDataSourceSqlColumnInformation } from '/@/apis/gct-platform/DataSourceController';
  import type { ColumnInformationSchema } from '/@/apis/gct-platform/model';

  const { t } = useI18n();

  const tableFormRef = ref<FormInstance>();

  const props = defineProps<{
    dsKey?: string;
    script?: string;
  }>();

  let fieldMetaInfos: ColumnInformationSchema[] = [];

  const fieldOptions = ref<
    Array<{
      key: string;
      i18n: string;
    }>
  >([]);

  const tableData = ref<
    Array<{
      /** 原字段名 */
      column: string;
      /** 原字段类型 */
      columnType?: string;
      /** 是否可用 */
      enabled: boolean;
      /** 别名 */
      key?: string;
      /** 字段名称 */
      name?: string;
      /** 字段类型 */
      type?: string;
    }>
  >([]);

  const columns = computed(() => getSetFieldColumns());

  const setDefaultValue = (obj) => {
    const item: ColumnInformationSchema = fieldMetaInfos.find((x) => x.column === obj.column)!;
    const defaultValue = {
      key: item.column?.toLocaleLowerCase(),
      type: fieldOptions.value?.[0].key,
      name: item.description,
    };
    Object.keys(defaultValue).forEach((key) => {
      // 原值为空时覆盖默认值
      if (!obj[key]) {
        obj[key] = defaultValue[key];
      }
    });
  };

  onBeforeMount(async () => {
    fieldOptions.value = getFiledOptionsByDb() as any;

    // 第一步完成后走这边，请求数据，绘制字段映射表格
    const res = await postDataSourceSqlColumnInformation({
      key: props.dsKey!,
      script: props.script!,
    });

    if (res) {
      fieldMetaInfos = res;
      tableData.value = res.map((item) => {
        const obj = {
          column: item.column!,
          key: item.column?.toLocaleLowerCase(),
          // 新建的时候一开始都启用
          enabled: true,
          name: undefined,
          type: undefined,
        };

        const sys = SystemFieldKeyMap[item.column!];

        if (sys) {
          Object.assign(obj, {
            enabled: true,
            name: sys.fieldName,
            type: sys.fieldType,
          });
        }

        // 设置默认值
        setDefaultValue(obj);
        return obj;
      });
    }
  });

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-z0-9_]+$/;
    if (!reg.test(value)) {
      callback(t('sys.component.dataConnection.ailsKeyFormat'));
    }
    callback();
  };

  const handleCheck = (checked: boolean, record) => {
    if (checked) {
      setDefaultValue(record);
    }
  };

  function getValue() {
    return tableData.value;
  }

  defineExpose({
    currentRef: tableFormRef,
    getValue,
  });
</script>

<style scoped lang="less">
  .field-table {
    .field-form-item {
      margin-bottom: 0;
      margin-right: 0;
      :deep(.ant-form-item-label) {
        display: none;
      }

      :deep(.ant-form-item-explain-error) {
        white-space: normal;
        overflow-wrap: break-word;
      }
    }
  }
</style>
