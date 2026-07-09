<template>
  <div class="mt20px flex-1 ks-column">
    <div class="flex-1">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item
            :label="$t('sys.integration.serverAddress')"
            :name="['authFormConfig', 0, 'value']"
            :rules="[
              {
                required: true,
                message: $t('sys.inputTextTip', { name: $t('sys.integration.serverAddress') }),
              },
            ]"
          >
            <a-input v-model:value="formState[0].value" />
          </a-form-item>
          <a-form-item
            :label="$t('sys.integration.systemNo')"
            :name="['authFormConfig', 1, 'value']"
            :rules="[
              {
                required: true,
                message: $t('sys.inputTextTip', { name: $t('sys.integration.systemNo') }),
              },
            ]"
          >
            <a-input v-model:value="formState[1].value" />
            <div class="text-12px text-[#C3C3C3] mt4px">
              {{ $t('sys.integration.systemNoTip') }}
            </div>
          </a-form-item>
          <a-form-item
            label="ClientID"
            :name="['authFormConfig', 2, 'value']"
            :rules="[{ required: true, message: $t('sys.inputTextTip', { name: 'ClientID' }) }]"
          >
            <a-input v-model:value="formState[2].value" />
            <div class="text-12px text-[#C3C3C3] mt4px">
              {{ $t('sys.integration.clientIDTip') }}
            </div>
          </a-form-item>
          <a-form-item
            :label="$t('sys.integration.db.username')"
            :name="['authFormConfig', 3, 'value']"
            :rules="[
              {
                required: true,
                message: $t('sys.inputTextTip', { name: $t('sys.integration.db.username') }),
              },
            ]"
          >
            <a-input v-model:value="formState[3].value" />
            <div class="text-12px text-[#C3C3C3] mt4px">
              {{ $t('sys.integration.userNameTip') }}
            </div>
          </a-form-item>
          <a-form-item
            :label="$t('sys.password')"
            :name="['authFormConfig', 4, 'value']"
            :rules="[{ required: true }]"
          >
            <a-input-password
              v-model:value="formState[4].value"
              :placeholder="$t('sys.inputTextTip', { name: $t('sys.password') })"
              autocomplete="new-password"
            />
          </a-form-item>
          <a-form-item :label="$t('sys.i18n.language')" :name="['authFormConfig', 5, 'value']">
            <a-select v-model:value="formState[5].value" :options="langOptions" />
          </a-form-item>
        </a-col>
      </a-row>
    </div>
    <div class="ks-row-center">
      <a-button :loading="isBtnLoading" @click="onTest">{{
        $t('sys.integration.db.testConnect')
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
  import { UrlInput } from '/@ipaas/comps';
  import { postAuthTestConnect } from '/@/apis/gct-ipaas2/AuthController';
  import { getController } from './logic';
  import { message } from 'ant-design-vue';
  import { pick } from 'lodash-es';

  const langOptions = [
    {
      value: 'ZH',
      label: $t('sys.zh'),
    },
    {
      value: 'EN',
      label: $t('sys.en'),
    },
  ];

  const emit = defineEmits(['save']);

  const props = withDefaults(
    defineProps<{
      data: IConnectorDesignerData;
    }>(),
    {},
  );

  const formState = computed(() => {
    return props.data.authFormConfig!;
  });

  const c = getController();
  const isBtnLoading = ref(false);

  /** 连接测试 */
  const onTest = async () => {
    await c.validateForm();
    isBtnLoading.value = true;
    const res: any = await postAuthTestConnect({
      ...pick(props.data, ['relationId', 'authFormConfig', 'authMode']),
    }).finally(() => {
      isBtnLoading.value = false;
    });
    if (res?.result) {
      message.success($t('sys.integration.testConnSuccess'));
    } else {
      message.error($t('sys.integration.testConnFailureTip2'));
    }
  };
</script>
<style lang="less" scoped></style>
