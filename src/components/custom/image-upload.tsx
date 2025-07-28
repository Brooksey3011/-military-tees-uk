"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon, FileImage, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedImage {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
}

export function ImageUpload({ 
  onImagesChange, 
  maxImages = 5, 
  maxFileSize = 10, 
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] 
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} not supported. Please use JPG, PNG, GIF, or WebP.`
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB.`
    }
    
    return null
  }

  const handleFiles = async (files: FileList) => {
    setError('')
    
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed.`)
      return
    }

    const newImages: UploadedImage[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const validationError = validateFile(file)
      
      if (validationError) {
        setError(validationError)
        continue
      }

      const id = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)
      
      newImages.push({
        id,
        file,
        preview,
        uploading: false,
        uploaded: false
      })
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      onImagesChange(updatedImages)
      
      // Start uploading files
      newImages.forEach(image => uploadImage(image, updatedImages))
    }
  }

  const uploadImage = async (imageToUpload: UploadedImage, currentImages: UploadedImage[]) => {
    // Update uploading state
    const updatedImages = currentImages.map(img => 
      img.id === imageToUpload.id 
        ? { ...img, uploading: true }
        : img
    )
    setImages(updatedImages)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', imageToUpload.file)
      formData.append('bucket', 'custom-designs')
      formData.append('path', `quotes/${Date.now()}-${imageToUpload.file.name}`)

      // Upload to our API endpoint
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      // Update with uploaded URL
      const finalImages = updatedImages.map(img => 
        img.id === imageToUpload.id 
          ? { ...img, uploading: false, uploaded: true, url: result.url }
          : img
      )
      setImages(finalImages)
      onImagesChange(finalImages)

    } catch (error) {
      console.error('Upload error:', error)
      // Update with error state
      const errorImages = updatedImages.map(img => 
        img.id === imageToUpload.id 
          ? { ...img, uploading: false, uploaded: false }
          : img
      )
      setImages(errorImages)
      setError('Failed to upload image. Please try again.')
    }
  }

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    setImages(updatedImages)
    onImagesChange(updatedImages)
    
    // Clean up preview URL
    const imageToRemove = images.find(img => img.id === id)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-none p-8 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={images.length < maxImages ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        <div className="space-y-3">
          <div className="mx-auto bg-muted p-3 border-2 border-border w-fit">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="font-medium text-foreground">
              {images.length >= maxImages ? `Maximum ${maxImages} images reached` : 'Upload Design References'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {images.length < maxImages ? (
                <>Drag & drop images here, or click to browse<br />
                JPG, PNG, GIF or WebP • Max {maxFileSize}MB per file</>
              ) : (
                'Remove some images to upload more'
              )}
            </p>
          </div>
          
          {images.length < maxImages && (
            <Button variant="outline" className="rounded-none border-2">
              <ImageIcon className="h-4 w-4 mr-2" />
              Choose Images
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 border-2 border-destructive rounded-none bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            <p className="text-xs text-muted-foreground">
              These will help our designers understand your vision
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square border-2 border-border rounded-none overflow-hidden bg-muted">
                  <img
                    src={image.preview}
                    alt="Design reference"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Loading Overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {image.uploading ? (
                      <Badge className="rounded-none bg-yellow-600 text-white">
                        Uploading...
                      </Badge>
                    ) : image.uploaded ? (
                      <Badge className="rounded-none bg-green-600 text-white">
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge className="rounded-none bg-red-600 text-white">
                        Failed
                      </Badge>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 truncate">
                  {image.file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-muted/20 border-2 border-border rounded-none p-4">
        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <FileImage className="h-4 w-4" />
          Upload Tips
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Include reference images, logos, or artwork you'd like incorporated</li>
          <li>• Upload existing designs you want modified or improved</li>
          <li>• Share inspiration images or style examples</li>
          <li>• Include photos of unit badges, insignia, or patches</li>
          <li>• Higher resolution images help us create better designs</li>
        </ul>
      </div>
    </div>
  )
}