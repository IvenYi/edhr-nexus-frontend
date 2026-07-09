<template>
  <BasicDialog
    v-model:show="show"
    :showHeader="false"
    :showFooter="false"
    :popup-props="dialogProps"
    :extraStyle="{
      width: '570px',
    }"
  >
    <div class="bg-white" :style="{ '--van-cell-vertical-padding': '20px' }">
      <div class="h100px text-center lh-100px text-18px font-600 user-select-popup"> DHR创建 </div>
      <div class="px32px">
        <van-form ref="FormRef">
          <van-field
            :border="false"
            class="is-link py20px"
            required
            is-link
            label="产品"
            readonly
            placeholder="请选择"
            input-align="right"
            v-model="formData.productId"
            :rules="[{ required: true, message: '请选择产品' }]"
            @click="selectProduce"
          >
            <template #input v-if="formLabels.productId">
              {{ formLabels.productId }}
              <div v-if="!formData.productId?.includes(':')" class="gct-custom-tag ml4px">{{
                $t('sys.default')
              }}</div>
            </template>
          </van-field>
          <van-field
            class="is-link"
            v-model="formData.tmplId"
            :border="false"
            required
            readonly
            is-link
            label="DHR模板"
            placeholder="请选择"
            input-align="right"
            :rules="[{ required: true, message: '请选择DHR模版' }]"
            @click="selectEdhrTmpl"
          >
            <template #input v-if="formData.tmplId"> {{ formLabels.tmplId }} </template>
          </van-field>
          <van-field
            v-model="formData.materialStatus"
            :border="false"
            required
            readonly
            label="记录类型"
            input-align="right"
            :rules="[{ required: true, message: '请选择记录类型' }]"
          >
            <template #input>
              <van-radio-group v-model="formData.materialStatus" direction="horizontal">
                <van-radio :name="MATERIAL_STATUS_ENUM.LOT">批次</van-radio>
                <van-radio :name="MATERIAL_STATUS_ENUM.SN">SN</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-form>
      </div>
      <div class="text-center py16px mt36px">
        <van-button class="w124px important-mr-16px h40px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button :loading="loading" class="w124px h40px" type="primary" @click="onOk"
          >确认</van-button
        >
      </div>
    </div>
  </BasicDialog>
</template>

<script setup lang="ts" name="user-select-popup">
  import { ref } from 'vue';
  import BasicDialog from '@mobile/views/edhr/_comps_/basic-dialog/index.vue';
  import { MATERIAL_STATUS_ENUM } from '@mobile/views/edhr/_utils_/interface';
  import {
    drawerSelectorInstance,
    CategoryModuleEnum,
  } from '@mobile/InstanceComponent/edhr-tmpl-picker';
  import { drawerRdoSelectorInstance } from '@mobile/InstanceComponent/rdo-table-picker';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

  const { businessSetting } = useBusinessSetting();
  const isControlled = !!businessSetting.enableDocControl;
  const loading = ref(false);
  const show = ref(true);
  const FormRef = ref();
  const { openPicker } = drawerSelectorInstance({
    moduleType: CategoryModuleEnum.EDHR,
    title: '选择DHR模版',
    rdoVersion: true,
    isControlled,
  });
  const { openPicker: openProducePicker } = drawerRdoSelectorInstance({
    title: '选择产品',
    modelKey: 'em_product',
    queryParams: {
      operating_state_: true,
    },
  });
  const props = withDefaults(
    defineProps<{
      materialNo: string; // 组件属性
      onOk: (data?: any) => {};
    }>(),
    {},
  );
  const formLabels = reactive({
    productId: '',
    tmplId: '',
  });
  const formData = reactive({
    materialNo: props.materialNo || '',
    materialStatus: '',
    productId: '',
    tmplId: '',
  });

  const onCancel = () => {
    show.value = false;
  };
  const save = async () => {
    return postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'insertEdhrInstanceAndOfInstance',
        modelCategory: 'entity',
        modelKey: 'em_product_process',
      },
      formData,
    );
  };
  const onOk = async () => {
    await FormRef.value?.validate();
    loading.value = true;
    try {
      const id = await save();
      props.onOk(id);
      onCancel();
    } catch (error) {
      loading.value = false;
    }
  };

  function selectEdhrTmpl() {
    openPicker(formData.tmplId).then((res: any) => {
      if (res) {
        const { id, name, version } = res;
        formData.tmplId = id;
        formLabels.tmplId = version ? `${name}:${version}` : name;
      }
    });
  }

  async function selectProduce() {
    const { __VALUE__, __SELECTED_LABEL__ } = await openProducePicker(formData.productId);
    formData.productId = __VALUE__;
    formLabels.productId = __SELECTED_LABEL__;
  }
</script>

<style lang="less" scoped>
  .user-select-popup {
    background: url('@mobile/assets/ipad/pic_popup.png') no-repeat;
    background-position: top;
    background-size: 100%;
  }

  :deep(.van-cell) {
    border-bottom: 1px solid #e0e3eb;
  }

  // .is-link {
  //   :deep(.van-field__value .van-field__body) {
  //     padding-right: 16px;
  //   }
  //   :deep(.van-cell__right-icon) {
  //     position: absolute;
  //     top: 20px;
  //     right: 16px;
  //   }
  // }

  // :deep(.van-field__error-message) {
  //   text-align: right;
  // }

  // :deep(.van-radio--horizontal:last-child) {
  //   margin-right: 0;
  // }
</style>
