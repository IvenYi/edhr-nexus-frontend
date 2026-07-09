<template>
  <div :class="ns.b()">
    <div :class="ns.e('wrapper')" v-for="(item, index) in arr" :key="index">
      <div :class="ns.e('platform')">
        <WindowsFilled v-if="item.platform === 'Windows'" :class="ns.e('platform-icon')" />
        <AppleFilled v-else :class="ns.e('platform-icon')" />
        <div :class="[ns.e('platform-name')]">{{ item.platform }}</div>
      </div>
      <div :class="ns.e('shortcuts')">
        <div
          :class="ns.e('shortcut-item')"
          v-for="(shortcut, index) in item.shortcuts"
          :key="index"
        >
          <span :class="ns.e('shortcut-title')">{{ shortcut.title }}</span>
          <span v-for="key in shortcut.keys" :key="key" :class="ns.e('shortcut-key')">
            <template v-if="key === SpecialKey.MouseClick">
              <img :src="Mouse" />
              {{ t('sys.onlineForm.help.mouseClick') }}
            </template>
            <template v-else-if="key === SpecialKey.MacCommand">
              <img :src="MacCommand" />
              Command
            </template>
            <template v-else-if="key === SpecialKey.MacOption">
              <img :src="MacOption" />
              Option
            </template>
            <template v-else>
              {{ key }}
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { reactive, ref } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { AppleFilled, WindowsFilled } from '@ant-design/icons-vue';
  import { useI18n } from 'vue-i18n';
  import MacCommand from '/@online-form/assets/mac-command.svg';
  import MacOption from '/@online-form/assets/mac-option.svg';
  import Mouse from '/@online-form/assets/mouse.svg';

  const { t } = useI18n();

  const ns = useNamespace('help-modal');

  enum SpecialKey {
    MouseClick = 'MouseClick',
    MacCommand = 'MacCommand',
    MacOption = 'MacOption',
  }

  const arr = reactive([
    {
      platform: 'Windows',
      shortcuts: [
        { title: t('sys.onlineForm.help.selectCell'), keys: [SpecialKey.MouseClick] },
        { title: t('sys.onlineForm.help.deleteCell'), keys: ['Del/Backspace'] },
        { title: t('sys.onlineForm.help.setThead'), keys: ['Alt', 'T'] },
        { title: t('sys.onlineForm.help.undo'), keys: ['Ctrl', 'Z'] },
        { title: t('sys.onlineForm.help.setFixedTable'), keys: ['Alt', 'G'] },
        { title: t('sys.onlineForm.help.normalCopy'), keys: ['Ctrl', 'C'] },
        { title: t('sys.onlineForm.help.cut'), keys: ['Ctrl', 'X'] },
        { title: t('sys.onlineForm.help.setDynamicTable'), keys: ['Alt', 'D'] },
        { title: t('sys.onlineForm.help.quickSave'), keys: ['Ctrl', 'S'] },
        { title: t('sys.onlineForm.help.paste'), keys: ['Ctrl', 'V'] },
        { title: t('sys.onlineForm.help.setDataGroup'), keys: ['Alt', 'F'] },
      ],
    },
    {
      platform: 'macOS',
      shortcuts: [
        { title: t('sys.onlineForm.help.selectCell'), keys: [SpecialKey.MouseClick] },
        { title: t('sys.onlineForm.help.deleteCell'), keys: ['Del/Backspace'] },
        { title: t('sys.onlineForm.help.setThead'), keys: [SpecialKey.MacOption, 'T'] },
        { title: t('sys.onlineForm.help.undo'), keys: [SpecialKey.MacCommand, 'Z'] },
        { title: t('sys.onlineForm.help.setFixedTable'), keys: [SpecialKey.MacOption, 'G'] },
        { title: t('sys.onlineForm.help.normalCopy'), keys: [SpecialKey.MacCommand, 'C'] },
        { title: t('sys.onlineForm.help.cut'), keys: [SpecialKey.MacCommand, 'X'] },
        { title: t('sys.onlineForm.help.setDynamicTable'), keys: [SpecialKey.MacOption, 'D'] },
        { title: t('sys.onlineForm.help.quickSave'), keys: [SpecialKey.MacCommand, 'S'] },
        { title: t('sys.onlineForm.help.paste'), keys: [SpecialKey.MacCommand, 'V'] },
        { title: t('sys.onlineForm.help.setDataGroup'), keys: [SpecialKey.MacOption, 'F'] },
      ],
    },
  ]);
</script>

<style lang="scss" scoped>
  @include b(help-modal) {
    padding: 12px 24px;
    overflow: auto;

    @include e(wrapper) {
      display: flex;
      align-items: center;
      padding: 24px 0;
      min-width: 1200px;
      & ~ & {
        border-top: 1px solid #e0e3ea;
      }
    }

    @include e(platform) {
      width: 200px;
      text-align: center;
      flex-grow: 0;
      flex-shrink: 0;
    }

    @include e(platform-icon) {
      font-size: 62px;
    }

    @include e(platform-name) {
      font-size: 14px;
    }

    @include e(shortcuts) {
      flex-grow: 1;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 12px;
    }

    @include e(shortcut-item) {
    }

    @include e(shortcut-title) {
      width: 104px;
      display: inline-block;
    }

    @include e(shortcut-key) {
      background: #f2f4f7;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #e6e9ef;
      padding: 3px 8px;
      position: relative;

      & ~ & {
        margin-left: 25px;
        &::before {
          position: absolute;
          content: '+';
          font-size: 14px;
          left: -18px;
        }
      }
    }
  }
</style>
