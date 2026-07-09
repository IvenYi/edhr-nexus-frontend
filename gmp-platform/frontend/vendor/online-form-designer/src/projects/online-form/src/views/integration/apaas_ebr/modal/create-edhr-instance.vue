<template>
  <view-container class="create-edhr-instance-modal-container px-16px py-16px">
    <div class="tips mb-16px px-12px" style="color: #999">{{
      t('sys.webRender.edhrApplication.createMaterialNoTips', {
        sth: `【${formState.materialNo}】`,
      })
    }}</div>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        name="productId"
        :label="t('sys.edhr.product')"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', {
              sth: t('sys.edhr.product'),
            }),
          },
        ]"
      >
        <rdo-table-select
          v-model:modelValue="formState.productId"
          :placeholder="t('sys.pleaseSelectSth')"
          modelKey="em_product"
          :parent-to-default="false"
          :hide-single-version="false"
        />
      </a-form-item>

      <a-form-item
        name="tmplId"
        :label="$t('sys.onlineForm.DHRTemplate')"
        :rules="[
          {
            required: true,
            message: $t('sys.chooseTextTip', { name: $t('sys.onlineForm.DHRTemplate') }),
          },
        ]"
      >
        <VersionSelect
          :notEmitParent="true"
          :type="FormDesignEnum.EDHR"
          v-model:value="formState.tmplId"
          :enable-control="true"
          :placeholder="$t('sys.chooseText')"
        />
      </a-form-item>

      <a-form-item
        name="materialStatus"
        :label="t('sys.webRender.edhrApplication.recordType')"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', {
              sth: t('sys.webRender.edhrApplication.recordType'),
            }),
          },
        ]"
      >
        <a-select
          v-model:value="formState.materialStatus"
          allowClear
          :placeholder="
            t('sys.pleaseSelectSth', { sth: t('sys.webRender.edhrApplication.recordType') })
          "
          :options="options"
        />
      </a-form-item>
    </a-form>
  </view-container>
</template>

<script setup lang="ts" name="create-edhr-instance">
  import { ref, reactive, watch, toRaw } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import RdoTableSelect from '/@web-render/views/edhr-application/components/rdo-table-select/rdo-table-select.vue';
  import VersionSelect from '/@online-form/views/web-render/components/version-select/version-select.vue';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { useMaterialStatus, MaterialStatusEnum } from '../utils/material-status';
  import { IModal, useModal, EntityModelCategoryEnum } from '@gct/runtime';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const { t } = useI18n();

  const { getStatusOptions } = useMaterialStatus();

  const options = getStatusOptions({ type: 'lot&sn' });

  const props = defineProps<{
    context: IParams;
    params: IParams;
    modal: IModal;
  }>();

  const formRef = ref<FormInstance>();

  const formState = reactive<{
    /** 产品ID */
    productId?: string;
    /** DHR模板ID */
    tmplId?: string;
    /** 物料类型 */
    materialStatus?: string;
    /** 物料编号 */
    materialNo?: string;
  }>({
    productId: undefined,
    materialStatus: MaterialStatusEnum.LOT,
    materialNo: undefined,
  });

  watch(
    () => props.context,
    () => {
      Object.keys(props.context).forEach((key) => {
        formState[key] = props.context[key];
      });
    },
    {
      immediate: true,
    },
  );

  watch(
    () => formState.productId,
    async (newProductId) => {
      if (!newProductId) {
        formState.tmplId = undefined;
        return;
      }
      const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_product_process',
          bsKey: 'biz_get_edhr_temp',
        },
        { product_id_: newProductId },
      );
      if (res) {
        formState.tmplId = res;
      } else {
        formState.tmplId = undefined;
      }
    },
  );

  async function onSave() {
    try {
      await formRef.value?.validate();

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
