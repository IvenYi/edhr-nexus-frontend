<template>
  <template v-if="widget">
    <basicButton
      v-if="Object.prototype.hasOwnProperty.call(widget?.props, 'basic')"
      type="primary"
      @click="submit"
      :loading="loading"
      v-bind="basic"
    >
      {{ title }}
    </basicButton>
    <!-- 新版本的BaseButton -->
    <baseButton v-else v-bind="widget?.props" :loading="loading" @click="submit" />
  </template>
</template>

<script setup lang="ts" name="gct-execute-button">
  import { ref, reactive, computed } from 'vue';
  import basicButton from '/@page-designer/components/widgets/web/__components__/basic_button.vue';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { message as Message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IExecuteButton } from './schema';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';

  const { t } = useI18n();
  const defProps = defineProps<{ widget?: IExecuteButton; destroyVm?: Function }>();
  const {
    title,
    basic,
    txnType,
    refForm,
    resetForm,
    resetTxnForm,
    refTxnForm,
    refTxnField,
    refSearch,
    isBatch,
    refBatchTxnTable,
  } = reactive(defProps?.widget?.props || ({} as any));

  const Event = getPageEvent();

  const loading = ref(false);
  const executeParams = ref<any>({});

  const bsActionKey = computed(() => {
    return isBatch ? 'batchExecute' : 'execute';
  });

  async function submit() {
    try {
      try {
        await beforeExecute();
        const data = await Event.runEventByName(
          'beforeExecute',
          defProps?.widget?.events || {},
          executeParams.value,
        );
        /** 在线表单组件会在页面beforeExecute里面更新表单内容，所以需要重新获取关联表单数据 */
        let formValue = {};
        if (refForm) {
          const form: any = await Event.getSyncComponent(refForm);
          formValue = form?.getValue?.();
        }
        Object.assign(executeParams.value, formValue, data);
      } catch (err) {
        console.error(err, 'run before execute');
        return err;
      }

      loading.value = true;
      const postRes = await postExecute(executeParams.value);
      Message.success(t('sys.submitSuccess'));
      afterExecute();
      await Event.runEventByName('afterExecute', defProps?.widget?.events || {}, postRes);
      executeParams.value = {};
    } catch (error) {
      console.error(error);
      loading.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function openModelingElectronicSignature(paramsData) {
    return new Promise((res, rej) => {
      // @ts-ignore
      const vm = Event.context.$modelingElectronicSignature({
        async successCallback({ relationId, signRequirementId, review, ...otherParams }) {
          try {
            await vm.validateForm();
            const relationKey: string = otherParams?.relationKey || 'relation_id_';
            const executeData = {
              ...executeParams.value,
              [relationKey]: relationId,
              sign_requirement_id_: signRequirementId,
              review_: review,
              relation_id_: otherParams?.relation_id_,
            };
            await postExecute(executeData, vm.close);
            res(true);
            await vm.close();
            console.log('electronic signature done: 电子签名结束');
          } catch (e) {
            rej(e);
            await vm.close();
          }
        },
        cancel() {
          rej();
        },
      });
      vm.open(paramsData);
    });
  }

  async function beforeExecute() {
    // 1. 获取表单数据；2. 转换提交格式
    try {
      let formData: any = {};
      let txnFormData: any = {};
      let txnBatchData: string[] = [];
      if (refForm) {
        const form: any = await Event.getSyncComponent(refForm);
        await form.validate();
        formData = await form.getValue();
      }
      if (refTxnForm) {
        txnFormData = formMap.value[refTxnForm];
      }
      if (refBatchTxnTable) {
        const txnTable: any = await Event.getSyncComponent(refBatchTxnTable);
        txnBatchData = txnTable?.getDataSource?.()?.map(({ id_ }) => id_);
      }
      const txnSubjectData = isBatch
        ? {
            txn_subject_ids_: txnBatchData,
          }
        : {
            txn_subject_id_: txnFormData?.[refTxnField],
          };
      executeParams.value = {
        ...executeParams.value,
        ...txnSubjectData,
        ...formData,
      };
    } catch (err) {
      console.error(err, 'error at beforeExecute runtime!!!');
      throw err;
    }
  }

  async function afterExecute() {
    //1. 关联表单清空
    if (refForm && resetForm) {
      const form: any = await Event.getSyncComponent(refForm);
      form && form?.reset?.() && form?.setValue({});
    }
    // 2. 事务（批次）表单重置
    if (refTxnForm && resetTxnForm) {
      const txnContainer: any = await Event.getSyncComponent(refSearch || refTxnForm);
      txnContainer && txnContainer?.reset?.() && txnContainer?.setValue?.({});
    }
    // 3. 批量执行 重置表格
    if (refBatchTxnTable) {
      const txnTable: any = await Event.getSyncComponent(refBatchTxnTable);
      txnTable && txnTable?.setDataSource?.([], {});
    }
  }

  /**
   * 执行接口 + 回调电子签名
   * @param params formData
   */
  async function postExecute(params: object, closePop?: Function) {
    const signRes =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: txnType,
          bsKey: bsActionKey.value,
        },
        {
          ...params,
          _DICT: undefined,
          _OPCT: undefined,
          _NOSUBMIT: undefined,
        },
      )) || ({} as any);

    const { relation_id_, sec_relation_id_, sign_requirement_, sign_requirement_entry_, review_ } =
      signRes;
    const relationId = sec_relation_id_ || relation_id_;
    const relationKey = sec_relation_id_ ? 'sec_relation_id_' : 'relation_id_';

    // 回调电子签名
    if (relationId) {
      closePop && (await closePop());
      await openModelingElectronicSignature({
        relationKey,
        relationId,
        signRequirementId: sign_requirement_?.id_,
        configs: sign_requirement_entry_,
        type: sign_requirement_?.sign_method_,
        review: review_, // 是否复合签名 {boolean}
        relation_id_: relation_id_,
      });
    }
    return signRes;
  }

  defineExpose({
    setParams: (value) => {
      executeParams.value = value || {};
    },

    destroyVm: () => {
      defProps.destroyVm && defProps.destroyVm();
    },
  });
</script>
<style scoped lang="less"></style>
