import React from 'react';
import { LocationIcon, TruckDeliveryIcon } from '../icons';

const HeaderTop = () => {
  return (
    <div className="justify-between h-12 m-auto mr-16 ml-16 hidden lg:flex md:flex">
      <div className="flex justify-center items-center">
        <div className="text-slate-600 text-sm hover:text-blue-600 cursor-pointer">
          Need help? Call us: (+98) 0234 456 789
        </div>
      </div>
      <div className="justify-center items-center gap-5 flex">
        <div className="w-32 h-10 rounded-lg justify-center items-center gap-3 flex hover:bg-slate-300 cursor-pointer">
          <div className="justify-center items-center flex">
            <LocationIcon />
          </div>
          <div className="text-slate-600 text-sm font-normal">Our store</div>
        </div>
        <div className="justify-center items-center gap-3 flex">
          <div className="w-44 h-10 rounded-lg justify-center items-center gap-3 flex hover:bg-slate-300 cursor-pointer">
            <div className="justify-center items-center flex">
              <TruckDeliveryIcon />
            </div>
            <div className="text-slate-600 text-sm font-normal">Track your order</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
