'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface CountryCardProps {
    countryName: string
    description: string
    flagImage: string // URL de l'image (drapeau ou paysage)
    stats: {
        nights?: number
        category?: string
        rating: number
        reviews: string
    }
    accentColor?: string // Couleur du bouton (ex: 'text-rose-500' ou hex)
    onExplore?: () => void
}

export default function CountryCard({
    countryName,
    description,
    flagImage,
    stats,
    accentColor = '#FF385C', // Couleur par défaut (rose Airbnb/Travel)
    onExplore
}: CountryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-[320px] h-[450px] rounded-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] group cursor-pointer border border-white/10"
        >
            {/* 1. Background Image (Drapeau ou Paysage) */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={flagImage}
                    alt={`Drapeau de ${countryName}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 320px"
                />

                {/* Overlay Gradient Sombre pour la lisibilité du texte */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
            </div>

            {/* 2. Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">

                {/* Titre et Description */}
                <div className="mb-4">
                    <h3 className="text-3xl font-bold mb-2 tracking-tight">{countryName}</h3>
                    <p className="text-white/80 text-sm font-medium leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>

                {/* Tags / Statistiques (Glassmorphism Capsules) */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {stats.nights && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold">
                            <i className="fa-solid fa-moon text-[10px]" />
                            <span>{stats.nights} Nuits</span>
                        </div>
                    )}

                    {stats.category && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold">
                            <i className="fa-solid fa-tag text-[10px]" />
                            <span>{stats.category}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold">
                        <i className="fa-solid fa-star text-yellow-400 text-[10px]" />
                        <span>{stats.rating}</span>
                        <span className="text-white/50 text-[10px]">({stats.reviews})</span>
                    </div>
                </div>

                {/* Zone d'action (Boutons) */}
                <div className="flex items-center justify-between gap-3">

                    {/* Bouton Principal */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExplore?.();
                        }}
                        className="flex-1 bg-white hover:bg-gray-100 text-slate-900 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg"
                    >
                        <span style={{ color: accentColor }}>Explore Details</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-xs" style={{ color: accentColor }} />
                    </button>

                    {/* Bouton Favori (Glass) */}
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-95 group/heart">
                        <i className="fa-regular fa-heart text-white group-hover/heart:text-white/80 transition-colors" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

