<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('模型赋值')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-button type="primary" class="mr-8px" @click="handleAdd">
      <template #icon>
        <plus-outlined />
      </template>
      添加</a-button
    >
    <a-button :disabled="selectedRowKeys.length === 0" danger @click="handleDelete">
      <template #icon>
        <delete-outlined />
      </template>
      删除</a-button
    >
    <a-table
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      class="mt-12px"
      :columns="columns"
      row-key="key"
      :data-source="dataSource"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'literal'">
          <edit-outlined class="edit-btn" @click="handleEdit(record)" />{{ record.literal }}
        </template>
      </template>
    </a-table>
  </basic-modal>
  <field-assign-modal @register="register" />
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModelFields } from '../../hooks/useModelFields';
  import FieldAssignModal from './field-assign-modal.vue';
  import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons-vue';

  // import {} from 'useModelFields'
  const { getModelFields } = useModelFields();
  const [register, { openModal }] = useModal();

  defineEmits(['register']);

  const columns = [
    {
      title: '字段KEY',
      dataIndex: 'key',
      // sorter: true,
      width: '20%',
    },
    {
      title: '字段名称',
      dataIndex: 'name',
      width: '20%',
      customRender: ({ record }) => {
        return record.rawField.name;
      },
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      width: '15%',
      customRender: ({ record }) => {
        return record.rawField.type;
      },
    },
    {
      title: '值',
      key: 'literal',
      dataIndex: 'literal',
    },
  ];

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((payload: Options) => {
    if (payload === undefined) return;
    options = payload;
    dataSource.value = payload.data ?? [];
  });

  interface Fields {
    key: string;
    literal: string;
    rawField: any;
  }

  interface Options {
    data?: Fields[]; // 数据
    model: string; // 模型
    callback: (data: Fields[]) => void; // 回调
  }

  type Key = string | number;

  let options: Partial<Options> = {};
  const dataSource = ref<Fields[]>([]);
  const selectedRowKeys = ref<Key[]>([]);

  const handleClose = () => {
    options = {};
    dataSource.value = [];
  };

  const handleAdd = async () => {
    const existFields = dataSource.value.map((item) => item.key);
    const fields = (await getModelFields(options.model!)).filter(
      (item) => !existFields.includes(item.key),
    );
    openModal(true, {
      fields,
      callback: (data) => {
        dataSource.value.push(data);
      },
    });
  };

  const onSelectChange = (keys: Key[]) => {
    selectedRowKeys.value = keys;
  };

  const handleEdit = async (record) => {
    const fields = await getModelFields(options.model!);
    openModal(true, {
      data: record,
      fields,
      callback: (data) => {
        const record = dataSource.value.find((item) => item.key === data.key);
        if (!record) return;
        Object.assign(record, {
          ...data,
        });
      },
    });
  };

  const handleDelete = () => {
    dataSource.value = dataSource.value.filter((i) => !selectedRowKeys.value.includes(i.key));
    selectedRowKeys.value = [];
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      changeOkLoading(false);
      if (options.callback && typeof options.callback === 'function') {
        options.callback(dataSource.value);
      }
      closeModal();
    } catch (err) {
      console.log(err);
      changeOkLoading(false);
    }
  };
</script>

<style scoped lang="less">
  .edit-btn {
    margin-right: 10px;
    color: var(--ant-primary-color);
    cursor: pointer;
  }
</style>
