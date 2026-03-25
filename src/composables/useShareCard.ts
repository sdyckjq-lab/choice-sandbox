import html2canvas from 'html2canvas'
import { ref } from 'vue'

export function useShareCard() {
  const generating = ref(false)
  const failed = ref(false)

  async function generateImage(element: HTMLElement) {
    generating.value = true
    failed.value = false

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0f1a',
        scale: 2,
        useCORS: true,
      })

      const imageUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = imageUrl
      downloadLink.download = 'choice-sandbox-result.png'
      downloadLink.click()
    } catch {
      failed.value = true
    } finally {
      generating.value = false
    }
  }

  return {
    generating,
    failed,
    generateImage,
  }
}
