import InputField from '@/shared/components/elements/InputField';
import React from 'react';
import { HeadphonesIcon, MessageSendIcon } from '../icons';

const Newsletter = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex pt-6 md:pt-10 pb-4">
        <div className="w-full lg:w-[90%] min-h-36 bg-white rounded-2xl justify-center items-center gap-4 md:gap-6 lg:gap-32 flex flex-col md:flex-row m-auto p-4 md:p-6">
          <div className="text-cyan-800 text-lg md:text-xl lg:text-2xl font-bold text-center md:text-left">
            Subscribe newsletter
          </div>
          <div className="justify-center items-center gap-4 md:gap-8 lg:gap-20 flex flex-col sm:flex-row w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <InputField
                type="text"
                className="w-full sm:w-72 md:w-80 lg:w-96 h-12 md:h-14 pl-4 md:pl-6 pr-12 md:pr-16 bg-amber-500 rounded-2xl p-4 md:p-5 flex text-white placeholder:text-white focus:outline-none focus:border-white text-sm md:text-base"
                placeholder="Email address"
              />
              <MessageSendIcon />
            </div>
            <div className="justify-center items-center gap-3 md:gap-5 flex">
              <div className="w-9 h-9 md:w-11 md:h-11 justify-center items-center flex flex-shrink-0">
                <div className="w-9 h-9 md:w-11 md:h-11 relative">
                  <HeadphonesIcon />
                </div>
              </div>
              <div className="text-zinc-600 text-xs md:text-sm font-semibold text-center sm:text-left">
                Call us 24/7 :<br />
                (+62) 0123 567 789
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
