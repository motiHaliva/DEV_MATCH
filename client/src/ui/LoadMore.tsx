import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import Button from './Button';
import Loader from './Louder';

interface LoadMoreProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  totalCount: number;
  currentCount: number;
  onLoadMore: () => void;
  loading?: boolean;
}

const LoadMore: React.FC<LoadMoreProps> = ({
  currentPage,
  totalPages,
  hasNext,
  totalCount,
  currentCount,
  onLoadMore,
  loading = false
}) => {

  if (!hasNext || currentPage >= totalPages) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">
          All {totalCount} results have been displayed
        </p>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center'>
    <div className="flex flex-col items-center py-6 space-y-4 w-3/4 ">
      {/* מידע על התוצאות הנוכחיות */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Showing {currentCount} out of {totalCount} results
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-xs">
          <div 
            className="bg-gradient-to-r from-brand-gradientStart to-brand-gradientEnd h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <Button
          text="Load More"
          variant="blue"
          icon={<FiChevronDown className="w-5 h-5" />}
          onClick={onLoadMore}
          disabled={loading}
        />
      )}
      <p className="text-xs text-gray-400">
        Page {currentPage} of {totalPages}
      </p>
    </div>
    </div>
  );
};

export default LoadMore;