<template>
  <a-select
    :class="[!border && 'custom-select-no-arrow']"
    v-model:value="localVal"
    :placeholder="t('sys.chooseText')"
    :bordered="border"
    :showSearch="false"
    :showArrow="false"
    :allowClear="false"
    :open="false"
    :fieldNames="{ label: 'fieldLabel', value: 'refId' }"
    :options="optionsData"
    @click.stop="openModal()"
  />
</template>

<script setup lang="ts" name="online-form-model-select">
  import { computed, h, ref, toRaw, watch } from 'vue';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import OnlineFormModelModal from './online-form-model-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';

  const moduleType = FormDesignEnum.ONLINE_FORM;

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      joinFormRefId?: string;
      joinModelKey?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:joinFormRefId', value?: string): void;
    (e: 'update:joinModelKey', value?: string): void;
  }>();

  // 关联表单下拉框
  const _options = ref<any[]>([]);

  const localVal = computed({
    get() {
      return props.joinFormRefId;
    },
    set(v) {
      emit('update:joinFormRefId', v);
    },
  });

  watch(
    () => localVal.value,
    async (v) => {
      if (v) {
        let data = _options.value.find((e) => e.refId === v);
        if (!data) {
          const id = v ? v.split(':')[1] || v.split(':')[0] : '';
          data = await getTmplInfo(id);
        }
      }
    },
    {
      immediate: true,
    },
  );

  const optionsData = computed(() => {
    const data = _options.value.map((e) => {
      return {
        ...e,
        fieldLabel: `${e.name}${e.version ? ' : ' + e.version : ''}`,
      };
    });
    return data;
  });

  async function getTmplInfo(id) {
    const res: any = await getFormRelateInfo({
      id,
      moduleType: moduleType,
    });
    res &&
      _options.value.push({
        ...res,
        refId: res.baseId ? res.baseId + ':' + res.id : res.id,
      });
    return res;
  }

  function getOptionValue(v = localVal.value) {
    let data = optionsData.value.find((i) => i.refId === v);
    return toRaw(data);
  }

  const openModal = async () => {
    const res: any = await gct.openUtil.modal(
      OnlineFormModelModal,
      {
        formSelected: getOptionValue(),
        modelSelected: props.joinModelKey,
        moduleType: moduleType,
      },
      {
        title: '表单模型选择',
        width: 800,
        okText: t('sys.okText'),
        okButtonProps: {
          disabled: true,
        },
      },
    );
    if (res.ok && res.params) {
      emit('update:joinModelKey', res.params.modelKey);
      localVal.value = res.params.formId;
    }
  };
</script>

<style scoped></style>
