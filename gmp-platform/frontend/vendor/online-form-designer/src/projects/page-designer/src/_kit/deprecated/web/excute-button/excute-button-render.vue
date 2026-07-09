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

  <electronicSignatureTemplate
    :key="forEachKey"
    ref="electronicSignatureRef"
    :destroyVm="destroySignatureVm"
    :successCallback="excuteSuccess"
  />
</template>

<script setup lang="ts" name="gct-excute-button">
  import basicButton from '/@page-designer/components/widgets/web/__components__/basic_button.vue';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import electronicSignatureTemplate from '/@web-render/render/Event/Modal/electronic-signature-template.vue';
  import { ref, reactive, onBeforeUnmount, nextTick } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  // import { Events } from '/@web-render/render/Event/baseEvent';
  import { message as Message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IExcuteButton } from './schema';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { IExcuteButtonComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const { t } = useI18n();
  const defProps = defineProps<{ widget?: IExcuteButton, destroyVm?: Function }>();
  const { title, basic, txnType, refForm, refSearch, refresh } = reactive(
    defProps?.widget?.props || ({} as any),
  );
  const Event = getPageEvent();
  const loading = ref(false);
  const excuteParams = ref<any>({});
  const autoExcuteEntity = ref<{
    txnType: string;
    params: object;
    callback: Function;
  }>();
  const signature = ref<any>(null);
  const electronicSignatureRef = ref();

  async function submit() {
    try {
      let formData: any = {};
      try {
        formData = await beforeExcute();
        const beforeRes = await Event.runEventByName(
          'beforeExecute',
          defProps?.widget?.events || {},
          formData,
        );
        if (beforeRes === false) return;
        await beforeExcute();
        excuteParams.value = beforeRes
          ? {
              ...excuteParams.value,
              ...beforeRes,
            }
          : excuteParams.value;
      } catch (err) {
        console.error(err, 'beforeExcute');
        return err;
      }

      if (refSearch && !excuteParams.value?.txn_subject_id_) {
        return Message.warn(t('sys.kit.containerSearchTips'));
      }

      loading.value = true;
      const excuteDone: boolean = await postExcute(txnType, excuteParams.value);
      loading.value = false;
      if (!excuteDone) return;

      Message.success(t('sys.submitSuccess'));
      afterExcute();
      await Event.runEventByName('afterExecute', defProps?.widget?.events || {}, '');
    } catch (error) {
      console.error(error);
      loading.value = false;
    }
    loading.value = false;
  }

  async function excuteSuccess({ relationId, signRequirementId, review, ...otherParams }) {
    if (!signature.value) return;
    await electronicSignatureRef.value.validateForm();
    const isAutoExcute = autoExcuteEntity.value?.txnType;
    const txnKey = isAutoExcute ? autoExcuteEntity.value?.txnType : txnType;
    const baseData = isAutoExcute ? autoExcuteEntity.value?.params : excuteParams.value;
    const relationKey: string = otherParams?.relationKey || 'relation_id_';
    const excuteData = {
      ...baseData,
      [relationKey]: relationId,
      sign_requirement_id_: signRequirementId,
      review_: review,
      relation_id_: otherParams?.relation_id_
    };

    const excuteDone: boolean = await postExcute(txnKey, excuteData);
    if (!excuteDone) return;

    electronicSignatureRef.value.close();
    Message.success(t('sys.submitSuccess'));
    afterExcute();
    if (isAutoExcute) {
      autoExcuteEntity.value?.callback?.();
    }
    await Event.runEventByName('afterExecute', defProps?.widget?.events || {}, '');
  }

  async function beforeExcute() {
    // 1. 获取表单数据；2. 转换提交格式
    try {
      let formData: any = {};
      let searchData: any = {};
      if (refSearch) {
        const search: any = await Event.getSyncComponent(refSearch);
        searchData = await search.getValue();
      }
      if (refForm) {
        const form: any = await Event.getSyncComponent(refForm);
        await form.validate();
        formData = await form.getValue();
      }
      excuteParams.value = {
        ...formData,
        txn_subject_id_: searchData?.id_ || '',
      };
      return excuteParams.value;
    } catch (err) {
      console.error(err, 'error at beforeExecute runtime!!!');
      throw err;
    }
  }

  async function afterExcute() {
    if (!refresh) return;
    //1. 表单清空；2. 批次查询重置；
    if (refSearch) {
      const containerSearch: any = await Event.getSyncComponent(refSearch);
      containerSearch && containerSearch?.reload?.();
    }
    if (refForm) {
      const form: any = await Event.getSyncComponent(refForm);
      form && form?.reset?.();
    }
  }

  /**
   * 自动执行
   * @param name
   * @param txnType 事务类型
   * @param params formData
   */
  async function autoExcute(txnType, params, callback) {
    autoExcuteEntity.value = { txnType, params, callback };

    const excuteDone: boolean = await postExcute(txnType, params);
    if (!excuteDone) return;

    callback?.();
    defProps.destroyVm && defProps.destroyVm();
    Message.success(t('sys.submitSuccess'));
  }

  /**
   * 执行接口 + 回调电子签名
   * @param txnType 事务类型
   * @param params formData
   * @return { type isDone = boolean } 执行是否结束
   */
  async function postExcute(txnType: string, params: object): Promise<boolean> {
    let isDone = false;
    const signRes =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: txnType,
          bsKey: 'execute',
        },
        { ...params, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
      )) || ({} as any);

    const { relation_id_, sec_relation_id_, sign_requirement_, sign_requirement_entry_, review_ } = signRes;
    const relationId = sec_relation_id_ || relation_id_;
    const relationKey = sec_relation_id_ ? 'sec_relation_id_' : 'relation_id_';

    // 回调电子签名
    if (relationId) {
      signature.value = signRes;
      // ！！！二次签名确认时，先关闭当前弹框再执行打开弹框操作！！！
      electronicSignatureRef.value.close();
      await nextTick();
      electronicSignatureRef.value.open({
        relationKey,
        relationId,
        signRequirementId: sign_requirement_?.id_,
        configs: sign_requirement_entry_,
        type: sign_requirement_?.sign_method_,
        review: review_,
        relation_id_: relation_id_
      });
    } else {
      isDone = true;
    }
    return isDone;
  }

  onBeforeUnmount(() => {
    destroySignatureVm();
  });
  const forEachKey = ref();
  function destroySignatureVm() {
    forEachKey.value = Math.random();
  }

  defineExpose<IExcuteButtonComponentExpose>({
    autoExcute,
    setParams: (value) => {
      excuteParams.value = value || {};
    },
    destroyVm: () => {
      defProps.destroyVm && defProps.destroyVm();
    }
  });
</script>
<style scoped lang="less"></style>
