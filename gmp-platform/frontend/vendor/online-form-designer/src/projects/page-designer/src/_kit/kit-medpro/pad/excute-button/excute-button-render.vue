<template>
  <vantButton v-bind="convertProps(widget?.props)" @click="submitExcute" :loading="loading" />
</template>

<script setup lang="ts" name="gct-excute-button">
  import { reactive, ref, computed } from 'vue';
  import { showToast } from 'vant';
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '/@page-designer/components/widgets/mobile/__components__/vantButton.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { IExecuteButton } from './schema';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';

  interface ButtonType {
    primary: 'primary';
    success: 'success';
    danger: 'danger';
    warning: 'warning';
    info: 'info';
    text: 'text';
  }

  function convertProps(props?: any) {
    return {
      ...props,
      type: props?.type as ButtonType, // 显式类型断言
    };
  }

  const props = defineProps<{ widget?: IExecuteButton; destroyVm?: Function }>();
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
  } = reactive(props.widget?.props || ({} as any));

  const Event = getPageEvent();

  const loading = ref(false);
  const executeParams = ref<any>({});

  const bsActionKey = computed(() => {
    return isBatch ? 'batchExecute' : 'execute';
  });

  async function submitExcute() {
    try {
      try {
        await beforeExecute();
        const data =
          (await Event.runEventByName(
            'beforeExecute',
            props?.widget?.events || {},
            executeParams.value,
          )) || {};

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
      showToast($t('sys.submitSuccess'));
      afterExcute();
      await Event.runEventByName('afterExecute', props?.widget?.events || {}, postRes);
      executeParams.value = {};
    } catch (error) {
      error && typeof error === 'string' && showToast(error);
    } finally {
      loading.value = false;
    }
  }

  async function openModelingElectronicSignature(paramsData, extra?: any) {
    return new Promise((res, rej) => {
      const _event = extra ?? Event?.context;
      // @ts-ignore
      const vm = _event?.$modelingElectronicSignature({
        async successCallback({ relationId, signRequirementId, review, ...otherParams }) {
          try {
            await vm.validateForm();
            const relationKey: string = otherParams?.relationKey || 'relation_id_';
            const executeData = {
              ...executeParams.value,
              ...autoExcuteEntity?.value?.params,
              [relationKey]: relationId,
              sign_requirement_id_: signRequirementId,
              review_: review,
              relation_id_: otherParams?.relation_id_,
            };
            await postExecute(
              executeData,
              vm.close,
              { txnType: autoExcuteEntity?.value?.txnType },
              extra,
            );
            res(true);
            await vm.close();
            afterExcute();
            await Event.runEventByName('afterExecute', props?.widget?.events || {}, postRes);
            console.log('electronic signature done: 电子签名结束');
          } catch (e) {
            rej(e);
            // await vm.close();
          }
        },
        cancel() {
          rej();
        },
      });
      vm.open(paramsData);
    });
  }

  /**
   * 提交前逻辑
   */
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

  /**提交后逻辑 */
  async function afterExcute() {
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
   * @param txnType 事务类型
   * @param params formData
   * @return { type isDone = boolean } 执行是否结束
   */
  async function postExecute(params: object, closePop?: Function, extra?: any, extra2?: any) {
    const signRes =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: extra?.txnType ?? txnType,
          bsKey: extra?.bsActionKey ?? bsActionKey.value,
        },
        { ...params, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
      )) || ({} as any);

    const { relation_id_, sec_relation_id_, sign_requirement_, sign_requirement_entry_, review_ } =
      signRes;
    const relationId = relation_id_ || sec_relation_id_;
    const relationKey = sec_relation_id_ ? 'sec_relation_id_' : 'relation_id_';

    // 回调电子签名
    if (relationId) {
      closePop && (await closePop());
      await openModelingElectronicSignature(
        {
          relationKey,
          relationId,
          signRequirementId: sign_requirement_?.id_,
          configs: sign_requirement_entry_,
          type: sign_requirement_?.sign_method_,
          review: review_,
          relation_id_: relation_id_,
        },
        extra2,
      );
    }
    return signRes;
  }

  const autoExcuteEntity = ref<{
    txnType: string;
    params: object;
    callback: Function;
  }>();
  /**
   * 自动执行
   * @param name
   * @param txnType 事务类型
   * @param params formData
   */
  async function autoExcute(txnType, params, callback, extra) {
    console.log('autoExcute', txnType, params, callback, extra);
    autoExcuteEntity.value = { txnType, params, callback };

    const excuteDone: boolean = await postExecute(
      params,
      () => {},
      {
        txnType,
        bsActionKey: 'execute',
      },
      extra,
    );
    if (!excuteDone) return;

    callback?.();
    props.destroyVm && props.destroyVm();
    showToast($t('sys.submitSuccess'));
  }

  defineExpose({
    autoExcute,
    setParams: (value) => {
      executeParams.value = value || {};
    },

    destroyVm: async () => {
      props.destroyVm && (await props.destroyVm());
    },
  });
</script>

<style scoped lang="less"></style>
