'use client'

import { useState, useRef, useCallback } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'
import { supabase } from '@/utils/supabase/client'

interface AvatarUploaderProps {
    userId: string
    currentAvatarUrl?: string
    onUploadComplete: (url: string) => void
    onSkip?: () => void
    showCameraOption?: boolean
    compact?: boolean
}

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp']

// Max dimensions and file size
const MAX_DIMENSION = 1000
const MAX_FILE_SIZE_KB = 300
const OUTPUT_SIZE = 400

// Extract file path from Supabase URL for deletion
function extractFilePathFromUrl(url: string): string | null {
    if (!url) return null
    const match = url.match(/\/avatars\/(.+)$/)
    return match ? match[1] : null
}

// Create cropped image from crop area
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    outputSize: number = OUTPUT_SIZE
): Promise<Blob | null> {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = reject
        image.src = imageSrc
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = outputSize
    canvas.height = outputSize

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    )

    // Compress to fit size limit
    let quality = 0.92
    let blob: Blob | null = null

    while (quality > 0.1) {
        blob = await new Promise<Blob | null>(resolve => {
            canvas.toBlob(b => resolve(b), 'image/jpeg', quality)
        })
        if (blob && blob.size / 1024 <= MAX_FILE_SIZE_KB) break
        quality -= 0.08
    }

    return blob
}

