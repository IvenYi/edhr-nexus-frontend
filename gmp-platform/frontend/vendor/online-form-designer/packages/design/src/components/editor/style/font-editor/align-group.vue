<template>
  <div class="align-group-box">
    <div
      v-for="item in options"
      :key="item.value"
      class="icon-box"
      :class="value === item.value ? 'selected' : null"
      @click="changeAlign(item.value)"
    >
      <a-tooltip>
        <template #title>{{ item.label }}</template>
        <span class="iconfont" :class="item.icon"></span>
      </a-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts" name="align-group">
  import { TextAlign } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n() as any;

  const options = [
    {
      label: t('sys.platform.left'),
      value: TextAlign.LEFT,
      icon: 'icon-zuoduiqi',
    },
    {
      label: t('sys.platform.center'),
      value: TextAlign.CENTER,
      icon: 'icon-juzhongduiqi',
    },
    {
      label: t('sys.platform.right'),
      value: TextAlign.RIGHT,
      icon: 'icon-youduiqi',
    },
    {
      label: t('sys.platform.justify'),
      value: TextAlign.JUSTIFY,
      icon: 'icon-liangduanduiqi',
    },
  ];

  defineProps<{
    value?: TextAlign;
  }>();

  const emit = defineEmits<{
    (e: 'update:value', value: TextAlign): void;
  }>();
  const changeAlign = (align) => {
    emit('update:value', align);
  };
</script>

<style lang="less" scoped>
  .icon-box {
    flex: 1;
    height: 22px;
    line-height: 22px;
    text-align: center;
    cursor: pointer;
    border-radius: 2px;

    .iconfont {
      padding: 3px 4px;
      border-radius: 2px;
      &:hover {
        background-color: #e6e9ef;
      }
    }
  }

  .selected {
    background-color: #ffffff;
  }

  .align-group-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 26px;
    background-color: #f2f4f7;
    margin-bottom: 8px;
    border-radius: 4px;
    padding: 2px;
  }
</style>
