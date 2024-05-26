import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  let categories = ref([])
  const isLoading = ref(false)
  const hasFinished = ref(false)
  const fetchStatusCode = ref(0)
  const fetchExecute = ref(false)
  const fetchCanAbort = ref(false)
  const fetchAbort = ref(false)
  const hasFetchFailed = ref(false)
  const baseUrl = import.meta.env.VITE_API_URL

  const fetchCategories = async () => {
        isLoading.value = true
        hasFinished.value = false
        hasFetchFailed.value = false
        fetchStatusCode.value = 0
        fetchCanAbort.value = false
        fetchAbort.value = false
        fetchExecute.value = true
        const { data, status } = await useFetch(`${baseUrl}/categories`).get().json()
        categories.value = data
        fetchStatusCode.value = status
        isLoading.value = false
        hasFinished.value = true
    }

  const getCategoryById = (id: number) => {
    const b = categories.value.find(category => category.id === id)
    return b
  }

  const createProduct = async (category) => {
    return await useFetch(`${baseUrl}/categories`).post(category).json()
  }

  const updateProduct = async (id, category) => {
    return await useFetch(`${baseUrl}/categories/${id}`).put(category).json()
  }

  const deleteProduct = async (id) => {
    const { data } = await useFetch(`${baseUrl}/categories/${id}`).delete().json()
    return data
  }

  return {
    categories,
    fetchCategories,
  }
})
