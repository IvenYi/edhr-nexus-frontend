<template>
  <div v-if="!isSimple" class="expression-card">
    <div class="expression-card__title">
      <a-button :disabled="configDisabled" type="link" @click="handleConfig">
        <div class="flex items-center">
          <i class="iconfont icon-shezhi mr-3px"></i>{{ t('sys.config') }}
        </div>
      </a-button>
      <a-button type="link" danger @click="handleDelete">
        <div class="flex items-center">
          <i class="iconfont icon-shanchu mr-3px"></i>{{ t('sys.delete') }}
        </div>
      </a-button>
    </div>
    <div class="expression-card__content">{{ expr }}</div>
  </div>
  <div v-else>
    <a-input
      :allowClear="false"
      v-model:value="expressionText"
      v-if="configDisabled"
      readOnly
      disabled
      :placeholder="t('sys.inputText')"
    />
    <a-input
      :allowClear="false"
      v-model:value="expressionText"
      v-else
      readOnly
      @click="handleConfig"
      :placeholder="t('sys.inputText')"
    />
  </div>
</template>

<script lang="ts" setup>
  import { createVNode, computed } from 'vue';
  import { Form, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps({
    expr: {
      type: String,
      default: '',
    },
    configDisabled: {
      type: Boolean,
      default: false,
    },
    isSimple: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:expr', 'config']);

  const { onFieldChange } = Form.useInjectFormItemContext();

  const expressionText = computed(() => {
    return props.expr;
  });

  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.sureToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        emit('update:expr', '');
        onFieldChange();
      },
      onCancel() {},
    });
  };

  const handleConfig = () => {
    emit('config');
  };

  defineExpose({
    onFieldChange,
  });
</script>

<style lang="less" scoped>
  .expression-card {
    overflow: hidden;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;

    &__title {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 36px;
      border-bottom: 1px solid #eaeaea;
    }

    &__content {
      min-height: 80px;
      padding: 10px;
    }
  }

  .ant-btn {
    padding: 4px 10px;
  }
</style>
