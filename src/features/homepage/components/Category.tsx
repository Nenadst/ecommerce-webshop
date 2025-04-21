import { Card } from '@/shared/components/elements/Card';
import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/components/icons';
import Link from 'next/link';
import React from 'react';

const Category = () => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-wrap pt-10 justify-center items-center">
        <div className="gap-8 flex">
          <Link href="/products">
            <Card className="w-96 h-36 justify-center items-center gap-11 relative cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110 flex m-auto">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex cursor-pointer absolute -left-5 hover:bg-amber-400">
                <div className=" m-auto">
                  <div className="w-6 h-6">
                    <ArrowLeftIcon />
                  </div>
                </div>
              </div>
              <img className="rounded-lg" src="/assets/img/2-1.png" alt="" />
              <div className="flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="text-cyan-800 text-2xl font-semibold">Speaker</div>
                <div className="6Items text-cyan-800 text-lg font-medium">(6 items)</div>
              </div>
            </Card>
          </Link>
          <Link href="/products">
            <Card className="w-96 h-36 justify-center items-center gap-11 cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110 flex m-auto">
              <img className="w-32 h-28 rounded-lg" src="/assets/img/5-1.png" alt="" />
              <div className="flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="text-cyan-800 text-xl font-semibold">Desktop & laptop</div>
                <div className="text-cyan-800 text-lg font-medium">(6 items)</div>
              </div>
            </Card>
          </Link>
          <Link href="/products">
            <Card className="w-96 h-36 justify-center items-center gap-11 relative cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110 flex m-auto">
              <img className="w-28 h-28 rounded-lg" src="/assets/img/8-1.png" alt="" />
              <div className="flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="text-cyan-800 text-2xl font-semibold">DSLR camera</div>
                <div className="text-cyan-800 text-lg font-medium">(6 items)</div>
              </div>
              <div className="w-9 h-9 bg-gray-200 rounded-full flex cursor-pointer absolute -right-5 hover:bg-amber-400">
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
