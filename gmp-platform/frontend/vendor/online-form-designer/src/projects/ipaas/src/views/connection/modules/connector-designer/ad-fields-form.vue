<template>
  <div class="mt20px flex-1 ks-column">
    <div class="flex-1">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item
            :label="$t('sys.integration.serverAddress')"
            name="loginAddress"
            :rules="[
              {
                required: true,
                message: $t('sys.inputTextTip', { name: $t('sys.integration.serverAddress') }),
              },
            ]"
          >
            <ServiceAddrInput v-model:value="formState.loginAddress" />
          </a-form-item>
          <a-form-item
            :label="$t('sys.integration.loginAccount2')"
            :name="['authFormConfig', 0, 'value']"
            :rules="[{ required: true }]"
          >
            <a-input
              v-model:value="formState.authFormConfig[0].value"
              :placeholder="$t('sys.inputTextTip', { name: $t('sys.integration.loginName4DN') })"
            />
            <div class="text-12px text-[#C3C3C3] mt4px">
              {{ $t('sys.integration.loginName4DNTip') }}
            </div>
          </a-form-item>
          <a-form-item
            :label="$t('sys.platform.loginPassword')"
            :name="['authFormConfig', 1, 'value']"
            :rules="[{ required: true }]"
          >
            <a-input
              v-model:value="formState.authFormConfig[1].value"
              :placeholder="$t('sys.inputTextTip', { name: $t('sys.platform.loginPassword') })"
              :type="showPwd ? 'text' : 'password'"
              autocomplete="new-password"
            >
              <template #suffix>
                <span class="cursor-pointer" @click="showPwd = !showPwd">
                  <i v-if="!showPwd" class="iconfont icon-baomi"></i>
                  <i v-else class="iconfont icon-chakan1"></i>
                </span>
              </template>
            </a-input>
          </a-form-item>
        </a-col>
      </a-row>
    </div>
    <div class="ks-row-center">
      <a-button :loading="isBtnLoading" @click="onTestAD">{{
        $t('sys.integration.testADConnection')
      }}</a-button>
      <a-button type="primary" class="ml20px" @click="emit('save')">
        {{ $t('sys.saveText') }}
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { IConnectorDesignerData } from './type';
  import ServiceAddrInput from './service-addr-input.vue';
  import { postAuthTestConnect } from '/@/apis/gct-ipaas2/AuthController';
  import { getController } from './logic';
  import { message } from 'ant-design-vue';
  import { pick } from 'lodash-es';

  const emit = defineEmits(['save']);

  const props = withDefaults(
    defineProps<{
      data: IConnectorDesignerData;
    }>(),
    {},
  );

  const c = getController();

  const showPwd = ref(false);
  const isBtnLoading = ref(false);

  const formState = computed({
    get() {
      return props.data;
    },
    set(v) {
      Object.assign(props.data, v);
    },
  });

  const onTestAD = async () => {
    await c.validateForm();
    isBtnLoading.value = true;
    const res: any = await postAuthTestConnect({
      ...pick(formState.value, ['relationId', 'authFormConfig', 'authMode', 'loginAddress']),
    }).finally(() => {
      isBtnLoading.value = false;
    });
    if (res?.result) {
      message.success($t('sys.integration.testConnSuccess'));
    } else {
      message.error($t('sys.integration.testConnFailureTip'));
    }
  };
</script>
<style lang="less" scoped></style>
