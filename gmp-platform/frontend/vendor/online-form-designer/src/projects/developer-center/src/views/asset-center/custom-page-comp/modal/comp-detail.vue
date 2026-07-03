<template>
  <a-drawer
    placement="right"
    v-model:visible="open"
    :bodyStyle="{ padding: 0, background: '#F7F8FA' }"
    :mask="false"
    width="100%"
  >
    <template #closeIcon>
      <div class="color-[#000000] leave">
        <left-outlined />{{ t('sys.appDesigner.customAppHome.preview.back') }}
      </div>
    </template>
    <template #title>
      <div class="text-center font-700">
        {{ t('sys.developer.compDetail') }}
      </div>
    </template>
    <div class="comp-basic-info bg-[#ffffff]">
      <div class="info-content flex">
        <img :src="'/minio/' + compInfo.icon" style="width: 64px; height: 64px" />
        <div class="ml-12px">
          <div class="flex title mb-12px">
            <div class="font-500 name-title">
              {{ compInfo.name }}
              <a-tag v-if="compInfo.tag === 'eDHR'" :bordered="false" color="magenta">
                {{ 'eDHR' + t('sys.org.kit') }}
              </a-tag>
              <a-tag v-if="compInfo.tag === 'common'" :bordered="false" color="blue">
                {{ t('sys.org.common') }}
              </a-tag>
              <a-tag v-if="compInfo.tag === 'MEDPRO'" :bordered="false" color="volcano">
                {{ 'MedPro' + t('sys.org.kit') }}
              </a-tag>
            </div>
            <a-button type="primary" @click="handleRowEdit">{{ t('sys.edit') }}</a-button>
          </div>
          <a-descriptions>
            <a-descriptions-item :label="t('sys.portal.comp') + 'KEY'">
              {{ compInfo.key }}
            </a-descriptions-item>
            <a-descriptions-item :label="t('sys.app.version.no')">
              {{ compInfo.version }}
            </a-descriptions-item>
            <a-descriptions-item :label="t('sys.developer.appCenter.client')">
              {{ compInfo.client }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </div>
    <div class="comp-detail-info">
      <div class="anchor">
        <div
          class="anchor-item"
          :class="{ selected: currentAnchor === '#basicInfo' }"
          @click="(e) => handleClick(e, 'basicInfo')"
        >
          {{ t('sys.model.basicInfo') }}
        </div>
        <div
          class="anchor-item"
          :class="{ selected: currentAnchor === '#history' }"
          @click="(e) => handleClick(e, 'history')"
        >
          {{ t('sys.bpmn.versionStatus.HISTORY') }}
        </div>
      </div>
      <!-- <a-anchor
        class="anchor"
        :key="currentAnchor"
        :current="currentAnchor"
        @click="getCurrentAnchor"
      >
        <a-anchor-link
          href="#basicInfo"
          :title="t('sys.model.basicInfo')"
          @click="(e) => handleClick(e, 'basicInfo')"
        />
        <a-anchor-link
          href="#history"
          :title="t('sys.bpmn.versionStatus.HISTORY')"
          @click="(e) => handleClick(e, 'history')"
        />
      </a-anchor> -->
      <div class="info-content mt-12px bg-[#ffffff]">
        <ScrollContainer class="p20px">
          <div id="basicInfo">
            <div class="font-700">{{ t('sys.developer.versionTip') }} </div>
            <div>{{ compInfo.description }}</div>
            <a-carousel arrows dots-class="slick-dots slick-thumb">
              <template #prevArrow>
                <div class="custom-slick-arrow" style="left: 20px; z-index: 1">
                  <left-circle-outlined />
                </div>
              </template>
              <template #nextArrow>
                <div class="custom-slick-arrow" style="right: 20px">
                  <right-circle-outlined />
                </div>
              </template>
              <template #customPaging="props">
                <a>
                  <img :src="'/minio/' + compInfo.screenShotArr[props.i]" />
                </a>
              </template>
              <div v-for="item in compInfo.screenShotArr" :key="item">
                <img :src="'/minio/' + item" />
              </div>
            </a-carousel>
          </div>
          <div id="history" class="pt-20px">
            <div class="font-700">
              {{ t('sys.bpmn.versionStatus.HISTORY') }}
            </div>
            <div v-for="item in versionList" :key="item.id">
              <div class="title mb-8px">
                <span class="font-700">{{ item.version }}</span>
                <a @click="toReadme(item)">README.md</a>
              </div>
              <div class="mb-8px">{{ item.description }} </div>
              <a-image
                v-for="item in item.screenShotArr"
                :key="item"
                :src="'/minio/' + item"
                alt=""
                style="height: 90px"
              >
                <template #previewMask>
                  <eye-outlined />
                </template>
              </a-image>
            </div>
          </div>
        </ScrollContainer>
      </div>
    </div>
    <edit-comp @register="registerEdit" @ok="loadAppInfo" />
  </a-drawer>
  <readme ref="readRef" :markdownFile="markdownFile" :version="version" />
</template>
<script setup lang="ts">
  import { ref, watch, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ScrollContainer } from '/@/components/Container';
  import { getPluginInfo } from '/@/apis/gct-platform/PluginController';
  import EditComp from './edit-comp.vue';
  import Readme from './readme.vue';
  import { useModal } from '/@/components/Modal';
  import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
  import { postPluginVersionList } from '/@/apis/gct-platform/PluginVersionController';
  const props = defineProps<{
    compId: string;
  }>();
  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const open = ref(false);
  const [registerEdit, { openModal: openModalEdit }] = useModal();
  let compInfo = ref({
    key: '',
    categoryId: '',
    client: '',
    description: '',
    icon: '',
    label: '',
    name: '',
    tag: '',
    version: '',
    zipUrl: '',
    tmpPath: '',
    screenShot: '',
    id: '',
    pluginId: '',
    // readMe: '',
    screenShotArr: [],
  });

  const readRef = ref();

  const versionList = ref([]);

  const currentAnchor = ref('#basicInfo');

  const markdownFile = ref();

  const version = ref();

  const loadAppInfo = async () => {
    if (!props.compId.id) return;
    const res = await getPluginInfo({ id: props.compId.id });
    compInfo.value = {
      ...res,
      screenShotArr: res?.screenShot ? res?.screenShot.split(',') : [],
      client: res?.client?.replaceAll(',', '、'),
    }!;
    /** 获取版本信息 */
    const list = await postPluginVersionList({ ...res, pluginId: props.compId.id });
    versionList.value = list.map((i) => {
      i.screenShotArr = i.screenShot ? i.screenShot.split(',') : [];
      return { ...i };
    });
    if (res) {
      const basicInfo = document.getElementById('basicInfo');

      const element = document.querySelector('.info-content .scrollbar__wrap');
      element.addEventListener('scroll', function (e) {
        if (e.target.scrollTop > basicInfo.getBoundingClientRect().height - 300) {
          currentAnchor.value = '#history';
          // getCurrentAnchor()
        } else {
          currentAnchor.value = '#basicInfo';
        }
      });
    }
    currentAnchor.value = '#basicInfo';
  };

  /** 编辑行数据 */
  const handleRowEdit = (record) => {
    openModalEdit(true, {
      ...compInfo.value,
    });
  };
  const getImgUrl = (i: number) => {
    return `${baseUrl}abstract0${i + 1}.jpg`;
  };

  watch(
    () => props.compId,
    () => {
      loadAppInfo();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const getCurrentAnchor = (e, link) => {
    if (link) {
      currentAnchor.value = link.href;
    }
    return currentAnchor.value ? currentAnchor.value : '#basicInfo';
  };
  const onClose = () => {
    open.value = false;
    emit('ok');
  };

  const handleClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: 'smooth' });
    currentAnchor.value = '#' + id;
  };

  const toReadme = (item) => {
    markdownFile.value = item.readMe;
    version.value = item.version;
    readRef.value.visible = true;
  };

  defineExpose({
    open,
  });
