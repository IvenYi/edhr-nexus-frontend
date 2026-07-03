<template>
  <div>
    <div v-if="contentInfo">
      <div v-for="(value, key) in contentInfo" :key="key" class="flex">
        <div :class="key === 'wecom' ? 'w90px' : 'w50px'"> {{ keyValue[key] }}：</div>
        <div class="word-break"> {{ value.content }}</div>
      </div>
    </div>
    <div v-if="emailInfo">
      <div v-for="(value, key) in emailInfo" :key="key" class="flex">
        <div class="w50px"> {{ keyValue[key] }}：</div>
        <div class="word-break">
          <div v-if="value.title" class="flex">
            <div class="w66px">【标题】</div>
            <div class="word-break">{{ value.title }}</div>
          </div>
          <div v-if="value.content">
            <div>【内容】</div>
            <div class="word-break" v-html="value.content?.replace(/\n/g, '<br>') || '--'"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!contentInfo && !emailInfo"> -- </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const props = defineProps<{
    content: string;
  }>();
  const keyValue = {
    dingtalk: '钉钉',
    email: '邮箱',
    feishu: '飞书',
    system: '系统',
    wecom: '企业微信',
    content: '内容',
    title: '标题',
  };
  const contentInfo = ref();
  const emailInfo = ref();
  onMounted(() => {
    if (props.content) {
      const { email, ...filteredKeyValue } = JSON.parse(props.content);
      contentInfo.value = filteredKeyValue;
      emailInfo.value = { email: email };
      console.log('props.content', contentInfo.value, emailInfo.value);
    }
  });
</script>
<style lang="scss" scoped>
  .word-break {
    width: 100%;
    word-break: break-all; /* 任意字符处都可换行（包括单词中间） */
    overflow-wrap: break-word; /* 允许在单词内换行 */
  }
</style>
