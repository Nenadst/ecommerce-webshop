interface ChevronRightIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const ChevronRightIcon = ({ width = 24, height = 24, className = '' }: ChevronRightIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8.95001 4.08001L15.47 10.6C16.24 11.37 16.24 12.63 15.47 13.4L8.95001 19.92"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronRightIcon;
