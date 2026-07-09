<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.removeAndHandover')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState">
      <a-table
        :striped="false"
        :bordered="true"
        :showIndexColumn="false"
        :ellipsis="true"
        :columns="columns"
        :dataSource="formState.appMemberPOList"
        :pagination="false"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'userId'">
            <a-form-item :name="['appMemberPOList', index, 'userId']" :rules="[{ required: true }]">
              <a-select style="width: 100%" v-model:value="record.userId">
                <a-select-option
                  v-for="item in developerList"
                  :value="item.userId"
                  :key="item.userId"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </template>
        </template>
      </a-table>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import type { TenantDeveloperDTO } from '/@/apis/gct-platform/model';
  import {
    getTenantDeveloperPageList,
    postTenantDeveloperREmoveAndHandover,
  } from '/@/apis/gct-platform/TenantDeveloperController';
  import { AppClassifyEnum } from '/@/components/AppManageCmp/src/constant/interface';

  const emit = defineEmits(['refresh']);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    const { record } = data;
    // 清除用户
    const formData = cloneDeep(record);
    formData.appMemberPOList = formData.appMemberPOList.map((item) => {
      item.userId = undefined;
      return item;
    });
    formState.value = formData;
    getTenantDeveloperPageList({
      pageNo: 1,
      pageSize: 9999,
    }).then((res) => {
      developerList.value = res!.data.filter((item) => item.userId !== record.userId);
    });
  });

  const columns = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.app.index') }),
      customRender: ({ record }) => record.appData.name,
    },
    {
      title: t('sys.app.type'),
      customRender: ({ record }) => {
        switch (record.appData.type) {
          case AppClassifyEnum.Pro:
            return t('sys.app.pro');
          case AppClassifyEnum.Micro:
            return t('sys.app.micro');
          case AppClassifyEnum.Bi:
            return t('sys.app.bi');
          default:
            return record.appData.type;
        }
      },
    },
    {
      title: t('sys.app.id'),
      dataIndex: 'appId',
    },
    {
      width: 200,
      title: t('交接人'),
      key: 'userId',
    },
  ];

  const formRef = ref<FormInstance>();
  const formState = ref<TenantDeveloperDTO>({});
  const developerList = ref<TenantDeveloperDTO[]>([]);

  const handleClose = () => {
    formState.value = {};
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postTenantDeveloperREmoveAndHandover({
        id: formState.value.id,
        removeAndHandoverDtoList: formState.value.appMemberPOList?.map((item) => ({
          appId: item.appId,
          userId: item.userId,
        })),
      });
      message.success(t('sys.operationSuccess'));
      closeModal();
      emit('refresh');
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less" scoped>
  .ant-form-item {
    margin-bottom: 0;

    :deep(.ant-form-item-explain) {
      display: none;
    }
  }
</style>
