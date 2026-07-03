<template>
  <view-container class="create-bind-edhr-relation-modal-container px-16px py-16px">
    <div class="tips mb-16px px-16px py-8px bg-[#F8F8F8] flex">
      <i class="iconfont icon-a-zhuyi_attention2" style="color: #f54547"></i>
      <span class="ml-8px" style="color: #797a7d">{{ t('sys.onlineForm.bindEdhrTip5') }}</span>
    </div>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item name="materialNo" :label="t('sys.onlineForm.bindEdhrLabel')" required>
        <div class="flex">
          <a-input
            v-model:value="formState.materialNo"
            allow-clear
            :placeholder="t('sys.inputTextTip', { name: t('sys.onlineForm.bindEdhrLabel') })"
            @change="
              () => {
                formState.productName = undefined;
                formState.edhrLinkName = undefined;
                formState.childInstId = undefined;
              }
            "
          />
          <a-button type="primary" class="ml-8px" @click="query">{{
            t('sys.onlineForm.bindEdhrQuery')
          }}</a-button>
        </div>
      </a-form-item>

      <a-form-item name="productName" :label="t('sys.onlineForm.bindEdhrLabel1')">
        <span>{{ formState.productName ?? '--' }}</span>
      </a-form-item>
      <a-form-item name="edhrLinkName" :label="t('sys.onlineForm.bindEdhrLabel2')">
        <span>{{ formState.edhrLinkName ?? '--' }}</span>
      </a-form-item>
    </a-form>
  </view-container>
</template>

<script setup lang="ts" name="create-bind-edhr-relation">
  import { ref, reactive, watch, toRaw } from 'vue';
  import { message } from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  import { IModal, useModal } from '@gct/runtime';
  import { InstanceStatusValues } from '../utils/instance-status';

  const { t } = useI18n();

  const props = defineProps<{
    context: IParams;
    params: IParams;
    modal: IModal;
  }>();

  const formRef = ref<FormInstance>();

  const formState = reactive<{
    /** 物料编号 */
    materialNo?: string;
    /** 产品ID */
    productName?: string;
    /** 关联eDHR名称 */
    edhrLinkName?: string;
    /** 关联eDHR实例id */
    childInstId?: string;
  }>({
    materialNo: undefined,
    productName: undefined,
    edhrLinkName: undefined,
    childInstId: undefined,
  });

  async function query() {
    if (!formState.materialNo) {
      return;
    }
    if (formState.materialNo === props.params.currentMaterialNo) {
      message.warn(t('sys.onlineForm.bindEdhrTip1'));
      return;
    }
    try {
      const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'getInstanceByMaterialNo',
          modelCategory: 'entity',
          modelKey: 'em_product_process',
        },
        {},
        {
          materialNo: formState.materialNo,
          ignoreOutline: 1,
        },
        {
          ignoreParamsToData: true,
        },
      );
      if (res && res.edhrInstance) {
        if (res.edhrInstance.instanceStatus === InstanceStatusValues.ARCHIVED) {
          formState.childInstId = res.edhrInstance.id;
          formState.edhrLinkName = res.edhrInstance.tmplName;
          formState.productName = res.edhrInstance.productName;
        } else {
          message.warn(t('sys.onlineForm.bindEdhrTip2'));
        }
      } else {
        message.error(t('sys.onlineForm.bindEdhrTip3'));
      }
    } catch (error) {}
  }

  async function onSave() {
    try {
      await formRef.value?.validate();
      if (!formState.childInstId) {
        throw message.warning(t('sys.onlineForm.bindEdhrTip4'));
      }
      return {
        ok: true,
        data: { ...toRaw(formState) },
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  }

  useModal(onSave);
</script>

<style scoped></style>
