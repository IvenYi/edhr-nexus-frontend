<template>
  <a-drawer
    class="gct-page-modal"
    v-model:visible="visible"
    placement="right"
    :title="computedTitle"
    :maskStyle="{ backgroundColor: '#00000000' }"
    width="60%"
    :closable="false"
    @close="close"
  >
    <template #extra>
      <CloseOutlined @click="close()" />
    </template>
    <div class="modal-content">
      <a-form :model="formState" layout="vertical" ref="formRef">
        <a-form-item :label="t('sys.kit.qms.outOfControlReason')" required>
          <a-textarea v-model:value="formState.reason_" />
        </a-form-item>
        <a-form-item :label="t('sys.kit.qms.outOfControlMeasure')" required>
          <a-textarea v-model:value="formState.action_" />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div class="modal-footer">
        <a-button @click="reset()">{{ t('sys.reset') }}</a-button>
        <a-button type="primary" @click="handleSubmit()">{{ t('sys.submit') }}</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import { message } from 'ant-design-vue';

  const emit = defineEmits(['refresh']);

  const { t } = useI18n();

  const visible = ref(false);

  const formRef = ref<any>(null);

  const formState = ref<any>({
    reason_: '',
    action_: '',
    experience_library_id_: '',
  });

  const originData = ref<any>({});

  const computedTitle = computed(() => {
    return formState.value.id_ ? '编辑' : '新增';
  });

  async function open(libId, data?: any) {
    if (data) {
      formState.value = cloneDeep(data);
      originData.value = cloneDeep(data);
    }
    formState.value.experience_library_id_ = libId;
    visible.value = true;
  }
  function close() {
    formRef.value.resetFields();
    visible.value = false;
  }

  function handleSubmit() {
    const params = {
      ...formState.value,
    };
    formRef.value.validate().then(() => {
      postBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_experience',
          bsKey: 'submit',
        },
        params,
      )
        .then(async () => {
          message.success(t('sys.operatingTitle'));
          emit('refresh');
          close();
        })
        .catch(async () => {});
    });
  }

  function reset() {
    formState.value = formState.value.id_
      ? cloneDeep(originData.value)
      : {
          reason_: '',
          action_: '',
        };
    formRef.value.resetFields();
  }

  defineExpose({ open, close });
</script>
<style lang="less">
  .gct-page-modal {
    .ant-drawer-header {
      padding: 16px !important;
    }

    .ant-drawer-body {
      padding: 16px !important;
    }

    .modal-content {
      min-height: 100px;
      overflow: auto;
      height: calc(100% - 64px);
    }
    .ant-drawer-footer {
      padding: 16px;
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);
      .modal-footer {
        text-align: right;
        .ant-btn {
          margin-left: 16px;
        }
      }
    }
  }
</style>
