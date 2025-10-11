import { BestQualityIcon, FreeDeliveryIcon, WarrantyIcon } from '@/shared/components/icons';
import React from 'react';

const Features = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex p-4 md:p-10">
        <div className="w-full lg:w-[93%] min-h-40 bg-sky-100 rounded-2xl justify-center items-center gap-6 md:gap-12 lg:gap-24 flex flex-col md:flex-row m-auto p-6 md:p-8">
          <div className="justify-start items-center gap-4 md:gap-8 flex w-full md:w-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 justify-center items-center flex">
              <div className="w-12 h-12 md:w-16 md:h-16 relative">
                <div className="w-10 h-10 md:w-12 md:h-12 left-[2px] top-[2px] md:left-[5.58px] md:top-[5.67px] absolute">
                  <FreeDeliveryIcon />
                </div>
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-1 md:gap-1.5 inline-flex">
              <div className="text-sky-900 text-lg md:text-xl lg:text-2xl font-semibold">
                Free delivery
              </div>
              <div className="text-sky-900 text-sm md:text-base lg:text-lg font-normal">
                on order above $50,00
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-4 md:gap-8 flex w-full md:w-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 justify-center items-center flex">
              <div className="w-12 h-12 md:w-16 md:h-16 relative">
                <BestQualityIcon />
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-1 md:gap-1.5 inline-flex">
              <div className="text-sky-900 text-lg md:text-xl lg:text-2xl font-semibold">
                Best quality{' '}
              </div>
              <div className="text-sky-900 text-sm md:text-base lg:text-lg font-normal">
                best quality in low price
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-4 md:gap-8 flex w-full md:w-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 justify-center items-center flex">
              <div className="w-12 h-12 md:w-16 md:h-16 relative">
                <WarrantyIcon />
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-1 md:gap-1.5 inline-flex">
              <div className="text-sky-900 text-lg md:text-xl lg:text-2xl font-semibold">
                1 year warranty
              </div>
              <div className="text-sky-900 text-sm md:text-base lg:text-lg font-normal">
                Avaliable warranty
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
