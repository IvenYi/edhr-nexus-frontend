import { defineComponent, h } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { List } from 'vant';
import { Checkbox, Radio } from '/@page-designer/components/common';
import type { Option } from '../../types';
import './user-select.scss';
import defaultAvatar from '@mobile/assets/ipad/default_avatar.png';
import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

export const UserSelect = defineComponent({
  name: 'UserSelect',
  components: {
    'van-list': List,
  },
  props: {
    options: {
      type: Array as () => Option[],
      default: () => [],
    },
    selectedValues: {
      type: Array as () => string[],
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isFinished: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['load', 'change'],
  setup(props, { emit }) {
    const ns = useNamespace('user-select');

    const handleLoad = () => {
      emit('load');
    };

    const handleClick = (value: string, option: Option) => {
      emit('change', value, option);
    };

    const renderUserList = () => {
      return (
        <van-list loading={props.isLoading} finished={props.isFinished} onLoad={handleLoad}>
          {props.options.map((option) => (
            <div
              key={option.value}
              class={[
                'flex items-center rounded-lg active:bg-[#E0E3EB]',
                ns.e('user-item'),
                option.disabled ? 'opacity-40 pointer-events-none' : '',
              ]}
              onClick={() => handleClick(option.value as string, option)}
            >
              {/* 选择框 */}
              {h(props.multiple ? Checkbox : Radio, {
                checked: props.selectedValues.includes(option.value as string),
                style: { width: '20px', height: '20px' },
              })}

              {/* 头像 */}
              <img
                class={ns.e('avatar')}
                src={
                  option._protoValue.avatar
                    ? `${MOBILE_MINIO_PATH.value}${option._protoValue.avatar}`
                    : defaultAvatar
                }
              />

              {/* 用户名称 */}
              <div class={['flex-grow break-all', ns.e('info')]}>
                <div class={ns.e('name')}>{option.label}</div>
                <div class={ns.e('description')}>{option._protoValue.orgNames}</div>
              </div>
            </div>
          ))}
        </van-list>
      );
    };

    return () => {
      return <div class={ns.b()}>{renderUserList()}</div>;
    };
  },
});
