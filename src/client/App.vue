<template>
  <div>
    <nav-bar v-if="!$route.meta.isPublic" />
    <div class="uk-container uk-flex uk-flex-center uk-flex-middle" style="min-height: calc(100vh - 80px);">
      <router-view />
    </div>
  </div>
</template>

<script>
import navBar from '@/components/partials/nav';

export default {
  components: {
    navBar,
  },
};
</script>
