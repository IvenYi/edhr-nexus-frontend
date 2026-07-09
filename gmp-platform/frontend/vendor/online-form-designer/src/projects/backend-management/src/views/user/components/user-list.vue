<template>
  <div>
    <a-breadcrumb style="margin-bottom: 20px; min-height: 22px">
      <a-breadcrumb-item v-for="item in getTreeNamePathArr(selectTreeNode.node.id)" :key="item">{{
        item
      }}</a-breadcrumb-item>
    </a-breadcrumb>
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item name="username" :label="t('sys.userName')">
            <a-input v-model:value="formState.username" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item name="fullname" :label="t('sys.fullname')">
            <a-input v-model:value="formState.fullname" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item name="state" :label="t('sys.status')">
            <a-select v-model:value="formState.state">
              <a-select-option :value="-1">{{ t('sys.all') }}</a-select-option>
              <a-select-option :value="0">{{ t('sys.disabled') }}</a-select-option>
              <a-select-option :value="1">{{ t('sys.enable') }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8" v-show="expand">
          <a-form-item name="createTime" :label="t('sys.createTime')">
            <a-range-picker
              style="width: 100%"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
              :placeholder="[t('sys.startTime'), t('sys.endTime')]"
              v-model:value="formState.createTime"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8" v-show="expand">
          <a-form-item name="email" :label="t('sys.email')">
            <a-input v-model:value="formState.email" />
          </a-form-item>
        </a-col>
        <a-col :span="8" v-show="expand">
          <a-form-item name="email" :label="t('sys.mobile')">
            <a-input v-model:value="formState.mobile" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24" style="text-align: right">
          <a-button @click="() => formRef?.resetFields()">
            <template #icon>
              <undo-outlined />
            </template>
            {{ t('sys.reset') }}
          </a-button>
          <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
            <template #icon>
              <search-outlined />
            </template>
            {{ t('sys.query') }}
          </a-button>
          <a style="font-size: 12px" @click="expand = !expand">
            <template v-if="expand">
              <up-outlined />
            </template>
            <template v-else>
              <down-outlined />
            </template>
            {{ t('sys.contract') }}
          </a>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-wrap">
      <!-- :rowSelection="{ type: 'checkbox', fixed: true }" -->
      <basic-table
        :striped="false"
        :bordered="true"
        :showIndexColumn="false"
        :ellipsis="true"
        :dataSource="tableData"
        :columns="userColumns"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #headerTop>
          <a-button type="primary" class="btn" @click="addUser">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.org.addUser') }}
          </a-button>
          <!-- <a-button class="btn" @click="handleImport">
            <template #icon>
              <download-outlined />
            </template>
            导入
          </a-button> -->
          <custom-button
            :title="t('sys.import')"
            class="mr-8px"
            @btn-left-click="handleImport"
            @btn-right-click="handleDownloadTpl"
          >
            <template #left-icon>
              <download-outlined />
            </template>
            <template #right-icon>
              <vertical-align-bottom-outlined />
            </template>
          </custom-button>
          <a-button class="btn" @click="handleExport">
            <template #icon>
              <upload-outlined />
            </template>
            导出
          </a-button>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'state'">
            <a-switch
              v-model:checked="record.state"
              :checkedValue="0"
              :unCheckedValue="1"
              @change="(val: number) => handleChangeState(val, record)"
            />
          </template>
          <template v-else-if="column.key === 'departmentList'">
            <span>{{ text.join(',') }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <table-action-auto :actions="tableActions(record)" :stopButtonPropagation="true" />
          </template>
        </template>
      </basic-table>
    </div>
    <user-modal @register="userRegister" @ok="handleModalOk" />
    <import-modal
      @register="registerImportModal"
      @on-download-template="handleDownloadTpl"
      :show-error-msg="true"
      :uploadExtraProps="{
        customRequest: handleCustomRequest,
      }"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, onMounted, createVNode, computed } from 'vue';
  import { message, Modal, type FormInstance } from 'ant-design-vue';
  import {
    SearchOutlined,
    UndoOutlined,
    UpOutlined,
    DownOutlined,
    PlusOutlined,
    // DownloadOutlined,
    // UploadOutlined,
    ExclamationCircleOutlined,
  } from '@ant-design/icons-vue';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import dayjs from 'dayjs';
  import { userColumns } from '../constant/index';
  import { QueryDto, UserTableDto } from '../types/org-user.d';
  import UserModal from './user-modal.vue';
  import { useModal } from '/@/components/Modal';
  import {
    getUserListByPage,
    addOrEditUser,
    getUserById,
    deleteUser,
    changeUserState,
  } from '/@backend-management/api/org-user/user';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ImportModal } from '@/components/Import';
  import { postUserTmpl, postUserImport } from '/@/apis/gct-platform/UserController';
  import { downloadByData } from '/@/utils/file/download';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { CustomButton } from '/@/components/Button/index';

  const { t } = useI18n();
  const [registerImportModal, { openModal: openImportModal }] = useModal();
  const { getOrgDelUser } = useRootSetting();

  const { selectTreeNode, getTreeNamePathArr } = useTreeList();
  watch(
    () => selectTreeNode.node,
    () => {
      pagination.value.current = 1;
      getTableData();
    },
    { deep: true },
  );
  onMounted(() => {
    // getTableData();
  });

  //搜索过滤部分
  const expand = ref(false);
  const formRef = ref<FormInstance>();

  const formState = reactive<QueryDto>({
    fullname: '',
    username: '',
    createTime: [],
    state: -1,
    email: '',
    mobile: '',
  });
  const handleSearch = () => {
    formRef.value?.validate().then(() => {
      console.log(formState);
      console.log(dayjs(formState.createTime[0]).format('YYYY-MM-DD HH:mm:ss'));
      console.log(dayjs(formState.createTime[1]).format('YYYY-MM-DD HH:mm:ss'));
      getTableData();
    });
  };

  const tableActions = computed(() => (record) => {
    if (getOrgDelUser.value !== 1) {
      return [
        {
          label: t('sys.edit'),
          onClick: handleRowEdit.bind(null, record),
        },
      ];
    } else {
      return [
        {
          label: t('sys.edit'),
          onClick: handleRowEdit.bind(null, record),
        },
        {
          label: t('sys.delete'),
          color: 'error',
          popConfirm: {
            title: t('sys.sureToDelete'),
            confirm: handleRowDelete.bind(null, record),
          },
        },
      ];
    }
  });

  const tableData = ref<UserTableDto[]>([]);
  const getTableData = async (reload?) => {
    const { data, totalCount } = await getUserListByPage(
      {
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
      },
      {
        email: formState.email,
        startTime: formState.createTime[0],
        endTime: formState.createTime[1],
        fullname: formState.fullname,
        state: formState.state === -1 ? undefined : formState.state,
        username: formState.username,
        mobile: formState.mobile,
        orgId: selectTreeNode.node.id,
      },
    );
    // console.log('query', pagination.value, formState, selectTreeNode.node);
    pagination.value.total = totalCount;
    tableData.value = data;
  };
  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const handleTableChange = (paginationInfo) => {
    console.log('change', paginationInfo);
    pagination.value = paginationInfo;
    getTableData();
  };

  const handleChangeState = async (checkedVal: number, record) => {
    await changeUserState({
      userId: record.userId,
      state: checkedVal,
    });
  };

  const handleRowDelete = async (record) => {
    await deleteUser({ ids: record.userId });
    getTableData();
  };
  const handleRowEdit = async (record) => {
    const data = await getUserById({ userId: record.userId });
    console.log(data);
    openModal(true, data);
  };

  //弹框相关
  const [userRegister, { openModal }] = useModal();
  const addUser = () => {
    openModal();
  };
  const handleModalOk = async (formData) => {
    console.log(formData);
    await addOrEditUser(formData);
    getTableData();
  };

  // 导入
  const handleImport = () => {
    openImportModal();
  };

  // 导出模板
  const handleDownloadTpl = () => {
    exportData(false);
  };
  const handleExport = () => {
    exportData(true);
  };

  const exportData = async (isExportData: boolean) => {
    const data = {
      email: formState.email,
      startTime: formState.createTime[0],
      exportData: isExportData,
      endTime: formState.createTime[1],
      fullname: formState.fullname,
      state: formState.state === -1 ? undefined : formState.state,
      username: formState.username,
      mobile: formState.mobile,
      orgId: selectTreeNode.node.id,
    };
    const fileData = await postUserTmpl(data, {
      isTransformResponse: false,
      transferToConfig: {
        responseType: 'blob',
        responseEncoding: 'utf8',
      },
    });
    if (fileData) {
      downloadByData(fileData, {
        filename: '.xlsx',
        timestamp: true,
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      return true;
    }
    return false;
  };

  const handleCustomRequest = async (data) => {
    let formData: any = new FormData();
    formData.append('file', data.file);
    data.onProgress();
    const res: any = await postUserImport(formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    });
    if (res) {
      if (res.errors && res?.errors.length > 0) {
        data.onError(null, res.errors);
      } else {
        data.onSuccess();
      }
    }
  };
</script>

<style lang="less" scoped>
  .table-wrap {
    margin-top: 20px;

    .btn {
      margin-right: 8px;
    }
  }
</style>
