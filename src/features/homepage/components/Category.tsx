import { Card } from '@/shared/components/elements/Card';
import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/components/icons';
import Link from 'next/link';
import React from 'react';

const Category = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap pt-10 justify-center items-center">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 w-full lg:w-auto">
          <Link href="/products" className="w-full lg:w-auto">
            <Card className="w-full lg:w-96 h-36 justify-center items-center gap-6 md:gap-11 relative cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-105 flex">
              <div className="hidden lg:flex w-9 h-9 bg-gray-200 rounded-full cursor-pointer absolute -left-5 hover:bg-amber-400">
                <div className="m-auto">
                  <div className="w-6 h-6">
                    <ArrowLeftIcon />
                  </div>
                </div>
              </div>
              <img className="rounded-lg w-24 md:w-28" src="/assets/img/2-1.png" alt="Speaker" />
              <div className="flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="text-cyan-800 text-xl md:text-2xl font-semibold">Speaker</div>
                <div className="text-cyan-800 text-base md:text-lg font-medium">(6 items)</div>
              </div>
            </Card>
          </Link>
          <Link href="/products" className="w-full lg:w-auto">
            <Card className="w-full lg:w-96 h-36 justify-center items-center gap-6 md:gap-11 cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-105 flex">
              <img className="w-24 md:w-32 h-24 md:h-28 rounded-lg" src="/assets/img/5-1.png" alt="Desktop & laptop" />
              <div className="flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="text-cyan-800 text-lg md:text-xl font-semibold">Desktop & laptop</div>
                <div className="text-cyan-800 text-base md:text-lg font-medium">(6 items)</div>
              </div>
            </Card>
          </Link>
          <Link href="/products" className="w-full lg:w-auto">
            <Card className="w-full lg:w-96 h-36 justify-center items-center gap-6 md:gap-11 relative cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-105 flex">
              <img className="w-24 md:w-28 h-24 md:h-28 rounded-lg" src="/assets/img/8-1.png" alt="DSLR camera" />
              <div className="flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="text-cyan-800 text-xl md:text-2xl font-semibold">DSLR camera</div>
                <div className="text-cyan-800 text-base md:text-lg font-medium">(6 items)</div>
              </div>
              <div className="hidden lg:flex w-9 h-9 bg-gray-200 rounded-full cursor-pointer absolute -right-5 hover:bg-amber-400">
                <div className="m-auto">
                  <div className="w-6 h-6">
                    <ArrowRightIcon />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Category;
