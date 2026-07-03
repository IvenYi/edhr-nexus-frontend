<template>
  <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical" class="p16px">
    <div v-for="(section, sectionKey) in currentConfig" :key="sectionKey">
      <div class="font-bold mt-4 mb-2">{{ t(`sys.kit.qms.chart.${sectionKey}`) }}</div>
      <a-row :gutter="16">
        <a-col v-for="field in section" :key="field.name" :span="12">
          <a-form-item :name="field.name" :label="field.label">
            <a-input-number
              v-model:value="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :precision="precision"
              @change="handleChange(section, sectionKey, field)"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </div>

    <!-- 提交按钮 -->
    <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
      <a-button style="margin-right: 8px" @click="onCancel">取消</a-button>
      <a-button type="primary" @click="onSubmit" :loading="confirmLoading">确认</a-button>
    </div>
  </a-form>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { message as Message } from 'ant-design-vue';
  import BigNumber from 'bignumber.js';
  // defineProps is a compiler macro, no import needed
  import { EntityModelCategoryEnum, IModal } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EControlChart } from '../../../enums/index';
  import { deepMergeWithBPriority } from '../../../utils/index';

  const props = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const { t } = useI18n();

  // 定义所有图表类型的配置
  const formConfigs = {
    [EControlChart.X_BAR_R]: {
      common: [
        { name: 'usl_', label: '规格上限(USL):', placeholder: '请输入上规格线' },
        { name: 'lsl_', label: '规格下限(LSL):', placeholder: '请输入下规格线' },
        { name: 'sl_', label: '规格中心线(SL):', placeholder: '请输入规格中心线', disabled: true },
      ],
      ave: [
        {
          name: 'ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
      range: [
        {
          name: 'r_ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'r_cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
    },
    [EControlChart.XBar_S]: {
      common: [
        { name: 'usl_', label: '规格上限(USL):', placeholder: '请输入上规格线' },
        { name: 'lsl_', label: '规格下限(LSL):', placeholder: '请输入下规格线' },
        { name: 'sl_', label: '规格中心线(SL):', placeholder: '请输入规格中心线', disabled: true },
      ],
      ave: [
        {
          name: 'ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
      sd: [
        {
          name: 'r_ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'r_cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
    },
    [EControlChart.I_MR]: {
      common: [
        { name: 'usl_', label: '规格上限(USL):', placeholder: '请输入上规格线' },
        { name: 'lsl_', label: '规格下限(LSL):', placeholder: '请输入下规格线' },
        { name: 'sl_', label: '规格中心线(SL):', placeholder: '请输入规格中心线', disabled: true },
      ],
      singleValue: [
        {
          name: 'ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
      moveRange: [
        {
          name: 'r_ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'r_cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
    },
    [EControlChart.M_R]: {
      common: [
        { name: 'usl_', label: '规格上限(USL):', placeholder: '请输入上规格线' },
        { name: 'lsl_', label: '规格下限(LSL):', placeholder: '请输入下规格线' },
        { name: 'sl_', label: '规格中心线(SL):', placeholder: '请输入规格中心线', disabled: true },
      ],
      median: [
        {
          name: 'ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
      range: [
        {
          name: 'r_ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
          disabled: true,
        },
        {
          name: 'r_target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'r_cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: false,
          disabled: true,
        },
      ],
    },
    [EControlChart.P]: {
      unqualifiedRate: [
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
      ],
    },
    [EControlChart.NP]: {
      unitUnqualifiedRate: [
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
      ],
    },
    [EControlChart.C]: {
      unqualifiedNum: [
        {
          name: 'ucl_',
          label: '上控制线(UCL):',
          placeholder: '请输入上控制线',
          required: true,
        },
        {
          name: 'lcl_',
          label: '下控制线(LCL):',
          placeholder: '请输入下控制线',
          required: true,
        },
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
        {
          name: 'cl_',
          label: '控制中心线(CL):',
          placeholder: '请输入控制中心线',
          required: true,
        },
      ],
    },
    [EControlChart.U]: {
      defectNum: [
        {
          name: 'target_',
          label: '目标值(Target):',
          placeholder: '请输入目标值',
          required: true,
        },
      ],
    },
  };

  const formRef = ref();
  const confirmLoading = ref(false);
  const formData = ref<Record<string, number | string>>({});

  // 获取当前图表类型
  const chartType = computed(() => props.data?.chartType || 'X_BAR_R');

  // 根据图表类型获取对应的配置
  const currentConfig = computed(() => {
    return formConfigs[chartType.value] || {};
  });

  const precision = computed(() => {
    return props.data?.scale_ || undefined;
  });

  const rules = computed(() => {
    const result: Record<string, any> = {};
    const config = currentConfig.value;

    Object.keys(config).forEach((sectionKey) => {
      const section = config[sectionKey];
      if (sectionKey === 'common') return;

      section.forEach((field) => {
        if (field.required) {
          result[field.name] = [
            { required: true, message: `${field.label.replace(/[:：]/, '')} 是必填项！` },
          ];
        }
      });
    });

    return result;
  });

  function handleChange(section, sectionKey, field) {
    const fieldKey = field.name;
    if (
      (fieldKey === 'usl_' && formData.value['lsl_']) ||
      (fieldKey === 'lsl_' && formData.value['usl_'])
    ) {
      const uslNum = new BigNumber(formData.value['usl_']);
      const lslNum = new BigNumber(formData.value['lsl_']);
      formData.value['sl_'] = uslNum.minus(uslNum.minus(lslNum).div(2)).toNumber();
    }
    const isR = field.name.indexOf('r_') !== -1;
    const uclField = isR ? 'r_ucl_' : 'ucl_';
    const lclField = isR ? 'r_lcl_' : 'lcl_';
    const clField = isR ? 'r_cl_' : 'cl_';
    if (
      (fieldKey === uclField && formData.value[lclField]) ||
      (fieldKey === lclField && formData.value[uclField])
    ) {
      const uclNum = new BigNumber(formData.value[uclField]);
      const lclNum = new BigNumber(formData.value[lclField]);
      formData.value[clField] = uclNum.minus(uclNum.minus(lclNum).div(2)).toNumber();
    }
  }

  function onCancel() {
    props.modal.dismiss();
  }

  async function onSubmit() {
    try {
      const values = await formRef.value.validate();
      // 如果没有主表id不执行
      if (!props.data.id_) return;
      confirmLoading.value = true;
      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_plan',
          bsKey: 'submit',
        },
        {
          id_: props.data.id_,
          prop_config_: JSON.stringify(values),
        },
      );
      Message.success('提交成功');
      props.modal.dismiss({ ok: true });
    } catch (error) {
      console.error('表单校验失败:', error);
      confirmLoading.value = false;
    }
    confirmLoading.value = false;
  }

  onMounted(async () => {
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_plan',
        bsKey: 'getOne',
      },
      {
        query: {
          id_: props.data.id_,
        },
      },
    );
    const { data } = res as any;
    const _data = typeof data?.prop_config_ === 'string' ? JSON.parse(data.prop_config_) : {};
    const propsDataConfig =
      typeof props.data?.prop_config_ === 'string' ? JSON.parse(props.data.prop_config_) : {};
    formData.value = deepMergeWithBPriority(_data, propsDataConfig);
  });
</script>
