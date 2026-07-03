<template>
  <div :class="[ns.b(), ns.is('info', isInfo), 'ks-row']">
    <div :class="[ns.b('wrapper'), ns.is('info', isInfo)]">
      <div :class="[ns.b('form-container')]">
        <a-form ref="form" :model="data" :label-col="{ style: { width: '150px' } }">
          <a-collapse v-model:activeKey="collapseKeys" ghost>
            <a-collapse-panel key="1" :header="t('sys.appDesigner.basicInfo')">
              <a-form-item
                v-if="isInfo === true"
                name="name"
                :label="t('sys.appDesigner.basicInfo')"
                :rules="config.name.rules"
              >
                <SpanEditor :value="data.name" />
              </a-form-item>
              <I18nSelectInputForm
                v-if="isInfo === false"
                :formRef="form!"
                formItemName="name"
                :fromItemExtraProps="{
                  label: t('sys.appDesigner.timedTask.entity.name'),
                  rules: [{ required: true }],
                }"
                :inputExtraProps="{ showCount: true, maxlength: 32 }"
                v-model:text="data.name"
                v-model:i18nConfig="data.i18nConfig"
              />
              <a-form-item name="desc" :label="t('sys.appDesigner.timedTask.entity.desc')">
                <SpanEditor v-if="isInfo === true" :value="data.desc" />
                <a-textarea
                  v-if="isInfo === false"
                  v-model:value="data.desc"
                  :placeholder="t('sys.appDesigner.timedTask.form.placeEnterDesc')"
                  :rows="4"
                  show-count
                  :maxlength="120"
                />
              </a-form-item>
            </a-collapse-panel>
            <a-collapse-panel key="2" :header="t('sys.appDesigner.configOption')">
              <a-form-item
                name="type"
                :label="t('sys.appDesigner.timedTask.entity.type')"
                :rules="config.type.rules"
              >
                <SpanEditor
                  v-if="isInfo === true"
                  :value="data.type"
                  :codeList="config.type.codeList"
                />
                <a-select
                  v-if="isInfo === false"
                  v-model:value="data.type"
                  @change="handleChangeType"
                  :options="config.type.codeList"
                  :placeholder="t('sys.appDesigner.pleaseSelect')"
                />
              </a-form-item>
              <a-form-item
                v-if="config.cycle.child.expression.visible"
                name="cycleExpression"
                :label="t('sys.appDesigner.timedTask.entity.cron')"
                :rules="config.cycle.child.expression.rules"
              >
                <CronEditor v-model:value="data.cycleExpression" :isInfo="isInfo" />
              </a-form-item>
              <a-form-item
                v-if="config.cycle.child.date.visible"
                name="cycleDate"
                :label="t('sys.appDesigner.timedTask.entity.date')"
                :rules="config.cycle.child.date.rules"
              >
                <SpanEditor
                  v-if="isInfo === true"
                  :value="data.cycleDate"
                  format="YYYY-MM-DD HH:mm:ss"
                />
                <a-date-picker
                  :placeholder="t('sys.appDesigner.pleaseSelect')"
                  v-if="isInfo === false"
                  v-model:value="data.cycleDate"
                  format="YYYY-MM-DD HH:mm:ss"
                  show-time
                  :disabledDate="
                    (currentDate) => {
                      // 单次定时任务今天之前的不能选，选择之前时间无意义
                      return currentDate && currentDate < dayjs().startOf('day');
                    }
                  "
                />
              </a-form-item>
              <a-form-item
                v-if="config.cycle.visible"
                :label="t('sys.appDesigner.timedTask.entity.cycle')"
                :class="[ns.e('cycle')]"
                :rules="config.cycle.rules"
              >
                <a-row>
                  <a-col :class="ns.e('cycle-top')" :span="24">
                    <a-form-item v-if="isInfo === true">
                      <SpanEditor
                        :value="`每 ${data.cycleInterval || ''}`"
                        style="padding-top: 5px"
                      >
                        <SpanEditor
                          style="display: inline"
                          :value="data.cycleMode"
                          :codeList="config.cycle.child.mode.codeList"
                        />
                      </SpanEditor>
                    </a-form-item>
                    <a-row v-if="isInfo === false">
                      <a-col :span="12">
                        <a-form-item
                          name="cycleInterval"
                          :class="[ns.e('cycle-interval')]"
                          label="每"
                          :rules="config.cycle.child.interval.rules"
                        >
                          <a-input-number
                            v-model:value="data.cycleInterval"
                            autocomplete="off"
                            :min="1"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item name="cycleMode" :rules="config.cycle.child.mode.rules">
                          <a-select
                            v-model:value="data.cycleMode"
                            :options="config.cycle.child.mode.codeList"
                            @change="handleChangeCycleMode2"
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-col>
                  <a-col
                    :class="ns.e('cycle-bottom')"
                    :span="24"
                    v-if="config.cycle.child.timeQuantum.visible"
                  >
                    <a-form-item
                      name="cycleTimeQuantum"
                      ref="cycleTimeQuantumRef"
                      :rules="config.cycle.child.timeQuantum.rules"
                    >
                      <CascaderPreview
                        v-if="isInfo === true"
                        :value="data.cycleTimeQuantum"
                        :options="config.cycle.child.timeQuantum.codeList"
                        :mode="data.cycleMode"
                      />
                      <a-cascader
                        v-if="data.cycleMode === '5' && isInfo === false"
                        :class="[ns.e('cycle-time-quantum')]"
                        v-model:value="data.cycleTimeQuantum"
                        max-tag-count="responsive"
                        multiple
                        :placeholder="config.placeholder"
                        :show-checked-strategy="Cascader.SHOW_CHILD"
                        :options="config.cycle.child.timeQuantum.codeList"
                        expandTrigger="hover"
                        :popupClassName="ns.e('cycle-time-quantum-popup')"
                        :getPopupContainer="() => cycleTimeQuantumRef?.$el"
                      />
                      <a-select
                        v-if="data.cycleMode !== '5' && isInfo === false"
                        v-model:value="data.cycleTimeQuantum"
                        mode="multiple"
                        :maxTagCount="5"
                        :maxTagTextLength="6"
                        :placeholder="config.placeholder"
                        :options="config.cycle.child.timeQuantum.codeList"
                        @change="() => calcCronExpression()"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form-item>
              <a-form-item
                v-if="config.cycle.child.time.visible && data.cycleMode != 6"
                name="cycleTime"
                :label="t('sys.appDesigner.timedTask.entity.time')"
                :rules="config.cycle.child.time.rules"
              >
                <SpanEditor
                  v-if="isInfo === true"
                  :value="data.cycleTime"
                  :format="data.cycleMode === '1' ? 'mm' : 'HH:mm'"
                />
                <a-time-picker
                  v-if="isInfo === false"
                  v-model:value="data.cycleTime"
                  :format="data.cycleMode === '1' ? 'mm' : 'HH:mm'"
                  show-time
                  :showNow="false"
                  :disabledHours="config.cycle.child.time.disabledTime.disabledHours"
                />
              </a-form-item>
              <a-form-item
                v-if="config.cycle.child.range.visible"
                name="cycleRange"
                :label="t('sys.appDesigner.timedTask.entity.timeRange')"
                :rules="config.cycle.child.range.rules"
              >
                <SpanEditor
                  v-if="isInfo === true"
                  :value="data.cycleRange"
                  dateRange
                  format="YYYY-MM-DD HH:mm:ss"
                />
                <a-range-picker
                  v-if="isInfo === false"
                  v-model:value="data.cycleRange"
                  format="YYYY-MM-DD HH:mm:ss"
                  show-time
                />
              </a-form-item>
              <a-form-item
                name="sourceType"
                :label="t('sys.appDesigner.timedTask.entity.mode')"
                :rules="config.sourceType.rules"
              >
                <SpanEditor
                  v-if="isInfo === true"
                  :value="data.sourceType"
                  :codeList="config.sourceType.codeList"
                />
                <a-select
                  v-if="isInfo === false"
                  v-model:value="data.sourceType"
                  :options="config.sourceType.codeList"
                  :placeholder="t('sys.appDesigner.pleaseSelect')"
                />
              </a-form-item>
              <a-form-item
                name="sourceId"
                :label="
                  data.sourceType === 'SCRIPT_SERVICE'
                    ? t('sys.appDesigner.timedTask.entity.script')
                    : t('sys.appDesigner.timedTask.entity.arrange')
                "
                :rules="config.sourceId.rules"
              >
                <ServiceScriptPicker
                  :isInfo="isInfo"
                  v-model:value="data.sourceId"
                  :mode="data.sourceType"
                />
              </a-form-item>
            </a-collapse-panel>
            <a-collapse-panel key="3" :header="t('sys.appDesigner.paramsConfig')">
              <ParamsEdit v-model:value="data.params" />
            </a-collapse-panel>
          </a-collapse>
        </a-form>
      </div>
      <div v-if="isInfo === false && data.type === 'CRON'" :class="[ns.b('cron-info')]">
        <CronDesc />
      </div>
    </div>
    <div :class="[ns.b('cron'), ns.is('info', isInfo)]">
      <CronPreview :value="data.cron" :range="data.cycleRange" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, watch, VNodeRef, defineExpose } from 'vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { useNamespace } from '@gct/runtime';
  import { RuleObject } from 'ant-design-vue/lib/form';
  import { useI18n } from 'vue-i18n';
  import { Cascader, FormInstance } from 'ant-design-vue';
  import { ServiceScriptPicker, CronEditor, SpanEditor, CascaderPreview } from './editor';
  import CronDesc from '../cron-desc/cron-desc.vue';
  import { CronPreview } from '../cron-preview/cron-preview';
  import { ParamsEdit } from '../params-edit/params-edit';
  import { ITimedTaskItem } from '../../interface';
  import './edit-form.scss';

  type RangeValue = [Dayjs, Dayjs];

  const { t } = useI18n();

  const collapseKeys = ref<string[]>(['1', '2', '3']);

  const cycleTimeQuantumRef = ref<VNodeRef | null>(null);

  const props = defineProps({
    isInfo: { type: Boolean, default: false },
    data: { type: Object as PropType<ITimedTaskItem>, required: true },
  });

  const form = ref<FormInstance | null>(null);

  const data = reactive<ITimedTaskItem>(props.data);

  const ns = useNamespace('timed-task-edit-form');

  const config: { [key: string]: { [key: string]: any; rules?: RuleObject[] } } = reactive({
    name: {
      default: '',
      rules: [
        {
          required: true,
        },
      ],
    },
    type: {
      default: 'ONCE',
      rules: [
        {
          required: true,
        },
      ],
      codeList: [
        { value: 'ONCE', label: t('sys.appDesigner.timedTask.codeList.oneShot') },
        { value: 'REPEAT', label: t('sys.appDesigner.timedTask.codeList.repeatedTrigger') },
        { value: 'CRON', label: t('sys.appDesigner.timedTask.codeList.customCronExpression') },
      ],
    },
    cycle: {
      default: {},
      visible: false,
      rules: [
        {
          required: true,
        },
      ],
      child: {
        expression: {
          default: '',
          visible: false,
          rules: [
            {
              required: true,
            },
          ],
        },
        date: {
          default: '',
          visible: true,
          rules: [
            {
              required: true,
            },
          ],
        },
        interval: {
          default: 1,
          visible: false,
          rules: [
            {
              required: true,
            },
          ],
        },
        mode: {
          default: '1',
          visible: false,
          rules: [
            {
              required: true,
            },
          ],
          codeList: [
            { value: '6', label: t('sys.appDesigner.timedTask.editor.minute') },
            { value: '1', label: t('sys.appDesigner.timedTask.codeList.hour') },
            { value: '2', label: t('sys.appDesigner.timedTask.codeList.day') },
            { value: '3', label: t('sys.appDesigner.timedTask.codeList.week') },
            { value: '4', label: t('sys.appDesigner.timedTask.codeList.month') },
            { value: '5', label: t('sys.appDesigner.timedTask.codeList.year') },
          ],
        },
        timeQuantum: {
          default: '',
          visible: false,
          rules: [
            {
              required: true,
            },
          ],
          codeList: [],
        },
        time: {
          default: '',
          visible: false,
          rules: [
            {
              required: true,
            },
          ],
          disabledTime: {
            disabledHours: () => {
              if (data.cycleMode !== '1') {
                return [];
              }
              return [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
              ];
            },
          },
        },
        range: {
          default: [],
          visible: false,
          ranges: {
            Today: [dayjs(), dayjs()] as RangeValue,
            'This Month': [dayjs(), dayjs().endOf('month')] as RangeValue,
          },
        },
      },
    },
    sourceType: {
      default: 'SCRIPT_SERVICE',
      rules: [
        {
          required: true,
        },
      ],
      codeList: [
        {
          value: 'SCRIPT_SERVICE',
          label: t('sys.appDesigner.timedTask.codeList.serviceScript'),
        },
        {
          value: 'SO_SERVICE',
          label: t('sys.appDesigner.timedTask.codeList.serviceOrchestration'),
        },
      ],
    },
    sourceId: {
      rules: [
        {
          required: true,
        },
      ],
    },
  });

  // 处理类型变化后控制表单显示隐藏
  const handleChangeType = (type: any) => {
    const { child } = config.cycle;
    switch (type) {
      // 单次触发
      case 'ONCE':
        child.date.visible = true;
        child.expression.visible = false;
        config.cycle.visible = false;
        child.time.visible = false;
        child.range.visible = false;
        break;
      // 重复触发
      case 'REPEAT':
        child.date.visible = false;
        child.expression.visible = false;
        config.cycle.visible = true;
        child.time.visible = true;
        child.range.visible = true;
        break;
      case 'CRON':
        child.date.visible = false;
        child.expression.visible = true;
        config.cycle.visible = false;
        child.time.visible = false;
        child.range.visible = true;
        break;
      default:
        break;
    }
  };

  /**
   * 根据周期模式计算周期选项
   *
   * @param cycleMode 周期模式
   */
  const calcCycleTimeQuantum = (cycleMode: string = data.cycleMode) => {
    if (cycleMode == null) {
      return;
    }
    const { child } = config.cycle;
    // 小时 || 日，无需选择量
    if (cycleMode == '1' || cycleMode == '2') {
      child.timeQuantum.codeList = [];
      return;
    }
    // 周
    if (cycleMode == '3') {
      child.timeQuantum.codeList = [
        { value: 'MON', label: t('sys.appDesigner.timedTask.codeList.mon') },
        { value: 'TUE', label: t('sys.appDesigner.timedTask.codeList.tue') },
        { value: 'WED', label: t('sys.appDesigner.timedTask.codeList.wed') },
        { value: 'THU', label: t('sys.appDesigner.timedTask.codeList.thu') },
        { value: 'FRI', label: t('sys.appDesigner.timedTask.codeList.fri') },
        { value: 'SAT', label: t('sys.appDesigner.timedTask.codeList.sat') },
        { value: 'SUN', label: t('sys.appDesigner.timedTask.codeList.sun') },
      ];
      return;
    }
    // 月
    if (cycleMode == '4') {
      child.timeQuantum.codeList = [];
      for (let i = 1; i <= 31; i++) {
        child.timeQuantum.codeList.push({
          value: i.toString(),
          label: t(`sys.appDesigner.timedTask.days.${i}day`),
        });
      }
      child.timeQuantum.codeList.push({
        value: '0',
        label: t('sys.appDesigner.timedTask.lastDayOfMonth'),
      });
      return;
    }
    // 年/月
    if (cycleMode == '5') {
      child.timeQuantum.codeList = [];
      for (let i = 1; i <= 12; i++) {
        const item: any = {
          value: i.toString(),
          label: t(`sys.appDesigner.timedTask.months.${i}month`),
          children: [],
        };
        let day = 31;
        if (i === 2) {
          day = 29;
        } else if (i === 4 || i === 6 || i === 9 || i === 11) {
          day = 30;
        }
        for (let j = 1; j <= day; j++) {
          item.children.push({
            value: j.toString(),
            label:
              t(`sys.appDesigner.timedTask.months.${i}month`) +
              t(`sys.appDesigner.timedTask.days.${j}day`),
          });
        }
        child.timeQuantum.codeList.push(item);
      }
      return;
    }
  };

  const handleChangeCycleMode2 = (value: any) => {
    data.cycleTimeQuantum = [];
    handleChangeCycleMode(value);
  };

  // 周期模式变更，控制周期量的显示隐藏
  const handleChangeCycleMode = (value: any) => {
    const { child } = config.cycle;
    switch (value) {
      case '3':
      case '4':
      case '5':
        child.timeQuantum.visible = true;
        break;
      default:
        child.timeQuantum.visible = false;
        break;
    }
    calcCycleTimeQuantum(value);
  };

  // 设置表单的默认值
  const setDefault = (configOption = config, source = data) => {
    const keys = Object.keys(configOption);
    keys.forEach((key) => {
      const cfg = configOption[key];
      if (source[key] == null && cfg.default != null) {
        source[key] = cfg.default;
      }
      if (cfg.child) {
        setDefault(cfg.child, source[key]);
      }
    });
    handleChangeType(source.type);
    if (source.cycleMode) {
      handleChangeCycleMode(source.cycleMode);
    }
  };

  setDefault();

  /**
   * 根据用户填写配置计算cron表达式
   * @param key 变更的配置项
   */
  const calcCronExpression = () => {
    // 清空之前计算的cron表达式
    data.cron = [];
    switch (data.type) {
      case 'ONCE':
        if (data.cycleDate) {
          const d = dayjs(data.cycleDate);
          data.cron = [d.format('ss mm HH DD MM ? YYYY')];
        }
        break;
      case 'REPEAT': {
        const d = dayjs(data.cycleTime);
        const m = Number.parseInt(d.format('mm'));
        const h = Number.parseInt(d.format('HH'));
        switch (data.cycleMode) {
          // 分
          case '6':
            if (data.cycleInterval) {
              data.cron = [`0 0/${data.cycleInterval} * * * ? *`];
            }
            break;
          // 小时
          case '1':
            if (data.cycleInterval && data.cycleTime) {
              data.cron = [`0 ${m} 0/${data.cycleInterval} * * ? *`];
            }
            break;
          // 日
          case '2':
            if (data.cycleInterval && data.cycleTime) {
              // 0 1 3 0/2 * ? *
              data.cron = [`0 ${m} ${h} 1/${data.cycleInterval} * ? *`];
            }
            break;
          // 周
          case '3':
            if (data.cycleInterval && data.cycleTime && data.cycleTimeQuantum) {
              const arr = data.cycleTimeQuantum as string[];
              // 0 1 3 ? * 1,7 *
              data.cron = [`0 ${m} ${h} ? * ${arr.join(',')} *`];
            }
            break;
          // 月
          case '4':
            if (data.cycleInterval && data.cycleTime && data.cycleTimeQuantum) {
              data.cron = [];
              const arr = [...((data.cycleTimeQuantum as string[]) || [])];
              if (arr.includes('0')) {
                arr.splice(arr.indexOf('0'), 1);
                data.cron.push(`0 ${m} ${h} L 1/${data.cycleInterval} ? *`);
              }
              if (arr.length > 0) {
                // 0 1 3 * 1,3,5,7 ? *
                data.cron.push(`0 ${m} ${h} ${arr.join(',')} 1/${data.cycleInterval} ? *`);
              }
            }
            break;
          // 年
          case '5':
            if (data.cycleInterval && data.cycleTime && data.cycleTimeQuantum) {
              const arr = data.cycleTimeQuantum as string[][];
              const month: { [key: string]: string[] } = {};
              arr.forEach((item) => {
                const [monthStr, dayStr] = item;
                if (!month[monthStr]) {
                  month[monthStr] = [];
                }
                month[monthStr].push(dayStr || '*');
              });
              const keys = Object.keys(month);
              const cronArr = keys.map((key) => {
                return `0 ${m} ${h} ${
                  month[key][0] === '*' ? month[key] : month[key].join(',')
                } ${key} ? *`;
              });
              data.cron = cronArr;
            }
            break;
          default:
            break;
        }
        break;
      }
      case 'CRON':
        const expression = data.cycleExpression;
        if (expression) {
          const arr = expression.split(',');
          let cron = arr
            .map((str) => {
              return str;
            })
            .join(' ');
          cron += ' *';
          data.cron = [cron];
        }
        break;
      default:
        break;
    }
  };

  // 监控值变化重算cron表达式
  watch(
    () => [
      data.type,
      data.cycleInterval,
      data.cycleMode,
      data.cycleTimeQuantum,
      data.cycleExpression,
      data.cycleDate,
      data.cycleTime,
      data.cycleRange,
      data.cycleTriggerMode,
    ],
    () => {
      calcCronExpression();
    },
  );

  watch(
    () => props.data,
    () => {
      Object.assign(data, props.data);
      handleChangeType(data.type);
      if (data.cycleMode) {
        handleChangeCycleMode(data.cycleMode);
      }
    },
  );

  watch(
    () => data.sourceId,
    () => {
      if (data.sourceId) {
        form.value?.clearValidate(['sourceId']);
      }
    },
  );

  // 校验表单
  const validate = async (): Promise<boolean> => {
    try {
      await form.value?.validate();
      return true;
    } catch (error) {
      return false;
    }
  };

  const getData = () => {
    return data as ITimedTaskItem;
  };

  defineExpose({
    validate,
    getData,
  });
</script>
