import { computed, defineComponent } from 'vue';
import { IModalData, useGctFormValue, useNamespace } from '@gct-paas/core';
import { DataRulesModal } from '../../../data-rules-modal/data-rules-modal';
import { useReportViewController } from '../../hooks';
import './data-rules-config.scss';
import { ValueTypeEnum } from '/@/projects/web-render/src/views/user-group/constant/config';
import { FIELD_TYPE } from '@gct/runtime';

export const DataRulesConfig = defineComponent({
  name: 'DataRulesConfig',
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          dataRule: '',
          dataRuleConfig: '',
          dataRuleEnabled: true,
        };
      },
    },
  },
  setup() {
    const ns = useNamespace('data-rules-config');
    const t = (window as any).$t;

    const reportView = useReportViewController();

    const detail = useGctFormValue();

    const filterValue = computed(() => {
      if (detail.value?.dataRule) {
        return detail.value.dataRule.exp;
      } else {
        return null;
      }
    });

    async function openConfig() {
      detail.value.dataRuleEnabled = true;
      const filterFieldKeys = [
        FIELD_TYPE.TEXT,
        FIELD_TYPE.LONG_TEXT,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
        FIELD_TYPE.DOUBLE,
        FIELD_TYPE.DECIMAL,
        FIELD_TYPE.BOOLEAN,
        FIELD_TYPE.DATE,
        FIELD_TYPE.DATE_TIME,
        FIELD_TYPE.TIME,
        FIELD_TYPE.ENUM,
        FIELD_TYPE.ENUM_MULTI,
        FIELD_TYPE.REF,
        FIELD_TYPE.REF_MULTI,
      ];
      if (reportView.state.schema.categorySelect === 'system') {
        filterFieldKeys.push(FIELD_TYPE.USER);
      }
      const res = await gct.openUtil.modal<IModalData>(
        DataRulesModal,
        {
          detail: detail.value,
          modelKey: reportView.state.schema.modelKey,
          excludeValueType: [ValueTypeEnum.VAR],
          filterFieldKeys,
        },
        { title: '字段条件规则', width: 640, height: 480 },
      );
      if (res.ok && res.data?.[0]) {
        detail.value = res.data[0];
      }
    }

    return { ns, t, filterValue, openConfig };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('title')}>{this.t('sys.pageDesigner.datafiltering')}</div>
        <div class={this.ns.e('action')}>
          <a-tooltip placement="top">
            {{
              default: () => {
                return (
                  <a-button
                    type={this.filterValue ? 'primary' : 'default'}
                    block
                    onClick={this.openConfig}
                  >
                    {this.filterValue
                      ? this.t('sys.pageDesigner.editFilterCondition')
                      : this.t('sys.pageDesigner.setFilterCondition')}
                  </a-button>
                );
              },
              // title: this.filterValue
              //   ? () => {
              //       return this.filterValue;
              //     }
              //   : undefined,
            }}
          </a-tooltip>
        </div>
        <div class={this.ns.e('info')}>
          {this.t('sys.pageDesigner.restrictedDataRange', { sth: '报表' })}
        </div>
      </div>
    );
  },
});
