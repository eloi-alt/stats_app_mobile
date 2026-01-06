'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { supabase } from '@/utils/supabase/client'

interface AvatarUploaderProps {
    userId: string
    currentAvatarUrl?: string
    onUploadComplete: (url: string) => void
    onSkip?: () => void
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export default function AvatarUploader({
    userId,
    currentAvatarUrl,
    onUploadComplete,
    onSkip
}: AvatarUploaderProps) {
    const [imgSrc, setImgSrc] = useState<string>('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('L\'image ne doit pas dépasser 5 Mo')
                return
            }

            // Check file type
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setError('Seuls les formats JPEG, PNG et WebP sont acceptés')
                return
            }

            setError(null)
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '')
            })
            reader.readAsDataURL(file)
        }
    }

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1))
    }, [])

    const getCroppedImg = async (): Promise<Blob | null> => {
        if (!imgRef.current || !completedCrop) return null

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height

        // Set canvas size to 300x300
        canvas.width = 300
        canvas.height = 300

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            300,
            300
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/jpeg', 0.9)
        })
    }

    const handleUpload = async () => {
        setIsUploading(true)
        setError(null)

        try {
            const blob = await getCroppedImg()
            if (!blob) {
                throw new Error('Impossible de traiter l\'image')
            }

            const fileName = `${userId}-${Date.now()}.jpg`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            onUploadComplete(publicUrl)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Une erreur est survenue lors du téléchargement')
        } finally {
            setIsUploading(false)
        }
    }

    const triggerFileSelect = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="avatar-uploader">
            <style jsx>{`
        .avatar-uploader {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .current-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          overflow: hidden;
          border: 3px solid var(--border-light);
        }

        .current-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .current-avatar i {
          font-size: 48px;
          color: var(--text-tertiary);
        }

        .upload-btn {
          padding: 12px 24px;
          background: var(--bg-secondary);
          border: 2px dashed var(--border-light);
          border-radius: 12px;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upload-btn:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
        }

        .hidden {
          display: none;
        }

        .crop-container {
          width: 100%;
          max-width: 300px;
          margin-bottom: 16px;
          border-radius: 16px;
          overflow: hidden;
        }

        .crop-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          margin-top: 16px;
        }

        .btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-cancel {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .btn-confirm {
          background: var(--accent-gold);
          color: white;
        }

        .btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 8px;
          text-align: center;
        }

        .skip-text {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-top: 16px;
          cursor: pointer;
        }

        .skip-text:hover {
          color: var(--text-secondary);
        }
      `}</style>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onSelectFile}
                className="hidden"
            />

            {!imgSrc ? (
                <>
                    <div className="current-avatar">
                        {currentAvatarUrl ? (
                            <img src={currentAvatarUrl} alt="Avatar" />
                        ) : (
                            <i className="fa-solid fa-user" />
                        )}
                    </div>
                    <button className="upload-btn" onClick={triggerFileSelect}>
                        <i className="fa-solid fa-camera" />
                        Choisir une photo
                    </button>
                    {onSkip && (
                        <p className="skip-text" onClick={onSkip}>
                            Passer cette étape
                        </p>
                    )}
                </>
            ) : (
                <>
                    <div className="crop-container">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <img
                                ref={imgRef}
                                alt="Crop preview"
                                src={imgSrc}
                                onLoad={onImageLoad}
                                style={{ maxWidth: '100%' }}
                            />
                        </ReactCrop>
                    </div>
                    <div className="crop-actions">
                        <button className="btn btn-cancel" onClick={() => setImgSrc('')}>
                            Annuler
                        </button>
                        <button
                            className="btn btn-confirm"
                            onClick={handleUpload}
                            disabled={!completedCrop || isUploading}
                        >
                            {isUploading ? 'Envoi...' : 'Confirmer'}
                        </button>
                    </div>
                </>
            )}

            {error && <p className="error">{error}</p>}
        </div>
    )
}
