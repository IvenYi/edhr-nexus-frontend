<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="title"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.appDesigner.sandboxName')"
        name="name"
        :rules="[
          {
            required: true,
          },
          maxValidate,
        ]"
      >
        <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item :label="t('sys.ipaas.domain')" name="path">
        <div class="text-[#8B8B8B] pt5px pb8px">应用前台</div>
        <div class="pb8px">
          <i class="gct-iconfont icon-yemiansheji-Web"></i>
          Web：{{ path.webRoutePath }}
        </div>
        <div v-if="appInfoStore.appInfo.mobileEnabled" class="pb8px">
          <i class="gct-iconfont icon-yemiansheji-PDA"></i>
          PDA：{{ path.pdaRoutePath }}
        </div>
        <div v-if="appInfoStore.appInfo.mobileEnabled">
          <i class="gct-iconfont icon-yemiansheji-Pad"></i>
          Pad：{{ path.padRoutePath }}
        </div>
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.printDesign.form.desc')"
        name="description"
        :rules="[
          {
            required: true,
          },
          { max: 1000, message: '最大1000字' },
        ]"
      >
        <a-textarea
          v-model:value="formState.description"
          :rows="3"
          :placeholder="t('sys.inputText')"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>
<script setup lang="ts">
  import { computed, ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { FormInstance, message } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { putSandboxConfigById } from '/@/apis/gct-apaas/SandboxConfigController';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const emit = defineEmits(['ok', 'create']);

  const { t } = useI18n();

  const appInfoStore = useAppInfoStore();

  /** 最大字符数校验 */
  const maxValidate = { max: 100, message: t('sys.max100') };

  const [registerInner, { closeModal }] = useModalInner((data) => {
    Object.assign(formState, data, path.value);
  });

  const formRef = ref<FormInstance>();

  const formState = reactive({
    id: '',
    name: '',
    padRoutePath: '',
    pdaRoutePath: '',
    webRoutePath: '',
    description: '',
  });

  const title = computed(() => {
    return formState.id ? t('sys.appDesigner.sandboxEdit') : t('sys.appDesigner.sandboxCreate');
  });
  const path = computed(() => {
    return {
      webRoutePath: `/web-sandbox/${appInfoStore?.appInfo?.id}#/login`,
      pdaRoutePath: appInfoStore.appInfo.mobileEnabled
        ? `/mobile-sandbox/${appInfoStore?.appInfo?.id}/#/login`
        : '',
      padRoutePath: appInfoStore.appInfo.mobileEnabled
        ? `/pad-sandbox/${appInfoStore?.appInfo?.id}/#/login`
        : '',
    };
  });
  const handleOk = async () => {
    await formRef.value?.validate();

    if (!formState.id) {
      console.log(formState, 888888888888);
      emit('create', formState);
      handleClose();
    } else {
      await putSandboxConfigById({ id: formState.id }, formState);
      message.success('编辑成功');
      emit('ok');

      handleClose();
    }
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.id = '';
    closeModal();
  };
</script>
<style lang="less" scoped>
  .gct-iconfont {
    margin-right: 4px;
    color: #8b8b8b;
  }
</style>
