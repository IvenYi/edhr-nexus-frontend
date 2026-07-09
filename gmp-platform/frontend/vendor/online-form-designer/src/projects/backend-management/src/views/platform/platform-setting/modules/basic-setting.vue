<template>
  <div class="basic-setting-form pt-32px">
    <!-- {{ basicSetting }} -->
    <a-form
      ref="formRef"
      :model="basicSetting"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.platform.platformName')"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="basicSetting.name"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.platform.platformName') })"
          show-count
          :maxlength="32"
          style="width: 50%"
        />
      </a-form-item>
      <a-form-item :label="t('sys.platform.platformVersion')" name="version">
        <a-input
          v-model:value="basicSetting.version"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.platform.platformVersion') })"
          show-count
          :maxlength="32"
          style="width: 50%"
          disabled
        />
      </a-form-item>
      <a-form-item :label="t('sys.platform.logo')" name="logo">
        <simple-upload v-model:file="basicSetting.logo" :size="100">
          <template #tip> 支持jpg、jpeg、png图片格式，大小100KB以内，建议尺寸128px*128px </template>
        </simple-upload>
      </a-form-item>
      <!-- <a-form-item :label="t('sys.platform.thumbnail')" name="thumbnail">
        <simple-upload v-model:file="basicSetting.thumbnail" :size="100">
          <template #tip> 支持jpg、png图片格式，大小100KB以内，建议尺寸48px*48px</template>
        </simple-upload>
      </a-form-item> -->
      <a-form-item :label="t('sys.platform.stationIcon')" name="logo">
        <simple-upload v-model:file="basicSetting.icon" :size="100">
          <template #tip> 支持jpg、jpeg、png图片格式，大小100KB以内，建议尺寸48px*48px </template>
        </simple-upload>
      </a-form-item>
      <!-- <a-form-item :label="t('sys.description')" name="description">
        <a-textarea
          v-model:value="basicSetting.description"
          style="width: 50%"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.description') })"
        />
      </a-form-item> -->
      <a-form-item :label="t('sys.platform.copyright')" name="copyright">
        <!-- <a-textarea
          v-model:value="basicSetting.copyright"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.platform.copyright') })"
          style="width: 50%"
        /> -->
        <div class="copyright">
          <div
            id="copyright"
            contenteditable="true"
            class="copyrightContent"
            @click="getCursorPosition"
            @copy="handleCopy"
            @paste="handlePaste"
            v-html="copyrightContent"
          >
          </div>
          <a id="insertButton" class="insert-btn"> 插入当前年份</a>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import SimpleUpload from '/@/components/SimpleUpload/index.vue';
  // import { useBasicSetting } from '../hooks/useBasicSetting';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  // import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
  // import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  // import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
  // import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  // import { useWatermarkSetting } from '/@/hooks/platform/useWatermarkSetting';
  // import { onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const { basicSetting, loadBasicSetting } = useBasicSetting();

  const copyrightContent = ref<string>('');

  onMounted(() => {
    void (async () => {
      await loadBasicSetting();
      copyrightContent.value = basicSetting.copyright ?? '';
    })();
  });

  const range = ref<Range | null>(null);
  const validateValue = () => {
    return formRef.value?.validate();
  };
  // 获取光标位置
  const getCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      range.value = selection.getRangeAt(0);
    } else {
      range.value = null;
    }
  };
  const insertYear = () => {
    // const range = getCursorPosition();
    if (range.value) {
      const textNode = document.createElement(`span`);
      textNode.textContent = '${当前年份}'; // 设置 span 的内容
      // if (className) {
      textNode.className = 'ownInput'; // 设置 span 的类名
      // }
      range.value.insertNode(textNode); // 在光标处插入变量

      // 将光标移动到插入内容之后
      range.value.setStartAfter(textNode);
      range.value.setEndAfter(textNode);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range.value);
    }
  };

  const syncCopyrightContent = (html: string) => {
    copyrightContent.value = html;
    basicSetting.copyright = html;
  };

  const handleCopy = (event: ClipboardEvent) => {
    const copyright = document.getElementById('copyright');
    const html = copyright?.innerHTML ?? '';
    syncCopyrightContent(html);

    if (!event.clipboardData) return;
    event.preventDefault();
    event.clipboardData.setData('text/plain', html);
    event.clipboardData.setData('text/html', html);
  };

  const cleanupStyleAttributes = () => {
    const copyright = document.getElementById('copyright');
    if (!copyright) return;
    // 移除所有 ownInput span 上的 style 属性（清理 UnoCSS 自动添加的 CSS 变量）
    const spans = copyright.querySelectorAll('span.ownInput');
    spans.forEach((span) => {
      span.removeAttribute('style');
    });
  };

  const handlePaste = () => {
    // 延迟清理，让浏览器完成粘贴动作
    setTimeout(() => {
      cleanupStyleAttributes();
      const copyright = document.getElementById('copyright');
      if (copyright) {
        syncCopyrightContent(copyright.innerHTML);
      }
    }, 0);
  };

  // 创建 MutationObserver 实例
  // const observer = new MutationObserver((mutationsList) => {
  //   for (const mutation of mutationsList) {
  //     if (mutation.type === 'childList' || mutation.type === 'characterData') {
  //       output.textContent = div.innerHTML; // 获取 div 的内容
  //     }
  //   }
  // });

  // 配置观察选项
  const config = {
    childList: true, // 观察子节点的变化
    subtree: true, // 观察所有后代节点
    characterData: true, // 观察文本内容的变化
  };

  onMounted(() => {
    const insertButton = document.getElementById('insertButton');
    const copyright = document.getElementById('copyright');
    if (!insertButton || !copyright) return;

    const onInsertClick = () => {
      insertYear();
    };

    // 点击按钮时插入变量
    insertButton.addEventListener('click', onInsertClick);

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          syncCopyrightContent(copyright.innerHTML);
        }
      }
    });

    // 开始观察
    observer.observe(copyright, config);

    onBeforeUnmount(() => {
      observer.disconnect();
      insertButton.removeEventListener('click', onInsertClick);
    });
  });

  const focus = (val) => {
    console.log(val, 'val');
  };

  defineExpose({ validateValue });
</script>

<style lang="less" scoped>
  .basic-setting-form {
    height: 100%;
    overflow: auto;
  }

  .copyright {
    position: relative;
    width: 50%;

    .copyrightContent {
      height: 100px;
      padding: 4px 12px;
      border: 1px solid #e8ebf0;
      border-radius: 4px;
    }
  }

  .insert-btn {
    position: absolute;
    bottom: 10px;
    left: 12px;
  }
</style>
<style>
  .ownInput {
    color: rgb(2 106 200);
    -webkit-user-modify: read-only !important;
  }
</style>
