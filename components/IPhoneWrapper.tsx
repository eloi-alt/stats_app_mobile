'use client'

import React from 'react'

export default function IPhoneWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="iphone-wrapper-container flex items-center justify-center min-h-screen box-border">
            <div id="iphone-frame">
                {/* Dynamic Island */}
                <div id="dynamic-island"></div>

                {/* Home Indicator */}
                <div id="home-indicator"></div>

                {/* App Screen */}
                <div id="app-screen">
                    {children}
                </div>
            </div>

            <style jsx global>{`
        /* Desktop Wrapper Styling */
        .iphone-wrapper-container {
            background: transparent; /* Transparent to show LiquidBackground */
            transition: all 0.3s ease;
            width: 100vw;
            height: 100vh;
        }

        /* iPhone 15 Pro Mockup */
        #iphone-frame {
            position: relative;
            width: 393px;
            height: 852px;
            background: #000;
            border-radius: 55px;
            border: 12px solid #0d0d0d;
            box-shadow:
                0 0 0 2px #3a3a3a,
                0 0 0 4px #242424,
                0 40px 100px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            box-sizing: border-box;
            transform-origin: center center;
            pointer-events: auto;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            /* Create containing block for fixed positioned children */
            transform: translateZ(0);
        }

        /* Dynamic Island */
        #dynamic-island {
            position: absolute;
            top: 11px;
            left: 50%;
            transform: translateX(-50%);
            width: 125px;
            height: 37px;
            background: #000;
            border-radius: 20px;
            z-index: 10000;
            transition: all 0.3s ease;
        }

        /* Home Indicator (Desktop only) */
        #home-indicator {
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 134px;
            height: 5px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
            z-index: 9999;
            pointer-events: none;
        }

        /* Responsive scaling for desktop height */
        @media (min-width: 601px) and (max-height: 950px) {
            #iphone-frame { transform: scale(0.9); }
        }
        @media (min-width: 601px) and (max-height: 850px) {
            #iphone-frame { transform: scale(0.85); }
        }
        @media (min-width: 601px) and (max-height: 750px) {
            #iphone-frame { transform: scale(0.75); }
        }

        /* Mobile View: Fullscreen Native Experience */
        @media (max-width: 600px) {
            .iphone-wrapper-container {
                padding: 0 !important;
                background: var(--bg-primary) !important;
            }
            #iphone-frame {
                width: 100vw !important;
                height: 100vh !important;
                border-radius: 0 !important;
                border: none !important;
                box-shadow: none !important;
                transform: none !important;
                position: fixed !important;
                inset: 0 !important;
            }
            #app-screen {
                border-radius: 0 !important;
            }
            #dynamic-island, #home-indicator {
                display: none !important; /* Managed by native iOS */
            }
        }

        /* App Screen Container */
        #app-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            overflow: hidden;
            border-radius: 43px;
            display: flex;
            flex-direction: column;
            transition: border-radius 0.3s ease;
        }
        
        .app-container {
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
        }

        body {
            overflow: hidden;
            margin: 0;
            padding: 0;
        }
      `}</style>
        </div>
    )
}
