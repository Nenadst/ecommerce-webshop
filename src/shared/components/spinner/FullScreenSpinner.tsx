import Spinner from './Spinner';

export default function FullScreenSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Spinner size={48} />
    </div>
  );
}
