import { useMutation } from '@tanstack/react-query'

export function useDataExport() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/export/data')
      if (!res.ok) throw new Error('Failed to export data')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'scorelift-export.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    },
  })
}