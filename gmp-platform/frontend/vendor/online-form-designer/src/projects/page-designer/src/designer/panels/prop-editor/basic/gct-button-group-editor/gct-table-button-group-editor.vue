<template>
  <div>
    <div class="mb10px">
      <a-button type="primary" @click="addButton" ghost block>
        {{ $t('sys.pageDesigner.addButton') }}
      </a-button>
    </div>
    <a-tabs v-model:activeKey="activeKey" v-show="positionOption.length > 1" class="gct-tabs">
      <a-tab-pane :key="i.value" v-for="i in positionOption" :tab="i.label" />
    </a-tabs>
    <div v-if="!!positionOption.length">
      <tableButtonGroupList
        :defaultNumber="headerRightMaxValue"
        :children="headerRightData"
        v-model:visibleButtons="headerRightVisible"
        :title="$t('sys.pageDesigner.headerButton')"
        v-if="activeKey === ButtonOpeEnum.HEAD"
        :maxValue="headerRightMaxValue"
      />
      <tableButtonGroupList
        :defaultNumber="columnsMaxValue"
        :children="columnsData"
        v-model:visibleButtons="columnsDataVisible"
        :title="$t('sys.pageDesigner.singleLineButton')"
        :maxValue="columnsMaxValue"
        v-if="activeKey === ButtonOpeEnum.SINGLELINE"
      />
      <a-tabs
        v-model:activeKey="activeRdoKey"
        type="card"
        v-if="
          activeKey === ButtonOpeEnum.SINGLELINE_RDO &&
          columnsRdoParentData.length > 0 &&
          columnsRdoChildData.length > 0
        "
      >
        <a-tab-pane
          :key="RdoButtonOpeEnum.parentVersion"
          :tab="$t('sys.pageDesigner.parentVersion')"
        >
          <tableButtonGroupList
            :defaultNumber="3"
            :maxValue="5"
            :children="columnsRdoParentData"
            v-model:visibleButtons="columnsRdoParentDataVisible"
          />
        </a-tab-pane>
        <a-tab-pane :key="RdoButtonOpeEnum.childVersion" :tab="$t('sys.pageDesigner.childVersion')">
          <tableButtonGroupList
            :defaultNumber="3"
            :maxValue="5"
            :children="columnsRdoChildData"
            v-model:visibleButtons="columnsRdoChildDataVisible"
          />
        </a-tab-pane>
      </a-tabs>
      <div
        v-else-if="activeKey === ButtonOpeEnum.SINGLELINE_RDO && columnsRdoParentData.length > 0"
      >
        <div class="mb4px" style="color: rgba(121, 122, 125, 1)">
          {{ $t('sys.pageDesigner.singleLineButton') }}&nbsp;
          {{ $t('sys.pageDesigner.parentVersion') }}
        </div>
        <div class="mb4px">
          <tableButtonGroupList
            :defaultNumber="3"
            :maxValue="5"
            :children="columnsRdoParentData"
            v-model:visibleButtons="columnsRdoParentDataVisible"
          />
        </div>
      </div>
      <div v-else-if="activeKey === ButtonOpeEnum.SINGLELINE_RDO && columnsRdoChildData.length > 0">
        <div class="mb4px" style="color: rgba(121, 122, 125, 1)">
          {{ $t('sys.pageDesigner.singleLineButton') }}&nbsp;
          {{ $t('sys.pageDesigner.childVersion') }}
        </div>
        <div class="mb4px">
          <tableButtonGroupList
            :defaultNumber="3"
            :maxValue="5"
            :children="columnsRdoChildData"
            v-model:visibleButtons="columnsRdoChildDataVisible"
          />
        </div>
      </div>
      <tableButtonGroupList
        :maxValue="headerLeftMaxValue"
        :defaultNumber="headerLeftMaxValue"
        :children="headerLeftData"
        v-model:visibleButtons="headerLeftVisible"
        :title="$t('sys.pageDesigner.batchButton')"
        v-if="activeKey === ButtonOpeEnum.BATCH"
      />
    </div>
  </div>
