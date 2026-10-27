"use client";

import * as React from "react";

export function EcoRecycleGraphic({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-[540px] aspect-square select-none ${className}`}>
      {/* Outer ambient glow */}
      <div className="absolute inset-4 rounded-full bg-emerald-200/40 blur-3xl -z-10 animate-pulse" />

      {/* Main SVG Vector Artwork */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="circleBgGrad" x1="120" y1="80" x2="480" y2="520" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5FAF6" />
            <stop offset="0.5" stopColor="#E2F2E7" />
            <stop offset="1" stopColor="#CDE7D7" />
          </linearGradient>

          <linearGradient id="arrowGreenGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#256B52" />
            <stop offset="1" stopColor="#1B4D3B" />
          </linearGradient>

          <linearGradient id="arrowGreenGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#2F8565" />
            <stop offset="1" stopColor="#1E5C45" />
          </linearGradient>

          <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#34D399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="skinTone1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#9C5A3C" />
            <stop offset="1" stopColor="#7E452B" />
          </linearGradient>

          <linearGradient id="skinTone2" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FBD5B5" />
            <stop offset="1" stopColor="#E6B48F" />
          </linearGradient>

          <linearGradient id="cardboardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F5E6CA" />
            <stop offset="1" stopColor="#D9BF97" />
          </linearGradient>

          <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1B4D3B" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Central Circular Background with Inner Border */}
        <circle cx="300" cy="300" r="225" fill="url(#circleBgGrad)" stroke="#1B4D3B" strokeWidth="5" />
        <circle cx="300" cy="300" r="215" fill="none" stroke="#256B52" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />

        {/* Background Foliage / Plant Leaves */}
        <g opacity="0.95">
          {/* Big monstera leaf left */}
          <path
            d="M 180 280 C 140 220, 200 160, 260 170 C 270 210, 240 260, 180 280 Z"
            fill="url(#leafGrad)"
            stroke="#1B4D3B"
            strokeWidth="3"
          />
          <path d="M 210 230 Q 235 210 255 175" stroke="#1B4D3B" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Leaves right */}
          <path
            d="M 400 240 C 460 200, 440 140, 370 160 C 350 200, 370 240, 400 240 Z"
            fill="url(#leafGrad)"
            stroke="#1B4D3B"
            strokeWidth="3"
          />
          <path d="M 390 200 Q 380 180 375 165" stroke="#1B4D3B" strokeWidth="2.5" strokeLinecap="round" />

          {/* Tropical leaf center top */}
          <path
            d="M 300 130 C 270 170, 330 170, 300 130 Z"
            fill="#10B981"
            stroke="#1B4D3B"
            strokeWidth="2"
          />
        </g>

        {/* ================= CHARACTERS ================= */}

        {/* Character 1 (Left - Friendly Young Citizen) */}
        <g id="citizen">
          {/* Body / Terracotta Dress */}
          <path
            d="M 180 500 C 170 410, 200 340, 255 330 C 275 350, 280 430, 280 500 Z"
            fill="#D95C3E"
            stroke="#1B4D3B"
            strokeWidth="4"
          />
          
          {/* Citizen Arm / Hand Waving */}
          <path
            d="M 195 365 C 160 350, 150 290, 160 270 C 170 260, 185 275, 195 305"
            fill="url(#skinTone1)"
            stroke="#1B4D3B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Waving fingers */}
          <circle cx="160" cy="265" r="7" fill="url(#skinTone1)" stroke="#1B4D3B" strokeWidth="2.5" />
          <circle cx="168" cy="260" r="6" fill="url(#skinTone1)" stroke="#1B4D3B" strokeWidth="2.5" />
          <circle cx="177" cy="263" r="5" fill="url(#skinTone1)" stroke="#1B4D3B" strokeWidth="2.5" />

          {/* Neck */}
          <path d="M 230 330 L 230 295 L 255 295 L 255 330 Z" fill="url(#skinTone1)" stroke="#1B4D3B" strokeWidth="3" />

          {/* Head & Face */}
          <ellipse cx="242" cy="265" rx="36" ry="42" fill="url(#skinTone1)" stroke="#1B4D3B" strokeWidth="4" />
          
          {/* Curly voluminous Hair */}
          <path
            d="M 195 260 C 185 210, 220 175, 270 185 C 295 190, 305 220, 290 260 C 285 240, 270 230, 250 235 C 220 235, 205 245, 195 260 Z"
            fill="#3B1E12"
            stroke="#1B4D3B"
            strokeWidth="4"
          />
          <circle cx="210" cy="210" r="14" fill="#3B1E12" />
          <circle cx="275" cy="205" r="16" fill="#3B1E12" />

          {/* Facial Features */}
          <ellipse cx="230" cy="262" rx="4" ry="5" fill="#1B4D3B" />
          <ellipse cx="260" cy="262" rx="4" ry="5" fill="#1B4D3B" />
          {/* Gentle Smile */}
          <path d="M 235 285 Q 248 296 260 285" stroke="#1B4D3B" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Eyebrows */}
          <path d="M 224 252 Q 232 248 238 252" stroke="#1B4D3B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 252 252 Q 260 248 268 252" stroke="#1B4D3B" strokeWidth="2.5" strokeLinecap="round" />

          {/* Eco Tote Bag held by Citizen */}
          <g transform="translate(190, 370)">
            {/* Bag Strap */}
            <path d="M 40 -15 C 30 -40, 50 -40, 45 -15" stroke="#1B4D3B" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Bag Body */}
            <rect x="15" y="-15" width="60" height="75" rx="10" fill="#FFFFFF" stroke="#1B4D3B" strokeWidth="4" />
            {/* Green Leaf on bag */}
            <path d="M 45 10 C 35 25, 45 40, 52 35 C 55 25, 52 15, 45 10 Z" fill="#256B52" />
            <path d="M 46 15 L 50 32" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        </g>

        {/* Character 2 (Right - Experienced Senior Waste Hero / Collector) */}
        <g id="collector">
          {/* Body / Orange Worker Shirt */}
          <path
            d="M 315 500 C 315 420, 340 330, 430 330 C 470 370, 480 430, 480 500 Z"
            fill="#F28B44"
            stroke="#1B4D3B"
            strokeWidth="4"
          />

          {/* Neck */}
          <path d="M 380 325 L 380 290 L 405 290 L 405 325 Z" fill="url(#skinTone2)" stroke="#1B4D3B" strokeWidth="3" />

          {/* Head & Face */}
          <ellipse cx="395" cy="260" rx="35" ry="40" fill="url(#skinTone2)" stroke="#1B4D3B" strokeWidth="4" />

          {/* White Hair & Beard */}
          <path
            d="M 355 240 C 350 200, 390 180, 430 190 C 455 200, 450 240, 440 250 C 430 220, 410 215, 390 220 C 370 220, 360 230, 355 240 Z"
            fill="#FFFFFF"
            stroke="#1B4D3B"
            strokeWidth="4"
          />
          {/* Ponytail tuft */}
          <circle cx="435" cy="210" r="10" fill="#FFFFFF" stroke="#1B4D3B" strokeWidth="3" />

          {/* Big White Beard */}
          <path
            d="M 365 270 C 365 315, 400 335, 420 315 C 430 300, 430 270, 425 265 C 410 275, 385 275, 365 270 Z"
            fill="#FFFFFF"
            stroke="#1B4D3B"
            strokeWidth="4"
          />

          {/* Eyes (Happy squint) */}
          <path d="M 378 255 Q 385 250 392 255" stroke="#1B4D3B" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 405 255 Q 412 250 419 255" stroke="#1B4D3B" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 390 270 Q 400 275 408 270" stroke="#1B4D3B" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Hand Greeting / Okay sign */}
          <path
            d="M 450 310 C 470 270, 480 230, 465 220 C 455 215, 445 235, 440 260"
            fill="url(#skinTone2)"
            stroke="#1B4D3B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="465" cy="225" r="6" fill="url(#skinTone2)" stroke="#1B4D3B" strokeWidth="2.5" />
          <circle cx="475" cy="230" r="5" fill="url(#skinTone2)" stroke="#1B4D3B" strokeWidth="2.5" />

          {/* Cardboard Box "ECO" Held by Collector */}
          <g transform="translate(340, 320)">
            {/* Box Front */}
            <path
              d="M 15 20 L 75 0 L 105 30 L 45 55 Z"
              fill="#F5E3C0"
              stroke="#1B4D3B"
              strokeWidth="3.5"
            />
            {/* Box Side */}
            <path
              d="M 45 55 L 105 30 L 105 85 L 45 110 Z"
              fill="#DFC69D"
              stroke="#1B4D3B"
              strokeWidth="3.5"
            />
            {/* Box Front Face */}
            <path
              d="M 15 20 L 45 55 L 45 110 L 15 75 Z"
              fill="#EAD0A9"
              stroke="#1B4D3B"
              strokeWidth="3.5"
            />

            {/* Recycle triangle on box */}
            <polygon points="75,45 62,68 88,68" fill="none" stroke="#256B52" strokeWidth="3" strokeLinejoin="round" />
            <text x="65" y="85" fill="#256B52" fontSize="11" fontWeight="900" fontFamily="sans-serif">
              ↑ ECO
            </text>
          </g>
        </g>

        {/* Foreground Eco Tote / Sorting Bag with Recycle Loop (Center Bottom) */}
        <g transform="translate(235, 385)" filter="url(#shadowFilter)">
          {/* Main White Canvas Bag */}
          <path
            d="M 20 20 L 110 20 L 98 120 L 32 120 Z"
            fill="#FFFFFF"
            stroke="#1B4D3B"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Handles */}
          <path
            d="M 45 20 C 45 -5, 85 -5, 85 20"
            stroke="#1B4D3B"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Green Recycling Emblem on Bag */}
          <g transform="translate(65, 70) scale(0.9)">
            <path
              d="M 0 -22 L 6 -12 L -6 -12 Z"
              fill="#10B981"
            />
            <path
              d="M -18 10 L -22 -2 L -12 2 Z"
              fill="#10B981"
            />
            <path
              d="M 18 10 L 12 2 L 22 -2 Z"
              fill="#10B981"
            />
            <circle cx="0" cy="0" r="16" fill="none" stroke="#256B52" strokeWidth="4" strokeDasharray="14 10" />
          </g>
        </g>

        {/* ================= THICK CIRCULAR RECYCLE ARROWS (THE RING) ================= */}
        
        {/* Top-Right to Bottom Arrow Segment */}
        <g id="arrow1" filter="url(#shadowFilter)">
          <path
            d="M 470 180 C 530 260, 525 380, 455 450 L 475 470 L 415 480 L 430 420 L 450 440 C 505 380, 510 280, 455 205 Z"
            fill="url(#arrowGreenGrad1)"
            stroke="#1B4D3B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Bottom-Right to Left Arrow Segment */}
        <g id="arrow2" filter="url(#shadowFilter)">
          <path
            d="M 400 495 C 310 545, 195 520, 130 440 L 115 460 L 110 400 L 170 410 L 150 430 C 205 490, 300 515, 385 475 Z"
            fill="url(#arrowGreenGrad2)"
            stroke="#1B4D3B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Left to Top Arrow Segment */}
        <g id="arrow3" filter="url(#shadowFilter)">
          <path
            d="M 120 370 C 85 270, 130 160, 220 100 L 210 80 L 270 90 L 245 145 L 235 125 C 165 175, 125 265, 150 355 Z"
            fill="url(#arrowGreenGrad1)"
            stroke="#1B4D3B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Floating Verified & Tech Badges */}
       
      </svg>
    </div>
  );
}
