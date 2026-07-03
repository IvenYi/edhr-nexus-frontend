<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :getContainer="getModalContainer"
    :title="t('sys.integration.cipher') + t('sys.integration.authorize')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="authorize-modal-wrap">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
        <a-form-item
          :label="t('sys.integration.authorizeUser')"
          name="accessUserId"
          :rules="[
            { required: true, message: t('sys.chooseText') + t('sys.integration.authorizeUser') },
          ]"
        >
          <a-select
            v-model:value="formState.accessUserId"
            :filter-option="filterOption"
            :placeholder="t('sys.pleaseInputSth', { sth: t('sys.accountOrName') })"
            show-search
            allowClear
            style="width: 60%"
            option-label-prop="fullname"
            :options="userOptions"
            @change="handleChange"
          >
            <template #option="{ avatar, fullname, username }">
              <div :class="prefixCls">
                <img :class="`${prefixCls}__avator`" :src="avatar" />
                <div :class="`${prefixCls}__info`">
                  <span :class="`${prefixCls}__name`">{{ fullname }}</span>
                  <span :class="`${prefixCls}__account`">{{ username }}</span>
                </div>
              </div>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
      <div class="transfer-title">{{ t('sys.integration.authorizeInterface') }}</div>
      <a-tabs v-model:activeKey="activeKey" v-if="tabShow">
        <a-tab-pane key="1" :tab="t('sys.appDesigner.testEnv')">
          <Transfer
            ref="testRef"
            v-model:value="testKeys"
            :options="formState.testApis"
            env="test"
            :is-tree="true"
          />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.appDesigner.productionEnv')">
          <Transfer
            ref="prodRef"
            v-model:value="prodKeys"
            :options="formState.prodApis"
            env="prod"
            :is-tree="true"
          />
        </a-tab-pane>
        <a-tab-pane key="3" :tab="t('sys.integration.tenantInterface')">
          <Transfer
            ref="tenantRef"
            v-model:value="tenantKeys"
            :options="formState.tenantApis"
            env="tenant"
            :is-tree="false"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { onMounted, ref, reactive } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import Transfer from './transfer.vue';
  import { getUserListByTenantId } from '/@/apis/gct-platform/UserController';
  import { UserResponse, OpenapiKeyGrantResponse } from '/@/apis/gct-platform/model/index';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import DefaultAvator from '/@/assets/images/header.jpg';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    putOpenapiKeyGrantById,
    getOpenapiKeyGrantInfo,
  } from '/@/apis/gct-platform/OpenapiKeyGrantController';

  const { t } = useI18n();

  const props = defineProps<{
    getContainer?: HTMLElement;
  }>();

  const emit = defineEmits(['register', 'ok']);
  const activeKey = ref('1');
  const prefixCls = 'auth-user-info';
  const formState = reactive({
    accessUserId: '',
    accessUserName: '',
    prodApis: [],
    testApis: [],
    tenantApis: [],
  });
  const pid = ref();
  const userOptions = ref<any[]>([]);
  const testKeys = ref<any[]>([]);
  const prodKeys = ref<any[]>([]);
  const tenantKeys = ref<any[]>([]);
  const formRef = ref<FormInstance>();
  const testRef = ref<any>();
  const prodRef = ref<any>();
  const tenantRef = ref<any>();
  const tabShow = ref(true);

  const getModalContainer = () => {
    return props.getContainer || document.body;
  };

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    tabShow.value = true;
    activeKey.value = '1';
    await getUserOpts();
    if (data) {
      pid.value = data.id;
      const res: OpenapiKeyGrantResponse = (await getOpenapiKeyGrantInfo({ id: data.id })) || {};
      const obj = {
        accessUserId: res.accessUserId,
        accessUserName: res.accessUserName,
        prodApis: res.prodApis || [],
        testApis: res.testApis || [],
        tenantApis: res.tenantApis || [],
      };
      Object.assign(formState, obj);
      prodKeys.value = res.prodApis ? res.prodApis.map((i) => i.id) : [];
      testKeys.value = res.testApis ? res.testApis.map((i) => i.id) : [];
      tenantKeys.value = res.tenantApis ? res.tenantApis.map((i) => i.key) : [];
    }
  });

  onMounted(() => {
    // getUserOpts();
  });

  const getUserOpts = async (str?: string) => {
    const res: UserResponse[] =
      (await getUserListByTenantId({ fullname: str, username: str })) || [];
    userOptions.value = res.map((i) => {
      const url = i.avatar ? transformUrl(i.avatar) : DefaultAvator;
      return { value: i.id, avatar: url, fullname: i.fullname, username: i.username };
    });
  };

  const filterOption = (input: string, option: any) => {
    const findItem: UserResponse = userOptions.value.find((i) => i.value === option.value) || {};
    return (
      (findItem.fullname || '').indexOf(input) > -1 || (findItem.username || '').indexOf(input) > -1
    );
  };

  const handleChange = (val) => {
    formState.accessUserName = userOptions.value.find((i) => i.value === val)?.fullname;
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.prodApis = [];
    formState.testApis = [];
    formState.tenantApis = [];
    tabShow.value = false;
  };

  const handleOk = async () => {
    prodRef.value?.getCheckedOpts() && (formState.prodApis = prodRef.value?.getCheckedOpts());
    testRef.value?.getCheckedOpts() && (formState.testApis = testRef.value?.getCheckedOpts());
    tenantRef.value?.getCheckedOpts() && (formState.tenantApis = tenantRef.value?.getCheckedOpts());
    await formRef.value?.validate();
    await putOpenapiKeyGrantById({ id: pid.value }, { ...formState });
    emit('ok');
    closeModal();
  };
</script>

<style lang="less" scoped>
  .authorize-modal-wrap {
    padding: 6px 20px;
    .transfer-title {
      font-weight: 500;
      margin-bottom: 12px;
    }
    :deep(.ant-tabs) {
      border: 1px solid #e0e3ea;
      border-radius: 4px;
      .ant-tabs-nav {
        padding-left: 12px;
        margin-bottom: 0;
      }
    }
  }
  @prefix-cls: ~'auth-user-info';
  .@{prefix-cls} {
    display: flex;
    align-items: center;

    &__avator {
      height: 28px;
      width: 28px;
      border-radius: 50%;
      margin-right: 12px;
    }
    &__info {
      font-size: 14px;
      line-height: 18px;
      & > span {
        display: block;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    &__account {
      // color: rgba(255, 255, 255, 0.64);
      transition: all 0.3s;
    }
  }
</style>