</template>
<script setup lang="ts" name="gct-table-button-group-editor">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { tableButtonGroupList, addTableButtonGroup } from './components/index';
  import { watchDebounced } from '@vueuse/core';
  import { ButtonOpeEnum, RdoButtonOpeEnum } from '@gct/runtime';

  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const headerRightButton = getData(propConfig.headerRightButton) || [];
  const headerLeftButton = getData(propConfig.headerLeftButton) || [];
  const columnsButton = getData(propConfig.columnsButton) || [];
  const columnsRdoButton = propConfig.columnsRdoButton?.map((i) => getData(i));
  const headerRightMaxValue = getData(propConfig.headerRightMaxValue);
  const columnsMaxValue = getData(propConfig.columnsMaxValue);
  const headerLeftMaxValue = getData(propConfig.headerLeftMaxValue);
  const modelKey = defProps.widget?.props[propConfig?.modelKey] || '';
  const activeKey = ref(ButtonOpeEnum.HEAD);
  const activeRdoKey = ref(RdoButtonOpeEnum.parentVersion);
  function getData(getFun) {
    if (typeof getFun === 'function') {
      return getFun(defProps.widget);
    } else {
      return getFun;
    }
  }
  const positionOption = computed(() => {
    return [
      {
        label: $t('sys.pageDesigner.headerButton'),
        value: ButtonOpeEnum.HEAD,
        show: () => headerRightData.value.length,
      },
      {
        label: $t('sys.pageDesigner.singleLineButton'),
        value: ButtonOpeEnum.SINGLELINE,
        show: () => columnsData.value.length,
      },
      {
        label: $t('sys.pageDesigner.singleLineButton'),
        value: ButtonOpeEnum.SINGLELINE_RDO,
        show: () => !!columnsRdoParentData.value.length || !!columnsRdoChildData.value.length,
      },
      {
        label: $t('sys.pageDesigner.batchButton'),
        value: ButtonOpeEnum.BATCH,
        show: () => headerLeftData.value.length,
      },
    ].filter((i) => i.show());
  });
  onMounted(() => {
    positionOption.value[0] && (activeKey.value = positionOption.value[0].value);
  });
  const headerRightData = computed({
    get() {
      return propValue.value.headerRight?.value || [];
    },
    set(value) {
      if (!propValue.value.headerRight) return;
      const headerRight = { value, visibleButtons: propValue.value.headerRight.visibleButtons };
      propValue.value = { ...propValue.value, headerRight };
    },
  });
  const headerRightVisible = computed({
    get() {
      return propValue.value.headerRight?.visibleButtons;
    },
    set(visibleButtons) {
      if (!propValue.value.headerRight) return;
      const headerRight = { value: propValue.value.headerRight.value, visibleButtons };
      propValue.value = { ...propValue.value, headerRight };
    },
  });
  const headerLeftData = computed({
    get() {
      return propValue.value?.headerLeft?.value || [];
    },
    set(value) {
      if (!propValue.value.headerLeft) return;
      const headerLeft = { value, visibleButtons: propValue.value.headerLeft.visibleButtons };
      propValue.value = { ...propValue.value, headerLeft };
    },
  });
  const headerLeftVisible = computed({
    get() {
      return propValue.value.headerLeft?.visibleButtons;
    },
    set(visibleButtons) {
      if (!propValue.value.headerLeft) return;
      const headerLeft = { value: propValue.value.headerLeft.value, visibleButtons };
      propValue.value = { ...propValue.value, headerLeft };
    },
  });
  const columnsData = computed({
    get() {
      return propValue.value.columns?.value || [];
    },
    set(value) {
      if (!propValue.value.columns) return;
      const columns = { value, visibleButtons: propValue.value.columns.visibleButtons };
      propValue.value = { ...propValue.value, columns };
    },
  });
  const columnsDataVisible = computed({
    get() {
      return propValue.value.columns?.visibleButtons;
    },
    set(visibleButtons) {
      if (!propValue.value.columns) return;
      const columns = { value: propValue.value.columns.value, visibleButtons };
      propValue.value = { ...propValue.value, columns };
    },
  });
  /**父版本按钮数组*/
  const columnsRdoParentData = computed({
    get() {
      return propValue.value.columnsRdo?.parent?.value || [];
    },
    set(value) {
      if (!propValue.value.columnsRdo) return;
      const columnsRdo = {
        parent: { ...propValue.value.columnsRdo.parent, value },
        child: propValue.value.columnsRdo.child,
      };
      propValue.value = { ...propValue.value, columnsRdo };
    },
  });
  /**父版本显示个数 */
  const columnsRdoParentDataVisible = computed({
    get() {
      return propValue.value.columnsRdo?.parent?.visibleButtons;
    },
    set(visibleButtons) {
      if (!propValue.value.columnsRdo) return;
      const columnsRdo = {
        parent: { ...propValue.value.columnsRdo.parent, visibleButtons },
        child: propValue.value.columnsRdo.child,
      };
      propValue.value = { ...propValue.value, columnsRdo };
    },
  });
  /**子版本按钮数组 */
  const columnsRdoChildData = computed({
    get() {
      return propValue.value.columnsRdo?.child?.value || [];
    },
    set(value) {
      if (!propValue.value.columnsRdo) return;
      const columnsRdo = {
        child: { ...propValue.value.columnsRdo.child, value },
        parent: propValue.value.columnsRdo.parent,
      };
      propValue.value = { ...propValue.value, columnsRdo };
    },
  });
  /**子版本显示个数 */
  const columnsRdoChildDataVisible = computed({
    get() {
      return propValue.value.columnsRdo?.child?.visibleButtons;
    },
    set(visibleButtons) {
      if (!propValue.value.columnsRdo) return;
      const columnsRdo = {
        child: { ...propValue.value.columnsRdo.child, visibleButtons },
        parent: propValue.value.columnsRdo.parent,
      };
      propValue.value = { ...propValue.value, columnsRdo };
    },
  });
  async function addButton() {
    const res = await gct.openUtil.modal(
      addTableButtonGroup,
      {
        headerRightButton,
        headerLeftButton,
        columnsButton,
        columnsRdoButton,
        position: propConfig?.position,
      },
      {
        title: $t('sys.pageDesigner.addButton'),
        width: 720,
      },
    );
    if (res.ok) {
      const { position, data, versionMode } = res.data;
      data.forEach((i) => {
        i.props.model = modelKey;
        i.preLocation = defProps.widget?.id;
        i.props.pos = position;
        i.props.modeldata = defProps.widget.props.modeldata;
        propConfig.eventCallback && propConfig.eventCallback(i);
      });
      activeKey.value = position;
      if (position === ButtonOpeEnum.SINGLELINE) {
        columnsData.value = [...columnsData.value, ...data];
      }
      if (position === ButtonOpeEnum.HEAD) {
        headerRightData.value = [...headerRightData.value, ...data];
      }
      if (position === ButtonOpeEnum.BATCH) {
        headerLeftData.value = [...headerLeftData.value, ...data];
      }
      if (position === ButtonOpeEnum.SINGLELINE_RDO) {
        if (versionMode === RdoButtonOpeEnum.parentVersion) {
          columnsRdoParentData.value = [...columnsRdoParentData.value, ...data];
        } else {
          columnsRdoChildData.value = [...columnsRdoChildData.value, ...data];
        }
        activeRdoKey.value = versionMode;
      }
    }
  }
  watchDebounced(
    () => positionOption.value.length,
    (length, old) => {
      if (
        length &&
        old > length &&
        positionOption.value.every((i) => i.value !== activeKey.value)
      ) {
        activeKey.value = positionOption.value[0].value;
      }
    },
    {
      debounce: 100,
      immediate: true,
    },
  );
