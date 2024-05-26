import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const isLoading = ref(false)
  const hasFinished = ref(false)
  const fetchStatusCode = ref(0)
  const fetchExecute = ref(false)
  const fetchCanAbort = ref(false)
  const fetchAbort = ref(false)
  const hasFetchFailed = ref(false)
  const baseUrl = import.meta.env.VITE_API_URL

    const fetchProducts = async () => {
        isLoading.value = true
        hasFinished.value = false
        hasFetchFailed.value = false
        fetchStatusCode.value = 0
        fetchCanAbort.value = false
        fetchAbort.value = false
        fetchExecute.value = true
        const { data, status } = await useFetch(`${baseUrl}/products`).get().json()
        products.value = data
        fetchStatusCode.value = status
        isLoading.value = false
        hasFinished.value = true
    }

  const getProductById = (id: number) => {
    const b = products.value.find(product => product.id === id)
    return b
  }

  const createProduct = async (product) => {
    return await useFetch(`${baseUrl}/products`).post(product).json()
  }

  const updateProduct = async (id, product) => {
    return await useFetch(`${baseUrl}/products/${id}`).put(product).json()
  }

  const deleteProduct = async (id) => {
    const { data } = await useFetch(`${baseUrl}/products/${id}`).delete().json()
    return data
  }

  return {
    products,
    fetchProducts,
  }
})
