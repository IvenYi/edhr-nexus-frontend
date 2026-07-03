<template>
  <vantButton v-bind="widget.props" @click="submitExcute" :loading="loading" />
</template>

<script setup lang="ts" name="gct-excute-button">
  import { reactive, ref } from 'vue';
  import { showToast } from 'vant';
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '/@page-designer/components/widgets/mobile/__components__/vantButton.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';

  const props = defineProps<{ widget: BaseButton; destroyVm?: Function }>();
  const { txnType, refForm, refSearch, refresh } = reactive(props.widget.props || ({} as any));
  const loading = ref(false);
  const Event = getPageEvent();
  const excuteParams = ref<any>({});
  async function submitExcute() {
    loading.value = true;
    try {
      await beforeExcute();
      const data =
        (await Event.runEventByName(
          'beforeExecute',
          props?.widget?.events || {},
          excuteParams.value,
        )) || {};
      Object.assign(excuteParams.value, data);
      await beforeExcute();
      if (refSearch && !excuteParams.value?.txn_subject_id_) {
        await Promise.reject($t('sys.kit.containerSearchTips'));
      }
      await postExcute(excuteParams.value);
      console.log('excute done: 执行结束');
      afterExcute();
      await Event.runEventByName('afterExecute', props?.widget?.events || {}, '');
      showToast($t('sys.submitSuccess'));
    } catch (error) {
      error && typeof error === 'string' && showToast(error);
    }
    loading.value = false;
  }

  /**
   * 执行接口 + 回调电子签名
   * @param txnType 事务类型
   * @param params formData
   * @return { type isDone = boolean } 执行是否结束
   */
  async function postExcute(params: object, closePop?: Function) {
    const signRes =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: txnType,
          bsKey: 'execute',
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
      await openModelingElectronicSignature({
        relationKey,
        relationId,
        signRequirementId: sign_requirement_?.id_,
        configs: sign_requirement_entry_,
        type: sign_requirement_?.sign_method_,
        review: review_,
        relation_id_: relation_id_,
      });
    }
  }

  async function openModelingElectronicSignature(paramsData) {
    return new Promise((res, rej) => {
      // @ts-ignore
      const vm = Event.context.$modelingElectronicSignature({
        async successCallback({ relationId, signRequirementId, review, ...otherParams }) {
          const relationKey: string = otherParams?.relationKey || 'relation_id_';
          const excuteData = {
            ...excuteParams.value,
            [relationKey]: relationId,
            sign_requirement_id_: signRequirementId,
            review_: review,
            relation_id_: otherParams?.relation_id_,
          };
          try {
            await postExcute(excuteData, vm.close);
            await vm.close();
            res(true);
            console.log('electronic signature done: 电子签名结束');
          } catch (e) {
            console.log('electronic signature done: 电子签名错误');
            // rej(e);
          }
        },
        cancel() {
          rej();
        },
      });
      vm.open(paramsData);
    });
  }

  /**提交后逻辑 */
  async function afterExcute() {
    if (!refresh) return;
    //1. 表单清空；2. 批次查询重置；
    if (refSearch) {
      const containerSearch: any = await Event.getSyncComponent(refSearch);
      containerSearch && containerSearch?.reset?.();
    }
    if (refForm) {
      const form: any = await Event.getSyncComponent(refForm);
      form && form?.reset?.();
    }
  }

  /**
   * 提交前逻辑
   */
  async function beforeExcute() {
    // 1. 获取表单数据；2. 转换提交格式
    try {
      if (refSearch) {
        const search: any = await Event.getSyncComponent(refSearch);
        const searchData = await search.getValue();
        excuteParams.value.txn_subject_id_ = searchData?.id_ || '';
      }
      if (refForm) {
        const form: any = await Event.getSyncComponent(refForm);
        await form.validate();
        const formData = await form.getValue();
        excuteParams.value = { ...excuteParams.value, ...formData };
      }
    } catch (err) {
      console.error(err, 'error at beforeExecute runtime!!!');
      throw err;
    }
  }

  defineExpose({
    setParams: (value) => {
      excuteParams.value = value || {};
    },

    destroyVm: async () => {
      props.destroyVm && (await props.destroyVm());
    },
  });
</script>

<style scoped lang="less"></style>