</script>

<style lang="less" scoped>
  .comp-basic-info {
    height: 105px;
    display: flex;
    justify-content: center;
    align-items: center;
    .info-content {
      width: 1205px;
      padding: 12px 40px;
    }
  }
  .title {
    display: flex;
    justify-content: space-between;
  }
  .comp-detail-info {
    position: relative;
    display: flex;
    justify-content: center;
    height: calc(100vh - 160px);
    .anchor {
      position: absolute;
      right: calc(50vw - 680px);
      top: 20px;
      line-height: 2;
      .anchor-item {
        padding-left: 8px;
        border-left: 2px solid #ccc;
      }
      .selected {
        color: var(--ant-primary-color);
        border-left: 2px solid var(--ant-primary-color);
      }
    }
    .info-content {
      width: 1205px;
      // padding: 40px;
    }
  }

  .ant-carousel :deep(.slick-dots) {
    position: relative;
    height: auto;
  }
  .ant-carousel :deep(.slick-slide img) {
    border: 5px solid #fff;
    display: block;
    margin: auto;
    width: 100%;
  }

  .ant-carousel :deep(.slick-thumb) {
    bottom: 0px;
  }
  .ant-carousel :deep(.slick-thumb li) {
    width: 200px;
    height: 120px;
  }
  .ant-carousel :deep(.slick-thumb li img) {
    width: 100%;
    height: 100%;
    display: block;
    background: rgba(0, 0, 0, 0.2);
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8));
    &:hover {
      box-shadow: 0px 4px 4px 0px rgba(115, 122, 135, 0.2);
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) , rgba(0, 0, 0, 1));
    }
  }
  .ant-carousel :deep .slick-thumb li.slick-active img {
    filter: grayscale(0%);
    border-radius: 4px;
    border: 2px solid var(--ant-primary-color);
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) , rgba(0, 0, 0, 1));

  }
  .ant-carousel :deep(.slick-arrow.custom-slick-arrow) {
    display: flex !important;
    align-items: center;
    width: 25px;
    height: 100%;
    font-size: 25px;
    color: #fff;
    // background-color: rgba(31, 45, 61, 0.11);
    opacity: 0.3;
    z-index: 1;
    top: 0;
  }
  .ant-carousel :deep(.custom-slick-arrow:before) {
    display: none;
  }
  .ant-carousel :deep(.custom-slick-arrow:hover) {
    opacity: 0.5;
  }
  :deep(.ant-image) {
    margin-right: 8px;
  }
  .leave {
    &:hover {
      color: var(--ant-primary-color);
    }
  }
  .name-title {
    font-size: 18px;
  }
</style>
