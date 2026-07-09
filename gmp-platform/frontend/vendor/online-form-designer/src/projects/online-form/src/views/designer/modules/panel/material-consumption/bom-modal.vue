<template>
  <ModalWrapper
    :opts="modalOptions"
    :class="['form-import-modal']"
    :disabled-ok="disabledOk"
    :do-ok="doOk"
  >
    <div :class="['form-import-modal__content']">
      <InsidePage :pageCallback="pageCallback" ref="page" linkPage="web_HWjQcSJq_6ibs" />
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="form-import-modal">
  import { reactive, computed, watch, onMounted, ref } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';

  import InsidePage from '/@web-render/render/components/inside-page.vue';
  import type { EventsPc } from '/@web-render/render/Event/EventsPc';
  import { IBomEntry } from '@gct/nocode-base';

  const props = defineProps<{
    modal: IModal;
    data?: any;
    /** 已经有的物料id集合 */
    hasIds: string[];
  }>();

  const openType = computed(() => {
    return props.data ? 'edit' : 'add';
  });

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    title: props.data ? $t('sys.edit') : $t('sys.add'),
    width: 800,
    height: 900,
  });

  let Event: EventsPc;

  const pageCallback = (_Event) => {
    Event = _Event;
    Event.runAsyncExportByName('init', {
      openType: openType.value,
      data: props.data ?? {},
      hasIds: props.hasIds,
    });
  };

  /** 禁用确认按钮 */
  const disabledOk = computed(() => {
    return false;
  });

  const doOk = async () => {
    console.log($t('sys.appDesigner.ok'));
    const CTX = Event.context;
    const formEl = (await CTX.$asyncRef('form_33260511628')) as any;
    await formEl.validate();
    const formData = formEl.getValue() as IBomEntry;
    console.log('获取到的数据formData', formData);
    return {
      ok: true,
      data: formData,
    };
  };
</script>

<style lang="less" scoped>
  .form-import-modal {
    :deep(.modal-wrapper__content) {
      overflow: auto;
    }
    &__content {
      padding: 24px;
    }
  }
</style>
