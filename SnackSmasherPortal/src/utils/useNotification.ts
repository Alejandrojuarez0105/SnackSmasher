import { useSnackbar, VariantType } from 'notistack'

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar()

  const showNotification = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { variant })
  }

  const showSuccess = (message: string) => {
    enqueueSnackbar(message, { variant: 'success' })
  }

  const showError = (message: string) => {
    enqueueSnackbar(message, { variant: 'error' })
  }

  const showWarning = (message: string) => {
    enqueueSnackbar(message, { variant: 'warning' })
  }

  const showInfo = (message: string) => {
    enqueueSnackbar(message, { variant: 'info' })
  }

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
