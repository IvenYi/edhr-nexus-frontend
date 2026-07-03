<template>
  <Icon
    v-if="simpleBtn"
    class="i18n-icon simple-btn"
    :class="{ 'is-highlight': isHighlight }"
    icon="ion:language"
    @click="handleOpenI18nSelectModal"
  />
  <a-tooltip v-else-if="isHighlight" color="#fff" placement="topRight">
    <template #title>
      <div class="i18n-tooltip-title">语言标识：{{ i18nValue }}</div>
      <div v-for="item in getEnableLocaleList" :key="item.id" class="i18n-tooltip-item">
        <strong>{{ item.language }}: </strong>
        <span style="margin-left: 4px">{{ i18nMap[item.languageTag] }}</span>
      </div>
    </template>
    <a-button
      v-bind="buttonExtraProps"
      :class="{ 'is-highlight': isHighlight }"
      :style="{
        '--btn-width': btnWidth,
        '--btn-height': btnHeight,
      }"
      @click="handleOpenI18nSelectModal"
      :size="size"
    >
      <template #icon>
        <Icon class="i18n-icon" icon="ion:language" />
      </template>
    </a-button>
  </a-tooltip>
  <a-button
    v-else
    v-bind="buttonExtraProps"
    :class="{ 'is-highlight': isHighlight }"
    :style="{
      '--btn-width': btnWidth,
      '--btn-height': btnHeight,
    }"
    @click="handleOpenI18nSelectModal"
    :size="size"
  >
    <template #icon>
      <Icon class="i18n-icon" icon="ion:language" />
    </template>
  </a-button>
</template>
<script setup lang="ts" name="i18n-select-btn">
  import { computed, watch, reactive } from 'vue';
  import type { ButtonProps } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useI18nSelect } from '/@/components/I18nSelect';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';
  import { isEmpty } from 'lodash-es';
  import { getI18nInfoPageList } from '/@/apis/gct-apaas/I18nInfoController';

  const { getEnableLocaleList } = useLocaleStoreWithOut();

  const i18nInstance = useI18nSelect();

  interface Props {
    i18nValue?: string;
    buttonExtraProps?: ButtonProps;
    size?: string;
    i18nModalKey?: string;
    simpleBtn?: boolean;
    btnHeight?: string;
    btnWidth?: string;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['on-select-i18n', 'closed']);

  const i18nMap = reactive<Recordable<any>>({});

  const isHighlight = computed<boolean>(() => {
    return !isEmpty(props.i18nValue);
  });

  const getTableData = async (keyword?) => {
    const result = await getI18nInfoPageList({
      pageNo: 1,
      pageSize: 20,
      searchKey: keyword,
    });

    if (result && result.data) {
      const row = result.data.find((item) => item.key === props.i18nValue);
      if (row) {
        Object.assign(
          i18nMap,
          Object.fromEntries(
            Object.entries(JSON.parse(row.info as string)).map(([_, item]: [string, any]) => [
              item.locale,
              item.info,
            ]),
          ),
        );
      }
    }
  };

  watch(
    () => props.i18nValue,
    () => {
      if (!isEmpty(props.i18nValue)) {
        getTableData(props.i18nValue);
      }
    },
    {
      immediate: true,
    },
  );

  const handleOpenI18nSelectModal = () => {
    i18nInstance.open({
      i18nModalKey: props.i18nModalKey,
      saveCallback: (params) => {
        emit('on-select-i18n', { ...params });
      },
      destroyCallback: () => {
        emit('closed');
      },
    });
  };
</script>
<style scoped lang="less">
  .ant-btn {
    background-color: #fff !important;

    &.ant-btn-icon-only {
      width: var(--btn-width, 32px);
      height: var(--btn-height, 32px);
    }

    &.ant-btn-icon-only.ant-btn-sm {
      width: 28px;
      height: 28px;
    }

    &:hover {
      .i18n-icon {
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        color: var(--ant-primary-color);
      }
    }
  }

  .ant-btn.is-highlight {
    border-color: var(--ant-primary-color);
    color: var(--ant-primary-color);

    .i18n-icon {
      color: var(--ant-primary-color);
    }
  }

  .i18n-icon {
    display: flex !important;
    color: #7f8695;
  }

  .simple-btn {
    &:hover {
      color: var(--ant-primary-color);
    }

    &.is-highlight {
      color: var(--ant-primary-color);
    }
  }

  .i18n-tooltip-title {
    margin-bottom: 12px;
    color: #303133;
    font-size: 16px;
    line-height: 1;
  }

  .i18n-tooltip-item {
    color: #606266;
    font-size: 14px;
  }

  .custom-i18n-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: #fff;
    color: #303133;
    font-size: 14px;
    vertical-align: middle;

    &.reg-i18n {
      position: absolute;
      right: -32px;
      bottom: 0;
    }
  }
</style>
