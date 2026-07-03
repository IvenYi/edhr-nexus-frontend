<template>
  <TmplCard class="device-tmpl-editor" :type="DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION">
    <div class="flex justify-between items-center px-12px py-8px text-size-12px cursor-pointer">
      <span class="color-#5A5F6B">{{ $t('sys.appDesigner.printDesign.paramList') }}</span>
      <!-- <span class="color-#026AC8FF" @click="onSelectDevice">
        <i class="gct-iconfont icon-tianjia2 mr-4px device-tmpl-editor__add-icon"></i>参数映射
      </span> -->
      <a-button
        v-if="tmplConfigC.state.IOTPermission"
        type="link"
        class="params-btn"
        @click="onSelectDevice"
      >
        <i class="gct-iconfont icon-tianjia2 mr-4px device-tmpl-editor__add-icon"></i>
        {{ $t('sys.edhr.parameterMapping') }}
      </a-button>
    </div>
    <div class="px-8px pb-8px">
      <a-empty
        class="empty-data"
        v-if="!formState.fieldMaps?.length"
        :description="$t('sys.noData')"
        :image="EmptyImg"
      />
      <PreviewEmpty v-if="!formState.fieldMaps?.length" />
      <template v-else>
        <ParamsItemCard
          v-for="fieldMap in formState.fieldMaps"
          :key="fieldMap.deviceField"
          :enableCollapse="fieldMap.isSubField"
          :deviceParams="fieldMap.deviceLinkParams!"
        >
          <template v-if="fieldMap.isSubField">
            <FormFieldSelect
              :onlySubFields="fieldMap.isSubField"
              :modelValue="fieldMap.formField"
              @update:modelValue="(val) => onSelectChange(fieldMap, val)"
            />
          </template>
          <template v-else>
            <FieldsEditor :map="fieldMap" />
          </template>
          <template v-if="fieldMap.children?.length" #children>
            <ParamsItemCard
              v-for="child in fieldMap.children"
              :key="child.deviceField"
              :deviceParams="child.deviceLinkParams!"
            >
              <FormFieldSelect :subModelKey="getSubModelKey(fieldMap)" v-model="child.formField" />
            </ParamsItemCard>
          </template>
        </ParamsItemCard>
      </template>
    </div>
  </TmplCard>
</template>

<script lang="ts" setup name="device-tmpl-editor">
  import { DeviceLink, useFormModel, useFormTmplConfig } from '@gct/nocode-base';
  import TmplCard from '../common/tmpl-card.vue';
  import ParamsItemCard from './params-item-card.vue';
  import { computed } from 'vue';
  import { FormFieldSelect } from '/@online-form/components/form-field';
  import { selectAndInitFieldMap } from '/@online-form/components/device';
  import EmptyImg from '/@/assets/svg/pic_nodata.svg';
  import FieldsEditor from './fields-editor.vue';

  const tmplConfigC = useFormTmplConfig().injectController();

  const { injectController } = useFormModel();
  const c = injectController();

  const props = withDefaults(
    defineProps<{
      value: DeviceLink.DeviceInterconnectionTmpl;
    }>(),
    {},
  );

  const formState = computed(() => props.value);

  /** 选择设备 */
  const onSelectDevice = async () => {
    // todo 打开设备选择弹窗，选中后根据设备的相关数据初始化参数列表
    const fieldsMap = await selectAndInitFieldMap();
    // 取消操作的时候会返回undefined，此时不修改
    if (fieldsMap) {
      formState.value.fieldMaps = fieldsMap;
    }
  };

  const onSelectChange = (fieldMap: DeviceLink.Device2FormFieldMap, value) => {
    fieldMap.formField = value;
    // 子表字段变更的时候重置子表字段
    if (fieldMap.isSubField) {
      fieldMap.children?.forEach((child) => {
        child.formField = undefined;
      });
    }
  };

  function getSubModelKey(fieldMap) {
    return fieldMap.formField ? c.getSubFieldModelKey(fieldMap.formField.split('.')[1]) : undefined;
  }
</script>

<style lang="scss" scoped>
  .device-tmpl-editor {
    &__add-icon {
      font-size: 14px;
    }

    .params-btn {
      padding: 0;
      height: auto;
      display: flex;
      align-items: center;
    }

    :deep(.ant-empty.empty-data) {
      height: 110px;
      width: 100%;
      border-radius: 4px 4px 4px 4px;
      border: 1px dashed #e0e3eb;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0;
      .ant-empty-image {
        height: 44px;
      }
      .ant-empty-description {
        font-weight: 400;
        font-size: 12px;
        color: #a6a6a6;
        margin-bottom: 0;
      }
    }
  }
</style>
