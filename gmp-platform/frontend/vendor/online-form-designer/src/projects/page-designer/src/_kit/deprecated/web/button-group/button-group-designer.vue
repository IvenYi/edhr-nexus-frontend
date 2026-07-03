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
      <template v-for="item in btnGroupList" :key="item.type">
        <div class="btn-item" v-if="buttonGroup.includes(item.type)">
          <SvgIcon :class="['btn-icon', setBtnColor(item.type) ? 'btn-color' : '']" size="40" :name="`btn-${item.type}`" />
          <span class="btn-name">{{ $t(item.name) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-button-group">
  import { computed, toRefs } from 'vue';
  import type { IButtonGroup } from './schema';
  import { SvgIcon } from '/@/components/Icon';
  import { btnGroupType, btnGroupData } from './type';

  const props = defineProps<{ widget: IButtonGroup }>();
  const { refForm, buttonGroup } = toRefs(props.widget.props);

  const btnGroupList = computed(() => {
    return btnGroupData;
  });

  const setBtnColor = computed(()=> {
    return (type) => {
      return [btnGroupType.MODELING, btnGroupType.COPY].includes(type)
    }
  })
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
        color: #FF914A;
      }
      .btn-name {
        margin-top: 8px;
        line-height: 20px;
        text-align: center;
      }
    }
  }
</style>
