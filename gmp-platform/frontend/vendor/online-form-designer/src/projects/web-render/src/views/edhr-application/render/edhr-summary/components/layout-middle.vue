<template>
  <div class="ks-column overflow-hidden pb16px ks-col">
    <div class="mt2px mb16px px16px">
      <a-input
        v-model:value="searchVal"
        :placeholder="$t('sys.keywordsPlaceholder')"
        allowClear
        style=" padding-top: 1px; padding-bottom: 1px;border-radius: 4px"
      >
        <template #suffix>
          <i class="iconfont icon-sousuo text-[#797A7D] text-[13px]"></i>
        </template>
      </a-input>
    </div>
    <div class="ks-col overflow-hidden">
      <Scrollbar class="px16px min-h50px">
        <a-empty v-if="!dataList.length && !loadingMiddle" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        <a-spin :spinning="loadingMiddle" size="large" wrapperClassName="summary-middle-loading">
          <div class="wrap inst-list-wrap">
            <div
              v-for="(element, i) in dataList"
              :data-idx="i"
              :key="i"
              class="move wrap-item drag-row"
              :class="[
                !element.isEdit && 'item-edit',
                currentFormInst.id_ === element.id_ && 'selected',
              ]"
              @click="chooseInst(element)"
            >
              <div
                class="title cursor-pointer"
                :class="[!element.fold && 'border-b']"
                @click="element.fold = !element.fold"
              >
                <div class="ks-col ell">
                  <template v-if="!element.isEdit">
                    {{ element.form_inst_name_ }}
                  </template>
                  <a-input
                    v-if="element.isEdit"
                    ref="inputRef"
                    v-model:value="element.form_inst_name_"
                    :allowClear="false"
                    @blur="onNameBlur(element)"
                    @click.stop
                  />
                </div>
                <div
                  v-if="!readonlySummary && element.edhrInstanceId === edhrInfo.edhrInstId"
                  class="edit-icon"
                  @click.stop
                >
                  <Dropdown
                    overlayClassName="edhr-summary-more-dropdown"
                    :trigger="['click']"
                    :drop-menu-list="NodeMoreMenus"
                    @menu-event="(e) => doAction(e.event, element, i)"
                  >
                    <i class="iconfont icon-gengduo2 text-14px! text-[#1A1D23]"></i>
                  </Dropdown>
                </div>
                <i
                  class="iconfont text-[#2C3344]"
                  :class="[element.fold ? 'icon-pad_arrow_down' : 'icon-pad_arrow_up']"
                ></i>
              </div>
              <div
                class="content overflow-hidden"
                :style="{
                  maxHeight: element.fold ? '0' : '300px',
                  transition: 'all 0.3s ease',
                }"
              >
                <a-descriptions
                  :column="1"
                  layout="vertical"
                  :colon="false"
                  :labelStyle="{
                    color: '#5A5F6B',
                    lineHeight: '18px',
                    fontSize: '12px',
                    marginBottom: '2px',
                  }"
                  :contentStyle="{ color: '#1A1D23', lineHeight: '18px', fontSize: '12px' }"
                  class="my8px"
                >
                  <a-descriptions-item :label="$t('sys.onlineForm.formIdent')">
                    <copy-module-key :moduleKey="element.serial_no_" :fontSize="12" />
                  </a-descriptions-item>
                  <a-descriptions-item :label="$t('sys.createTime')">
                    {{ element.form_create_time_ }}
                  </a-descriptions-item>
                  <a-descriptions-item :label="$t('sys.edhr.changedTime')">
                    {{ element.form_modify_time_ }}
                  </a-descriptions-item>
                  <a-descriptions-item :label="$t('sys.edhr.changedUser')">
                    {{ element.form_modify_user_name }}
                  </a-descriptions-item>
                </a-descriptions>
              </div>
            </div>
          </div>
        </a-spin>
      </Scrollbar>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref, computed, nextTick } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import Sortable from 'sortablejs';
  import { useEdhrSummary } from '../hook/useEdhrSummary';
  import { Empty, message, Modal } from 'ant-design-vue';
  import { Dropdown } from '/@/components/Dropdown/index';
  import { NodeMoreMenus, OutlineActionType } from './constant';

  const searchVal = ref();
  const inputRef = ref();

  const {
    formInstData,
    insertFormInstToTable,
    loadingMiddle,
    readonlySummary,
    currentFormInst,
    edhrInfo,
  } = useEdhrSummary();

  onMounted(() => {
    init();
  });

  const dataList = computed(() => {
    if (!searchVal.value || !searchVal.value.trim()) return formInstData.value;
    return formInstData.value.filter((e) => e.form_inst_name_?.includes(searchVal.value));
  });

  function init() {
    if (readonlySummary.value) return;
    const rows = document.querySelector('.inst-list-wrap') as HTMLElement;
    new Sortable(rows, {
      group: {
        name: 'edhrSummaryGroup',
        pull: false,
        put: true,
      }, // set both lists to same group
      animation: 150,
      sort: false,
      handle: '.drag-row',
      filter: '.wrap-item',
      preventOnFilter: false,
      ghostClass: 'inst-list-ghost',
      // chosenClass: 'chosenItem',
      dragClass: 'inst-list-dragged',
      onAdd: (e) => {
        console.log('list-onAdd', e);
      },
      onStart: () => {},
      onMove: (e) => {
        console.log('list-onMove', e);
      },
      onEnd: (e) => {
        console.log('middle--onEnd', e);
        const { newIndex, oldIndex } = e;
        if (newIndex === oldIndex) return;
        // 拖拽排序还有 bug
        const oldItem = dataList.value[oldIndex!];
        const newItem = dataList.value[newIndex!];
        const realOldIdx = formInstData.value.findIndex(
          (e) => e.form_inst_id_ === oldItem.form_inst_id_,
        );
        if (realOldIdx > -1) formInstData.value.splice(realOldIdx, 1);
        const realNewIdx = formInstData.value.findIndex(
          (e) => e.form_inst_id_ === newItem.form_inst_id_,
        );
        if (realNewIdx > -1) {
          formInstData.value.splice(realNewIdx, 0, oldItem);
        }
      },
      onChange: (e) => {
        console.log('list-onChange', e);
      },
      onChoose: function (evt) {
        console.log('list-onChoose', evt);
      },
      onRemove: (e) => {
        console.log('list--onRemove', e);
      },
    });
  }

  const onNameBlur = (data) => {
    console.log('blur', data);
    if (!data.form_inst_name_ || !data.form_inst_name_.trim()) {
      message.warning($t('sys.notEmptySth', { sth: $t('sys.name') }));
      inputRef.value[0]?.focus();
      return;
    }
    data.isEdit = false;
  };

  const doAction = async (actionKey: OutlineActionType, data, i) => {
    if (formInstData.value.some((e) => e.isEdit)) return;
    switch (actionKey) {
      case OutlineActionType.RENAME:
        data.isEdit = true;
        nextTick(() => {
          inputRef.value[0]?.focus();
        });
        if (!data.isInsert) {
          data.isUpdate = true;
        }
        break;
      case OutlineActionType.DELETE:
        Modal.confirm({
          title: $t('sys.edhr.confirmToDelete'),
          okText: $t('sys.okText'),
          onOk: () => {
            if (data.id_ === currentFormInst.value?.id_) {
              currentFormInst.value = {};
            }
            const item = formInstData.value.splice(i, 1)[0];
            insertFormInstToTable(item);
          },
        });
        break;
      default:
        break;
    }
  };

  const chooseInst = (row) => {
    currentFormInst.value = row;
  };
