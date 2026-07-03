<template>
  <div :class="{ 'w100%': true, onlineform: templateId }" @click="handlerOpen">
    <!-- <a-empty v-else />
    <online-form-modal
      :dataId="value"
      @register="register"
      @update:modelValue="updateValue"
      @saveFormData="saveFormData"
    />
    <IconNext
      class="full-screen-icon"
      value="icon-park:full-screen-one"
      :size="48"
      :style="{
        lineHeight: '1',
        zIndex: 101,
      }"
    /> -->
  </div>
</template>
<script setup lang="ts" name="gct-online-form">
  import { computed, reactive, toRefs, ref, onBeforeMount, watch } from 'vue';

  import { OnlineForm } from '/@page-designer/types/web';
  import { postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { getStashInfo } from '/@/apis/gct-apaas/StashController';
  import { TransactionMode, EntityModelCategoryEnum } from '@gct/runtime';
  import { debounce, isEmpty } from 'lodash-es';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { useModal } from '/@/components/Modal';
  import onlineFormModal from './component/online-form-modal.vue';
  import { useOnlineEvent } from './hooks';
  import { RenderModeEnum } from '@gct/nocode-base';

  const props = defineProps<{ modelValue?: string; widget: OnlineForm; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, value } = useFormWidget(props, emit);
  /**表单暂存对象 */
  const onlineFormData = ref({});
  const [register, { openModal }] = useModal();

  const tempRef = ref();
  /**表单模版key */
  const templateKey = ref('');
  const templateId = ref();
  const formModelKey = ref();
  const { readonly, disabled, hidden } = toRefs(props.widget.props);
  const { refField, ruleConfig, templateRefType, modelKey } = reactive(props.widget.props);
  const { gctSubmit, gctTemporaryStorage } = useOnlineEvent(props.widget);
  const watchRefkey = computed(() => {
    if (templateRefType === TransactionMode.CURRENT) {
      return props.formData?.[refField];
    } else {
      return props.formData?.[ruleConfig?.nodes?.[0]?.fieldKey];
    }
  });
  const getReftemplatekey = debounce(reftemplatekey, 200);
  watch(
    watchRefkey,
    (refValue) => {
      if (refValue) {
        getReftemplatekey(refValue);
      }
    },
    { immediate: true },
  );

  /**动态获取表单模版 */
  async function reftemplatekey(refValue: string) {
    try {
      if (templateRefType === TransactionMode.CURRENT) {
        templateKey.value = refValue;
      } else {
        /**标签模版引用其他模型 */
        const { fieldKey, nodes } = ruleConfig;
        templateKey.value =
          (await postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory(
            { modelCategory: EntityModelCategoryEnum.ENTITY },
            {
              // dataIds: refValue,
              fieldKey,
              modelKey,
              refModelChain: nodes,
              queryParams: { ...props.formData },
            },
          )) || '';
      }

      // 获取表单模板信息
      const res = await getOnlineFormTmplGetVersionById({ id: templateKey.value });
      templateId.value = res?.id;
      formModelKey.value = res?.modelKey;
    } catch (error) {
      templateId.value = '';
      formModelKey.value = '';
    }
  }

  const handlerOpen = async () => {
    if (templateKey.value) {
      openModal(true, {
        templateKey: templateKey.value,
        modelValue: props.modelValue ? JSON.parse(props.modelValue) : {},
        onlineFormData: onlineFormData.value,
      });
    }
  };
  const updateValue = (value) => {
    return setValue(value);
  };

  const saveFormData = (data) => {
    onlineFormData.value = data;
    tempRef.value.resetFormState();
    tempRef.value.setModeType(RenderModeEnum.ViewMode);
  };
  onBeforeMount(() => {
    console.log('hidden',hidden)
    hidden.value = true;
  });

  defineExpose({
    getValue,
    setValue,
    async submit() {
      let data = onlineFormData.value;

      const stashId = props.modelValue ? JSON.parse(props.modelValue)?.stashId : '';
      let dataId = props.modelValue ? JSON.parse(props.modelValue)?.dataId : '';

      if (!dataId) {
        if (isEmpty(data) && stashId) {
          const stashData = await getStashInfo({ id: stashId });
          if (stashData?.content) {
            data = JSON.parse(stashData?.content);
          }
        }
        delete data.data_version_;
        dataId = await gctSubmit(formModelKey.value, data);
      }

      emit(
        'update:modelValue',
        JSON.stringify({
          modelKey: formModelKey.value,
          dataId,
          stashId: undefined,
        }),
      );
    },
    async temporaryStorage() {
      let data = onlineFormData.value;

      let stashId = props.modelValue ? JSON.parse(props.modelValue)?.stashId : '';

      if (isEmpty(data) && stashId) {
        const stashData = await getStashInfo({ id: stashId });
        if (stashData?.content) {
          data = JSON.parse(stashData?.content);
        }
      }

      stashId = await gctTemporaryStorage(data);
      emit(
        'update:modelValue',
        JSON.stringify({
          modelKey: formModelKey.value,
          dataId: undefined,
          stashId,
        }),
      );
    },
    reset() {
      // tempRef.value.resetFormState();
    },
  });
</script>
<style lang="less" scoped>
  .onlineform {
    cursor: pointer;
    position: relative;
    background-color: #e6e9ef;

    .full-screen-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
    }

    &:hover::before {
      content: ' ';
      background-color: rgb(0 0 0 / 40%);
      display: block;
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 100;
    }

    &:hover {
      .full-screen-icon {
        opacity: 1;
      }
    }
  }
</style>
