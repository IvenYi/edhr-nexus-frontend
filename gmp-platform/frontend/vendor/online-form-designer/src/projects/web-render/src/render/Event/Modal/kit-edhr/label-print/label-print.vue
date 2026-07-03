<template>
  <div class="label-print-modal" :class="ns.b()">
    <a-form :class="ns.e('form')" ref="formRef" :model="formState">
      <form-item
        :name="'printTmplId'"
        :label="$t('sys.pageDesigner.labelTemplateRef')"
        :inline="false"
        is-first
        :rules="[
          {
            required: true,
            message: $t('sys.pleaseSelectSth', { sth: $t('sys.pageDesigner.labelTemplateRef') }),
          },
        ]"
      >
        <LabelTmplSelect
          v-model="formState.printTmplId"
          v-model:templateType="formState.templateType"
          @change="onTmplChange"
        />
      </form-item>
      <form-item
        v-if="formState.templateType === 'zpl'"
        :name="'printService'"
        :label="$t('sys.pageDesigner.printService')"
        :inline="false"
        :rules="[
          {
            required: formState.templateType === 'zpl',
            message: $t('sys.pleaseSelectSth', {
              sth: $t('sys.pageDesigner.printService'),
            }),
          },
        ]"
      >
        <PrinterTreeSelect
          v-model="formState.printService"
          :disabled="!formState.printTmplId || formState.templateType !== 'zpl'"
        />
      </form-item>
      <form-item
        :name="'printNumber'"
        :label="$t('sys.pageDesigner.printNumber')"
        :inline="false"
        :rules="[
          {
            required: true,
            message: $t('sys.pleaseInputSth', {
              sth: $t('sys.pageDesigner.printNumber'),
            }),
          },
        ]"
      >
        <a-input-number
          v-model:value="formState.printNumber"
          :min="1"
          :precision="0"
          :controls="false"
          clearable
        />
      </form-item>
    </a-form>

    <div v-if="modal" class="border-top text-right" :class="ns.e('footer')">
      <a-button style="margin-right: 8px" @click="onCancel">{{ $t('sys.cancelText') }}</a-button>
      <a-button type="primary" @click="onSubmit" :loading="confirmLoading">
        {{ $t('sys.okText') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { message as Message } from 'ant-design-vue';
  import { IModal, useNamespace } from '@gct/runtime';
  import FormItem from './form-item.vue';
  import LabelTmplSelect from './label-tmpl-select.vue';
  import PrinterTreeSelect from './printer-tree-select.vue';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  const defProps = defineProps<{
    modal: IModal;
    data: {
      txnInstId: string;
      printTmplId: string;
      templateType: string;
      printService: string;
      printNumber: number;
    };
  }>();

  const ns = useNamespace('label-print');
  const formRef = ref();
  const confirmLoading = ref(false);
  const formState = ref({
    printTmplId: '',
    templateType: '',
    printService: undefined,
    printNumber: 1,
  });

  function onTmplChange(val, opt) {
    console.log('onTmplChange', val, opt);
    if (opt.printType === 'btw') {
      formState.value.printService = undefined;
    }
  }

  function onCancel() {
    defProps.modal.close();
  }

  async function onSubmit() {
    try {
      await formRef.value.validate();
      confirmLoading.value = true;
      const res = await postBizServiceByModelKeyByBsKey(
        {
          bsKey: 'biz_print_txn',
          modelKey: 'em_label_print_flow',
        },
        {
          label_template_id_: formState.value.printTmplId,
          print_service_: formState.value.printService,
          print_number_: formState.value.printNumber,
          txn_inst_id_: defProps.data.txnInstId,
        },
      );
      Message.success($t('sys.success'));
      defProps.modal.dismiss({ ok: true, data: res } as any);
    } catch (err) {
      /* empty */
    } finally {
      confirmLoading.value = false;
    }
  }

  onMounted(() => {
    Object.assign(formState.value, defProps.data);
  });
</script>

<style lang="scss" scoped>
  @include b(label-print) {
    @include e(form) {
      padding: 16px;
    }

    @include e(footer) {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: end;
      min-height: 60px;
      padding: 0 16px 6px;
      background-color: #ffffff;
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);
    }
  }
</style>
