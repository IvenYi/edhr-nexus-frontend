<template>
  <div class="p24px pb-0">
    <div class="font-500">{{ t('sys.app.selectFieldTip') }}</div>
    <div class="p16px">
      <div v-show="selectedRows.length" class="ks-row-middle mb10px">
        {{ t('sys.pageDesigner.selected') }}
        <span class="pl4px pr4px primary-gct font-500 cursor-pointer" @click="viewDetail">{{
          selectedRows.length
        }}</span>
        {{ t('sys.pageDesigner.row') }}
        <div
          class="h16px w16px bg-[#E6E9EF] rounded-50% ks-row-middle ml8px cursor-pointer"
          @click="
            selectedRowKeys = [];
            selectedRows = [];
          "
        >
          <close-outlined :style="{ fontSize: '10px', color: '#797A7D' }" class="ks-col" />
        </div>
      </div>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        size="middle"
        :row-selection="{
          checkStrictly: true,
          preserveSelectedRowKeys: true,
          selectedRowKeys: selectedRowKeys,
          onChange: (keys: (string | number)[], stedRow: DigitsFieldDTO[]) => {
            selectedRowKeys = keys;
            selectedRows = stedRow;
          },
        }"
        :pagination="false"
        :scroll="{ y: 390 }"
        :custom-row="customRow"
      >
        <template
          #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        >
          <template v-if="column.dataIndex === 'type'">
            <div class="pt16px pb16px pl8px pr8px">
              <a-select
                ref="selectRef"
                :value="selectedKeys"
                mode="multiple"
                :maxTagCount="5"
                :maxTagTextLength="6"
                style="width: 140px"
                :placeholder="t('sys.chooseText')"
                show-arrow
                show-search
                allow-clear
                dropdownClassName="gct-custom-select-dropdown"
                @change="
                  (value) => {
                    setSelectedKeys(value);
                    // if (isEmpty(value)) confirm();
                  }
                "
                @blur="confirm()"
              >
                <a-select-option v-for="item in typeOptions" :value="item" :key="item">
                  {{ t(`sys.pageDesigner.fieldCmp.${item}`) }}
                </a-select-option>
              </a-select>
            </div>
          </template>
          <template v-else>
            <div class="pt16px pb16px pl8px pr8px">
              <a-input
                ref="searchInput"
                :placeholder="t('sys.inputText')"
                :value="selectedKeys[0]"
                style="width: 140px"
                @change="
                  (e) => {
                    setSelectedKeys(e.target.value ? [e.target.value] : []);
                    // if (!e.target.value) confirm();
                  }
                "
                @pressEnter="confirm()"
                @blur="confirm()"
              />
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <div class="mt8px mb4px font-500">{{ t('sys.app.batchModifying') }}</div>
    <div class="p16px">
      <a-form ref="formRef" :model="form">
        <a-form-item
          :label="t('sys.model.decimalDigits')"
          name="digits"
          :rules="[{ required: true }]"
        >
          <a-input-number
            id="inputNumber"
            v-model:value="form.digits"
            :min="0"
            :max="8"
            :precision="0"
            :placeholder="t('sys.inputText')"
            style="width: 388px !important"
          />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import {
    getDevopsListAllDigitsFields,
    postDevopsUpdateDigits,
  } from '/@/apis/gct-apaas/DevopsController';
  import { DigitsFieldDTO } from '/@/apis/gct-apaas/model';
  import selectedRowModal from './selected-row-modal.vue';
  import { useModal } from '@gct/runtime';
  import { message } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';

  const { t } = useI18n();
  const formRef = ref();
  const form = ref({});
  const dataSource = ref<DigitsFieldDTO[]>([]);
  const selectRef = ref();
  const searchInput = ref();
  const selectedRows = ref<DigitsFieldDTO[]>([]);
  const selectedRowKeys = ref<(string | number)[]>([]);

  const columns = [
    {
      title: t('sys.FieldName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      customFilterDropdown: true,
      onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            searchInput.value?.input.focus();
          }, 100);
        }
      },
    },
    {
      title: t('sys.keyOfSth', { sth: t('sys.field') }),
      dataIndex: 'ckey',
      key: 'ckey',
      ellipsis: true,
      customFilterDropdown: true,
      onFilter: (value, record) =>
        record.ckey.toString().toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            searchInput.value?.input.focus();
          }, 100);
        }
      },
    },
    {
      title: t('sys.typeOfSth', { sth: t('sys.field') }),
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
      customFilterDropdown: true,
      customRender: ({ text }) => {
        return t(`sys.pageDesigner.fieldCmp.${text}`);
      },
      onFilter: (value, record) => {
        return record.type === value;
      },
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            selectRef.value?.focus();
          }, 100);
        }
      },
    },
    {
      title: t('sys.category'),
      dataIndex: 'modelCategory',
      ellipsis: true,
      customRender: ({ text }) => {
        return 'entity' === text ? t('sys.model.entity') : t('sys.model.data');
      },
    },
    {
      title: t('sys.pageDesigner.soModelTitle'),
      dataIndex: 'modelName',
      key: 'modelName',
      ellipsis: true,
      customFilterDropdown: true,
      onFilter: (value, record) =>
        record.modelName.toString().toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            searchInput.value?.input.focus();
          }, 100);
        }
      },
    },
  ];

  const typeOptions = [FIELD_TYPE.DECIMAL, FIELD_TYPE.EXPRESSION, FIELD_TYPE.AGG];

  onMounted(() => {
    getTableData();
  });

  const getTableData = async () => {
    const res = await getDevopsListAllDigitsFields();
    dataSource.value = (res || []).map((e, i) => {
      e.ckey = e.key;
      e.key = i.toString();
      return e;
    });
  };

  // 自定义行属性 - 实现整行点击选中
  const customRow = (record) => {
    return {
      onClick: () => {
        const key = record.key;
        const keys = [...selectedRowKeys.value];
        if (keys.includes(key)) {
          // 取消选中
          selectedRowKeys.value = keys.filter((k) => k !== key);
        } else {
          // 选中行
          selectedRowKeys.value = [...keys, key];
        }
      },
    };
  };

  const viewDetail = async () => {
    await gct.openUtil.modal(
      selectedRowModal,
      {
        rows: selectedRows.value,
        keys: selectedRowKeys.value,
      },
      { width: 640, footer: false },
    );
  };

  const onSave = async () => {
    await formRef.value?.validate();
    if (!selectedRows.value.length) {
      message.warning('请至少选择一条数据');
      return { ok: false };
    }
    const data = cloneDeep(selectedRows.value);
    await postDevopsUpdateDigits({
      digits: form.value.digits,
      fieldMetas: data.map((e) => {
        e.key = e.ckey;
        delete e.ckey;
        return e;
      }),
    });
    message.success(t('sys.success'));
    return { ok: true };
  };

  useModal(onSave);
</script>
<style lang="less" scoped>
  :deep(.ant-table-filter-column) {
    // background-color: red !important;
    &:has(.active) {
      .ant-table-column-title {
        color: var(--ant-primary-color);
      }
    }
  }

  :deep(.ant-table-tbody > tr.ant-table-row-selected > td) {
    background: #e6eeff;
  }

  :deep(
    .ant-table-thead
      > tr
      > th:not(:last-child):not(.ant-table-selection-column):not(
        .ant-table-row-expand-icon-cell
      ):not([colspan])::before
  ) {
    width: 1px;
  }
</style>
