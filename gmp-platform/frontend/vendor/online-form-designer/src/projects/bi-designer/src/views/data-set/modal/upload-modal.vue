<template>
  <basic-modal
    @register="registerInner"
    :title="t('sys.uploadFile')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <div class="mb-18px mt-8px"
      >文件名称：<b>{{ fileName }}</b></div
    >
    <a-form
      ref="uploadFormRef"
      :model="tableData"
      :wrapper-col="{ span: 24 }"
      autocomplete="off"
      hide-required-mark
      :colon="false"
    >
      <basic-table
        ref="tableRef"
        class="upload-model-table-wrapper"
        :showIndexColumn="false"
        :ellipsis="true"
        row-key="id"
        :columns="columns"
        :dataSource="tableData"
        :pagination="false"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'colName'">
            <a-form-item
              :rules="[
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback(t('sys.pleaseInputSth', { sth: t('sys.bi.fileColName') }));
                      return;
                    }
                    if (value && value.trim().length > 100) {
                      callback('最大100字');
                      return;
                    }
                    const arr =
                      tableData
                        .filter((i, ind) => ind !== index)
                        .filter((v) => v.colName == value) || [];
                    if (arr.length > 0) {
                      callback('字段名有重复');
                      return;
                    }
                    callback();
                  },
                },
              ]"
              label=""
              :name="[index, 'colName']"
            >
              <a-input
                style="width: 100%"
                v-model:value="record.colName"
                :allowClear="false"
                :maxlength="32"
                :placeholder="t('sys.pleaseInputSth', { sth: t('sys.bi.fileColName') })"
              />
            </a-form-item>
          </template>
          <template v-if="column.key === 'fieldName'">
            <a-form-item
              :rules="[
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback(t('sys.pleaseInputSth', { sth: t('sys.bi.dbFieldName') }));
                      return;
                    }
                    if (value && value.trim().length > 100) {
                      callback('最大100字');
                      return;
                    }
                    if (value && value.trim() == 'id') {
                      callback('id为保留字段名，不可以填写');
                      return;
                    }
                    const arr =
                      tableData
                        .filter((i, ind) => ind !== index)
                        .filter((v) => v.fieldName == value) || [];
                    if (arr.length > 0) {
                      callback('数据库字段名有重复');
                      return;
                    }
                    callback();
                  },
                },
              ]"
              label=""
              :name="[index, 'fieldName']"
            >
              <a-input
                style="width: 100%"
                v-model:value="record.fieldName"
                :allowClear="false"
                :maxlength="32"
                :placeholder="t('sys.pleaseInputSth', { sth: t('sys.bi.dbFieldName') })"
              />
            </a-form-item>
          </template>
          <template v-if="column.key === 'fieldType'">
            <a-form-item
              :rules="[
                {
                  required: true,
                  message: t('sys.pleaseSelectSth', { sth: t('sys.bi.fieldType') }),
                },
              ]"
              label=""
              :name="[index, 'fieldType']"
            >
              <a-select
                style="width: 100%"
                v-model:value="record.fieldType"
                :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.bi.fieldType') })"
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
    <div class="bot-text mt-20px">
      <span>字段类型为日期时间、日期、时间、文本、长文本时默认为维度</span>
      <span>字段类型为数值（整数、长整数、小数、精度小数）时默认为度量</span>
    </div>
  </basic-modal>
</template>

<script setup lang="ts" name="UploadModal">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { fieldTypeOpts } from '../hooks/hooks';

  const { t } = useI18n();
  const emit = defineEmits(['ok', 'register']);

  const tableData = ref<
    Array<{
      /** 文件列名 */
      colName: string;
      /** 字段名 */
      fieldName?: string;
      /** 字段类型 */
      fieldType: string;
      /** 字段总类型｜dim:维度｜meas:度量 */
      type: string;
    }>
  >([]);

  const tableRef = ref();
  const uploadFormRef = ref();
  const fileName = ref();

  const columns = [
    {
      title: t('sys.bi.fileColName'),
      dataIndex: 'colName',
    },
    {
      title: t('sys.bi.dbFieldName'),
      dataIndex: 'fieldName',
    },
    {
      title: t('sys.bi.fieldType'),
      dataIndex: 'fieldType',
    },
  ];

  const [registerInner, { closeModal, setModalProps }] = useModalInner(async (data) => {
    console.log(data);
    data && onDataReceive(data);
  });

  const onDataReceive = async (data) => {
    fileName.value = data.name;
    tableData.value = cloneDeep(data.list);
  };

  const handleClose = () => {
    tableData.value = [];
    uploadFormRef.value?.resetFields();
    closeModal();
  };

  const handleOk = async () => {
    try {
      setModalProps({ confirmLoading: true });
      await uploadFormRef.value?.validate();
      emit('ok', [...cloneDeep(tableData.value)]);
      // message.success(t('sys.operationSuccess'));
      // closeModal();
    } catch (err) {
      setModalProps({ confirmLoading: false });
      console.log(err);
    }
  };

  const handleTypeChange = (value, record) => {
    record.type = value.split('_')[0];
  };

  //弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {};
</script>

<style lang="scss" scoped>
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
  // .upload-model-table-wrapper
  :deep(.ant-table) {
    border: 1px solid #f0f0f0;
    // border-bottom: 0;
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
  .field-icon {
    &.dim {
      color: var(--ant-primary-color);
    }
    &.meas {
      color: var(--ant-success-color);
    }
  }
  .bot-text {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #8f8f8f;
    line-height: 18px;
    span {
      padding-left: 11px;
      position: relative;
      &::before {
        position: absolute;
        left: 0;
        top: 8px;
        content: '';
        width: 3px;
        height: 3px;
        background: #026ac8;
        border-radius: 2px;
      }
    }
  }
</style>
