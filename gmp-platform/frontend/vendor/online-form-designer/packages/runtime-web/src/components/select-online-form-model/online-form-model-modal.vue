<template>
  <div class="ks-row">
    <div class="pt-20px px-20px gct-online-form-model-modal ks-col">
      <a-form :model="formState">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="表单分类">
              <a-tree-select
                v-model:value="formState.categoryId"
                placeholder="请选择表单分类"
                clearable
                show-search
                :tree-data="categoryList"
                tree-node-filter-prop="name"
                :fieldNames="{
                  label: 'name',
                  value: 'id',
                  children: 'child',
                }"
                @change="getDataSource"
              >
                <!-- <a-select-option :key="i.id" :value="i.id" v-for="i in categoryList">{{
                  i.name
                }}</a-select-option> -->
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="表单名称">
              <a-input
                v-model:value="formState.name"
                placeholder="请输入表单名称"
                clearable
                @keyup.enter="getDataSource"
                @change="getDataSource"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <vxe-table
        ref="tableRef"
        show-overflow
        :data="tableData"
        :height="400"
        :scroll-y="{ enabled: true, oSize: 10 }"
        :row-config="{ isHover: true, keyField: 'id', height: 44, isCurrent: true }"
        :class="{
          vxetable: true,
          default: true,
        }"
        @cell-click="cellClickEvent"
      >
        <vxe-column field="name" title="表单名称" show-overflow tree-node>
          <template #default="{ row }">
            <div class="ks-row">
              <a-tooltip>
                <template #title>{{ row.version || row.name }}</template>
                <div class="gct-text-overflow">{{ row.version || row.name }}</div>
              </a-tooltip>
              <div v-if="row.default" class="gct-custom-tag ml4px">{{ t('sys.default') }}</div>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="formType" title="表单类型" show-overflow width="120">
          <template #default="{ row }">
            <div class="flex items-center" v-if="row.formType">
              <img :src="svgUtils[row.formType]" class="w18px h18px mr-4px" />
              {{ t(`sys.onlineForm.formTypeEnum.${row.formType}`) }}
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <div class="model-list w280px h520px">
      <div class="model-title">选择模型</div>
      <div class="model-table-wrap">
        <div
          v-for="item in modelTableData"
          :key="item.key"
          class="model-table-row ks-row"
          :class="{ selected: item.key === modelKey }"
          @click="modelKey = item.key"
        >
          <div
            class="model-tag mr8px"
            :style="{
              '--tag-bg': item.subModel === 1 ? '#0066FF' : '#B445F5',
            }"
          >
            {{ item.subModel === 1 ? '子表' : '主表' }}
          </div>
          <div class="ks-col ell" :title="item.name">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="online-form-model-modal">
  import { nextTick, onMounted, ref, watch, reactive, toRaw } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, IModal, getInterfaceApi } from '@gct/runtime';
  import { VxeTableInstance } from 'vxe-table';
  import {
    getOnlineFormTmplFormModelsById,
    getOnlineFormTmplListBaseAndProcessForm,
  } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { FormTypeEnum } from '@gct/nocode-base';
  import ViewOnlineForm from '/@web-render/assets/svg/view-online-form.svg';
  import TextOnlineForm from '/@web-render/assets/svg/text-online-form.svg';
  import ProccessOnlineForm from '/@web-render/assets/svg/proccess-online-form.svg';
  import BaseOnlineForm from '/@web-render/assets/svg/base-online-form.svg';
  import FileOnlineForm from '/@web-render/assets/svg/file-online-form.svg';
  import { ModelBriefInfo } from '/@/apis/gct-apaas/model';
  import { orderBy } from 'lodash-es';

  const svgUtils = {
    [FormTypeEnum.TEXT]: TextOnlineForm,
    [FormTypeEnum.BASE]: BaseOnlineForm,
    [FormTypeEnum.PROCESS]: ProccessOnlineForm,
    [FormTypeEnum.VIEW]: ViewOnlineForm,
    [FormTypeEnum.FILE]: FileOnlineForm,
  };

  const { t } = useI18n();

  interface IRowVO {
    id: string;
    name: string;
    desc: string;
    modifier: string;
    modifyTime: string;
    default?: number;
    categoryId?: string;
    children?: IRowVO[];
  }

  const props = defineProps<{
    modal: IModal;
    modelSelected?: string;
    formSelected?: string;
  }>();
  const keys = ['name', 'code'];
  const tableRef = ref<VxeTableInstance>();
  const categoryList = ref([]);
  const formState = ref({});

  const tableData = ref<IRowVO[]>([]);
  const modelTableData = ref<ModelBriefInfo[]>([]);
  const modelKey = ref();
  const formId = ref();
  watch(modelKey, (k) => {
    props.modal.setOptions({
      okButtonProps: {
        disabled: !k,
      },
    });
  });

  /**获取表单分类 */
  async function getCategoryList() {
    categoryList.value = await getInterfaceApi.getCategoryList({
      moduleType: 'online_form_module',
    });
  }
  onMounted(async () => {
    getCategoryList();
    await getDataSource();
    const row = props.formSelected?.id
      ? tableData.value.find((i) => i.id === props.formSelected?.id)
      : tableData.value[0];
    tableRef.value.setCurrentRow(row);
    await cellClickEvent({ row });
    modelKey.value = props.modelSelected;
  });

  async function getDataSource() {
    keys.forEach((key) => {
      if (formState.value[key]) {
        formState.value[key] = formState.value[key].trim();
      }
    });
    tableData.value = (await getOnlineFormTmplListBaseAndProcessForm(formState.value)) || [];
  }

  const onSave = () => {
    return {
      ok: true,
      params: { modelKey: modelKey.value, formId: formId.value },
    };
  };
  async function cellClickEvent({ row }) {
    if (formId.value === row.id) return;
    formId.value = row.id;
    const data = await getOnlineFormTmplFormModelsById({ id: row.id });
    modelTableData.value = orderBy(data, 'subModel', 'asc');
    modelKey.value = '';
  }
  useModal(onSave);
