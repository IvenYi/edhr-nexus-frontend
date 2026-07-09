<template>
  <div class="w-full" style="width: 100%">
    <div class="p12px h100px ks-row-center-middle bg-[#fbfbfc]" v-if="!refForm">
      <span class="text-[#5d6474] text-14px">
        {{ $t('sys.pageDesigner.selectAssociatedForm') }}</span
      >
    </div>
    <div
      v-else
      class="button-group-wrap py-16px px-24px"
      :class="buttonGroup.length == 1 ? 'flex-start' : ''"
    >
      <widget-wrapper
        :widget="item"
        :parentWidget="props.widget"
        :parentList="children"
        v-for="item in children"
        :key="item.id"
      >
        <component :is="widgetEntry" :widget="item">
          <div class="btn-item">
            <SvgIcon
              :class="['btn-icon', setBtnColor(item.btnType) ? 'btn-color' : '']"
              size="40"
              :name="`btn-${item.btnType}`"
            />
            <span class="btn-name">{{ $t(item.props.title) }}</span>
          </div>
        </component>
      </widget-wrapper>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-button-group">
  import { computed, toRefs, toRef } from 'vue';
  import type { IButtonGroup } from './schema';
  import { SvgIcon } from '/@/components/Icon';
  import { btnGroupType, btnGroupData } from './type';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';

  const { widgetEntry } = useDesigner();
  const props = defineProps<{ widget: IButtonGroup }>();
  const { refForm } = toRefs(props.widget.props);

  const buttonGroup = computed(() => {
    return children.value.map((n) => n.type);
  });

  const children = toRef(() => {
    let data: any[] = [];
    if (props.widget.children) {
      data = props.widget.children.map((item) => {
        const btnInfo = btnGroupData.find((n) => n.schemaType === item.type);
        return {
          ...item,
          btnType: btnInfo?.type,
          btnName: btnInfo?.name,
        };
      });
    }
    return data;
  });
  const setBtnColor = computed(() => {
    return (type) => {
      return [btnGroupType.MODELING, btnGroupType.COPY].includes(type);
    };
  });
</script>

<style scoped lang="less">
  .button-group-wrap {
    display: flex;
    justify-content: space-around;
    background: #fafafa;
    border-radius: 4px;
    &.flex-start {
      justify-content: flex-start;
    }
    .btn-item {
      display: flex;
      flex-direction: column;
      .btn-icon {
        margin: 0 auto;
      }
      .btn-color {
        color: #ff914a;
      }
      .btn-name {
        margin-top: 8px;
        line-height: 20px;
        text-align: center;
      }
    }
  }
</style>
