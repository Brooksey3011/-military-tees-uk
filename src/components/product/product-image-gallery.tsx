"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, ZoomIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
// Removed Modal import - using custom implementation
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export function ProductImageGallery({ 
  images, 
  productName, 
  className 
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isZoomModalOpen, setIsZoomModalOpen] = React.useState(false)
  const [isZoomed, setIsZoomed] = React.useState(false)
  const [zoomPosition, setZoomPosition] = React.useState({ x: 0, y: 0 })

  const mainImageRef = React.useRef<HTMLDivElement>(null)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !isZoomed) return

    const rect = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsZoomed(true)
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
  }

  if (images.length === 0) {
    return (
      <div className={cn("aspect-square bg-muted rounded-none border-2 border-border flex items-center justify-center", className)}>
        <div className="text-6xl">👕</div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="relative group">
        <div
          ref={mainImageRef}
          className="relative aspect-square overflow-hidden rounded-none border-2 border-border bg-muted cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsZoomModalOpen(true)}
        >
          <Image
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              isZoomed && "scale-150"
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : {}
            }
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentIndex === 0}
          />

          {/* Zoom Indicator */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/80">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-background/80"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-background/80"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-background/80 rounded-none border border-border px-2 py-1 text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "flex-shrink-0 relative aspect-square w-16 h-16 rounded-none overflow-hidden border-2 transition-all",
                  currentIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-border"
                )}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Military-themed Zoom Modal */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsZoomModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border-2 border-border rounded-none max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b-2 border-border p-4 flex items-center justify-between">
                <h3 className="text-lg font-display font-bold tracking-wide uppercase">
                  {productName} - IMAGE {currentIndex + 1} OF {images.length}
                </h3>
                <div className="flex gap-2">
                  {images.length > 1 && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-none border-2"
                        onClick={handlePrevious}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-none border-2"
                        onClick={handleNext}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-none"
                    onClick={() => setIsZoomModalOpen(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              {/* Image Container */}
              <div className="relative aspect-square max-h-[60vh] overflow-hidden bg-muted">
                <Image
                  src={images[currentIndex]}
                  alt={`${productName} - Full size image ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>

              {/* Modal Thumbnail Strip */}
              {images.length > 1 && (
                <div className="border-t-2 border-border p-4">
                  <div className="flex gap-2 justify-center overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={cn(
                          "flex-shrink-0 relative aspect-square w-12 h-12 rounded-none overflow-hidden border-2",
                          currentIndex === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}