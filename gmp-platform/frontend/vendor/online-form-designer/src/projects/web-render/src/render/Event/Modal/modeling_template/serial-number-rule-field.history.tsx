import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { isEqual } from 'lodash-es';
import { useI18n } from '/@/hooks/web/useI18n';
import { SerialModalPreview } from './serial-modal-preview/serial-modal-preview';
import './serial-number-rule-field.history.scss';

export const SerialNumberRuleFieldHistory = defineComponent({
  name: 'SerialNumberRuleFieldHistory',
  props: {
    oldData: {
      type: String,
    },
    data: {
      type: String,
    },
  },
  setup(props) {
    const { t } = useI18n() as any;

    const ns = useNamespace('serial-number-rule-field-history');
    const json = props.data ? JSON.parse(props.data) : {};
    const ruleConfigs: IData[] = json.ruleConfig || [];

    if (props.oldData) {
      const oldJson = JSON.parse(props.oldData);
      const oldRulConfigs: IData[] = oldJson.ruleConfig || [];
      ruleConfigs.forEach((item) => {
        const data = oldRulConfigs.find((oldItem) => oldItem.id === item.id);
        if (!data) {
          item.isNew = true;
        }
        if (data && !isEqual(item.config, data!.config)) {
          item.isEdit = true;
        } else {
          item.isEdit = false;
        }
      });
    }

    const onPreview = (config: IData) => {
      gct.openUtil.modal(
        SerialModalPreview,
        { modelKey: json.modelKey, data: config },
        { title: '查看', width: 640, minHeight: 320, showFooter: false },
      );
    };

    return { t, ns, ruleConfigs, onPreview };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.ruleConfigs.map((item) => {
          return (
            <div class={this.ns.e('item')}>
              {this.oldData ? (
                <span
                  class={[
                    this.ns.e('state'),
                    this.ns.is('new', item.isNew),
                    this.ns.is('edit', item.isEdit),
                  ]}
                >
                  {item.isNew === true ? '新建' : item.isEdit === true ? '修改' : ''}
                </span>
              ) : null}
              <span class={this.ns.e('info')}>{this.t(`sys.model.${item.type}`)}</span>
              <span class={this.ns.e('preview')}>
                <i class="iconfont icon-yulan" onClick={() => this.onPreview(item)} />
              </span>
            </div>
          );
        })}
      </div>
    );
  },
});
