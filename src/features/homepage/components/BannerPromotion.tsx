import Button from '@/shared/components/elements/Button';
import React from 'react';

const BannerPromotion = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center m-4 md:m-10 relative">
        <div className="relative w-full rounded-lg overflow-hidden">
          <img
            className="w-full h-[250px] sm:h-[350px] md:h-[417px] object-cover rounded-lg"
            src="/assets/img/pexels-nao-triponez-129208-1.png"
            alt="Laptop promotion"
          />
          {/* Dark overlay for better text visibility on mobile */}
          <div className="absolute inset-0 bg-black/20 md:bg-transparent rounded-lg" />

          {/* Content Container */}
          <div className="absolute inset-0 flex flex-col items-center md:items-end justify-center md:justify-between p-6 md:p-10">
            <Button className="w-28 md:w-32 h-10 md:h-11 bg-amber-500 justify-center items-center flex text-white text-xs md:text-sm font-medium hover:bg-amber-600 mb-4 md:mb-0 md:mr-20 md:mt-8">
              New laptop
            </Button>

            <div className="flex flex-col justify-center items-center gap-2 md:gap-3 text-center md:mr-32">
              <div className="text-cyan-600 text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg">
                Sale up to 50% off
              </div>
              <div className="text-white text-base md:text-lg font-medium drop-shadow-lg">
                12 inch hd display
              </div>
            </div>

            <Button className="w-28 md:w-32 h-10 md:h-11 bg-amber-500 justify-center items-center flex text-white text-xs md:text-sm font-medium hover:bg-amber-600 mt-4 md:mt-0 md:mr-20 md:mb-8">
              Shop now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerPromotion;
