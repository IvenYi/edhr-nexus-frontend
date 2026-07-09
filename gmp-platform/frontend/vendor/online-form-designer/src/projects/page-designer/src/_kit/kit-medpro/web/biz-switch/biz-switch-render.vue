<template>
  <a-form :layout="layout">
    <a-form-item labelAlign="right" class="gct-biz-switch">
      <template #label>
        <div :title="label">
          <a-tooltip v-if="!!showExplain">
            <template #title> {{ explain }}</template>
            <question-circle-outlined
              class="explain-icon ml5px color-cyan"
              :style="{ color: 'var(--ant-primary-color)' }"
            />
          </a-tooltip>
          {{ label }}
        </div>
      </template>

      <a-switch v-model:checked="checked" @change="handleChange" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts" name="gct-biz-switch">
  import { toRefs, ref, onMounted } from 'vue';
  import { IBizSwitch } from './schema';
  import {
    getSysConfigInfo,
    postSysConfig,
    putSysConfigById,
  } from '/@/apis/gct-apaas/SysConfigController';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Modal, message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const Event = getPageEvent();

  const props = defineProps<{
    widget: IBizSwitch;
  }>();

  const { label, showExplain, explain, key, layout } = toRefs(props.widget.props);

  const checked = ref<boolean>(false);

  const handleChange = (val) => {
    checked.value = !checked.value;
    Modal.confirm({
      title: t('sys.sureToDo'),
      okText: t('sys.ok2'),
      cancelText: t('sys.cancel'),
      async onOk() {
        putSysConfigById({ id: key.value }, { value: val }).then(() => {
          checked.value = val;
          message.success(t('sys.operationSuccess'));
          Event.runEventByName('onChange', props.widget.events, val);
        });
      },
      onCancel() {},
    });
  };

  const submit = (val) => {
    putSysConfigById({ id: key.value }, { value: val });
  };

  onMounted(() => {
    getSysConfigInfo({ key: key.value }).then((res) => {
      if (res === null) {
        postSysConfig({ id: key.value, value: 'false', type: 'USER_DEFINED' }).then(() => {
          checked.value = false;
        });
      } else {
        checked.value = res?.value === 'true';
      }
    });
  });

  defineExpose({
    getValue() {
      return checked.value;
    },
    setValue(v) {
      checked.value = v;
      submit(v);
    },
  });
</script>

<style scoped lang="less">
  .gct-biz-switch {
    :deep(.ant-form-item-label) {
      padding: 0;
    }
  }
</style>
