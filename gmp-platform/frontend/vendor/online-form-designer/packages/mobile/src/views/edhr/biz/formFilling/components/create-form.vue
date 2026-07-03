<template>
  <BasicDialog
    v-model:show="show"
    :showHeader="false"
    :showFooter="false"
    :popup-props="dialogProps"
    :extraStyle="{
      width: '570px',
    }"
  >
    <div class="bg-white" :style="{ '--van-cell-vertical-padding': '20px' }">
      <div class="text-center text-18px font-600 pt32px">
        {{ formData.ofInstId ? '编辑' : '新建' }}
      </div>
      <div class="px32px">
        <van-form ref="FormRef">
          <van-field
            :border="false"
            class="py20px"
            required
            is-link
            label="表单"
            readonly
            placeholder="请选择"
            input-align="right"
            v-model="formData.tmplName"
            :rules="[{ required: true, message: '请选择表单' }]"
            :disabled="editForm"
            @click="selectForm"
          />
          <van-field
            v-model="formData.title"
            :border="false"
            required
            label="备注名"
            placeholder="请输入"
            input-align="right"
            :rules="[{ required: true, message: '请输入备注人' }]"
          />
          <van-field
            v-model="formData.operatorRange"
            :border="false"
            required
            readonly
            is-link
            label="填报人"
            placeholder="请选择"
            input-align="right"
            :rules="[{ required: true, message: '请选择填报人' }]"
            @click="selectUser"
          >
            <template #input v-if="formData.operatorRange"> {{ userFullName }} </template>
          </van-field>
          <van-field
            :border="false"
            readonly
            is-link
            label="关联批次"
            placeholder="请选择"
            input-align="right"
            @click="selectRef"
          >
            <template #input v-if="formData.relatedMaterialNos?.length">
              <div class="ell max-w340px">{{ formData.relatedMaterialNos.join(',') }}</div>
            </template>
          </van-field>
        </van-form>
      </div>
      <div class="text-center py16px mt36px">
        <van-button class="w124px important-mr-16px h40px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button :loading="loading" class="w124px h40px" type="primary" @click="onOk"
          >确认</van-button
        >
      </div>
    </div>
  </BasicDialog>
</template>

