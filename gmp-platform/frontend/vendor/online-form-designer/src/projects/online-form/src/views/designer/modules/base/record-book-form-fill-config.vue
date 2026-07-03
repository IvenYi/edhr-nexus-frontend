<template>
  <div class="record-book-form-fill-config">
    <Scrollbar class="px-4px pb-8px">
      <a-collapse
        class="override"
        v-model:activeKey="activeCollapse"
        ghost
        expandIconPosition="right"
      >
        <a-collapse-panel key="1" :header="$t('sys.onlineForm.formFillingConfiguration')">
          <form-item :label="$t('sys.onlineForm.setDailyFillableTimes')" isFirst>
            <div class="flex justify-end">
              <a-switch
                size="small"
                :disabled="isReadonly"
                v-model:checked="fill_time_config_.activateFillTime"
                @change="toggleFillTime"
              />
            </div>
          </form-item>

          <div class="fill-time-wrapper" v-if="fill_time_config_.activateFillTime">
            <div class="fill-time-area">
              <div class="fill-time-item" v-for="item in fill_time_config_.times" :key="item.key">
                <div class="ks-row-middle fieldrow mb5px">
                  <div class="ks-col ks-row">
                    <div class="min-w-86px flex-grow-1">
                      <a-time-picker
                        class="ks-col"
                        v-model:value="item.startTime"
                        :placeholder="t('sys.chooseText')"
                        format="HH:mm"
                        value-format="HH:mm"
                        size="small"
                        :allowClear="false"
                        :show-now="false"
                        :disabled="isReadonly"
                        :disabled-hours="() => getDisabledStartHours(item)"
                        :disabled-minutes="(h) => getDisabledStartMinutes(item, h)"
                      />
                    </div>
                    <div class="w16px flex justify-center items-center">-</div>
                    <div class="min-w-86px flex-grow-1">
                      <a-time-picker
                        class="ks-col"
                        v-model:value="item.endTime"
                        :placeholder="t('sys.chooseText')"
                        format="HH:mm"
                        value-format="HH:mm"
                        size="small"
                        :allowClear="false"
                        :show-now="false"
                        :disabled="isReadonly"
                        :disabled-hours="() => getDisabledEndHours(item)"
                        :disabled-minutes="(h) => getDisabledEndMinutes(item, h)"
                      />
                    </div>
                  </div>
                  <i
                    class="iconfont icon-shanchu primary-gct-hover ml-4px"
                    v-if="fill_time_config_.times.length !== 1 && !isReadonly"
                    @click="onDeleteFillTimeItem(item)"
                  ></i>
                </div>
              </div>
            </div>

            <div class="button cursor-pointer" v-if="!isReadonly" @click="onAddFillTime">
              <i class="iconfont icon-tianjia"></i>
              <span>{{ $t('sys.add') }}</span>
            </div>
          </div>

          <form-item :label="$t('sys.onlineForm.limitFormCreationCount')">
            <div class="flex justify-end">
              <a-switch
                size="small"
                :disabled="isReadonly"
                v-model:checked="create_config_.createLimit"
              />
            </div>
          </form-item>

          <div class="create-time-wrapper" v-if="create_config_.createLimit">
            <a-select
              :placeholder="t('sys.chooseText')"
              size="small"
              class="w-100px text-12px"
              v-model:value="create_config_.timeUnit"
              :disabled="isReadonly"
            >
              <a-select-option value="DAY">{{ $t('sys.onlineForm.perDay') }}</a-select-option>
              <a-select-option value="WEEK">{{ $t('sys.onlineForm.perWeek') }}</a-select-option>
              <a-select-option value="MONTH">{{ $t('sys.onlineForm.perMonth') }}</a-select-option>
            </a-select>
            <span class="mx-4px">{{ $t('sys.onlineForm.canCreate') }}</span>
            <a-input-number
              class="create-input-number"
              :placeholder="t('sys.inputText')"
              v-model:value="create_config_.times"
              size="small"
              :min="1"
              :disabled="isReadonly"
            />
            <span class="ml-4px">{{ $t('sys.onlineForm.times') }}</span>
          </div>
        </a-collapse-panel>

        <!-- <a-collapse-panel key="2" header="子模型填报配置">
          <div class="sub-model-fill-config">
            <div class="title">
              <span>{{ $t('sys.onlineForm.subTableType.FIXED') }}</span>
              <span>温度记录表</span>
            </div>
            <div class="container">
              <form-item>
                <template #label>
                  <span>是否设置为记录表</span>

                  <a-tooltip placement="top">
                    <template #title>
                      <div>
                        开关开启后系统会将固定表中的数据分组定义为一条记录，可对记录进行提交和审核
                      </div>
                    </template>
                    <i class="iconfont icon-assist ml-2px text-14px! leading-1 cursor-pointer"></i>
                  </a-tooltip>
                </template>
                <div class="flex justify-end">
                  <a-switch size="small" />
                </div>
              </form-item>

              <form-item label="记录填报字段权限" :inline="false">
                <div class="button field-prem cursor-pointer">
                  <span>配置字段权限</span>
                </div>
              </form-item>
            </div>
          </div>
        </a-collapse-panel> -->
      </a-collapse>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, reactive, toRaw, onBeforeMount } from 'vue';
  import { uuid2 } from '/@/utils/uuid';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Scrollbar } from '/@/components/Scrollbar';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  const { t } = useI18n();

  interface TimeItem {
    key: string;
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
  }

  interface IFillTimeConfig {
    activateFillTime: boolean;
    times: Array<TimeItem>;
  }

  interface ICreateConfig {
    createLimit: boolean;
    timeUnit: string;
    times: number;
  }

  interface IFormState {
    fill_time_config_: IFillTimeConfig;
    create_config_: ICreateConfig;
  }

  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const allMinutes = Array.from({ length: 60 }, (_, i) => i);

  const props = defineProps<{
    form?: IFormState;
    isReadonly: boolean;
  }>();

  const activeCollapse = ref(['1', '2', '3', '4', '5', '6', '7']);

  /** 设置每天可填报时间 */
  const fill_time_config_ = reactive<IFillTimeConfig>({
    activateFillTime: false,
    times: [],
  });

  /** 限制表单提交次数 */
  const create_config_ = reactive<ICreateConfig>({
    createLimit: false,
    timeUnit: 'DAY',
    times: 1,
  });

  onBeforeMount(() => {
    if (props.form) {
      Object.assign(fill_time_config_, props.form.fill_time_config_);
      Object.assign(create_config_, props.form.create_config_);
    }
  });

  const toggleFillTime = (visible) => {
    if (visible && !fill_time_config_.times.length) {
      fill_time_config_.times.push({
        key: uuid2(16),
        startTime: '00:00',
        endTime: '23:59',
      });
    }
  };

  const onDeleteFillTimeItem = (item) => {
    const findIndex = fill_time_config_.times?.findIndex((i) => item.key === i.key);
    if (findIndex !== -1) {
      fill_time_config_.times?.splice(findIndex!, 1);
    }
  };

  const onAddFillTime = () => {
    fill_time_config_.times.push({
      key: uuid2(16),
      startTime: '00:00',
      endTime: '23:59',
    });
  };

  function getDisabledStartHours(item: TimeItem) {
    if (!item.endTime) return [];
    const [eh] = item.endTime.split(':').map(Number);

    return allHours.filter((h) => h > eh);
  }
  function getDisabledStartMinutes(item: TimeItem, hour: number) {
    if (!item.endTime) return [];
    const [eh, em] = item.endTime.split(':').map(Number);

    if (hour === eh) {
      return allMinutes.filter((m) => m > em);
    }
    return [];
  }

  function getDisabledEndHours(item: TimeItem) {
    if (!item.startTime) return [];
    const [sh] = item.startTime.split(':').map(Number);

    return allHours.filter((h) => h < sh);
  }
  function getDisabledEndMinutes(item: TimeItem, hour: number) {
    if (!item.startTime) return [];
    const [sh, sm] = item.startTime.split(':').map(Number);
    if (hour === sh) {
      return allMinutes.filter((m) => m < sm);
    }
    return [];
  }

  function getValue() {
    return {
      fill_time_config_: JSON.stringify(toRaw(fill_time_config_)),
      create_config_: JSON.stringify(toRaw(create_config_)),
    };
  }

  defineExpose({
    getValue,
  });
</script>

<style scoped lang="less">
  .record-book-form-fill-config {
    background: #fff;
    width: 279px;
    flex-shrink: 0;

    .fill-time-area {
      .fill-time-item {
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

    .button {
      height: 26px;
      background: transparent;
      border-radius: 4px;
      color: var(--ant-primary-color);
      font-size: 12px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1em;
      transition: all 0.3s;
      margin-top: 8px;
      i {
        margin-right: 6px;
        display: flex;
        font-size: 12px;
      }

      border: 1px solid var(--ant-primary-color);

      &.field-prem {
        color: #444444;
        border: 1px solid #444444;
        &:hover {
          color: var(--ant-primary-color-hover);
          border-color: var(--ant-primary-color-hover);
        }
      }
    }

    .create-time-wrapper {
      display: flex;
      align-items: center;
      margin-top: 4px;
      font-size: 12px;
      line-height: 18px;

      .create-input-number {
        width: 84px !important;
      }
    }
  }
</style>
