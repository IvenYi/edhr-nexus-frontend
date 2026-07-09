<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="title"
    centered
    width="764px"
    :maskClosable="false"
  >
    <div class="p8px">
      <div class="title mb12px">{{ t('sys.basicInfo') }}</div>
      <a-form :model="formState" ref="formRef">
        <a-row>
          <a-col :span="12">
            <a-form-item
              :label="t('sys.platform.code')"
              name="key"
              :rules="[{ required: true }, { max: 64, message: t('sys.max64') }]"
            >
              <a-input
                v-model:value.trim="formState.key"
                :disabled="operateType === 'edit'"
                :placeholder="t('sys.inputText')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label="t('sys.name')"
              name="name"
              :labelCol="labelCol"
              :rules="[{ required: true }, { max: 32, message: t('sys.max32') }]"
            >
              <a-input v-model:value.trim="formState.name" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label="t('sys.developer.devive.type')"
              name="type"
              :rules="[{ required: true }]"
            >
              <a-radio-group v-model:value="formState.type">
                <a-radio value="MQTT">MQTT</a-radio>
                <a-radio value="IPAAS">{{ t('sys.developer.devive.interface') }}</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.type === 'IPAAS'" :labelCol="labelCol">
            <a-form-item
              :label="t('sys.integration.flow')"
              name="flowId"
              :rules="[{ required: true }]"
            >
              <a-tree-select
                v-model:value="formState.flowId"
                :placeholder="t('sys.chooseText')"
                :treeData="flowOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'child' }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('sys.notes')" name="remark">
              <a-textarea v-model:value.trim="formState.remark" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div class="flex justify-between items-center mb12px">
        <div class="title">{{ t('sys.developer.devive.paramsMapping') }}</div>
        <div>
          <a-button @click="addParams">
            <i class="gct-iconfont icon-a-btn_add2 mr4px"></i>
            {{ t('sys.developer.devive.addParams') }}
          </a-button>
          <a-button class="ml12px" @click="addArrayParams">
            <i class="gct-iconfont icon-icon_shuzujiegou mr4px"></i>
            {{ t('sys.developer.devive.addArrayMapping') }}
          </a-button>
        </div>
      </div>
      <a-form :model="tableData" ref="formTableRef" class="table-form">
        <BasicTable
          :striped="false"
          :bordered="true"
          :showIndexColumn="false"
          :ellipsis="true"
          :columns="columns"
          :dataSource="tableData"
          :pagination="false"
          :scroll="{ y: 300 }"
        >
          <template #expandIcon="{ expanded, onExpand, record }">
            <span
              v-if="record.children && record.children.length > 0"
              @click="(e) => onExpand(record, e)"
              style="margin-right: 8px; cursor: pointer"
            >
              <CaretDownOutlined v-if="expanded" class="color-blue" />
              <CaretRightOutlined v-else />
            </span>
          </template>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'code' && record.type === 'Array'">
              <a-form-item
                :name="[record.index, 'code']"
                :rules="[
                  { required: true, message: t('sys.inputTextTip', { name: $t('sys.ipaas.encoding') }) },
                  { max: 64, message: t('sys.max64') },
                ]"
              >
                <a-input
                  v-model:value="record.code"
                  @blur="() => changeCode(index, record)"
                  :placeholder="t('sys.inputText')"
                />
              </a-form-item>
            </template>
            <template v-else-if="column.key === 'type'">
              {{ t(typeEnum[record.type]) || '--' }}
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-button
                v-if="record.type === 'Array'"
                type="link"
                @click="openParamsChoose(record)"
              >
                <i class="gct-iconfont icon-btn_add mr4px"></i>
                {{ $t('sys.add') }}
              </a-button>
              <a-popconfirm
                overlayClassName="device"
                :title="t('sys.confirmExecution')"
                @confirm="handleRowDelete(record)"
              >
                <a-button type="text">
                  <i class="gct-iconfont icon-icon_shanchu"></i>
                </a-button>
              </a-popconfirm>
              <!-- <table-action-auto
                :actions="[
                  {
                    label: t('sys.add'),
                    ifShow: record.type === 'Array',
                    onClick: openParamsChoose.bind(null, record),
                  },

                  {
                    label: t('sys.delete'),
                    color: 'error',
                    popConfirm: {
                      title: t('sys.confirmExecution'),
                      confirm: handleRowDelete.bind(null, record),
                    },
                  },
                ]"
                :stopButtonPropagation="true"
              /> -->
            </template>
            <template v-else>{{ record[column.key] || '--' }}</template>
          </template>
        </BasicTable>
      </a-form>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <a @click="openAddParams">
          <i class="gct-iconfont icon-a-btn_add mr4px"></i>
          {{ t('sys.developer.devive.quickCreateParams') }}
        </a>
        <div>
          <a-button @click="close" :loading="loading">
            {{ t('sys.cancel') }}
          </a-button>
          <a-button type="primary" @click="handleOk" :loading="loading">
            {{ t('sys.ok2') }}
          </a-button>
        </div>
      </div>
    </template>
    <ChooseParams @register="registerChoose" @ok="chooseConfirm" />
    <CreateParams @register="register" />
  </basic-modal>
