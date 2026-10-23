<template>
  <div class="shell">
    <header class="topbar">
      <router-link to="/params" class="mark">
        <span class="mark-seal">SP</span>
        <span>
          <strong>Structured Products</strong>
          <em>Parameter catalog</em>
        </span>
      </router-link>
      <nav class="nav-pills">
        <router-link to="/params" :class="{on: !isProduct}">Parameters</router-link>
        <router-link to="/products" :class="{on: isProduct}">Products</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const isProduct = computed(() => route.path.startsWith('/products'));
</script>
