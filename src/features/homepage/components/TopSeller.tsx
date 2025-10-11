import Button from '@/shared/components/elements/Button';
import { Card } from '@/shared/components/elements/Card';
import DotSlide from '@/shared/components/elements/DotSlide';
import Star from '@/shared/components/elements/Star';
import { EyeIcon, ShoppingCartIcon } from '@/shared/components/icons';
import React from 'react';

const TopSeller = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-5 mb-5">
        <Card className="w-full lg:w-[830px] min-h-[500px] justify-center items-center gap-6 md:gap-10 flex flex-col md:flex-row relative p-4 md:p-6">
          <img className="p-3 rounded-2xl max-w-[250px] md:max-w-[350px]" src="/assets/img/jbl-bar.png" alt="JBL bar" />
          <div className="justify-center items-center flex absolute bottom-4 md:bottom-10">
            <DotSlide count={1} />
          </div>
          <div className="flex-col justify-center items-center md:items-start gap-6 md:gap-9 inline-flex">
            <div className="flex-col justify-center items-center md:items-start gap-3 md:gap-4 flex">
              <div className="text-sky-900 text-lg md:text-xl font-semibold text-center md:text-left">
                JBL bar 2.1 deep bass
              </div>
              <div className="text-neutral-600 text-base md:text-lg font-semibold">$11,70</div>
              <Star count={5} />
            </div>
            <div className="justify-center items-center gap-2 md:gap-3 flex flex-wrap">
              <button className="w-16 h-16 md:w-20 md:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-xl md:text-2xl font-bold">57</div>
              </button>
              <button className="w-16 h-16 md:w-20 md:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-xl md:text-2xl font-bold">11</div>
              </button>
              <button className="w-16 h-16 md:w-20 md:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-xl md:text-2xl font-bold">33</div>
              </button>
              <button className="w-16 h-16 md:w-20 md:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-xl md:text-2xl font-bold">59</div>
              </button>
            </div>
            <div className="justify-center items-center gap-3 md:gap-5 flex">
              <Button className="w-44 md:w-56 h-12 md:h-14 pl-4 md:pl-6 pr-2 justify-between flex items-center bg-blue-300 hover:bg-blue-400 text-slate-800 text-sm md:text-base font-semibold">
                <span>Add to cart</span>
                <div className="w-7 h-7 md:w-8 md:h-8 bg-amber-500 rounded-full justify-center items-center flex">
                  <ShoppingCartIcon />
                </div>
              </Button>
              <Button className="w-12 md:w-16 h-12 md:h-14 bg-blue-300 justify-center flex items-center hover:bg-blue-400">
                <EyeIcon />
              </Button>
            </div>
          </div>
        </Card>
        <div className="flex flex-col gap-5 w-full lg:w-auto">
          <div className="w-full lg:w-[500px] min-h-[200px] md:h-60 rounded-2xl border border-zinc-400 flex-col justify-center items-center gap-4 inline-flex cursor-pointer hover:bg-slate-100 p-4">
            <div className="flex flex-col sm:flex-row justify-start items-center gap-6 md:gap-12 w-full">
              <img
                className="w-full sm:w-48 md:w-72 h-auto max-h-44 p-2 relative rounded-2xl object-cover"
                src="https://source.unsplash.com/288x176?gaming"
                alt="Gaming"
              />
              <div className="flex-col justify-center items-center sm:items-start gap-3 md:gap-4 inline-flex">
                <div className="text-sky-900 text-base md:text-lg font-medium">Play game</div>
                <div className="text-neutral-600 text-base md:text-lg font-semibold">$11,70</div>
                <Star count={5} />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[500px] min-h-[200px] md:h-60 rounded-2xl border border-zinc-400 flex-col justify-center items-center gap-4 inline-flex cursor-pointer hover:bg-slate-100 p-4">
            <div className="flex flex-col sm:flex-row justify-start items-center gap-6 md:gap-12 w-full">
              <img
                className="w-full sm:w-48 md:w-72 h-auto max-h-44 p-2 relative rounded-2xl object-cover"
                src="https://source.unsplash.com/288x176?laptop"
                alt="Laptop"
              />
              <div className="flex-col justify-center items-center sm:items-start gap-3 md:gap-4 inline-flex">
                <div className="text-sky-900 text-base md:text-lg font-medium">Play game</div>
                <div className="text-neutral-600 text-base md:text-lg font-semibold">$11,70</div>
                <Star count={5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSeller;
