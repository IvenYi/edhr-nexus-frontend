<template>
  <van-popup
    v-model:show="detailShow"
    destroy-on-close
    round
    close-on-click-overlay
    position="right"
    :style="{ width: '40%', height: '100%' }"
    :teleport="teleport"
  >
    <div class="popup-container">
      <div class="popup-title">
        <div class="title-text"> 详情 </div>
        <van-icon name="cross" @click="handleCancel" />
      </div>

      <div class="popup-content">
        <van-form ref="refForm">
          <van-cell>
            <template #default>
              <select-field
                v-if="dataCollection?.type === 'select'"
                :widget="dataCollection"
                :rowValue="dataCollection"
              />

              <field-widget v-else :widget="dataCollection" :rowValue="dataCollection" />
            </template>
          </van-cell>
        </van-form>
      </div>

      <div class="popup-footer">
        <div class="footer-btns">
          <van-button class="footer-btn" type="default" @click="handleCancel" :disabled="loading">
            取消
          </van-button>
          <van-button
            class="footer-btn"
            type="primary"
            @click="handleSubmit"
            :disabled="loading"
            :loading="submitLoading"
          >
            保存
          </van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
  import { ref, watch, provide } from 'vue';
  import { showToast, showNotify } from 'vant';
  import fieldWidget from '/@page-designer/components/widgets/pad/__components__/fieldByList/index.vue';
  import selectField from './select-field.vue';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  const { teleport } = usePadTeleport();

  const props = defineProps({
    dataCollection: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['refresh-data', 'save-value']);

  const refForm = ref(null);
  const detailShow = ref(false);

  provide('form-layout', 'horizontal');

  watch(
    () => detailShow.value,
    (val) => {
      if (val) {
        // 打开弹窗时的逻辑
      }
    },
    { immediate: true },
  );

  watch(
    () => props.dataCollection,
    (val) => {
      if (val) {
        console.log(val, '=======');
        // 数据变化时的逻辑
      }
    },
  );

  const loading = ref(false);
  const submitLoading = ref(false);

  const onOpen = () => {
    detailShow.value = true;
  };

  const onClose = () => {
    detailShow.value = false;
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async () => {
    try {
      submitLoading.value = true;
      const newValue = props.dataCollection?.value_;

      console.log(props.dataCollection, '=========== props.dataCollection');

      // 将当前编辑值透传给外部，由父组件更新数据源
      emit('save-value', { id_: props.dataCollection?.id_, value_: newValue });

      showToast('保存成功');
      onClose();
    } catch (error) {
      showNotify({ type: 'danger', message: error?.message || '保存失败' });
    } finally {
      submitLoading.value = false;
    }
  };

  defineExpose({ onOpen, onClose });
</script>

<style scoped>
  .popup-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .popup-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebedf0;
    flex-shrink: 0;
  }

  .title-text {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
    min-height: 0;
  }

  .popup-footer {
    padding: 16px;
    border-top: 1px solid #ebedf0;
    flex-shrink: 0;
    margin-top: auto;
  }

  .required {
    color: #ff4d4f;
    margin-right: 4px;
    font-size: 14px;
  }

  .footer-btns {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .footer-btn {
    flex: 1;
    margin: 0;
  }
</style>
