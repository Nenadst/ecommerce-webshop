import Button from '@/components/elements/Button';
import { Card } from '@/components/elements/Card';
import DotSlide from '@/components/elements/DotSlide';
import Star from '@/components/elements/Star';
import { EyeIcon, ShoppingCartIcon } from '@/components/icons';
import React from 'react';

const TopSeller = () => {
  return (
    <div className="container mx-auto">
      <div className="flex justify-center items-center gap-5 mb-5">
        <Card className="w-[830px] h-[500px] justify-center items-center gap-10 flex relative">
          <img className="p-3 rounded-2xl" src="/assets/img/jbl-bar.png" />
          <div className="justify-center items-center flex absolute bottom-10">
            <DotSlide count={1} />
          </div>
          <div className="flex-col justify-center items-start gap-9 inline-flex">
            <div className="flex-col justify-center items-start gap-4 flex">
              <div className="text-sky-900 text-xl font-semibold">JBL bar 2.1 deep bass</div>
              <div className="text-neutral-600 text-lg font-semibold">$11,70</div>
              <Star count={5} />
            </div>
            <div className="justify-center items-center gap-3 flex">
              <button className="w-20 h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-2xl font-bold">57</div>
              </button>
              <button className="w-20 h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-2xl font-bold">11</div>
              </button>
              <button className="w-20 h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-2xl font-bold">33</div>
              </button>
              <button className="w-20 h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                <div className="text-amber-500 text-2xl font-bold">59</div>
              </button>
            </div>
            <div className="justify-center items-center gap-5 inline-flex">
              <Button className="w-56 h-14 pl-6 justify-between flex items-center bg-blue-300 hover:bg-blue-400 text-slate-800 text-base font-semibold">
                Add to cart
                <div className="w-8 h-8 bg-amber-500 rounded-full justify-center items-center flex mr-4">
                  <ShoppingCartIcon />
                </div>
              </Button>
              <Button className="w-16 h-14 bg-blue-300 justify-center flex items-center hover:bg-blue-400">
                <EyeIcon />
              </Button>
            </div>
          </div>
        </Card>
        <div className="flex flex-col">
          <div className="w-[500px] h-60 rounded-2xl border border-zinc-400 flex-col justify-center items-center gap-4 inline-flex mb-5 cursor-pointer hover:bg-slate-100">
            <div className="justify-start items-center gap-12 inline-flex">
              <img
                className="w-72 h-44 p-2 relative rounded-2xl"
                src="https://source.unsplash.com/288x176?gaming"
              />
              <div className="flex-col justify-center items-start gap-4 inline-flex">
                <div className="text-sky-900 text-lg font-medium">Play game</div>
                <div className="text-neutral-600 text-lg font-semibold">$11,70</div>
                <Star count={5} />
              </div>
            </div>
          </div>
          <div className="w-[500px] h-60 rounded-2xl border border-zinc-400 flex-col justify-center items-center gap-4 inline-flex cursor-pointer hover:bg-slate-100">
            <div className="justify-start items-center gap-12 inline-flex">
              <img
                className="w-72 h-44 p-2 relative rounded-2xl"
                src="https://source.unsplash.com/288x176?laptop"
              />
              <div className="flex-col justify-center items-start gap-4 inline-flex">
                <div className="text-sky-900 text-lg font-medium">Play game</div>
                <div className="text-neutral-600 text-lg font-semibold">$11,70</div>
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
