import { BestQualityIcon, FreeDeliveryIcon, WarrantyIcon } from '@/components/icons';
import React from 'react';

const Features = () => {
  return (
    <div className="container mx-auto">
      <div className="flex p-10">
        <div className="w-[93%] h-40 bg-sky-100 rounded-2xl justify-center items-center gap-24 flex m-auto">
          <div className="justify-start items-center gap-8 flex">
            <div className="w-16 h-16 justify-center items-center flex">
              <div className="w-16 h-16 relative">
                <div className="w-12 h-12 left-[5.58px] top-[5.67px] absolute">
                  <FreeDeliveryIcon />
                </div>
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-1.5 inline-flex">
              <div className="text-sky-900 text-2xl font-semibold">Free delivery</div>
              <div className="text-sky-900 text-lg font-normal">on order above $50,00</div>
            </div>
          </div>
          <div className="justify-start items-center gap-8 flex">
            <div className="w-16 h-16 justify-center items-center flex">
              <div className="w-16 h-16 relative">
                <BestQualityIcon />
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-1.5 inline-flex">
              <div className="text-sky-900 text-2xl font-semibold">Best quality </div>
              <div className="text-sky-900 text-lg font-normal">best quality in low price</div>
            </div>
          </div>
          <div className="justify-start items-center gap-8 flex">
            <div className="w-16 h-16 justify-center items-center flex">
              <div className="w-16 h-16 relative">
                <WarrantyIcon />
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-1.5 inline-flex">
              <div className="text-sky-900 text-2xl font-semibold">1 year warranty</div>
              <div className="text-sky-900 text-lg font-normal">Avaliable warranty</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