</template>
<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import {
    postDeviceInterconnection,
    putDeviceInterconnectionById,
  } from '/@/apis/gct-platform/DeviceInterconnectionController';
  import { message } from 'ant-design-vue';
  import CreateParams from './create-params.vue';
  import ChooseParams from './choose-params.vue';
  import { typeEnum } from '../../enum';
  import { getFlowFlowCategoryTree } from '/@/apis/gct-ipaas2/FlowMainController';

  const { t } = useI18n();
  const emit = defineEmits(['ok']);
  const [register, { openModal }] = useModal();
  const [registerChoose, { openModal: openChooseModal }] = useModal();
  const operateType = ref();
  const loading = ref(false);
  const [registerInner, { closeModal }] = useModalInner((data) => {
    formRef.value && formRef.value.resetFields();
    tableData.value = [];
    formState.id = '';
    formState.flowId = '';

    if (!data) {
      operateType.value = '';
      return;
    }
    operateType.value = data.operateType;
    Object.assign(formState, data);
    if (data.id && data.mapping) {
      const obj = JSON.parse(data.schema);
      for (let key in obj.properties) {
        const temp = {
          code: key.replace('$ref_', ''),
          key: key.replace('$ref_', ''),
          name:
            obj.properties[key]?.description ||
            (obj.properties[key]?.type === 'Array' ? t('sys.developer.devive.arrayMapping') : ''),
          type: obj.properties[key]?.type,
          index: tableData.value.length,
        };

        if (obj.properties[key]?.items && obj.properties[key]?.items.properties) {
          temp.children = [];
          for (let subkey in obj.properties[key].items.properties) {
            if (obj.properties[key].items.properties[subkey]?.sort) {
              temp.children[Number(obj.properties[key].items.properties[subkey]?.sort)] = {
                code: subkey.replace('$ref_', ''),
                key: key.replace('$ref_', '') + ':' + subkey.replace('$ref_', ''),
                name: obj.properties[key].items.properties[subkey]?.description,
                type: obj.properties[key].items.properties[subkey]?.type,
              };
            } else {
              temp.children.push({
                code: subkey.replace('$ref_', ''),
                key: key.replace('$ref_', '') + ':' + subkey.replace('$ref_', ''),
                name: obj.properties[key].items.properties[subkey]?.description,
                type: obj.properties[key].items.properties[subkey]?.type,
              });
            }
          }
        }
        if (obj.properties[key]?.sort) {
          tableData.value[Number(obj.properties[key]?.sort)] = temp;
        } else {
          tableData.value.push(temp);
        }
      }
    }
  });
  const formRef = ref();

  const formTableRef = ref();

  const flowOptions = ref();

  const labelCol = { span: 4 };

  const tableData = ref<Array<any>>([]);

  const formState = reactive({
    key: '',
    id: '',
    name: '',
    type: 'MQTT',
    flowId: '',
    remark: '',
    mapping: '',
  });
  const columns = [
    {
      title: t('sys.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.platform.code'),
      dataIndex: 'code',
      key: 'code',
    },

    {
      title: t('sys.type'),
      dataIndex: 'type',
      key: 'type',
    },

    {
      title: t('sys.operation'),
      width: 200,
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const title = computed(() => {
    if (operateType.value === 'edit') {
      return t('sys.edit') + t('sys.developer.devive.index');
    }
    if (operateType.value === 'copy') {
      return t('sys.copy') + t('sys.developer.devive.index');
    }
    return t('sys.new') + t('sys.developer.devive.index');
  });

  const close = () => {
    formState.id = '';
    formState.flowId = '';
    formRef.value.resetFields();
    closeModal();
  };

  /** 快速创建参数 */
  const openAddParams = () => {
    openModal(true);
  };

  /** 添加参数 */
  const addParams = () => {
    openChooseModal(true, { selectedRow: tableData.value.filter((i) => i.type !== 'Array') });
  };

  const openParamsChoose = (record) => {
    openChooseModal(true, { selectedRow: record.children, key: record.key });
  };

  const handleRowDelete = (record) => {
    const arr = record.key.split(':');
    if (arr.length <= 1) {
      const filter = tableData.value.findIndex((i) => i.key === record.key);
      if (filter > -1) {
        tableData.value.splice(filter, 1);
        tableData.value = tableData.value.map((p, i) => {
          return {
            ...p,
            index: i,
          };
        });
      }
    } else {
      const filter = tableData.value.findIndex((i) => i.key === arr[0]);
      const filterChild = tableData.value[filter].children.findIndex((i) => i.key === record.key);
      if (filterChild > -1) {
        tableData.value[filter].children.splice(filterChild, 1);
        tableData.value = [...tableData.value];
      }
    }
  };

  const handleOk = () => {
    formRef.value?.validate().then(() => {
      formTableRef.value?.validate().then(() => {
        const codeArr = [];
        let flag = true;
        if (tableData.value.length) {
          const mapping = {
            type: 'Object',
            properties: {},
          };
          tableData.value.forEach((element, index) => {
            if (!flag) return;
            if (element.type !== 'Array') {
              mapping.properties[`$ref_${element.code}`] = {
                sort: index,
              };
            } else {
              // 编码不能重复
              if (codeArr.indexOf(element.code) > -1) {
                flag = false;
                message.warning('数据结构编码不能重复');
                return;
              }
              codeArr.push(element.code);
              mapping.properties[`${element.code}`] = {
                type: 'Array',
                items: {
                  type: 'Object',
                  properties: {},
                },
                sort: index,
              };
              if (element.children && element.children.length) {
                element.children.forEach((p, i) => {
                  mapping.properties[`${element.code}`].items.properties[`$ref_${p.code}`] = {
                    sort: i,
                  };
                });
              }
            }
          });

          formState.mapping = JSON.stringify(mapping);
        } else {
          formState.mapping = '';
        }
        if (flag) {
          loading.value = true;
          if (operateType.value === 'edit') {
            putDeviceInterconnectionById({ id: formState.id }, formState)
              .then(() => {
                message.success(t('sys.editSuccess'));
                emit('ok');
                close();
              })
              .finally(() => {
                loading.value = false;
              });
          } else {
            postDeviceInterconnection(formState)
              .then(() => {
                message.success(t('sys.createSuccess'));
                emit('ok');
                close();
              })
              .finally(() => {
                loading.value = false;
              });
          }
        }
      });
    });
  };
  /** 获取连接流树 */
  watch(
    () => formState.type,
    (val) => {
      if (val === 'IPAAS') {
        getFlowFlowCategoryTree().then((res) => {
          flowOptions.value = filterAndProcess(res || []);
        });
      }
    },
  );
  const filterAndProcess = (items) => {
    return items
      .map((item) => {
        // 递归处理子节点
        const processedChildren = item.child?.length ? filterAndProcess(item.child) : [];

        // 父是category且子为空数组，排除
        if (item.type === 'category' && processedChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          child: processedChildren,
          disabled: item.type === 'category',
        };
      })
      .filter(Boolean); // 过滤掉null/undefined
  };
  /** 添加数组结构 */
  const addArrayParams = () => {
    tableData.value.push({
      code: '',
      name: t('sys.developer.devive.arrayMapping'),
      type: 'Array',
      children: [],
      key: Date.now().toString(),
      index: tableData.value.length,
    });
    tableData.value = [...tableData.value];
  };

  /** 选择参数后续去重处理 */
  const chooseConfirm = (selectRow, key?) => {
    if (!key) {
      // 如果根据 id 判断唯一性
      const intersection = tableData.value.filter((item1) =>
        selectRow.some((item2) => item2.code === item1.code || item1.type === 'Array'),
      );

      tableData.value = [
        ...new Map([...intersection, ...selectRow].map((item) => [item.key, item])).values(),
      ];
    } else {
      const idx = tableData.value.findIndex((i) => i.key === key);
      // 如果根据 id 判断唯一性
      const intersection = tableData.value[idx].children
        ? tableData.value[idx].children.filter((item1) =>
            selectRow.some((item2) => item2.code === item1.code || item1.type === 'Array'),
          )
        : [];
      tableData.value[idx].children = [
        ...new Map([...intersection, ...selectRow].map((item) => [item.code, item])).values(),
      ];
      tableData.value[idx].children = tableData.value[idx].children.map((i) => {
        return {
          ...i,
          key: tableData.value[idx].key + ':' + i.key,
        };
      });
      tableData.value = [...tableData.value];
    }
  };

  const changeCode = (index, record) => {
    const filter = tableData.value.findIndex((i) => i.key === record.key);
    tableData.value[filter].code = record.code;
    tableData.value = [...tableData.value];
  };
</script>
<style lang="less" scoped>
  .title {
    font-weight: 600;

    &::before {
      content: '';
      display: inline-block;
      position: relative;
      top: 2px;
      width: 3px;
      height: 14px;
      margin-right: 8px;
      border-radius: 10px;
      background-color: var(--van-primary-color);
    }
  }

  :deep(.gct-iconfont) {
    font-size: 14px;
  }

  .table-form {
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
  }
</style>
<style>
  .device {
    .ant-popover-content {
      min-width: 236px;
    }
  }
</style>
