<!-- 工单创建 -->
<template>
  <a-drawer
    v-model:visible="visible"
    :title="title"
    :width="800"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    destroyOnClose
    :closable="false"
    @close="onClose"
  >
    <template #extra>
      <close-outlined
        style="font-size: 16px; color: rgba(0, 0, 0, 0.45)"
        class="api-icon"
        @click.stop="onClose"
      />
    </template>
    <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <a-row :gutter="8">
        <a-col
          :span="field.props.fieldType === 'long_text' ? 24 : 12"
          v-for="(field, index) in fieldWidgets"
          :key="field.id"
        >
          <a-form-item :label="field.alias" :name="field.props.field">
            <template v-if="field.props.field === 'description_'">
              <span v-if="dialogType === EActionType.VIEW">{{ formData.description_ }}</span>
              <a-textarea
                v-else
                v-model:value="formData.description_"
                show-count
                :maxlength="120"
              />
            </template>
            <FieldWidget v-else :widget="field" :rowValue="formData" :index="index" />
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
  import { ref, computed, watch } from 'vue';
  import type { Rule } from 'ant-design-vue/es/form';
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
    (e: 'submitted'): void;
  }>();

  const Event = getPageEvent();
  const formData: any = ref({
    attr_status_: 'selfbuilt',
  });
  const dialogType = ref<EActionType>(EActionType.CREATE);

  const rules: Record<string, Rule[]> = {
    code_: [{ required: true, message: '请输入' }],
    name_: [{ required: true, message: '请输入' }],
    product_id_: [{ required: true, message: '请选择' }],
    qty_: [{ required: true, message: '请输入' }],
    planned_completion_date_: [
      {
        validator: (_, value) => {
          if (
            formData.value.planned_start_date_ &&
            value &&
            new Date(value) <= new Date(formData.value.planned_start_date_)
          ) {
            return Promise.reject('结束时间必须大于开始时间');
          }
          return Promise.resolve();
        },
      },
    ],
  };

  const visible = ref<boolean>(false);
  const formRef = ref();

  watch(
    [() => formData.value.planned_start_date_, dialogType.value],
    () => {
      if (formRef.value && dialogType.value !== EActionType.VIEW) {
        formRef.value.validateFields(['planned_completion_date_']);
      }
    },
    {
      immediate: true,
    },
  );

  const title = computed(() => {
    if (dialogType.value === EActionType.VIEW) {
      return '工单详情';
    }
    if (dialogType.value === EActionType.EDIT) {
      return '编辑工单';
    }
    return '新建工单';
  });

  const fieldWidgets = computed(() => {
    return props.widgetList.map((item) => {
      return {
        ...item,
        props: {
          ...item.props,
          readonly: !!(dialogType.value === EActionType.VIEW),
          disabled: !!(item.props.field === 'attr_status_'),
        },
      };
    });
  });

  const onOpen = (type: EActionType, val?: object) => {
    visible.value = true;
    dialogType.value = type;
    if (type === EActionType.EDIT || type === EActionType.VIEW) {
      formData.value = Object.assign(formData.value, val);
    } else {
      formData.value = { attr_status_: 'selfbuilt' };
    }
  };

  const onClose = () => {
    visible.value = false;
  };

  const onReset = () => {
    formRef.value.resetFields();
    formData.value = { attr_status_: 'selfbuilt' };
    visible.value = false;
  };

  const onSubmit = async () => {
    const res = await submit();
    formRef.value.clearValidate();
    onClose();
    emits('submitted', res.id);
  };

  async function submit() {
    await formRef.value.validate();
    let res = await Event.context.$customBizService.post(
      {
        key: 'em_mfg_order',
        action: 'mfgOrderSaveBs',
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
