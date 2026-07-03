<template>
  <MrContainer
    ref="mrContainer"
    :id="projectObj?.id"
    :zoom="1"
    :style="pageStyles"
    :class="[{ stage: true }]"
    :snapTracking="false"
    :isDesign="false"
  >
    <stage-elv v-for="element in projectObj?.page" :key="'view_' + element.id" :elem="element" />
  </MrContainer>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { type ProjectType } from '../hooks/usePage';
  import MrContainer from '../components/mr-vue/MrContainer.vue';
  import StageElv from './StageElv.vue';

  const props = defineProps<{
    project: ProjectType;
  }>();

  const projectObj = computed(() => {
    return { ...props.project, id: props.project.id + '_' + new Date().getTime() };
  });

  const mrContainer = ref();

  const pageStyles = computed(() => {
    const newProject = props.project;
    const styles = newProject.styles || {};
    return {
      ...styles,
      height: isNaN(newProject.height) ? newProject.height : newProject.height + 'px',
      width: isNaN(newProject.width) ? newProject.width : newProject.width + 'px',
      zoom: 1,
      overflow: 'hidden',
    };
  });
</script>

<style></style>
