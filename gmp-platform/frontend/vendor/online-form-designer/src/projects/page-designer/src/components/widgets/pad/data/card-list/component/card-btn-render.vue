<template>
  <div class="btn-wrap">
    <div
      v-show="btnPickerColumns.length"
      :class="['btn-more', { 'is-disabled': rowDisabled }]"
      @click="onClick"
    >
      <IconNext
        :size="20"
        value="icon-park:more"
        :style="{
          marginRight: '0px',
          '--color': '#bfbfbf',
        }"
      />
    </div>
    <vantButton
      v-for="(el, i) in showBtnList"
      :widget="el"
      :key="i"
      :has-icon="el.props.hasIcon"
      :has-text="el.props.hasText"
      :icon="el.props.icon"
      :title="el.props.i18nConfig ? $t(JSON.parse(el.props.i18nConfig).title) : el.props.title"
      :size="el.props.size"
      :type="el.props.type"
      :danger="el.props.danger"
      :enableCustomColor="el.props.enableCustomColor"
      :fontColor="el.props.fontColor"
      :backgroundColor="el.props.backgroundColor"
      :disabled="rowDisabled"
      class="vant-button"
      @click="handleClick(el)"
    />
  </div>
  <van-popup v-model:show="showPicker" round position="bottom">
    <van-picker
      :columns="btnPickerColumns"
      @cancel="showPicker = false"
      @confirm="onPickerConfirm"
    />
  </van-popup>
</template>
<script setup lang="ts">
  import { toRaw, computed, ref } from 'vue';
  import vantButton from '/@page-designer/components/widgets/mobile/__components__/vantButton.vue';
  import { operateSysEnums } from '/@/projects/page-designer/src/enum';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { showNotify, showConfirmDialog } from 'vant';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { BaseButton } from '/@/projects/page-designer/src/types/mobile';
  import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';

  const emit = defineEmits(['afterDelete']);
  const defProps = defineProps({
    cardId: {
      type: String,
      default: '',
    },
    children: {
      type: Array<BaseButton>,
      default: () => [],
    },
    data: {
      type: Object,
      default: () => {},
    },
    visibleButtons: {
      type: Number,
      default: 1,
    },
    clickMethod: {
      type: Function,
    },
    rowDisabled: {
      type: Boolean,
    },
    doNotSubmit: {
      type: Boolean,
    },
    index: Number,
  });
  const Event = getPageEvent();
  const showPicker = ref(false);

  const list = useDependencyToShowList(defProps.children, defProps.data);

  const onClick = () => {
    if (defProps.rowDisabled) {
      return;
    }
    showPicker.value = true;
  };

  const handleClick = (data) => {
    if (data.props.confirm) {
      showConfirmDialog({
        message: data.props.confirmText || $t('sys.pageDesigner.confirmTodo'),
      })
        .then(() => {
          if (defProps.clickMethod) defProps.clickMethod(data.props);
          else {
            if (data.props.innerEvent) {
              !!data.props.sysMethedType && innerEventOptions[data.props.sysMethedType](data.props);
            } else {
              runInnerEvent(data.props, defProps.data, defProps.index);
            }
          }
        })
        .catch(() => {});
    } else {
      if (defProps.clickMethod) defProps.clickMethod(data.props);
      else {
        if (data.props.innerEvent) {
          !!data.props.sysMethedType && innerEventOptions[data.props.sysMethedType](data.props);
        } else {
          runInnerEvent(data.props, defProps.data, defProps.index);
        }
      }
    }
  };
  /**执行内置事件 */
  function runInnerEvent(prop, rowData, index) {
    /**兼容老版本按钮数据结构,新版本上不需要加 */
    if (prop.eventName && !Object.keys(prop.events).length) {
      prop.events = {
        onClick: {
          name: prop.eventName,
        },
      };
    }
    Event.runEventByName('onClick', prop.events, rowData, index);
  }
  const showBtnList = computed(() => {
    return list.value.slice(0, defProps.visibleButtons).reverse();
  });

  const btnPickerColumns = computed(() => {
    return list.value.slice(defProps.visibleButtons, defProps.children.length).map((e) => {
      return {
        text: e.props.title,
        value: e.id,
        props: e.props,
      };
    });
  });
  /**按钮选择器 */
  const onPickerConfirm = ({ selectedOptions }) => {
    showPicker.value = false;
    handleClick(selectedOptions[0]);
  };
  /**内置事件 */
  const innerEventOptions = {
    [operateSysEnums.COLUMNDELETE]: async (value) => {
      if (value.model && defProps.data.id_ && !defProps.doNotSubmit) {
        await Event.context.$httpBizService(
          { key: value.model, action: 'removeById' },
          {},
          { id: defProps.data.id_ },
        );
      }
      emit('afterDelete', toRaw(defProps.data));
      showNotify({ type: 'success', message: $t('sys.delSuccess') });
    },
    [operateSysEnums.COLUMNLINK]: (value) => {
      Event.context.$push(value.linkPage, { id: defProps.data.id_ });
    },
  };
</script>
<style lang="scss" scoped>
  .btn-wrap {
    display: flex;
    flex: 1;
    flex-direction: row-reverse;
  }

  .van-button {
    height: auto;
    padding: 7px 12px;
    // float: right;
  }
  .vant-button {
    & + & {
      margin-right: 8px;
    }
  }

  .btn-more {
    margin-left: 8px;

    &.is-disabled {
      opacity: 0.3;
    }

    .i-icon-more {
      position: relative;
      top: 6px;
    }
  }
</style>
