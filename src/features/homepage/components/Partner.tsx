import React from 'react';
import { PARTNERS } from '@/data/partners';

const Partner = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex p-4 md:p-7">
        <div className="flex flex-wrap w-full lg:w-[93%] min-h-32 bg-sky-100 justify-center items-center gap-6 md:gap-10 lg:gap-14 rounded-2xl m-auto p-6 md:p-8">
          {PARTNERS.map((partner, index) => (
            <div
              key={index}
              className="transition ease-in-out hover:-translate-y-1 hover:scale-110"
            >
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer rounded-lg"
              >
                <img
                  className="rounded-xl p-2 max-w-[80px] md:max-w-[100px] lg:max-w-none h-auto"
                  src={partner.logo}
                  alt={`Partner ${index + 1}`}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partner;
