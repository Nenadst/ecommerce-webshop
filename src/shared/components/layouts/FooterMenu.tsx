import React from 'react';
import Image from 'next/image';
import { ChatIcon, FacebookIcon, GoogleIcon } from '../icons';

const FooterMenu = () => {
  return (
    <div className="container mx-auto">
      <div className="flex p-16">
        <div className="w-full h-full justify-center items-center lg:justify-start lg:items-start gap-10 flex m-auto">
          <div className="flex-col justify-center items-center lg:justify-start lg:items-start gap-9 flex">
            <div className="flex-col gap-10 flex lg:justify-start lg:items-start">
              <Image
                src="/assets/img/logo-footer.png"
                alt="WebShop Footer Logo"
                width={144}
                height={40}
                className=""
              />
              <div className="text-cyan-800 text-base font-normal">
                64 st james boulevard
                <br />
                hoswick , ze2 7zj
              </div>
            </div>
            <div className="flex-col gap-6 justify-center items-center flex lg:justify-start lg:items-start">
              <div className="w-64 h-px -rotate-180 border border-neutral-400"></div>
              <div className="justify-center items-center gap-9 flex">
                <div className="w-6 h-6 justify-center items-center flex">
                  <a href="#" className="w-6 h-6 relative">
                    <GoogleIcon />
                  </a>
                </div>
                <div className="w-6 h-6 justify-center items-center flex">
                  <a href="#" className="w-6 h-6 relative">
                    <FacebookIcon />
                  </a>
                </div>
                <div className="w-6 h-6 justify-center items-center flex">
                  <a href="#" className="w-6 h-6 relative">
                    <ChatIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full justify-center items-center gap-10 lg:gap-32 hidden lg:flex">
            <div className="flex-col justify-center items-start gap-3 inline-flex">
              <div className="text-cyan-800 text-lg font-semibold">Find product</div>
              <div className="flex-col justify-center items-start gap-3.5 flex">
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Brownze arnold
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Chronograph blue
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Smart phones
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Automatic watch
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Hair straighteners
                  </a>
                </div>
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-3 inline-flex">
              <div className="text-cyan-800 text-lg font-semibold">Get help</div>
              <div className="flex-col justify-center items-start gap-3.5 flex">
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    About us
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Contact us
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Return policy
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Privacy policy
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Payment policy
                  </a>
                </div>
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-3 inline-flex">
              <div className="text-cyan-800 text-lg font-semibold">About us</div>
              <div className="flex-col justify-center items-start gap-3.5 flex">
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    News
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Service
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Our policy
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Custmer care
                  </a>
                </div>
                <div className="justify-center items-center gap-3 inline-flex">
                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
                  <a href="#" className="text-cyan-800 text-lg font-normal">
                    Faq’s
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterMenu;
