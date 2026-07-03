<template>
  <basic-popup v-model:show="show" title="查询条件" :popup-props="popupProps">
    <div class="p-8px">
      <div class="rounded-8px bg-white">
        <van-form ref="FormRef">
          <van-field
            :model-value="statusOptions.find((e) => e.value === formData.materialStatus)?.text"
            readonly
            is-link
            label="记录类型"
            placeholder="请选择记录类型"
            @click="handleStatusSelect"
            input-align="right"
          />
          <van-field
            v-model="formData.materialNo"
            label="批次/SN"
            placeholder="请输入批次/SN"
            input-align="right"
          />
          <van-field
            v-model="formData.ofTmplName"
            label="表单名称"
            placeholder="请输入表单名称"
            input-align="right"
          />
          <van-field
            v-model="formData.ofCode"
            label="表单编码"
            placeholder="请输入表单编码"
            input-align="right"
          />
          <van-field
            readonly
            is-link
            label="物料名称"
            placeholder="请选择物料"
            @click="handleProductSelect"
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
            :model-value="
              processStatusOptions.find((e) => e.value === formData.processInstanceStatus)?.text
            "
            readonly
            is-link
            label="流程状态"
            placeholder="请选择流程状态"
            @click="handleProcessStatusSelect"
            input-align="right"
          />
        </van-form>
        <van-field
          v-model="formData.startTime"
          readonly
          is-link
          clearable
          label-width="9em"
          :label="`${timeTitle}起始时间`"
          :placeholder="`请选择${timeTitle}起始时间`"
          @click="handleEditStartTime"
          input-align="right"
        />
        <van-field
          v-model="formData.endTime"
          readonly
          is-link
          clearable
          label-width="9em"
          :label="`${timeTitle}结束时间`"
          :placeholder="`请选择${timeTitle}结束时间`"
          @click="handleEditEndTime"
          input-align="right"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="handleReset"
          >重置</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleSearch">筛选</van-button>
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
  import { MaterialStatusEnum, ProcessStatusEnum } from './enums';

  import { i18n } from '@mobile/locales/setupI18n';
  import DateTimePopup from '../../_comps_/date-time/date-time-popup.vue';
  import dayjs from 'dayjs';

  const { t } = i18n.global;

  interface IQuery {
    materialNo?: string;
    productId?: string;
    materialStatus?: string;
    ofTmplName?: string;
    ofCode?: string;
    processInstanceStatus?: string;
    startTime?: string;
    endTime?: string;
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
      type: 'todo' | 'done';
      query: any;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const timeTitle = computed(() => {
    return props.context.type === 'todo' ? '任务接收' : '任务审核';
  });

  const show = ref<boolean>(true);
  const formData = ref<IQuery>({
    ...props.context.query,
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
      value: undefined,
      text: '全部',
    },
    ...Object.values(MaterialStatusEnum).map((item) => {
      return {
        text: t('sys.edhr.materialStatus.' + item),
        value: item,
      };
    }),
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

  const processStatusOptions = [
    {
      value: undefined,
      text: '全部',
    },
    ...Object.values(ProcessStatusEnum).map((item) => {
      return {
        text: t('sys.edhr.instanceStatus2FormEnum.' + item),
        value: item,
      };
    }),
  ];
  const handleProcessStatusSelect = () => {
    GctPopup.open(BasicPicker, {
      popupProps: {
        position: 'bottom',
      },
      context: {
        value: [formData.value.processInstanceStatus],
        title: '流程状态',
        options: processStatusOptions,
      },
      onOk: (value: string[]) => {
        if (value && value.length > 0) {
          formData.value.processInstanceStatus = value[0] as any;
        }
      },
    });
  };

  const handleEditStartTime = () => {
    GctPopup.open(DateTimePopup, {
      popupProps: {
        position: 'bottom',
      },
      context: {
        max: formData.value.endTime,
      },
      onOk: (value: string) => {
        formData.value.startTime = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      },
    });
  };

  const handleEditEndTime = () => {
    GctPopup.open(DateTimePopup, {
      popupProps: {
        position: 'bottom',
      },
      context: {
        min: formData.value.startTime,
      },
      onOk: (value: string) => {
        formData.value.endTime = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      },
    });
  };

  const handleReset = async () => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk({});
    }
    show.value = false;
  };

  const handleSearch = async () => {
    try {
      await FormRef.value?.validate();
      if (props.onOk && typeof props.onOk === 'function') {
        props.onOk({ ...formData.value });
      }
      show.value = false;
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style scoped lang="less"></style>