</script>
<style lang="scss" scoped>
  .gct-tabs {
    :deep(.ant-tabs-nav-list) {
      justify-content: space-around;
      width: 100%;

      .ant-tabs-tab {
        margin: 0;
        padding: 0 4px;
      }
    }

    :deep(.ant-tabs-nav) {
      margin-bottom: 12px;
    }
  }

  :deep(.ant-tabs-card) {
    border: 1px solid #e0e3ea;
    border-radius: 4px;

    .ant-tabs-nav {
      margin-bottom: 8px;
    }

    .ant-tabs-nav-list {
      justify-content: space-around;
      width: 100%;
      height: 34px;

      .ant-tabs-tab {
        display: flex;
        flex-grow: 1;
        align-items: center;
        justify-content: center;
        margin: 0 !important;
        padding: 8px;
        transition: none;
        border: none;
        border-bottom: 1px solid #e0e3ea;
        background-color: #f7f8fa;
      }

      .ant-tabs-tab:first-child {
        border-right: 1px solid #e0e3ea;
      }

      .ant-tabs-tab:last-child {
        border-left: 1px solid #e0e3ea;
      }

      .ant-tabs-tab.ant-tabs-tab-active {
        border-bottom: 0;
        background-color: #fff;
      }
    }

    .ant-tabs-content-holder {
      padding: 0 8px;
      padding-bottom: 12px;
    }
  }

  :deep(.ant-tabs-nav-operations) {
    display: none !important;
  }
</style>
