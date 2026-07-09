<template>
  <div :class="{ [ns.b()]: true, [ns.e('collapsed')]: isCollapsed }">
    <div :class="[ns.e('container')]">
      <div :class="[ns.e('operating-console')]">
        <div :class="[ns.e('title')]">
          <span>{{ t('sys.onlineForm.operationTable') }}</span>
        </div>
        <a-form layout="vertical" :model="formState" ref="formRef" class="px-12px! py-12px!">
          <a-form-item :label="$t('sys.edhr.notebookTitle')" name="recordId">
            <NoteBookSelect
              v-model:value="formState.recordId"
              v-model:select-info="docInfoData"
              :placeholder="t('sys.chooseText')"
            />
          </a-form-item>
        </a-form>
      </div>
      <div :class="[ns.e('doc-info')]">
        <div :class="[ns.e('title')]">
          <span>{{ $t('sys.edhr.recordBookInfo') }}</span>
        </div>
        <div class="form-container">
          <Scrollbar class="px-12px py-12px">
            <a-form layout="vertical">
              <a-form-item :label="$t('sys.Dept')">{{ docInfoData.org_id_ ?? '-' }}</a-form-item>
              <a-form-item :label="$t('sys.status')">{{ docInfoData.status_ ?? '-' }}</a-form-item>
              <a-form-item :label="$t('sys.edhr.recordBook.fillStartTime')">
                {{ docInfoData.start_time_ ?? '-' }}
              </a-form-item>
              <a-form-item :label="$t('sys.edhr.recordBook.fillEndTime')">{{
                docInfoData.end_time_ ?? '-'
              }}</a-form-item>
              <a-form-item :label="$t('sys.pageDesigner.label')">
                <select-label-example
                  v-if="docInfoData.label_ids_"
                  :title="docInfoData.label_ids_lab_"
                  :modelValue="docInfoData.label_ids_"
                  needRequest
                  :widget="{
                    props: {
                      bindModelKey: 'em_notebook_label',
                      edhrIsExample: false,
                      edhrLabelNameField: 'name_',
                      edhrLabelStyleField: 'background_style_',
                      edhrLabelStyleColorField: 'background_color_',
                      edhrLabelNameColorField: 'name_color_',
                    },
                  }"
                />
                <span v-else>-</span>
              </a-form-item>
              <a-form-item :label="$t('sys.modifier')">{{
                docInfoData.modify_user_name_ ?? '-'
              }}</a-form-item>
              <a-form-item :label="$t('sys.modifyTime')"
                >{{ docInfoData.modify_time_ ?? '-' }}
              </a-form-item>
            </a-form>
          </Scrollbar>
        </div>
      </div>
    </div>

    <div
      :class="{
        'toggle-btn': true,
        'toggle-btn--collapsed': isCollapsed,
      }"
      @click="toggleCollapsed"
    >
      <i class="iconfont icon-a-Leftarrow"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { message } from 'ant-design-vue';
  import SelectLabelExample from '/@page-designer/components/widgets/web/field/select/select-label-example.vue';
  import type { FormInstance } from 'ant-design-vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import NoteBookSelect from '../../../components/note-book-select/note-book-select.vue';
  import { cloneDeep } from 'lodash-es';

  const { t } = useI18n();

  const ns = useNamespace('note-book-left-container');

  const formRef = ref<FormInstance>();
  const isCollapsed = ref(false); // 是否折叠

  const formState = reactive<{
    recordId: string | undefined;
  }>({
    recordId: undefined,
  });

  const docInfoData = ref({});

  const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  function getValue() {
    return cloneDeep(formState);
  }

  defineExpose({
    getValue,
  });
</script>

<style lang="less" scoped>
  .gct-note-book-left-container {
    width: 242px;
    height: 100%;
    border-right: 1px solid #e8ecf0;
    position: relative;
    transition: width 0.3s ease;

    .ant-form-item {
      margin-bottom: 12px;
      :deep(.ant-form-item-label) {
        label {
          color: #252525;
          font-size: 12px;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    &__title {
      position: relative;
      padding: 14px 12px;
      line-height: 18px;
      border-bottom: 1px solid #e8ecf0;

      span {
        font-weight: 500;
        font-size: 12px;
        color: #212528;
        line-height: 18px;
        display: inline-block;
      }
    }

    &__operating-console {
      flex: 0 0 auto;
    }

    &__doc-info {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .form-container {
        height: 100%;
        overflow: hidden;

        :deep(.ant-form-item-label) {
          padding-bottom: 6px;
          label {
            color: #252525;
            font-size: 12px;
          }
        }
        :deep(.ant-form-item-control) {
          .ant-form-item-control-input {
            min-height: 22px;
            line-height: 22px;
            color: #666;
            font-size: 12px;
          }
        }
      }
    }

    .toggle-btn {
      display: flex;
      position: absolute;
      z-index: 999;
      top: 24px;
      right: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      transform: translate3d(50%, -50%, 0);
      transition: all 0.3s;
      border: 1px solid #d9d9d9;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;

      .icon-a-Leftarrow {
        font-size: 12px;
      }

      &--collapsed {
        .icon-a-Leftarrow {
          transform: scale(0.8) rotateY(180deg);
        }
      }
    }

    &__collapsed {
      width: 0;
      padding: 0;

      .gct-record-change-left-container__container {
        width: 0;
        overflow: hidden;
      }
    }
  }
</style>