export default function AvatarUploader({
    userId,
    currentAvatarUrl,
    onUploadComplete,
    onSkip,
    showCameraOption = false,
    compact = false
}: AvatarUploaderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    const validateFile = (file: File): string | null => {
        // Check file extension
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
            return `Format non supporté. Utilisez : ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
        }

        // Check MIME type
        if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
            return `Type de fichier non supporté. Utilisez une image JPEG, PNG ou HEIC.`
        }

        // Check file size (max 15MB input)
        if (file.size > 15 * 1024 * 1024) {
            return 'L\'image ne doit pas dépasser 15 Mo'
        }

        return null
    }

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            const validationError = validateFile(file)
            if (validationError) {
                setError(validationError)
                return
            }

            setError(null)
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string)
            })
            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const deleteOldAvatar = async (oldUrl: string | undefined) => {
        if (!oldUrl) return
        const filePath = extractFilePathFromUrl(oldUrl)
        if (!filePath) return

        try {
            await supabase.storage.from('avatars').remove([filePath])
            console.log('[AvatarUploader] Old avatar deleted')
        } catch (err) {
            console.warn('[AvatarUploader] Could not delete old avatar:', err)
        }
    }

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        setIsUploading(true)
        setError(null)

        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (!blob) throw new Error('Impossible de traiter l\'image')

            console.log('[AvatarUploader] Final size:', Math.round(blob.size / 1024), 'KB')

            const fileName = `${userId}/${Date.now()}.jpg`

            await deleteOldAvatar(currentAvatarUrl)

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            console.log('[AvatarUploader] Upload successful:', publicUrl)
            onUploadComplete(publicUrl)
        } catch (err: any) {
            console.error('[AvatarUploader] Error:', err)
            setError(err?.message || 'Une erreur est survenue')
        } finally {
            setIsUploading(false)
        }
    }

    const resetCrop = () => {
        setImageSrc(null)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        setError(null)
    }

    return (
        <div className="avatar-uploader">
            <style jsx>{`
                .avatar-uploader {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0 16px;
                }

                .current-avatar {
                    width: ${compact ? '100px' : '140px'};
                    height: ${compact ? '100px' : '140px'};
                    border-radius: 50%;
                    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: ${compact ? '20px' : '32px'};
                    overflow: hidden;
                    border: 4px solid rgba(255,255,255,0.8);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                }

                .current-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .current-avatar i {
                    font-size: ${compact ? '40px' : '56px'};
                    color: #bbb;
                }

                .upload-options {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    justify-content: center;
                    width: 100%;
                }

                .upload-btn {
                    flex: 1;
                    min-width: 140px;
                    max-width: 200px;
                    padding: 18px 24px;
                    background: linear-gradient(135deg, #f8f8f8 0%, #efefef 100%);
                    border: 2px solid #e5e5e5;
                    border-radius: 16px;
                    color: #555;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                }

                .upload-btn:hover, .upload-btn:active {
                    border-color: var(--accent-gold, #C9A962);
                    background: linear-gradient(135deg, #fff 0%, #f8f5f0 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(201, 169, 98, 0.15);
                }

                .upload-btn i {
                    font-size: 24px;
                    color: var(--accent-gold, #C9A962);
                }

                .hidden {
                    display: none;
                }

                /* Modern Crop Container */
                .crop-wrapper {
                    width: 100%;
                    max-width: 320px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .crop-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 24px;
                    overflow: hidden;
                    background: #1a1a1a;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
                }

                .crop-hint {
                    margin-top: 16px;
                    font-size: 13px;
                    color: #888;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .crop-hint i {
                    font-size: 16px;
                }

                /* Zoom Slider */
                .zoom-container {
                    width: 100%;
                    max-width: 280px;
                    margin-top: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .zoom-container i {
                    font-size: 14px;
                    color: #888;
                }

                .zoom-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    border-radius: 3px;
                    background: linear-gradient(to right, var(--accent-gold, #C9A962) 0%, #e5e5e5 0%);
                    outline: none;
                }

                .zoom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: var(--accent-gold, #C9A962);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(201, 169, 98, 0.4);
                    transition: transform 0.15s ease;
                }

                .zoom-slider::-webkit-slider-thumb:active {
                    transform: scale(1.15);
                }

                .crop-actions {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                    margin-top: 28px;
                    padding-bottom: env(safe-area-inset-bottom, 24px);
                }

                .btn {
                    flex: 1;
                    padding: 18px 24px;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                }

                .btn-cancel {
                    background: #f0f0f0;
                    color: #666;
                }

                .btn-cancel:active {
                    background: #e5e5e5;
                }

                .btn-confirm {
                    background: linear-gradient(135deg, var(--accent-gold, #C9A962) 0%, #B89952 100%);
                    color: white;
                    box-shadow: 0 4px 16px rgba(201, 169, 98, 0.35);
                }

                .btn-confirm:active {
                    transform: scale(0.98);
                }

                .btn-confirm:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .error {
                    color: #e74c3c;
                    font-size: 13px;
                    margin-top: 12px;
                    text-align: center;
                    padding: 12px 16px;
                    background: rgba(231, 76, 60, 0.1);
                    border-radius: 12px;
                }

                .skip-text {
                    font-size: 14px;
                    color: #999;
                    margin-top: 20px;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .skip-text:hover {
                    color: #666;
                }

                .uploading-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    border-radius: 24px;
                    z-index: 10;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.2);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .uploading-text {
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                }
            `}</style>

            {/* Hidden inputs with strict accept attributes */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic,image/heif"
                capture="user"
                onChange={onSelectFile}
                className="hidden"
            />
            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"
                onChange={onSelectFile}
                className="hidden"
            />

            {!imageSrc ? (
                <>
                    <div className="current-avatar">
                        {currentAvatarUrl ? (
                            <img src={currentAvatarUrl} alt="Avatar" />
                        ) : (
                            <i className="fa-solid fa-user" />
                        )}
                    </div>
                    <div className="upload-options">
                        {showCameraOption && (
                            <button
                                className="upload-btn"
                                onClick={() => cameraInputRef.current?.click()}
                            >
                                <i className="fa-solid fa-camera" />
                                Prendre une photo
                            </button>
                        )}
                        <button
                            className="upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <i className="fa-solid fa-images" />
                            Photothèque
                        </button>
                    </div>
                    {onSkip && (
                        <p className="skip-text" onClick={onSkip}>
                            Passer cette étape
                        </p>
                    )}
                </>
            ) : (
                <div className="crop-wrapper">
                    <div className="crop-container">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            minZoom={1}
                            maxZoom={4}
                            objectFit="contain"
                            style={{
                                containerStyle: {
                                    borderRadius: '24px',
                                },
                                cropAreaStyle: {
                                    border: '3px solid rgba(255,255,255,0.9)',
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                                },
                            }}
                        />
                        {isUploading && (
                            <div className="uploading-overlay">
                                <div className="spinner" />
                                <span className="uploading-text">Envoi en cours...</span>
                            </div>
                        )}
                    </div>

                    <p className="crop-hint">
                        <i className="fa-solid fa-hand-pointer" />
                        Pincez pour zoomer • Glissez pour déplacer
                    </p>

                    <div className="zoom-container">
                        <i className="fa-solid fa-image" />
                        <input
                            type="range"
                            className="zoom-slider"
                            value={zoom}
                            min={1}
                            max={4}
                            step={0.05}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{
                                background: `linear-gradient(to right, var(--accent-gold, #C9A962) ${((zoom - 1) / 3) * 100}%, #e5e5e5 ${((zoom - 1) / 3) * 100}%)`
                            }}
                        />
                        <i className="fa-solid fa-magnifying-glass-plus" />
                    </div>

                    <div className="crop-actions">
                        <button className="btn btn-cancel" onClick={resetCrop}>
                            Annuler
                        </button>
                        <button
                            className="btn btn-confirm"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Envoi...' : 'Confirmer'}
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}</p>}
        </div>
    )
}
