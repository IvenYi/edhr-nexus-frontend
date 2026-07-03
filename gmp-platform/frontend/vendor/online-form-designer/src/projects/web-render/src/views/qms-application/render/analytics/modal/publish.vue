<template>
  <div class="mb-16 p16px">
    <div>
      <p style="margin-bottom: 5px">
        <span style="color: rgba(98, 105, 120, 1); font-weight: 400"
          >注意：发布后，判异规则触发通知会同步创建待办任务，请至左侧菜单“</span
        >
        <span style="color: rgba(25, 144, 255, 1); font-weight: 400"
          >分析异常列表-判异处理”中处理</span
        >
      </p>
    </div>
    <a-form ref="formRef" :model="formData" :layout="'vertical'">
      <a-form-item label="查看范围：" required name="view_range_">
        <WidgetRender :widget="viewRangeField" :formData="formData" />
      </a-form-item>
      <a-form-item label="通知范围：" required name="notify_range_">
        <WidgetRender :widget="notifyRangeField" :formData="formData" />
      </a-form-item>
      <!-- <a-form-item label="推送方式：" required name="notify_type_">
        <a-checkbox-group v-model:value="formData.notify_type_">
          <a-checkbox value="sys">系统通知</a-checkbox>
          <a-checkbox value="email">邮箱</a-checkbox>
          <a-checkbox value="wecome">企业微信</a-checkbox>
          <a-checkbox value="feishu">飞书</a-checkbox>
          <a-checkbox value="dingding">钉钉</a-checkbox>
        </a-checkbox-group>
      </a-form-item> -->
    </a-form>
  </div>
  <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
    <a-button style="margin-right: 8px" @click="onCancel">取消</a-button>
    <a-button type="primary" @click="onSubmit" :loading="confirmLoading">确认</a-button>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { IModal } from '@gct/runtime';
  import WidgetRender from '/@web-render/render/widget/widget-async.vue';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  const defProps = defineProps<{
    data: any;
    modal: IModal;
    parentWidget: any;
  }>();

  const formRef = ref();
  const confirmLoading = ref(false);
  const rangeUserField = computed(() => {
    return defProps.parentWidget.children?.[0];
  });
  const viewRangeField = computed(() => {
    return {
      ...rangeUserField.value,
      props: {
        ...rangeUserField.value.props,
        field: 'view_range_',
      },
    };
  });
  const notifyRangeField = computed(() => {
    return {
      ...rangeUserField.value,
      props: {
        ...rangeUserField.value.props,
        field: 'notify_range_',
      },
    };
  });

  const formData = ref({
    view_range_: '',
    notify_range_: '',
  });

  function onCancel() {
    defProps.modal.dismiss();
  }

  async function onSubmit() {
    try {
      await formRef.value.validate();
      confirmLoading.value = true;
      await postBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_plan',
          bsKey: 'biz_publish',
        },
        {
          ...defProps.data,
          ...formData.value,
        },
      );
      confirmLoading.value = false;
      defProps.modal.dismiss({ ok: true });
    } catch (err) {}
    confirmLoading.value = false;
  }
</script>
