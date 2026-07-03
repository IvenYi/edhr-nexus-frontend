<template>
  <div class="panel-global-config">
    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="$t('sys.onlineForm.enumGroupContentConfiguration')">
        <form-item
          :inline="false"
          class="option-item"
          v-for="(item, index) of formState.globalOptions"
          :key="item.id"
          :isFirst="index === 0"
        >
          <template #label>
            <div class="option-item-title">
              <a-input
                v-model:value="item.title"
                :placeholder="$t('sys.onlineForm.pleaseEnterGroupName')"
                style="padding: 1px 6px"
              />
              <div class="actions">
                <i
                  class="iconfont icon-shanchu ml-4px primary-gct-hover"
                  @click="removeGorupItem(item)"
                ></i>
                <div class="ml-8px flex" @click="addOption(item)">
                  <i class="iconfont icon-chuangjian mr-4px"></i>
                  <span>{{ $t('sys.insert') }}</span>
                </div>
              </div>
            </div>
          </template>
          <draggable
            :list="item.options"
            handle=".cursor-move"
            :animation="200"
            chosen-class="drawing-chosen"
            drag-class="drawing-drag"
            item-key="id"
            class="field-list"
          >
            <template #item="{ element: option }">
              <div class="ks-row-middle fieldrow mb5px">
                <i
                  class="icon-drag iconfont mr4px cursor-move text-[#C3C3C3] primary-gct-hover"
                ></i>

                <div class="ks-col ks-row">
                  <div class="min-w-86px flex-grow-1">
                    <a-input
                      v-model:value="option.text"
                      style="padding: 1px 6px"
                      :placeholder="$t('sys.onlineForm.pleaseEnterOptionContent')"
                    />
                  </div>
                  <div class="w4px"></div>
                  <div class="min-w-86px flex-grow-1">
                    <a-input
                      v-model:value="option.value"
                      style="padding: 1px 6px"
                      :placeholder="$t('sys.onlineForm.pleaseEnterKey')"
                      @blur="validateInput(option, 'value')"
                    />
                  </div>
                </div>
                <i
                  class="iconfont icon-shanchu primary-gct-hover ml-4px"
                  @click="removeOption(item, option)"
                ></i>
              </div>
            </template>
          </draggable>
        </form-item>

        <a-button type="primary" ghost block class="add-btn" @click="addGroupItem">
          {{ $t('sys.onlineForm.addEnumGroup') }}
        </a-button>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { ref, computed, nextTick } from 'vue';
  import draggable from 'vuedraggable';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { buildUUID } from '/@/utils/uuid';

  import type { IGlobalOption } from '/@online-form/views/designer/types';

  const { paper } = useSpreadSheet();

  const { t } = useI18n();

  const activeCollapse = ref(['1', '2', '3']);

  const regxUtils = {
    text: /[^\u4e00-\u9fa5a-zA-Z0-9_]/g,
    value: /[^a-zA-Z0-9_]/g,
  };

  const formState = computed({
    get() {
      return paper.value;
    },
    set(v) {
      Object.assign(paper.value, v);
    },
  });

  function validateInput(option, key) {
    const value = option[key].replace(regxUtils[key], '');
    nextTick(() => {
      option[key] = value;
    });
  }

  function addGroupItem() {
    if (!formState.value.globalOptions) {
      formState.value.globalOptions = [];
    }
    formState.value.globalOptions.push({
      id: buildUUID(),
      title: '',
      options: [],
    });
  }

  function removeGorupItem(info: IGlobalOption) {
    const findIndex = formState.value.globalOptions?.findIndex((item) => item.id === info.id);
    if (findIndex !== -1) {
      formState.value.globalOptions?.splice(findIndex!, 1);
    }
  }

  function addOption(info: IGlobalOption) {
    const findIndex = formState.value.globalOptions?.findIndex((item) => item.id === info.id);
    if (findIndex !== -1) {
      formState.value.globalOptions?.[findIndex!].options.push({
        id: buildUUID(),
        text: '',
        value: '',
      });
    }
  }

  function removeOption(info: IGlobalOption, option) {
    const findIndex = formState.value.globalOptions?.findIndex((item) => item.id === info.id);
    if (findIndex !== -1) {
      const findex = formState.value.globalOptions?.[findIndex!].options.findIndex(
        (o) => o.id === option.id,
      );

      if (findex !== -1) {
        formState.value.globalOptions?.[findIndex!].options.splice(findex!, 1);
      }
    }
  }
</script>

<style lang="less" scoped>
  .panel-global-config {
    .option-item {
      .option-item-title {
        display: flex;
        align-items: center;
      }

      .iconfont {
        line-height: 1;
        cursor: pointer;
      }

      .fieldrow {
        padding: 4px;
        border-radius: 4px;
        background-color: #f0f0f0;
        align-items: center;
      }

      .actions {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;

        > div {
          flex-shrink: 0;
          align-items: center;
          color: var(--ant-primary-color);
          cursor: pointer;
          > span {
            line-height: 18px;
            font-size: 14px;
          }
        }
      }

      .icon-shanchu {
        color: #797a7d;
      }
    }
  }
</style>