</script>
<style lang="less" scoped>
  .gct-online-form-model-modal {
    border-right: 1px solid #f0f0f0;
    :deep(.vxe-table) {
      --vxe-table-row-hover-radio-checked-background-color: hsl(
        from var(--ant-primary-color) h s 94%
      );
      --vxe-table-row-radio-checked-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-row-checkbox-checked-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-row-hover-checkbox-checked-background-color: hsl(
        from var(--ant-primary-color) h s 94%
      );
      --vxe-table-row-current-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-row-hover-current-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-header-background-color: #f6f8faff;
    }

    :deep(.gct-text-overflow) {
      color: #212528;
    }

    :deep(.vxe-cell--label) {
      color: #212528;
    }

    :deep(.vxe-table--render-default .is--checked.vxe-cell--radio .vxe-radio--icon) {
      color: var(--ant-primary-color);
    }

    :deep(.vxe-tree--node-btn.rotate90) {
      color: var(--ant-primary-color);
    }

    :deep(.ant-form) {
      .ant-form-item {
        margin-bottom: 15px;
      }
      .ant-form-item-label {
        padding: 0;
      }

      .ant-form-item .ant-form-item-label > label {
        &::after {
          display: block;
        }
      }
    }

    // 禁用时候的单选框的样式调整
    :deep(.vxe-table--render-default .vxe-cell--radio.is--disabled) {
      .vxe-radio--icon {
        position: relative;
        &::after {
          content: '';
          background-color: rgba(0, 0, 0, 0.06);
          border-color: #d9d9d9;
          cursor: not-allowed;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: inline-block;
          position: absolute;
          top: 2px;
          left: 2px;
        }
      }
    }
  }
  .model-list {
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .model-title {
      color: #212528;
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 16px 20px;
      font-weight: 500;

      &::before {
        content: ' ';
        display: inline-block;
        width: 2px;
        height: 12px;
        background-color: var(--ant-primary-color);
        margin-right: 8px;
        vertical-align: -1px;
      }
    }

    .model-table-wrap {
      overflow: auto;
      padding: 0 12px;
      flex: 1;
    }
    .model-table-row {
      padding: 9px 12px;
      border-radius: 4px;
      cursor: pointer;
      align-items: center;

      &.selected {
        color: var(--ant-primary-color);
        background: hsl(from var(--ant-primary-color) h s 94%);
      }

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .model-tag {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ffffff;
        background-color: var(--tag-bg, #0066ff);
        border-radius: 2px;
        font-size: 10px;
        padding: 0 4px;
        height: 16px;
      }
    }
  }
</style>
