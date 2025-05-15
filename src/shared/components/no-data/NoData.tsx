import { Box } from 'lucide-react';
import React from 'react';

type Props = {
  name: string;
  handleOnClick: () => void;
};

const NoData = ({ name, handleOnClick }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Box size={64} className="text-gray-300 mb-6" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">No products found</h2>
      <p className="text-center text-gray-500 mb-6">
        It looks like you haven’t added any products yet.
      </p>
      <button
        onClick={() => handleOnClick()}
        className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-800"
      >
        + Add your first {name}
      </button>
    </div>
  );
};

export default NoData;
