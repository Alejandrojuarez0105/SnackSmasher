import { Close, Crop, CropFree, Upload } from '@mui/icons-material'
import {
    Box,
    Button,
    IconButton,
    Paper,
    Slider,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUploader({ value, onChange, label = 'Imagen' }: ImageUploaderProps) {
  const [originalImage, setOriginalImage] = useState('')
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 })
  const [imageZoom, setImageZoom] = useState(100)
  const [cropMode, setCropMode] = useState<'cover' | 'contain'>('cover')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Cargar imagen cuando value cambia (para modo edición)
  useEffect(() => {
    if (value && !originalImage) {
      setOriginalImage(value)
    }
  }, [value])

  // Aplicar recorte con debounce para mejor rendimiento
  const applyImageTransformDebounced = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      applyImageTransform()
    }, 150) // 150ms de delay para suavizar
  }, [imagePosition, imageZoom, originalImage, cropMode])

  useEffect(() => {
    if (originalImage && originalImage.startsWith('data:')) {
      applyImageTransformDebounced()
    }
  }, [imagePosition, imageZoom, originalImage, cropMode, applyImageTransformDebounced])

  const compressImage = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject('No se pudo crear el canvas')
            return
          }

          const maxWidth = 1200
          const maxHeight = 900
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }

          if (height > maxHeight) {
            width = (maxHeight / height) * width
            height = maxHeight
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          const compressed = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressed)
        }
        img.onerror = () => reject('Error al cargar la imagen')
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject('Error al leer el archivo')
      reader.readAsDataURL(file)
    })
  }

  const applyImageTransform = () => {
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const targetWidth = 800
      const targetHeight = 600

      canvas.width = targetWidth
      canvas.height = targetHeight

      const scale = imageZoom / 100

      if (cropMode === 'cover') {
        // Modo COVER: Rellena todo el espacio (puede recortar)
        const imgRatio = img.width / img.height
        const targetRatio = targetWidth / targetHeight

        let renderWidth, renderHeight

        if (imgRatio > targetRatio) {
          // Imagen más ancha - ajustar por altura
          renderHeight = targetHeight * scale
          renderWidth = renderHeight * imgRatio
        } else {
          // Imagen más alta - ajustar por ancho
          renderWidth = targetWidth * scale
          renderHeight = renderWidth / imgRatio
        }

        const offsetX = -(renderWidth - targetWidth) * (imagePosition.x / 100)
        const offsetY = -(renderHeight - targetHeight) * (imagePosition.y / 100)

        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight)

      } else {
        // Modo CONTAIN: Muestra toda la imagen (con barras negras si es necesario)
        const imgRatio = img.width / img.height
        const targetRatio = targetWidth / targetHeight

        let renderWidth, renderHeight, offsetX, offsetY

        if (imgRatio > targetRatio) {
          // Imagen más ancha
          renderWidth = targetWidth * scale
          renderHeight = renderWidth / imgRatio
          offsetX = (targetWidth - renderWidth) / 2
          offsetY = (targetHeight - renderHeight) * (imagePosition.y / 100)
        } else {
          // Imagen más alta
          renderHeight = targetHeight * scale
          renderWidth = renderHeight * imgRatio
          offsetX = (targetWidth - renderWidth) * (imagePosition.x / 100)
          offsetY = (targetHeight - renderHeight) / 2
        }

        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight)
      }

      const transformed = canvas.toDataURL('image/jpeg', 0.85)
      onChange(transformed)
    }
    img.src = originalImage
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    try {
      const compressed = await compressImage(file)
      setOriginalImage(compressed)
      setImagePosition({ x: 50, y: 50 })
      setImageZoom(100)
    } catch (err) {
      alert('Error al procesar la imagen: ' + err)
    }
  }

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        if (!blob) continue

        try {
          const compressed = await compressImage(blob)
          setOriginalImage(compressed)
          setImagePosition({ x: 50, y: 50 })
          setImageZoom(100)
        } catch (err) {
          alert('Error al procesar la imagen: ' + err)
        }
        break
      }
    }
  }

  const handleUrlChange = (url: string) => {
    if (url.startsWith('http')) {
      setOriginalImage(url)
      onChange(url)
      setImagePosition({ x: 50, y: 50 })
      setImageZoom(100)
    } else if (url === '') {
      setOriginalImage('')
      onChange('')
    }
  }

  const handleClear = () => {
    setOriginalImage('')
    onChange('')
    setImagePosition({ x: 50, y: 50 })
    setImageZoom(100)
  }

  return (
    <Box>
      <Typography variant='subtitle2' gutterBottom>
        {label}
      </Typography>

      <TextField
        fullWidth
        placeholder='Pega una URL o arrastra una imagen aquí'
        value={originalImage && !originalImage.startsWith('data:') ? originalImage : ''}
        onChange={(e) => handleUrlChange(e.target.value)}
        onPaste={handlePaste}
        sx={{ mb: 2 }}
        helperText='Puedes pegar una URL, subir un archivo, o pegar una imagen desde el portapapeles'
      />

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <Button
        variant='outlined'
        startIcon={<Upload />}
        onClick={() => fileInputRef.current?.click()}
        sx={{ mb: 2 }}
      >
        Subir imagen desde archivo
      </Button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {originalImage && (
        <Paper
          sx={{
            p: 2,
            border: '2px solid rgba(0, 255, 255, 0.3)',
            background: 'rgba(0, 255, 255, 0.05)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='subtitle2'>Vista Previa</Typography>
            <IconButton size='small' onClick={handleClear}>
              <Close />
            </IconButton>
          </Box>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 300,
              overflow: 'hidden',
              borderRadius: 1,
              mb: 2,
              background: '#000'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${value || originalImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          </Box>

          {originalImage.startsWith('data:') && (
            <>
              {/* Modo de recorte */}
              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' gutterBottom display='block'>
                  Modo de ajuste
                </Typography>
                <ToggleButtonGroup
                  value={cropMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setCropMode(newMode)}
                  size='small'
                  fullWidth
                >
                  <ToggleButton value='cover'>
                    <Crop sx={{ mr: 1 }} />
                    Recortar (llenar)
                  </ToggleButton>
                  <ToggleButton value='contain'>
                    <CropFree sx={{ mr: 1 }} />
                    Contener (completa)
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                  {cropMode === 'cover' 
                    ? '📐 La imagen llenará todo el espacio (puede recortar bordes)'
                    : '📐 Se mostrará la imagen completa (puede haber barras negras)'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' gutterBottom>
                  Posición Horizontal
                </Typography>
                <Slider
                  value={imagePosition.x}
                  onChange={(_, value) => setImagePosition({ ...imagePosition, x: value as number })}
                  min={0}
                  max={100}
                  sx={{ color: 'primary.main' }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' gutterBottom>
                  Posición Vertical
                </Typography>
                <Slider
                  value={imagePosition.y}
                  onChange={(_, value) => setImagePosition({ ...imagePosition, y: value as number })}
                  min={0}
                  max={100}
                  sx={{ color: 'primary.main' }}
                />
              </Box>

              <Box>
                <Typography variant='caption' gutterBottom>
                  Zoom ({imageZoom}%)
                </Typography>
                <Slider
                  value={imageZoom}
                  onChange={(_, value) => setImageZoom(value as number)}
                  min={50}
                  max={200}
                  sx={{ color: 'primary.main' }}
                />
              </Box>

              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                💡 Ajusta el modo, posición y zoom para enfocar lo importante. Los cambios se aplicarán automáticamente.
              </Typography>
            </>
          )}

          {originalImage.startsWith('http') && (
            <Typography variant='caption' color='text.secondary'>
              ℹ️ Las URLs externas no se pueden recortar. Si quieres ajustar la imagen, descárgala y súbela como archivo.
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  )
}