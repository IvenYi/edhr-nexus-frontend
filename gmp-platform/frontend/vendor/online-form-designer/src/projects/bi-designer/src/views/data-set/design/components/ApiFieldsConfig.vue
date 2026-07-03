<template>
  <div :class="ns.b()">
    <a-form
      ref="formRef"
      :model="tableData"
      :wrapper-col="{ span: 24 }"
      autocomplete="off"
      hide-required-mark
      :colon="false"
    >
      <basic-table
        ref="tableRef"
        :class="ns.e('table-wrap')"
        :showIndexColumn="false"
        :ellipsis="true"
        row-key="id"
        :columns="columns"
        :dataSource="tableData"
        :pagination="false"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'originKey'">
            {{ record.originKey }}
          </template>
          <template v-if="column.key === 'fieldKey'">
            <a-form-item
              :rules="[
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback($t('sys.pleaseInputSth', { sth: $t('sys.bi.dbFieldName') }));
                      return;
                    }
                    if (value && value.trim().length > 100) {
                      callback('最大100字');
                      return;
                    }
                    if (
                      value &&
                      [
                        'id',
                        'id_',
                        'modify_user_id_',
                        'modify_user_name_',
                        'modify_time_',
                        'create_user_id_',
                        'create_user_name_',
                        'create_time_',
                      ].includes(value.trim())
                    ) {
                      callback('当前字段名为保留字段名，请重新填写');
                      return;
                    }
                    const regex = /__+/g;
                    if (value && regex.test(value)) {
                      callback('不可以有连续的下划线，请重新填写');
                      return;
                    }
                    if (value && !/^[^A-Z]*$/.test(value)) {
                      callback('不支持大写字母，请重新填写');
                      return;
                    }
                    const arr =
                      tableData
                        .filter((i, ind) => ind !== index)
                        .filter((v) => v.fieldKey == value) || [];
                    if (arr.length > 0) {
                      callback('数据库字段名有重复');
                      return;
                    }
                    callback();
                  },
                },
              ]"
              label=""
              :name="[index, 'fieldKey']"
            >
              <a-input
                style="width: 100%"
                v-model:value="record.fieldKey"
                :disabled="isApiEdit && !isApiDBChecked"
                :allowClear="false"
                :maxlength="32"
                :placeholder="$t('sys.pleaseInputSth', { sth: $t('sys.bi.dbFieldName') })"
              />
            </a-form-item>
          </template>
          <template v-if="column.key === 'fieldType'">
            <a-form-item
              :rules="[
                {
                  required: true,
                  message: $t('sys.pleaseSelectSth', { sth: $t('sys.bi.fieldType') }),
                },
              ]"
              label=""
              :name="[index, 'fieldType']"
            >
              <a-select
                style="width: 100%"
                v-model:value="record.fieldType"
                :disabled="isApiEdit && !isApiDBChecked"
                :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.bi.fieldType') })"
                @change="handleTypeChange($event, record)"
              >
                <a-select-opt-group
                  v-for="(group, index) in fieldTypeOpts"
                  :key="index"
                  :label="group.label"
                >
                  <a-select-option
                    v-for="item in group.options"
                    :value="item.value"
                    :key="item.value"
                  >
                    <span :class="['field-icon', item.value.split('_')[0]]">
                      <template v-if="item.value.split('_')[1] == 'text'">Str.</template>
                      <template v-else-if="item.value.split('_')[1] == 'number'">No.</template>
                      <template v-else-if="item.value.split('_')[1] == 'date'">
                        <calendar-outlined />
                      </template>
                      <template v-else-if="item.value.split('_')[1] == 'img'">
                        <i class="icon iconfont icon-tupian_wudaima new-size"></i>
                      </template>
                    </span>
                    {{ item.label }}
                  </a-select-option>
                </a-select-opt-group>
              </a-select>
            </a-form-item>
          </template>
        </template>
      </basic-table>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  // import type { SelectProps } from 'ant-design-vue';
  import { fieldTypeOpts } from '../../hooks/hooks';

  const { t } = useI18n();
  const ns = useNamespace('api-fields-config');

  const props = defineProps<{
    apiDatabaseId?: string;
    configData?: any[];
    apiSelected: string;
    isApiEdit: boolean;
    isApiDBChecked: boolean;
  }>();

  const tableRef = ref();
  const formRef = ref();

  const tableData = ref<
    Array<{
      /** 原字段名 */
      originKey: string;
      /** 字段名 */
      fieldKey?: string;
      /** 字段类型 */
      fieldType: string;
      /** 字段总类型｜dim:维度｜meas:度量 */
      type: string;
    }>
  >([]);

  const columns = [
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      width: 60,
    },
    {
      title: t('sys.bi.originalFieldKey'),
      dataIndex: 'originKey',
    },
    {
      title: t('sys.bi.dbFieldKey'),
      dataIndex: 'fieldKey',
    },
    {
      title: t('sys.bi.fieldType'),
      dataIndex: 'fieldType',
    },
  ];

  const getApiDatabaseInfo = async () => {
    if (props.configData?.length) {
      tableData.value = props.configData?.map((i) => {
        return {
          fieldKey: i.fieldName,
          originKey: i.originKey,
          fieldType: i.fieldType,
          type: i.type,
        };
      });
    } else {
      // const res = (await getDatabaseInfo({ id: databaseId })) || {};
      // const apiConfig = JSON.parse(res?.apiConfig || '{}');
      const keys = props.apiSelected?.split(',');
      tableData.value = keys.map((key) => {
        return {
          originKey: key,
          fieldKey: key.split('.').at(-1)?.toLowerCase()?.replace(/__+/g, '_'),
          fieldType: 'dim_text',
          type: 'dim',
        };
      });
    }
  };

  const handleTypeChange = (value, record) => {
    record.type = value.split('_')[0];
  };

  async function validate(): Promise<[]> {
    try {
      const result = await formRef.value?.validate();
      console.log('Table validation result:', result);
      return [];
    } catch (err) {
      console.error('Table validation failed:', err);
      return err?.errorFields || [];
    }
  }

  function getNodes() {
    return [...cloneDeep(tableData.value)];
  }

  watch(
    () => props.apiSelected,
    (v) => {
      v && getApiDatabaseInfo();
    },
    {
      deep: true,
      immediate: true,
    },
  );

  watch(
    () => props.configData,
    (v) => {
      if (v?.length) {
        tableData.value =
          props.configData?.map((i) => {
            return {
              fieldKey: i.fieldName,
              originKey: i.originKey,
              fieldType: i.fieldType,
              type: i.type,
            };
          }) || [];
      }
    },
    {
      deep: true,
    },
  );

  defineExpose({
    validate,
    getNodes,
  });
</script>

<style lang="scss" scoped>
  @include b(api-fields-config) {
    height: 100%;
    padding: 16px;
    background: #fff;
    @include e(table-wrap) {
    }
  }

  .field-icon {
    &.dim {
      color: var(--ant-primary-color);
    }
    &.meas {
      color: var(--ant-success-color);
    }
  }

  :deep(.ant-form-item) {
    position: relative;
    margin-bottom: 4px;
    .ant-form-item-control {
      .ant-form-item-explain {
        z-index: 1;
        position: absolute;
        left: 0;
        bottom: -24px;
        font-size: 12px;
      }
    }
  }

  :deep(.ant-table) {
    border: 1px solid #f0f0f0;
    .ant-table-tbody {
      tr.ant-table-row {
        &:last-child {
          td {
            border-bottom-width: 0;
          }
        }
      }
    }
  }
</style>
