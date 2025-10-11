import React from 'react';
import { TESTIMONI } from '@/data/testimoni';
import { Card } from '@/shared/components/elements/Card';
import DotSlide from '@/shared/components/elements/DotSlide';

const Testimoni = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="w-full min-h-60 justify-center items-stretch gap-4 md:gap-5 flex flex-col md:flex-row mb-5">
        {TESTIMONI.map((testimoni, index) => (
          <Card
            key={index}
            className="w-full md:w-[440px] min-h-60 flex-col justify-center items-start flex hover:bg-slate-100 cursor-pointer p-4"
          >
            <div className="justify-center md:justify-start items-center gap-6 md:gap-9 flex w-full mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 relative">
                <div className="w-20 h-20 md:w-24 md:h-24 left-0 top-0 absolute rounded-full border-2 border-amber-500">
                  <img
                    className="w-16 h-16 md:w-20 md:h-20 left-[4px] top-[4px] md:left-[6.54px] md:top-[6.54px] absolute rounded-full object-cover"
                    src={testimoni.image}
                    alt={testimoni.name}
                  />
                </div>
              </div>
              <div className="flex-1 text-sky-900 text-sm md:text-base font-medium">
                {testimoni.name}
              </div>
            </div>
            <div className="w-full min-h-20 bg-sky-100 rounded-2xl justify-center items-center flex">
              <div className="w-full p-3 md:p-4 text-sky-900 text-xs md:text-sm font-normal">
                {testimoni.description}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <DotSlide className="p-5 m-auto" count={4} />
    </div>
  );
};

export default Testimoni;
