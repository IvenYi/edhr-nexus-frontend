<template>
  <div :class="[ns.b(), ns.is('designing', !!currentConfigData)]">
    <div :class="[ns.e('designer-content')]">
      <div :class="ns.e('header')">
        <div :class="ns.e('header-title')">
          {{ t('sys.integration.connectorConfig') }}
        </div>
        <div :class="ns.e('header-actions')">
          <a-button type="primary" @click="onBack">{{ t('sys.back') }}</a-button>
        </div>
      </div>
      <ConnectorDesigner
        ref="designerRef"
        :class="ns.e('designer')"
        v-if="designerData"
        :app-data="currentAppData!"
        :data="designerData"
        @close="onBack"
      />
    </div>
    <div :class="[ns.e('content')]">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="connector-designer-wrapper">
  import { ResultAwaiter, useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { setController, toConfigData, toDesignData } from './logic';
  import { onMounted, ref } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import ConnectorDesigner from './connector-designer.vue';
  import { ConnectorConfigRequest, FlowAppResponse } from '/@/apis/gct-ipaas2/model';
  import {
    getConnectorConfigByAppid,
    postConnectorConfig,
    putConnectorConfigById,
  } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import { IConnectorDesignerData } from './type';
  import { AuthModeEnum, EffectiveTimeUnitEnum } from '/@ipaas/enums';

  const { t } = useI18n();
  const ns = useNamespace('connector-designer-wrapper');
  const currentConfigData = ref<ConnectorConfigRequest | undefined>(undefined);
  const designerData = ref<IConnectorDesignerData | undefined>(undefined);
  const currentAppData = ref<FlowAppResponse>();
  const isEdit = ref(false);
  const isModified = ref(false);
  const awaiter = new ResultAwaiter<boolean>();
  const designerRef = ref();

  setController({
    async design(data) {
      currentAppData.value = data;
      const configData = await getConnectorConfigByAppid({ id: data.id! });
      if (configData) {
        currentConfigData.value = cloneDeep(configData);
        isEdit.value = true;
        console.log(data);
      } else {
        // 为空的时候创建默认值
        currentConfigData.value = {
          httpMethod: 'POST',
          authMode: AuthModeEnum.ACCESS_TOKEN,
          timeUnit: EffectiveTimeUnitEnum.HOURS,
          dynamicDomain: 0,
          relationId: data.id,
        } as any;
        isEdit.value = false;
      }
      designerData.value = toDesignData(currentConfigData.value!);
      return awaiter.await();
    },
    async createOrUpdate(data) {
      // 校验配置数据
      await designerRef.value.validate();
      const configData = toConfigData(data);
      if (isEdit.value) {
        await putConnectorConfigById({ id: data.id }, configData);
      } else {
        await postConnectorConfig(configData);
        isEdit.value = true;
      }
      // 更新数据
      // currentConfigData.value = cloneDeep(data);
      isModified.value = true;
    },
    async validateForm() {
      return await designerRef.value.validate();
    },
  });

  const onBack = () => {
    awaiter.resolve(isModified.value);
    // 重置数据
    currentAppData.value = undefined;
    currentConfigData.value = undefined;
    designerData.value = undefined;
    isModified.value = false;
  };
</script>

<style lang="scss" scoped>
  $connector-designer-wrapper: ();

  @include b(connector-designer-wrapper) {
    @include set-component-css-var(connector-designer-wrapper, $connector-designer-wrapper);

    @include e(designer-content) {
      display: none;
      width: 100%;
      height: 100%;
      padding: 20px;
      background: #fff;
    }

    @include e(content) {
      width: 100%;
      height: 100%;
    }

    @include when(designing) {
      @include e(designer-content) {
        display: block;
      }

      @include e(content) {
        display: none;
      }
    }

    @include e(header) {
      display: flex;
      justify-content: space-between;
      height: 32px;
      margin-bottom: 8px;
    }

    @include e(designer) {
      height: calc(100% - 40px);
    }

    width: 100%;
    height: 100%;
  }
</style>
