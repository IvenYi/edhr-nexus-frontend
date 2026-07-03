import { defineComponent, h, PropType } from 'vue';
import { OperateButton, BaseButton } from '/@page-designer/types/web';
import { Popconfirm, Button } from 'ant-design-vue';
import { ButtonColorType } from '/@page-designer/enum';
import { IconNext } from '/@/components/Icon';
import { useI18n } from 'vue-i18n';

/**按钮 */
function getAction(i: OperateButton) {
  return h('div', i.props.label || i.props.title);
}
/**操作按钮 */
function TableAction(i: OperateButton, emit) {
  const child = getAction(i);
  let render: any;
  if (i.props.buttonType === ButtonColorType.LINK) {
    render = h(
      'a',
      {
        class: `ant-btn-link ant-btn-${i.props.buttonTheme}`,
      },
      child,
    );
  } else
    render = h(
      Button,
      {
        class: `ant-btn-${i.props.buttonTheme}`,
      },
      { default: () => child },
    );
  return PopAction(i, emit, render);
}
/**操作下拉作按钮 */
function PopAction(i: OperateButton | BaseButton, emit, c?: any) {
  const { t } = useI18n();
  const child = c ? c : getAction(i);
  if (i.props.confirm) {
    return h(
      Popconfirm,
      {
        title: i.props.confirmText || t('sys.pageDesigner.confirmTodo'),
        onConfirm() {
          emit('runEvent');
        },
      },
      { default: () => child },
    );
  } else {
    return h(child, {
      onClick() {
        emit('runEvent');
      },
    });
  }
}

/**操作按钮 */
export const getTableAction = defineComponent({
  name: 'GetTableAction',
  inheritAttrs: false,
  props: {
    action: {
      type: Object as PropType<OperateButton>,
    },
  },
  emits: ['runEvent'],
  setup(props, { emit }) {
    return () => TableAction(props.action!, emit);
  },
});
/**操作下拉作按钮 */
export const getPopAction = defineComponent({
  name: 'GetPopAction',
  inheritAttrs: false,
  props: {
    action: {
      type: Object as PropType<OperateButton>,
    },
  },
  emits: ['runEvent'],
  setup(props, { emit }) {
    return () => PopAction(props.action!, emit);
  },
});
/** 新版的操作按钮 */
function newTableAction(i: BaseButton, emit) {
  const render = h(
    Button,
    {
      size: i.props.size,
      type: i.props.type,
      danger: i.props.danger,
      disabled: i.props.disabled,
      icon: i.props.hasIcon
        ? h(IconNext, {
            size: 16,
            value: i.props.icon,
            style: {
              marginRight: i.props.hasText ? '4px' : 0,
              '--color': 'inherit',
              lineHeight: '1',
              verticalAlign: i.props.hasText ? 'text-bottom' : 'unset',
            },
          })
        : '',
    },
    {
      default: () => [i.props.hasText ? i.props.title : ''],
    },
  );
  return PopAction(i, emit, render);
}
/**操作按钮 */
export const getNewTableAction = defineComponent({
  name: 'GetNewTableAction',
  inheritAttrs: false,
  props: {
    action: {
      type: Object as PropType<BaseButton>,
    },
  },
  emits: ['runEvent'],
  setup(props, { emit }) {
    return () => newTableAction(props.action!, emit);
  },
});
