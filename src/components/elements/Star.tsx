import React from 'react';
import { StarIcon } from '../icons';

interface StarProps {
  count: number;
}

const Star = (props: StarProps) => {
  const stars = Array.from({ length: props.count }, (_, index) => index);

  return (
    <div className="w-28 h-3.5 gap-2.5 inline-flex">
      {stars.map((starIndex) => (
        <StarIcon key={starIndex} />
      ))}
    </div>
  );
};

export default Star;
