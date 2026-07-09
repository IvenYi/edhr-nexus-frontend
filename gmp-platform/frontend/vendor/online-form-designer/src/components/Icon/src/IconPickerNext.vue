<template>
  <div class="icon-picker-next">
    <a-popover
      placement="bottomLeft"
      trigger="click"
      v-model="visible"
      overlayClassName="icon-picker-next__popover"
    >
      <template #content>
        <ScrollContainer class="icon-picker-next__scroll">
          <ul>
            <li
              v-for="icon in svgIconNames"
              :key="icon"
              @click="handleClick(icon)"
              :title="icon"
              :class="{
                'icon-picker-next--selected': icon === value && !isShowColor,
              }"
              :style="
                isShowColor && icon === value
                  ? {
                      backgroundColor: color,
                    }
                  : {}
              "
            >
              <SvgIcon :size="32" :name="icon" />
            </li>
          </ul>
          <div class="color-wrap" v-if="isShowColor">
            <span
              class="color-item"
              v-for="colorItem of colors"
              :key="colorItem"
              :style="{ backgroundColor: colorItem }"
              @click="() => handleSelectColor(colorItem)"
            >
              <CheckOutlined v-if="color === colorItem" />
            </span>
          </div>
        </ScrollContainer>
      </template>

      <div
        class="icon-picker-next__trigger cursor-pointer"
        :class="{
          'icon-picker-next--selected': value && !isShowColor,
        }"
        :style="
          isShowColor && value
            ? {
                backgroundColor: color,
              }
            : {}
        "
      >
        <SvgIcon
          v-if="value"
          :size="32"
          :name="value"
          :style="
            isShowColor
              ? {
                  backgroundColor: color,
                }
              : {}
          "
        />
        <div>
          <i class="iconfont icon-bianji"></i>
        </div>
      </div>
    </a-popover>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { Form } from 'ant-design-vue';
  import { ScrollContainer } from '/@/components/Container';
  import SvgIcon from './SvgIcon.vue';

  import { propTypes } from '/@/utils/propTypes';
  import svgIcons from 'virtual:svg-icons-names';

  console.warn('IconPickerNext is about to be deleted !!!');

  const colors = [
    '#EF3232',
    '#EFA332',
    '#25DF70',
    '#18C8D3',
    '#1C84E3',
    '#3370FF',
    '#A33FF2',
    '#0DAA9C',
    '#2639E2',
  ];

  /**
   * todo list
   * disabled
   * namespace
   */

  const { onFieldChange } = Form.useInjectFormItemContext();

  defineProps({
    value: propTypes.string,
    disabled: propTypes.bool.def(false),
    color: {
      type: String,
      default: '#3370FF',
    },
    isShowColor: {
      type: Boolean,
      default: false,
    },
  });

  const svgIconNames = svgIcons
    .filter((item) => item.startsWith('icon-preset'))
    .map((icon) => icon.replace('icon-', ''));

  const emit = defineEmits(['update:value', 'update:color']);

  const visible = ref(false);

  function handleClick(icon: string) {
    emit('update:value', icon);
    onFieldChange();
  }

  const handleSelectColor = (color: string) => {
    emit('update:color', color);
    onFieldChange();
  };
</script>
<style lang="less">
  .icon-picker-next {
    height: 48px;
    width: 48px;

    &__trigger {
      height: 100%;
      width: 100%;
      background: #e1e1e1;
      border-radius: 4px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      div {
        position: absolute;
        height: 16px;
        width: 16px;
        font-size: 12px;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;

        .iconfont {
          transform: scale(0.6);
        }
      }
    }

    &__scroll {
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-column-gap: 8px;
        grid-row-gap: 8px;
        grid-template-columns: repeat(6, 40px);
        & > li {
          height: 40px;
          width: 40px;
          background: #e1e1e1;
          border-radius: 4px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          &:hover {
            background-color: #d0d0d0;
          }
        }
      }

      .color-wrap {
        display: flex;
        width: 100%;
        column-gap: 8px;
        padding-top: 16px;
        padding-bottom: 2px;
        .color-item {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: transparent;
          display: inline-block;
          text-align: center;
          color: #fff;
          cursor: pointer;
        }
      }
    }

    &--selected {
      background: #3370ff !important;
    }
  }
</style>
