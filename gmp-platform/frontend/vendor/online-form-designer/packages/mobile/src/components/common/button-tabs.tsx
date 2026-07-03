import { defineComponent, type PropType } from 'vue';

export interface IButtonTab {
  key: string;
  name: string;
  disabled?: boolean;
}

export const ButtonTabs = defineComponent({
  name: 'ButtonTabs',

  props: {
    tabs: {
      type: Array as PropType<IButtonTab[]>,
      default: () => [],
    },
    activeTab: {
      type: String,
      default: () => '',
    },
    onChange: {
      type: Function as PropType<(key: string) => void>,
      default: () => () => null,
    },
  },

  setup(props) {
    return () => (
      <div class="flex p-[2px] bg-[#E1E4E6] rounded-lg select-none">
        {props.tabs.map(({ key, name, disabled }, index) => {
          const isActive = key === props.activeTab;
          const isFirst = index === 0;

          return (
            <div
              key={key}
              class={`
                flex-grow flex-shrink-0 flex justify-center items-center
                h-8 md:h-10 rounded-md font-500
                transition-all duration-200
                ${
                  disabled
                    ? 'opacity-30 cursor-not-allowed'
                    : isActive
                      ? 'bg-white'
                      : 'cursor-pointer'
                }
                ${isFirst ? '' : 'ml-[2px]'}
              `}
              onClick={() => {
                if (disabled || isActive) return;
                props.onChange(key);
              }}
            >
              {name}
            </div>
          );
        })}
      </div>
    );
  },
});
