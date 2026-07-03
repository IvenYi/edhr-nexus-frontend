<template>
  <div class="device-tmpl-form">
    <a-form ref="formRef" :model="formData">
      <a-row :gutter="24">
        <a-col :span="12">
          <FormItem :label="$t('sys.tableColumnType')" name="type" required :inline="false">
            <a-select
              v-model:value="formData.type"
              :placeholder="$t('sys.chooseText')"
              :options="typeOptions"
            />
          </FormItem>
        </a-col>
        <a-col :span="12">
          <FormItem
            :label="$t('sys.developer.devive.index')"
            name="deviceId"
            required
            :inline="false"
            :rules="[{ required: true, message: $t('sys.onlineForm.selectDevice') }]"
          >
            <DeviceSelect
              :model-value="formData.deviceId"
              :placeholder="$t('sys.chooseText')"
              @update:model-value="onDeviceChange"
            />
          </FormItem>
        </a-col>
        <a-col :span="24">
          <div class="w-full mt24px">
            <FormItem
              :label="$t('sys.appDesigner.printDesign.paramList')"
              name="fieldMaps"
              :inline="false"
            >
              <DeviceParamsTable
                v-model:value="formData.fieldMaps"
                :readonly="false"
                :inline="false"
              />
            </FormItem>
          </div>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="device-tmpl-form">
  import { DeviceLink, DeviceLinkTmplUtil, useFormTmplConfig } from '@gct/nocode-base';
  import { computed, ref } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { FormInstance } from 'ant-design-vue';
  import DeviceParamsTable from './device-params-table.vue';
  import { DeviceSelect } from '/@online-form/components/device';

  const c = useFormTmplConfig().injectController();

  const props = withDefaults(
    defineProps<{
      tmpl: DeviceLink.DeviceInterconnectionTmpl;
    }>(),
    {
      tmpl: undefined,
    },
  );

  const typeOptions = computed(() => {
    const types = [];
    if (c.state.IOTPermission) {
      types.push(DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION);
    }
    if (c.state.OCRPermission) {
      types.push(DeviceLink.TmplTypeEnum.AI_OCR);
    }
    return types.map((i) => {
      return {
        value: i,
        label: $t('sys.edhr.DeviceLinkTmplTypeEnum.' + i),
      };
    });
  });

  const formData = computed({
    get() {
      return props.tmpl;
    },
    set(v) {
      Object.assign(props.tmpl, v);
    },
  });

  const formRef = ref<FormInstance>();
  const validate = async () => {
    await formRef.value?.validate();
  };

  /**  选择设备后 */
  const onDeviceChange = async (deviceId: string) => {
    formData.value.deviceId = deviceId;
    const deviceLink = await DeviceLinkTmplUtil.getDeviceLink(deviceId);
    if (!deviceLink) {
      return;
    }
    formData.value.fieldMaps = DeviceLinkTmplUtil.initDevice2FormFieldMap(deviceLink);
    console.log('onDeviceChange', DeviceLinkTmplUtil.initDevice2FormFieldMap(deviceLink));
  };

  defineExpose({
    validate,
  });
</script>

<style lang="less" scoped>
  .device-tmpl-form {
  }
</style>
