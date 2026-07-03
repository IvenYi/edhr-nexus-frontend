<template>
  <div class="locale-box" ref="LocalePickerBox">
    <a-select
      class="w-108px"
      :get-popup-container="() => LocalePickerBox"
      :value="selectedKeys"
      @change="handleChange"
    >
      <a-select-option v-for="item in localeList" :key="item.event" :value="item.event">{{
        item.text
      }}</a-select-option>
    </a-select>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watchEffect, unref, computed } from 'vue';
  import { useLocale } from '/@/locales/useLocale';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';

  const localeStore = useLocaleStoreWithOut();

  // const props = defineProps({
  //   /**
  //    * Whether to display text
  //    */
  //   showText: { type: Boolean, default: true },
  //   /**
  //    * Whether to refresh the interface when changing
  //    */
  //   reload: { type: Boolean },
  // });

  const selectedKeys = ref<string[]>([]);
  const LocalePickerBox = ref();

  const { getLocale } = useLocale();

  const localeList = computed(() => {
    return localeStore.getEnableLocaleList.map((d: any) => {
      return { ...d, text: d.language, event: d.languageTag };
    });
  });

  // const getLocaleText = computed(() => {
  //   const key = selectedKeys.value[0];
  //   if (!key) {
  //     return '';
  //   }
  //   return localeList.value.find((item) => item.languageTag === key)?.text;
  // });

  watchEffect(() => {
    selectedKeys.value = [unref(getLocale)];
  });

  // async function toggleLocale(lang: LocaleType | string) {
  //   await changeLocale(lang as LocaleType);
  //   selectedKeys.value = [lang as string];
  //   props.reload && location.reload();
  // }

  function handleChange(val: any) {
    // if (unref(getLocale) === val) {
    //   return;
    // }
    selectedKeys.value = [unref(val)];
    // toggleLocale(val as string);
  }

  async function setLocale() {
    const [lang] = selectedKeys.value;
    const localeStore = useLocaleStoreWithOut();
    localeStore.setLocaleInfo({ locale: lang });
    return Promise.resolve();
  }

  function reload() {
    selectedKeys.value = [unref(getLocale)];
  }

  defineExpose({ setLocale, reload });
</script>

<style lang="less"></style>
