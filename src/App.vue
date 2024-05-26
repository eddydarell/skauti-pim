<script setup>
import { useProductStore } from '@/store/product'
import { useCategoryStore } from '@/store/category'
import { onMounted } from 'vue'

const productStore = useProductStore()
const categoryStore = useCategoryStore()

onMounted(() => {
    productStore.fetchProducts()
    categoryStore.fetchCategories()
})
</script>

<template>
    <router-view />
</template>

<style scoped></style>