<script setup lang="ts" name="user-select-popup">
  import { ref } from 'vue';
  import BasicDialog from '@mobile/views/edhr/_comps_/basic-dialog/index.vue';
  import {
    drawerSelectorInstance,
    CategoryModuleEnum,
  } from '@mobile/InstanceComponent/edhr-tmpl-picker';
  import { postOnlineFormInstanceTaskForm } from '/@/apis/gct-apaas/FormInstanceController';
  import { putOnlineFormInstanceTaskUpdate } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import SelectLotsnPopup from './produce-popup.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import { drawerSelectorInstance as drawerUserSelector } from '/@page-designer/components/drawerSelector';
  import {
    getDesignerCommonGetVisibleOrgUser,
    getDesignerCommonGetVisibleOrg,
    getDesignerCommonListUserByIds,
  } from '/@/apis/gct-apaas/DesignerCommonController';
  import { UserData } from '@mobile/stores/loginHooks';
  import { getFormRelateInfo } from '@mobile/apis/gct-apaas/FormRelateController';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

  const { businessSetting } = useBusinessSetting();
  const isControlled = !!businessSetting.enableDocControl;
  interface OnlineFormInsTaskRequest {
    formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
    ofInstId?: string; // 表单实例Id - 更新时传递
    operatorRange: string; // 填报人员范围
    relatedMaterialNos?: any[]; // 关联批次
    title?: string; // 任务标题
    tmplId?: string; // 表单模板ID
    tmplName?: string;
  }
  const props = withDefaults(
    defineProps<{
      editForm?: OnlineFormInsTaskRequest;
      onOk: (data?: any) => {};
    }>(),
    {},
  );

  const loading = ref(false);
  const show = ref(true);
  const FormRef = ref();

  const formData = reactive<OnlineFormInsTaskRequest>({
    formType: undefined,
    operatorRange: `USER:${UserData.value.userId}`,
    relatedMaterialNos: [],
    title: '',
    tmplId: '',
    tmplName: '',
  });
  /**填报人 */
  const userFullName = ref(UserData.value.fullname);
  const { openPicker } = drawerSelectorInstance({
    moduleType: CategoryModuleEnum.ONLINE_FORM,
    title: '选择表单模版',
    rdoVersion: true,
    isControlled,
  });
  const { openPicker: openUserPicker } = drawerUserSelector({
    title: '选择填报人',
    listType: 'user',
    async getOptionsByIds(ids) {
      const res = await getDesignerCommonListUserByIds({ ids: ids?.join(',') });
      const data = (res.data || res || []).map((i) => {
        return { label: i.__LABEL__!, value: i.id!, _protoValue: i };
      });
      return data;
    },
    async getOptions({ pageNumber, pageSize, query, searchValue }) {
      const orgIds = query.query.orgIds;
      const res = await getDesignerCommonGetVisibleOrgUser({
        pageNo: pageNumber,
        pageSize,
        orgIds,
        ignoreEnabled: 1,
        userName: searchValue,
      });
      return {
        options: res.data.map((i) => {
          return { ...i, _protoValue: i, label: i.__LABEL__, value: i.id };
        }),
        total: res.totalCount,
      };
    },
    multiple: true,
    searchable: true,
    paged: true,
  });

  const onCancel = () => {
    show.value = false;
  };
  const save = async () => {
    const saveApi = props.editForm
      ? putOnlineFormInstanceTaskUpdate
      : postOnlineFormInstanceTaskForm;
    return saveApi(formData);
  };
  const onOk = async () => {
    await FormRef.value?.validate();
    loading.value = true;
    try {
      const id = await save();
      props.onOk(id);
      onCancel();
    } catch (error) {
      loading.value = false;
    }
  };

  function selectForm() {
    if (props.editForm) return;
    openPicker(formData.tmplId).then((res: any) => {
      if (res) {
        const { id, name, version, formType } = res;
        formData.tmplId = id;
        formData.formType = formType;
        formData.tmplName = version ? `${name}:${version}` : name;
      }
    });
  }

  async function selectUser() {
    const data = await getDesignerCommonGetVisibleOrg();
    const orgIds = data.find((i) => i.parentId === 'ROOT')?.id;
    const value = formData.operatorRange
      ? formData.operatorRange.split(',').map((i) => i.replace('USER:', ''))
      : [];
    const { values, options } = await openUserPicker({
      value,
      queryData: { query: { orgIds } },
    });
    console.log(values, options);
    userFullName.value = options.map((i) => i.label).join(',');
    formData.operatorRange = values.map((i) => `USER:${i}`).join(',');
  }

  async function selectRef() {
    GctPopup.open(SelectLotsnPopup, {
      context: {
        relatedMaterialNos: formData.relatedMaterialNos,
      },
      onOk: (res) => {
        formData.relatedMaterialNos = res;
      },
    });
  }

  async function getTmplInfo(id) {
    if (!id) return;
    const res: any = await getFormRelateInfo({
      id,
      moduleType: 'online_form_module',
    });
    formData.tmplName = res?.version ? `${res.name}:${res.version}` : res.name;
  }

  onMounted(() => {
    if (props.editForm) {
      Object.assign(formData, props.editForm);
      const { tmplId } = props.editForm;
      const id = tmplId ? tmplId.split(':')[1] || tmplId.split(':')[0] : '';
      getTmplInfo(id);
    }
  });
</script>

<style lang="less" scoped>
  // .user-select-popup {
  //   background: url('@mobile/assets/ipad/pic_popup.png') no-repeat;
  //   background-position: top;
  //   background-size: 100%;
  // }

  :deep(.van-cell) {
    border-bottom: 1px solid #e0e3eb;
  }
</style>
