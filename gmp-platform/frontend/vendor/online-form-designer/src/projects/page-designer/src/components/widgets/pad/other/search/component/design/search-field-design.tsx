import { useNamespace } from '@gct-paas/core';
import { computed, toRefs, defineComponent } from 'vue';
import { SearchWidgets } from '/@page-designer/types/pad/search-widget-types';
import { SearchComponents } from '/@page-designer/enum';
import { DefaultSearchField } from './default-search-field/default-search-field';
import './search-field-design.scss';

export const SearchFieldDesign = defineComponent({
  name: 'SearchFieldDesign',
  props: {
    modelValue: {
      type: String,
      required: false,
    },
    widget: {
      type: Object as PropType<SearchWidgets>,
      required: true,
    },
    labelWidth: {
      type: Number,
      default: 0,
    },
    isFirstInRow: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ns = useNamespace('search-field-design');

    const { type } = props.widget;

    const { field, fieldType, fieldName } = props.widget.props;

    const { placeholder, isRang, readonly, moreOptions } = toRefs(props.widget.props);
    const selectList = [
      SearchComponents.SearchSelect,
      SearchComponents.SearchUserSelect,
      SearchComponents.SearchRdoSelect,
      SearchComponents.SearchTransaction,
      SearchComponents.SearchTmplTreeSelect,
      SearchComponents.SearchPrinter,
      SearchComponents.SearchSwitch,
      SearchComponents.SearchSelectDepartment,
    ];

    const dateList = [
      SearchComponents.SearchDate,
      SearchComponents.SearchDateTime,
      SearchComponents.SearchTime,
    ];

    const showMoreOptions = computed(() => {
      return moreOptions && moreOptions.value && moreOptions.value.length > 0 && !readonly.value;
    });

    const isShowRang = computed(() => {
      return (
        [
          SearchComponents.SearchDate,
          SearchComponents.SearchDateTime,
          SearchComponents.SearchTime,
          SearchComponents.SearchNumberInput,
          SearchComponents.SearchStringNumberInput,
        ].includes(type) && isRang?.value
      );
    });

    const formAttr = computed(() => {
      const res = {};

      if (
        [
          SearchComponents.SearchNumberInput,
          SearchComponents.SearchSwitch,
          SearchComponents.SearchDate,
          SearchComponents.SearchDateTime,
          SearchComponents.SearchTime,
          SearchComponents.SearchSelect,
          SearchComponents.SearchRdoSelect,
          SearchComponents.SearchPrinter,
        ].includes(type)
      ) {
        Object.assign(res, {
          isLink: true,
          clickable: true,
        });

        if (isShowRang.value) {
          Object.assign(res, {
            isLink: false,
          });
        }
      }

      return {
        name: field,
        readonly: true,
        inputAlign: 'right',
        ...res,
      };
    });

    function renderIcon() {
      const showIcon = selectList.includes(type) || dateList.includes(type);
      if (!showIcon) return null;
      let icon = '';
      if (selectList.includes(type)) {
        icon = 'icon-zujianziduan-xiajiantou';
      }
      if (dateList.includes(type)) {
        if (type === SearchComponents.SearchDateTime) {
          icon = 'icon-chaxun-riqishijian';
        } else if (type === SearchComponents.SearchTime) {
          icon = 'icon-chaxun-shijian';
        } else {
          icon = 'icon-chaxun-riqi';
        }
      }
      return (
        <span class={ns.e('editor-icon')}>
          <i class={`gct-iconfont ${icon}`} />
        </span>
      );
    }

    function renderText() {
      if (readonly.value) {
        return <DefaultSearchField type={fieldType!} />;
      }
      return (
        <div class={[ns.e('editor')]}>
          <span class={ns.e('editor-placeholder')}>{placeholder.value}</span>
          {renderIcon()}
        </div>
      );
    }

    return () => {
      return (
        <van-field
          v-bind={formAttr.value}
          class={[ns.b(), ns.is('first-in-row', props.isFirstInRow), ns.is('show-more-options', showMoreOptions.value)]}
          colon
          label-align="right"
          label={props.widget.props.label || fieldName || ''}
          style={{
            // 实际宽度需要 +6 来适配 vant 呈现
            '--van-field-label-width': props.labelWidth > 0 ? `${props.labelWidth + 6}px` : 'auto',
          }}
        >
          {{
            label: () => {
              return <span>{props.widget.props.label || fieldName || ''}</span>;
            },
            input: () => {
              if (isShowRang.value) {
                return (
                  <div class="ks-row-middle">
                    <div class="start-item">{renderText()}</div>
                    <div class="text-center">-</div>
                    <div class="end-item">{renderText()}</div>
                  </div>
                );
              }
              return (
                <div class="ks-row-middle">
                  {renderText()}
                  {showMoreOptions.value ? (
                    <span class="pl6px inline-block">
                      <van-button type="default" size="small" class="more-icon">
                        <span class="gct-iconfont icon-shaixuan-chaxun"></span>
                      </van-button>
                    </span>
                  ) : null}
                </div>
              );
            },
          }}
        </van-field>
      );
    };
  },
});

export default SearchFieldDesign;
