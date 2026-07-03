<template>
  <div class="tmpl-detail-drawer">
    <CollapseList :descData="basicInfo" :column="2" :isHead="true" />
    <div class="table-label">{{ formLabel }} </div>
    <DeviceParamsTable
      v-if="tmpl.type === DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION"
      :value="deviceTmpl.fieldMaps"
      :readonly="true"
    />
    <IndentifyParamsTable
      v-else-if="tmpl.type === DeviceLink.TmplTypeEnum.AI_OCR"
      :value="aiTmpl.identifyParams"
    />
  </div>
</template>

<script lang="ts" setup name="tmpl-detail-drawer">
  import { DeviceLink, FormModelController, useFormModel } from '@gct/nocode-base';
  import CollapseList from '/@app-designer/components/collapse-detail/components/collapse-list.vue';
  import { computed, onMounted, ref } from 'vue';
  import DeviceParamsTable from './device-params-table.vue';
  import IndentifyParamsTable from './indentify-params-table.vue';
  import { getDeviceInterconnectionInfo } from '/@/apis/gct-platform/DeviceInterconnectionController';

  const props = defineProps<{
    formModelController: FormModelController;
    tmpl: DeviceLink.BasicTmpl;
  }>();

  const formLabel = computed(() => {
    if (props.tmpl?.type === DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION) {
      return $t('sys.appDesigner.printDesign.paramList');
    } else {
      return $t('sys.onlineForm.parameterRecognition');
    }
  });

  const { provideController } = useFormModel();
  provideController(props.formModelController);

  const deviceTmpl = computed(() => props.tmpl as DeviceLink.DeviceInterconnectionTmpl);
  const aiTmpl = computed(() => props.tmpl as DeviceLink.AIOcrTmpl);

  const deviceName = ref<string>();
  onMounted(async () => {
    if (deviceTmpl.value.deviceId) {
      const res = await getDeviceInterconnectionInfo({ id: deviceTmpl.value.deviceId });
      deviceName.value = res?.name;
    }
  });

  /** 基础信息 */
  const basicInfo = computed(() => {
    const { tmpl } = props;
    if (tmpl.type === DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION) {
      const _tmpl = tmpl as DeviceLink.DeviceInterconnectionTmpl;
      return [
        {
          label: $t('sys.tableColumnType'),
          name: $t('sys.edhr.DeviceLinkTmplTypeEnum.DEVICE_INTERCONNECTION'),
        },
        {
          label: $t('sys.developer.devive.index'),
          name: deviceName.value ?? '--',
        },
      ];
    } else {
      const _tmpl = tmpl as DeviceLink.AIOcrTmpl;
      return [
        {
          label: $t('sys.tableColumnType'),
          name: $t('sys.edhr.DeviceLinkTmplTypeEnum.AI_OCR'),
        },
        {
          label: $t('sys.onlineForm.recognitionTemplateName'),
          name: _tmpl.name ?? '--',
        },
        {
          label: $t('sys.developer.devive.index') + '/' + $t('sys.onlineForm.instrumentName'),
          name: _tmpl.deviceName ?? '--',
        },
        {
          label: $t('sys.onlineForm.denoiseMethod'),
          name: _tmpl.denoiseMethod
            ? $t(`sys.edhr.DenoiseMethodEnum.${_tmpl.denoiseMethod}`)
            : '--',
        },
        {
          label: $t('sys.onlineForm.binarizationMethod'),
          name: _tmpl.binarizeMethod
            ? $t(`sys.edhr.BinarizeMethodEnum.${_tmpl.binarizeMethod}`)
            : '--',
        },
        {
          label: $t('sys.onlineForm.contrastEnhancement'),
          name: _tmpl.contrastAlpha ?? '--',
        },
        {
          label: $t('sys.onlineForm.extraPromptWords'),
          name: _tmpl.extraPrompt ?? '--',
        },
      ];
    }
  });
</script>

<style lang="less" scoped>
  .tmpl-detail-drawer {
    padding: 24px;

    .ant-descriptions {
      display: flex;
      align-items: center;
      padding: 20px 20px 0;
      border-radius: 4px;
      background-color: #f7f8fa;
      margin-bottom: 24px;
    }

    :deep(.ant-descriptions-item-container .ant-descriptions-item-label) {
      color: #8b8b8b;
    }
    .desc-area {
      color: #1a1d23;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 20px;
        }
      }
    }

    .table-label {
      font-weight: 400;
      font-size: 14px;
      color: #1a1d23;
      margin-bottom: 8px;
    }
  }
</style>
