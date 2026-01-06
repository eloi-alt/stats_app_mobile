/**
 * Image processing utilities for profile photos
 * - Crops to circular format
 * - Resizes to 320x320 pixels
 * - Compresses to 15-40 KB
 */

export interface ProcessedImage {
    dataUrl: string
    blob: Blob
    size: number
}

/**
 * Process an image file for profile photo use
 * @param file - The input image file
 * @returns Promise with processed image data
 */
export async function processProfileImage(file: File): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
        }

        img.onload = () => {
            // Target size
            const targetSize = 320

            // Calculate crop dimensions (square from center)
            const minDimension = Math.min(img.width, img.height)
            const sx = (img.width - minDimension) / 2
            const sy = (img.height - minDimension) / 2

            // Set canvas size
            canvas.width = targetSize
            canvas.height = targetSize

            // Draw circular mask
            ctx.beginPath()
            ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, Math.PI * 2)
            ctx.closePath()
            ctx.clip()

            // Draw image centered and cropped
            ctx.drawImage(
                img,
                sx, sy, minDimension, minDimension, // source
                0, 0, targetSize, targetSize // destination
            )

            // Compress with quality adjustment to reach target size (15-40 KB)
            let quality = 0.8
            let blob: Blob | null = null
            const targetMinSize = 15 * 1024 // 15 KB
            const targetMaxSize = 40 * 1024 // 40 KB

            const compress = () => {
                canvas.toBlob(
                    (b) => {
                        if (!b) {
                            reject(new Error('Failed to create blob'))
                            return
                        }

                        blob = b

                        // If too large, reduce quality and try again
                        if (b.size > targetMaxSize && quality > 0.1) {
                            quality -= 0.1
                            compress()
                            return
                        }

                        // If too small, increase quality (but not above 0.95)
                        if (b.size < targetMinSize && quality < 0.95) {
                            quality += 0.05
                            compress()
                            return
                        }

                        // Convert to data URL
                        const reader = new FileReader()
                        reader.onload = () => {
                            resolve({
                                dataUrl: reader.result as string,
                                blob: b,
                                size: b.size,
                            })
                        }
                        reader.onerror = () => reject(new Error('Failed to read blob'))
                        reader.readAsDataURL(b)
                    },
                    'image/jpeg',
                    quality
                )
            }

            compress()
        }

        img.onerror = () => reject(new Error('Failed to load image'))

        // Load image from file
        const reader = new FileReader()
        reader.onload = (e) => {
            img.src = e.target?.result as string
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Create a circular preview element from a data URL
 */
export function createCircularPreview(dataUrl: string, size: number = 100): HTMLDivElement {
    const container = document.createElement('div')
    container.style.width = `${size}px`
    container.style.height = `${size}px`
    container.style.borderRadius = '50%'
    container.style.overflow = 'hidden'
    container.style.backgroundImage = `url(${dataUrl})`
    container.style.backgroundSize = 'cover'
    container.style.backgroundPosition = 'center'
    return container
}
