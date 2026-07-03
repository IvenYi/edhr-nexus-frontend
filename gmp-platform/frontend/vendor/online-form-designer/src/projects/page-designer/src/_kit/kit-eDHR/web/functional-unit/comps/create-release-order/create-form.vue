<template>
  <div class="mt20px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 12 }"
      autocomplete="off"
    >
      <!-- <a-form-item label="放行类型" name="releaseType">
        <a-radio-group v-model:value="formState.releaseType" @change="handleReleaseTypeChange">
          <a-radio :value="ReleaseTypeEnum.SINGLE">单批次/SN放行</a-radio>
          <a-radio :value="ReleaseTypeEnum.MERGE">SN合并放行</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-row class="mb20px" v-if="formState.releaseType === ReleaseTypeEnum.MERGE">
        <a-col span="4" />
        <a-col span="16">
          <info-circle-outlined class="text-[#f5b60a]" />
          <span>
            SN合并放行只需选择放行单模板，将您需要放行的SN全部填写到表单的lot/sn字段中即可，系统会自动进行识别
          </span>
        </a-col>
      </a-row> -->
      <a-form-item
        v-if="formState.releaseType === ReleaseTypeEnum.SINGLE"
        :label="$t('sys.edhr.releaseLotOrSn')"
        name="materialNo"
        :rules="[
          {
            required: formState.releaseType === ReleaseTypeEnum.SINGLE,
            message: $t('sys.webRender.placeholderInput') + $t('sys.edhr.releaseLotOrSn'),
          },
        ]"
        :validateStatus="validateStatus"
        :help="helpStr"
      >
        <a-input
          v-model:value="formState.materialNo"
          :placeholder="$t('sys.webRender.placeholderInput')"
          @pressEnter="onMaterialNoBlur"
          @blur="onMaterialNoBlur"
          @change="handleMaterialNoChange"
        />
      </a-form-item>
      <a-form-item
        name="tmplId"
        :label="$t('sys.edhr.field.releaseTmpl')"
        :rules="[
          {
            required: true,
            message: $t('sys.webRender.placeholderSelect') + $t('sys.edhr.field.releaseTmpl'),
          },
        ]"
      >
        <VersionSelect
          :type="FormDesignEnum.ONLINE_FORM"
          :value="formState.tmplId"
          @select="onFormVersionSelect"
          :query-params="queryParams"
          :enable-control="true"
          :placeholder="$t('sys.webRender.placeholderSelect')"
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, nextTick } from 'vue';
  import VersionSelect from '/@/projects/online-form/src/views/web-render/components/version-select/version-select.vue';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { useModal } from '@gct/runtime';
  import {
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { useEnterFillProcess } from '/@online-form/views/integration/apaas_ebr';
  // import { FIELD_TYPE } from '@gct/runtime';
  // import TraceSelect from '/@/projects/web-render/src/views/edhr-application/components/trace-select/trace-select.vue';

  enum ReleaseTypeEnum {
    SINGLE = 'single',
    MERGE = 'merge',
  }

  const formRef = ref();
  const formState = reactive<{
    releaseType?: ReleaseTypeEnum;
    tmplId?: string;
    materialNo?: string;
    mfgOrderId?: string;
  }>({
    releaseType: ReleaseTypeEnum.SINGLE,
    tmplId: undefined,
    materialNo: undefined,
    mfgOrderId: undefined,
  });

  const queryParams = { formType: [FormTypeEnum.BASE, FormTypeEnum.PROCESS].join(',') };
  const helpStr = ref();
  const validateStatus = ref();

  const { canEnterReleaseFillProcess } = useEnterFillProcess();

  const onFormVersionSelect = (option) => {
    formState.tmplId = `${option.baseId}:${option.id}`;
  };

  const onMaterialNoBlur = async () => {
    await sleep(100);
    const materialNo = formState.materialNo;

    if (materialNo?.trim() && formState.releaseType === ReleaseTypeEnum.SINGLE) {
      try {
        const res: any =
          await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
            {
              bsKey: 'getProductReleaseByMaterialNo',
              modelKey: 'em_product',
              modelCategory: 'entity',
            },
            {},
            { materialNo, type: 'list' },
            { ignoreParamsToData: true },
          );
        helpStr.value = undefined;
        validateStatus.value = undefined;

        // 放行单已经存在，直接展示
        if (res && res.releaseFormInstanceId) {
          helpStr.value = $t('sys.edhr.releaseTmplHasExit');
          validateStatus.value = 'error';
        } else if (res) {
          formState.tmplId = `${res.baseId}:${res.id}`;
          formState.mfgOrderId = res.mfgOrderId;
        }
      } catch (error) {
        // 接口报错不允许创建放行单
        validateStatus.value = 'error';
        helpStr.value = error || error?.message || $t('sys.edhr.releaseTmplCreateFail');
      }
    }
  };

  // const handleReleaseTypeChange = (e) => {
  //   const type = e.target.value;
  //   if (type === ReleaseTypeEnum.MERGE) {
  //     formState.materialNo = undefined;
  //     helpStr.value = undefined;
  //     validateStatus.value = undefined;
  //   }
  // };

  const handleMaterialNoChange = () => {
    const materialNo = formState.materialNo;
    if (!materialNo?.trim()) {
      helpStr.value = undefined;
      validateStatus.value = undefined;
    }
  };

  const onCreate = async () => {
    await formRef.value.validate();
    if (validateStatus.value === 'error') return;
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_release_execute_insert_form',
        modelKey: 'em_product_release_list',
        modelCategory: 'entity',
      },
      { ...formState },
      {},
      { ignoreParamsToData: true },
    );
    if (res) {
      return {
        ok: true,
      };
    }
    return {
      ok: false,
    };
  };

  const sleep = (time: number = 20) => {
    return new Promise(async (resolve) => {
      await nextTick();
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  useModal(onCreate);
</script>
<style lang="less" scoped></style>
