<template>
  <a-modal
    :closable="false"
    :visible="visible"
    v-bind="props.options ?? {}"
    :wrapClassName="[ns.e('wrap')].join(' ')"
    destroyOnClose
    :centered="true"
    :keyboard="false"
    :okText="t('sys.ok')"
    :cancelText="t('sys.cancel')"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div :class="[ns.e('header')]">
      <ExclamationCircleFilled :class="[ns.e('icon')]" />
      <span :class="['title']">{{
        t('sys.onlineForm.formChangeConfirmTitle', { name: docName })
      }}</span>
    </div>
    <a-form ref="formRef" :model="formData" :class="['content']">
      <a-form-item
        name="reason"
        :label="t('sys.onlineForm.formChangeReason')"
        :rules="[
          {
            required: true,
            message: t('sys.inputTextTip', { name: t('sys.onlineForm.formChangeReason') }),
          },
        ]"
      >
        <a-textarea
          v-model:value="formData.reason"
          :placeholder="t('sys.inputTextTip', { name: t('sys.onlineForm.formChangeReason') })"
          :rows="3"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
    <div :class="[ns.e('tip')]">
      {{ t('sys.onlineForm.formChangeConfirmTip') }}
    </div>
  </a-modal>
</template>

<script lang="ts" setup name="form-change-modal">
  import { ExclamationCircleFilled } from '@ant-design/icons-vue';
  import { useNamespace } from '@gct/runtime';
  import { FormInstance } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n() as any;

  const ns = useNamespace('form-change-modal');

  const visible = ref<boolean>(true);

  const props = withDefaults(
    defineProps<{
      userName: string;
      docName: string;
      options?: object;
      okCallback: (data: IData) => void;
    }>(),
    {},
  );

  const formData = reactive({
    reason: '',
  });

  const formRef = ref<FormInstance>();
  const handleOk = async () => {
    await formRef.value?.validate();
    await props.okCallback({ ...formData });
    visible.value = false;
  };

  const handleCancel = () => {
    visible.value = false;
  };
</script>

<style lang="scss" scoped>
  $form-change-modal: (
    height: auto,
  );

  @include b(form-change-modal) {
    @include set-component-css-var(form-change-modal, $form-change-modal);
    height: getCssVar(form-change-modal, height);

    @include e(header) {
      margin-bottom: 12px;
    }

    @include e(icon) {
      color: #ff8c4b;
      margin-right: 8px;
    }

    @include e(title) {
      font-weight: 500;
      font-size: 14px;
      color: #212528;
      line-height: 22px;
    }

    @include e(tip) {
      font-weight: 400;
      font-size: 14px;
      color: #797a7d;
    }
  }
</style>

<style lang="less">
  .gct-form-abandon-modal__wrap {
    .ant-modal-footer {
      border-width: 0;
    }
  }
</style>
