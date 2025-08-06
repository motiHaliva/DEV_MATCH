import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import Button from '../Button';
import Filter from './Filter';
import Sort from './Sort';
import type { FreelancerFilters, ProjectFilters } from '../../api/typs'

export type PageType = 'freelancers' | 'projects' | 'posts';

interface FilterSortPopupProps {
  pageType?: PageType;
  currentTab?: 'filter' | 'sort';
  onFiltersChange?: (filters: FreelancerFilters | ProjectFilters) => void;
  onSortChange?: (sortValue: string) => void;
  onClose: () => void;
  isOpen?: boolean;
}

export const FilterSortPopup: React.FC<FilterSortPopupProps> = ({
  pageType = 'freelancers',
  currentTab = 'filter',
  onFiltersChange,
  onClose,
  isOpen = true
}) => {
  const [tab, setTab] = useState<'filter' | 'sort'>(currentTab);
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [freelancerFilters, setFreelancerFilters] = useState<FreelancerFilters>(() => ({
    is_available: '',
    min_experience: '',
    max_experience: '',
    sort: '',
    search: ''
  }));

  const [projectFilters, setProjectFilters] = useState<ProjectFilters>(() => ({
    type: '',
    is_open: '',
    sort: '',
    search: ''
  }));

  const handleFreelancerFilterChange = (key: keyof FreelancerFilters, value: string) => {
    const updated = { ...freelancerFilters, [key]: value };
    setFreelancerFilters(updated);

    if (!isMobile) {
      onFiltersChange?.(updated);
    }
  };

  const handleProjectFilterChange = (key: keyof ProjectFilters, value: string) => {
    const updated = { ...projectFilters, [key]: value };
    setProjectFilters(updated);
    if (!isMobile) {
      onFiltersChange?.(updated);
    }
  };

  const clearFilters = () => {
    if (pageType === 'freelancers') {
      const cleared: FreelancerFilters = {
        is_available: '',
        min_experience: '',
        max_experience: '',
        sort: '',
        search: '',
      };
      setFreelancerFilters(cleared);
      onFiltersChange?.(cleared);
    } else if (pageType === 'projects') {
      const cleared: ProjectFilters = {
        type: '',
        is_open: '',
        sort: '',
        search: '',
      };
      setProjectFilters(cleared);
      onFiltersChange?.(cleared);
    }
  };

  const applyFilters = () => {
    if (pageType === 'freelancers') {
      onFiltersChange?.(freelancerFilters);
    } else if (pageType === 'projects') {
      onFiltersChange?.(projectFilters);
    }
    onClose();
  };

  if (pageType === 'posts') return null;


  const MobilePopup = () => (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 lg:hidden" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            {['filter', 'sort'].map((t) => (
              <Button
                key={t}
                text={t === 'filter' ? 'Filter' : 'Sort'}
                variant={tab === t ? 'blue' : 'text'}
                onClick={() => setTab(t as 'filter' | 'sort')}
                className="px-2 py-1"
              />
            ))}
          </div>
          <Button
            variant="icon"
            onClick={onClose}
            icon={<MdClose size={20} />}
            className="text-gray-500 hover:text-gray-700"
          />
        </div>

        <Filter
          pageType={pageType}
          tab={tab}
          freelancerFilters={freelancerFilters}
          projectFilters={projectFilters}
          handleFreelancerFilterChange={handleFreelancerFilterChange}
          handleProjectFilterChange={handleProjectFilterChange}
        />

        <Sort
          pageType={pageType}
          tab={tab}
          freelancerFilters={freelancerFilters}
          projectFilters={projectFilters}
          handleFreelancerFilterChange={handleFreelancerFilterChange}
          handleProjectFilterChange={handleProjectFilterChange}
        />

        <div className="flex gap-3 mt-6">
          <Button
            text="Apply"
            variant="green"
            onClick={applyFilters}
            className="flex-1"
          />
          <Button
            text="Clear"
            variant="text"
            onClick={clearFilters}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex-1"
          />
        </div>
      </div>
    </div>
  );

 
  const DesktopSidebar = () => (
    <div className="hidden lg:block fixed top-30 right-0 w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto z-40">
      <div className="p-4">
        {/* כותרת */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Filter & Sort
          </h2>
        </div>

        {/* טאבים */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          {['filter', 'sort'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as 'filter' | 'sort')}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-medium ${
                tab === t 
                  ? 'bg-white shadow-sm text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t === 'filter' ? 'Filter' : 'Sort'}
            </button>
          ))}
        </div>

        {/* תוכן הסינונים */}
        <div className="space-y-6">
          <Filter
            pageType={pageType}
            tab={tab}
            freelancerFilters={freelancerFilters}
            projectFilters={projectFilters}
            handleFreelancerFilterChange={handleFreelancerFilterChange}
            handleProjectFilterChange={handleProjectFilterChange}
          />

          <Sort
            pageType={pageType}
            tab={tab}
            freelancerFilters={freelancerFilters}
            projectFilters={projectFilters}
            handleFreelancerFilterChange={handleFreelancerFilterChange}
            handleProjectFilterChange={handleProjectFilterChange}
          />
        </div>

    
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-700 transition-colors duration-200"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>

      {isMobile && isOpen && <MobilePopup />}

      {!isMobile && pageType !== 'posts' && <DesktopSidebar />}
    </>
  );
};