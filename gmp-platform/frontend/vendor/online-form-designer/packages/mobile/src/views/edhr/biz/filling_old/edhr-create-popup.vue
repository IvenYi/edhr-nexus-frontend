<template>
  <basic-popup v-model:show="show" title="eDHR创建" :popup-props="popupProps">
    <div class="p-8px">
      <div class="rounded-8px bg-white">
        <van-form ref="FormRef">
          <van-field v-model="formData.materialNo" label="批次号" disabled input-align="right" />

          <van-field
            required
            readonly
            is-link
            label="产品"
            placeholder="请选择产品"
            @click="handleProductSelect"
            :rules="[{ validator: validateProduct }]"
            input-align="right"
          >
            <template v-if="formData.productId" #input>
              <div v-if="productMeta.versionId"
                >{{ productMeta.productName }}:{{ productMeta.versionName }}</div
              >
              <div v-else class="flex items-center">
                <span>{{ productMeta.productName }}</span>
                <van-tag class="ml-6px" type="primary">默认</van-tag>
              </div>
            </template>
          </van-field>

          <van-field
            :model-value="statusOptions.find((e) => e.value === formData.materialStatus)?.text"
            required
            readonly
            is-link
            label="记录类型"
            placeholder="请选择记录类型"
            @click="handleStatusSelect"
            :rules="[{ validator: validateStatus }]"
            input-align="right"
          />
        </van-form>
      </div>
    </div>

    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleCreate">确认创建</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue';
  // import AddNgForm from '../ng/add-form.vue';
  // import DateTimePopup from '../date-time/date-time-popup.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { showSuccessToast } from 'vant';
  import ProducePickerPopup from '@mobile/views/edhr/_comps_/product/product-picker-popup.vue';
  import BasicPicker from '@mobile/views/edhr/_comps_/basic-popup/basic-picker.vue';

  interface ICreateInstance {
    materialNo?: string;
    materialStatus?: 'LOT' | 'SN';
    productId?: string;
  }

  interface IProductMeta {
    productId?: string;
    productName?: string;
    versionId?: string;
    versionName?: string;
  }

  const props = defineProps<{
    popupProps: any;
    context: {
      materialNo: string;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const formData = ref<ICreateInstance>({
    materialNo: props.context.materialNo,
    materialStatus: 'LOT',
  });
  const productMeta: IProductMeta = reactive({
    productId: undefined,
    productName: undefined,
    versionId: undefined,
    versionName: undefined,
  });
  const FormRef = ref();

  const handleProductSelect = () => {
    GctPopup.open(ProducePickerPopup, {
      popupProps: {
        position: 'bottom',
      },
      onOk: (value: IProductMeta) => {
        Object.assign(productMeta, value);
        formData.value.productId = value.versionId
          ? `${value.productId}:${value.versionId}`
          : value.productId;
      },
    });
  };
  const statusOptions = [
    {
      value: 'LOT',
      text: '批次',
    },
    {
      value: 'SN',
      text: 'SN',
    },
  ];
  const handleStatusSelect = () => {
    GctPopup.open(BasicPicker, {
      popupProps: {
        position: 'bottom',
      },
      context: {
        value: [formData.value.materialStatus],
        title: '记录类型',
        options: statusOptions,
      },
      onOk: (value: string[]) => {
        if (value && value.length > 0) {
          formData.value.materialStatus = value[0] as any;
        }
      },
    });
  };

  const validateProduct = () => {
    if (!formData.value.productId) return '产品不能为空';
    return true;
  };
  const validateStatus = () => {
    if (!formData.value.materialStatus) return '记录类型不能为空';
    return true;
  };

  const handleCreate = async () => {
    try {
      await FormRef.value?.validate();
      const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'insertEdhrInstanceAndOfInstance',
          modelKey: 'em_product_process',
          modelCategory: 'entity',
        },
        {
          ...formData.value,
        },
      );
      if (props.onOk && typeof props.onOk === 'function') {
        props.onOk(res, { ...formData.value });
      }
      show.value = false;
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style scoped lang="less"></style>
