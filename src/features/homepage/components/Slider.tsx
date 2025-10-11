'use client';

import Button from '@/shared/components/elements/Button';
import Link from 'next/link';
import React from 'react';

const Slider = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="relative bg-slate-50 rounded-lg overflow-hidden min-h-[300px] md:min-h-[420px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 p-6 md:p-10">
          {/* Content Section */}
          <div className="flex-1 text-center md:text-left z-10">
            <div className="text-cyan-800 text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Canon
              <br />
              camera
            </div>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-3 md:gap-5 mb-4">
              <Link href="/products">
                <Button
                  type="button"
                  className="w-32 h-14 bg-amber-500 justify-center text-white text-base font-semibold hover:bg-amber-600"
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  type="button"
                  className="w-32 h-14 rounded-2xl border border-cyan-800 text-cyan-800 text-base font-semibold hover:bg-slate-200"
                >
                  View more
                </Button>
              </Link>
            </div>
            {/* Slider Dots */}
            <div className="flex justify-center md:justify-start items-center gap-2 mt-6">
              <div className="w-4 h-4 bg-amber-500 cursor-pointer rounded-full" />
              <div className="w-4 h-4 hover:bg-amber-500 cursor-pointer rounded-full border border-zinc-400" />
              <div className="w-4 h-4 hover:bg-amber-500 cursor-pointer rounded-full border border-zinc-400" />
            </div>
          </div>

          {/* Image Section */}
          <div className="flex-1 relative flex items-center justify-center">
            <img
              className="w-full max-w-[250px] md:max-w-[350px] lg:max-w-[450px] rounded-lg"
              src="/assets/img/8-1.png"
              alt="Canon camera"
            />
            {/* Price Badge */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 w-20 h-20 md:w-28 md:h-28 bg-amber-500 rounded-full flex justify-center items-center">
              <div className="text-white text-base md:text-xl font-semibold text-center">
                only
                <br />
                $89
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
