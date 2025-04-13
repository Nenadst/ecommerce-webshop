import InputField from '@/components/elements/InputField';
import React from 'react';
import { HeadphonesIcon, MessageSendIcon } from '../icons';

const Newsletter = () => {
  return (
    <div className="container mx-auto">
      <div className="flex pt-10">
        <div className="w-[90%] h-36 bg-white rounded-2xl justify-center items-center gap-5 lg:gap-32 flex m-auto">
          <div className="text-cyan-800 text-2xl font-bold ml-3">Subscribe newsletter</div>
          <div className="justify-center items-center gap-20 flex mr-3">
            <div className="relative">
              <InputField
                type="text"
                className="w-96 h-14 pl-6 pr-16 bg-amber-500 rounded-2xl justify-between p-5 flex m-auto text-white placeholder:text-white focus:outline-none focus:border-white"
                placeholder="Email address"
              />
              <MessageSendIcon />
            </div>
            <div className="justify-center items-center gap-5 hidden lg:flex">
              <div className="w-11 h-11 justify-center items-center flex">
                <div className="w-11 h-11 relative">
                  <HeadphonesIcon />
                </div>
              </div>
              <div className="text-zinc-600 text-sm font-semibold">
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