</script>
<style lang="less" scoped>
  :deep(.ant-input) {
    font-size: 12px;
  }

  .inst-list-wrap {
    :deep(tr.ant-table-row.inst-list-ghost) {
      display: block;
      width: 100%;
      height: 2px;
      overflow: hidden;
      background-color: var(--ant-primary-color);
    }
  }

  .wrap-item {
    margin-bottom: 8px;
    padding: 0 12px;
    border-radius: 4px;
    background-color: #f9fafb;

    &.selected {
      background-color: #e1f0ff;
    }

    .edit-icon {
      display: none;
    }

    &.item-edit:hover {
      .edit-icon {
        display: block;
      }
    }

    .title {
      display: flex;
      align-items: center;
      padding: 6px 0;
      column-gap: 8px;
      color: #1a1d23;

      &.border-b {
        border-bottom: 1px solid #e0e3eb;
      }

      .iconfont {
        cursor: pointer;
      }
    }

    .content {
      :deep(.ant-descriptions-view) {
        .ant-descriptions-item-content {
          margin-bottom: 8px;
        }

        .ant-descriptions-row:last-child {
          .ant-descriptions-item-content {
            margin-bottom: 0;
          }
        }
      }

      :deep(.ant-descriptions-item) {
        padding-bottom: 0;
      }
    }

    & + & {
      // margin-top: 8px;
    }
  }
</style>
<style lang="less">
  .summary-middle-loading.ant-spin-nested-loading {
    .ant-spin-container {
      min-height: 50px;
    }
  }
</style>
