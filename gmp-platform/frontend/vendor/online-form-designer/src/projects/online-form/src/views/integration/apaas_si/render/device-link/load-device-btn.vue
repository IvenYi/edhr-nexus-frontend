<template>
  <a-dropdown class="load-device-btn">
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="selectTmpl">{{ $t('sys.edhr.selectDeviceTmpl') }}</a-menu-item>
        <a-menu-item v-if="c.state.IOTPermission || c.state.OCRPermission" key="createTmpl">
          {{ $t('sys.edhr.addTmpl') }}
        </a-menu-item>
      </a-menu>
    </template>
    <a-button class="load-device-btn">
      <i :class="['gct-iconfont icon-shujujiazai']" class="mr6px text-14px!"></i
      >{{ $t('sys.edhr.loadData') }}
    </a-button>
  </a-dropdown>
</template>

<script lang="ts" setup name="load-device-btn">
  import { useDeviceTmpl, type DeviceLink } from './hook';
  import { useFormTmplConfig } from '@gct/nocode-base';

  const c = useFormTmplConfig().injectController();

  const { createTmpl, selectTmpl } = useDeviceTmpl();

  const props = defineProps<{
    runningTmplIds?: string[];
  }>();

  const emit = defineEmits<{
    (e: 'select', result?: DeviceLink.BasicTmpl): void;
  }>();

  /** 选择模板 */
  const doSelectTmpl = async () => {
    const result = await selectTmpl({
      runningTmplIds: props.runningTmplIds,
    });
    console.log(result);
    emit('select', result);
  };

  const handleMenuClick = (e: any) => {
    switch (e.key) {
      case 'selectTmpl':
        doSelectTmpl();
        break;
      case 'createTmpl':
        createTmpl();
        break;
      default:
        break;
    }
  };
</script>

<style lang="less" scoped>
  .load-device-btn {
  }
</style>
