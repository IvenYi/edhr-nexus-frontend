<template>
  <div class="select-tmpl-drawer">
    <a-empty
      v-if="list.length === 0"
      :description="$t('sys.onlineForm.noTemplateYet')"
      :image="EmptyImg"
    />
    <template v-else>
      <component
        :class="['select-tmpl-drawer__item', selectedTmpl?.id === tmpl.id ? 'selected' : '']"
        v-for="(tmpl, i) in list"
        :key="tmpl.id"
        :is="type2Component[tmpl.type]"
        :tmpl="tmpl"
        :isRunning="_runningTmplIds?.includes(tmpl.id)"
        @click="selectTmpl(tmpl)"
        @edit="doEdit"
        @detail="doDetail"
        @disconnect="doDisconnect"
      />
    </template>
  </div>
</template>

<script setup lang="ts" name="select-tmpl-drawer">
  import { computed, onMounted, reactive, ref, toRaw } from 'vue';
  import { message, type FormInstance } from 'ant-design-vue';
  import { useModal } from '@gct/runtime';
  import {
    DeviceLink,
    FormModelController,
    FormTmplConfigController,
    useFormModel,
  } from '@gct/nocode-base';
  import DeviceTmplCard from './device-tmpl-card.vue';
  import AiTmplCard from './ai-tmpl-card.vue';
  import { useDeviceTmpl } from '../hook';
  import { cloneDeep } from 'lodash-es';
  import EmptyImg from '@/assets/images/empty-2.svg';

  const props = defineProps<{
    runningTmplIds?: string[];
    formModelController: FormModelController;
    formTmplConfigController: FormTmplConfigController;
  }>();

  const _runningTmplIds = computed(() => {
    return props.formTmplConfigController.state.runningTmpls?.map((i) => i.id);
  });

  // 透传给子组件用
  const { provideController } = useFormModel();
  provideController(props.formModelController);
  // 给模态抽屉用
  const { editTmpl, openTmplDetail } = useDeviceTmpl({
    formModelController: props.formModelController,
    formTmplConfigController: props.formTmplConfigController,
  });

  const type2Component = {
    [DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION]: DeviceTmplCard,
    [DeviceLink.TmplTypeEnum.AI_OCR]: AiTmplCard,
  };

  const list = ref<DeviceLink.BasicTmpl[]>([]);

  const selectedTmpl = ref<DeviceLink.BasicTmpl>();

  /** 加载模板数据 */
  const loadData = () => {
    // 拷贝一份去操作修改
    list.value = cloneDeep(props.formTmplConfigController.state.tmpls).map((tmpl) => {
      // 如果有运行中的模板，用运行中的模板作为数据来源
      const runningTmpls = props.formTmplConfigController.state.runningTmpls;
      const find = runningTmpls.find((i) => i.id === tmpl.id);
      return cloneDeep(find) ?? tmpl;
    });
  };

  onMounted(() => {
    loadData();
  });

  /** 设备选择变更回调 */
  const selectTmpl = (tmpl) => {
    selectedTmpl.value = tmpl;
  };

  const validate = () => {
    if (selectedTmpl.value) {
      if (selectedTmpl.value.type === DeviceLink.TmplTypeEnum.AI_OCR) {
        if (!(selectedTmpl.value as DeviceLink.AIOcrTmpl).inputMode) {
          message.error($t('sys.onlineForm.pleaseSelectInputMethod'));
          return false;
        }
      } else {
        if (!(selectedTmpl.value as DeviceLink.DeviceInterconnectionTmpl).runtimeDeviceId) {
          message.error($t('sys.onlineForm.selectDevice'));
          return false;
        }
      }
      return true;
    }
    message.error($t('sys.onlineForm.pleaseSelectTemplate'));
    return false;
  };

  /** 编辑模板 */
  const doEdit = async (tmpl: DeviceLink.BasicTmpl) => {
    console.log('doEdit', tmpl);
    const res = await editTmpl(tmpl);
    if (res.ok) {
      loadData();
    }
  };

  /** 查看模板 */
  const doDetail = async (tmpl: DeviceLink.BasicTmpl) => {
    console.log('doDetail', tmpl);
    openTmplDetail(tmpl);
  };

  const doDisconnect = async (tmpl: DeviceLink.BasicTmpl) => {
    console.log('doDisconnect', tmpl);
    props.formTmplConfigController.disconnect(tmpl);
  };

  useModal(() => {
    const isOk = validate();
    props.formTmplConfigController.cacheRunningTmpl(toRaw(selectedTmpl.value!));
    return {
      // 修改过后返回ok,外面刷新数据
      ok: isOk,
      data: cloneDeep(toRaw(selectedTmpl.value)),
    };
  });
</script>

<style lang="less" scoped>
  .select-tmpl-drawer {
    padding: 16px;
    background: #f7f8fa;
    height: 100%;
    overflow: auto;

    :deep(.ant-empty) {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .ant-empty-image {
        height: 114px;
      }
      .ant-empty-description {
        font-weight: 400;
        font-size: 14px;
        color: #8b8b8b;
      }
    }

    &__item {
      border-radius: 6px 6px 6px 6px;
      border: 1px solid transparent;
      background: #ffffff;
      &:hover {
        border-color: var(--ant-primary-color);
      }
      &.selected {
        box-shadow: 0px 2px 12px -2px rgba(0, 0, 0, 0.08);
        border-color: var(--ant-primary-color);
      }
    }
  }
</style>
