<!-- lot详情 -->
<template>
  <a-drawer
    v-model:visible="visible"
    title="任务详情"
    :width="800"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    :closable="false"
    destroyOnClose
    @close="onClose"
  >
    <template #extra>
      <close-outlined
        style="font-size: 16px; color: rgba(0, 0, 0, 0.45)"
        class="api-icon"
        @click.stop="onClose"
      />
    </template>
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-row :gutter="8">
        <a-col
          :span="field.props.fieldType === 'long_text' ? 24 : 8"
          v-for="(field, index) in fieldWidgets"
          :key="field.id"
        >
          <a-form-item :label="field.alias" :name="field.props.field">
            <FieldWidget :widget="field" :rowValue="formData" :index="index" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <template #footer v-if="dialogType !== EActionType.VIEW">
      <a-button style="margin-right: 8px" @click="onReset">取消</a-button>
      <a-button type="primary" @click="onSubmit">提交</a-button>
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import FieldWidget from '../../components/field-widget.vue';

  enum EActionType {
    CREATE = 'create',
    EDIT = 'edit',
    VIEW = 'view',
  }

  const props = defineProps<{
    widgetList: Array<any>;
  }>();

  const emits = defineEmits<{
    (e: 'submitted', id: string): void;
  }>();

  const Event = getPageEvent();
  const formData = ref({});
  const dialogType = ref<EActionType>(EActionType.CREATE);

  const visible = ref<boolean>(false);
  const formRef = ref();

  const fieldWidgets = computed(() => {
    return props.widgetList.map((item) => {
      return {
        ...item,
        props: {
          ...item.props,
          readonly: true,
        },
      };
    });
  });

  const onOpen = (type: EActionType, val?: object) => {
    console.log(val, 'val');
    visible.value = true;
    dialogType.value = type;
    if (type === EActionType.EDIT || type === EActionType.VIEW) {
      formData.value = Object.assign(formData.value, val);
    } else {
      formData.value = {};
    }
  };

  const onClose = () => {
    visible.value = false;
  };

  const onReset = () => {
    formRef.value.resetFields();
    formData.value = {};
  };

  const onSubmit = async () => {
    const res = await submit();
    formRef.value.clearValidate();
    onClose();
    emits('submitted', res.id);
  };

  async function submit() {
    await formRef.value.validate();
    let res = await Event.context.$httpBizService(
      {
        key: 'em_mfg_order',
        action: 'submit',
        modelCategory: 'entity',
      },
      { ...formData.value, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
    );
    return res;
  }

  defineExpose({
    onOpen,
    onClose,
  });
</script>
