import { defineStore } from 'pinia';
import { useFetch } from '@vueuse/core';
import { ref } from 'vue';

export const useTemplateStore = defineStore('template', () => {
    const templates = ref([]);

    return {
        templates
    };
});
