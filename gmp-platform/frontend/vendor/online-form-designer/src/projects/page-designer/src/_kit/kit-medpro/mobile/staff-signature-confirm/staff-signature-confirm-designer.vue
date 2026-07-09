<template>
  <div class="staff-signature-confirm-designer">
    <van-form label-align="left" input-align="right" v-for="item in 2" :key="item">
      <van-cell-group :border="false" class="bg-light-600 border-rd-md mb-2">
        <van-field
          v-for="field in computedFields"
          :border="false"
          :label="field.title"
          required
          placeholder="请选择"
          is-link
        />
        <div class="ks-row verify-item">
          <i class="iconfont icon-shanchu2 error-gct text-[14px] lh-1 p7px ml14px"></i>
          <div v-if="isSignRequired" class="verify-btn text-[14px]">签名确认</div>
        </div>
      </van-cell-group>
    </van-form>
    <div class="text-[14px] py4px add-btn mb10px" v-if="!computedHideAdd">
      <i class="iconfont icon-tianjia lh-1 mr6px"></i>
      {{ $t('sys.add') }}
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-staff-signature-confirm-designer">
  import { toRefs, computed } from 'vue';
  import { IStaffSignatureConfirm } from './schema';

  const defProps = defineProps<{ widget: IStaffSignatureConfirm }>();
  const { isSignRequired, needOtherFields, otherFieldsData, staffFields, hideAdd } = toRefs(
    defProps.widget.props,
  );

  const staffLabel = computed(() => {
    return staffFields.value ? `${staffFields.value}(人员)` : '人员';
  });

  const computedFields = computed(() => {
    const columns = [
      {
        title: staffLabel.value,
        dataIndex: 'info',
      },
    ];
    if (needOtherFields?.value && otherFieldsData?.value) {
      for (const key in otherFieldsData.value) {
        const element = otherFieldsData.value[key];
        if (element) {
          const addItem = {
            title: element.name,
            dataIndex: element.key,
            key: element.key,
            type: element.type,
          };
          columns.push(addItem);
        }
      }
    }
    return columns;
  });

  const computedHideAdd = computed(() => {
    return hideAdd?.value;
  });
</script>
<style lang="less" scoped>
  .add-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--van-primary-color);
    color: var(--van-primary-color);
    border-radius: 4px;
  }

  :deep(.van-cell-group) {
    padding: 14px 10px;
    background-color: #f2f2f2;
  }

  :deep(.van-cell) {
    background: transparent;
    padding: 10px 0;
  }

  .verify-item {
    justify-content: right;
    align-items: center;

    .verify-btn {
      color: var(--van-primary-color);
    }
  }
</style>
