<template>
  <basic-page>
    <a-spin :spinning="spinning">
      <div class="w-400px ml-72px pt-40px">
        <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
          <a-form-item
            :label="
              t('sys.nameOfSth', {
                sth: t('sys.tenant.index'),
              })
            "
            name="name"
            :rules="[{ required: true }]"
          >
            <a-input v-model:value="formState.name" :maxlength="32" show-count />
          </a-form-item>

          <a-form-item label="租户标识">
            <CopyModuleKey :module-key="formState.id" />
          </a-form-item>

          <template v-if="!isHostMode">
            <a-form-item
              name="domainPrefix"
              :rules="[
                { required: true, message: t('sys.notEmptySth', { sth: t('sys.tenantDomains') }) },
                {
                  pattern: domainPrefixReg,
                  message: t('租户域名只能输入小写字母及数字'),
                },
              ]"
            >
              <template #label>
                <div class="flex items-center">
                  <span>{{ t('sys.tenantDomains') }}</span>
                  <span
                    class="ml-12px text-12px"
                    :style="{
                      color: '#999',
                    }"
                    >提示：租户域名只可修改一次</span
                  >
                </div>
              </template>
              <a-input
                v-model:value="formState.domainPrefix"
                :maxlength="16"
                show-count
                :addon-before="prefix"
                :addon-after="suffix"
                :disabled="domainDisabled"
              />
            </a-form-item>

            <a-form-item label="租户验证域名">
              <CopyModuleKey :module-key="testDomain" />
            </a-form-item>

            <a-form-item label="">
              <a-button class="mr-8px" type="primary" @click="handleOk">{{
                t('sys.saveText')
              }}</a-button>
              <a-button @click="handleReset">{{ t('sys.reset') }}</a-button>
            </a-form-item>
          </template>
        </a-form>
      </div>
    </a-spin>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    getTenantInfoById,
    putTenantUpdateDomainById,
  } from '/@/apis/gct-platform/TenantController';
  import type { TenantResponse } from '/@/apis/gct-platform/model';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const userStore = useUserStoreWithOut();
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const { isHostMode, platformOrigin } = useEnv();

  const spinning = ref<boolean>(false);
  let tenantDataBak: any = null;

  const prefix = platformOrigin.split('//')[0] + '//';
  const suffix = platformOrigin.substr(platformOrigin.indexOf('.', platformOrigin.indexOf('.')));

  const formRef = ref();
  const formState = reactive<TenantResponse>({
    name: undefined,
    domainPrefix: undefined,
  });
  const domainDisabled = ref<boolean>(true);

  const domainPrefixReg = /^[a-z0-9]+$/;

  const testDomain = computed(() => {
    if (formState.domainPrefix && domainPrefixReg.test(formState.domainPrefix!)) {
      return `${prefix}${formState.domainPrefix}-test${suffix}`;
    } else {
      return '';
    }
  });

  onMounted(() => {
    getTenantInfoById({
      id: userStore.getTenant as unknown as string,
    }).then((res) => {
      tenantDataBak = res;
      Object.assign(formState, tenantDataBak);
      domainDisabled.value = !!res?.domainPrefix;
    });
  });

  const handleOk = async () => {
    spinning.value = true;
    const data = {
      name: formState.name,
      domainPrefix: formState.domainPrefix,
    };
    try {
      await formRef.value?.validate();
      await putTenantUpdateDomainById(
        {
          id: userStore.getTenant as unknown as string,
        },
        data,
      );
      createMessage.success(t('sys.operationSuccess'));
      // 保存成功更新备份数据
      Object.assign(tenantDataBak, data);
      // 禁用域名输入
      domainDisabled.value = true;
    } catch (err) {
      console.warn(err);
    } finally {
      spinning.value = false;
    }
  };

  const handleReset = () => {
    Object.assign(formState, tenantDataBak);
  };
</script>

<style></style>
