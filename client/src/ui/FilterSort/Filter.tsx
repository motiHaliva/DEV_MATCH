import React from 'react';
import { SelectField } from './SelectField';
import Input from '../Input';
import type { FreelancerFilters, ProjectFilters } from '../../api/typs'

interface FilterProps {
  pageType: "freelancers" | "projects";
  tab: "filter" | "sort";
  freelancerFilters: FreelancerFilters;
  projectFilters: ProjectFilters; 
  handleFreelancerFilterChange: (key: keyof FreelancerFilters, value: string) => void;
  handleProjectFilterChange: (key: keyof ProjectFilters, value: string) => void;
}

const Filter: React.FC<FilterProps> = ({ 
  pageType, 
  tab, 
  freelancerFilters, 
  projectFilters, 
  handleFreelancerFilterChange, 
  handleProjectFilterChange 
}) => {
  return (
    <div>
      {tab === "filter" && (
        <div className="space-y-4">
          {pageType === "freelancers" && (
            <>
              <SelectField
                label="Availability"
                value={freelancerFilters.is_available || ''} // הוסף fallback ל-undefined
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleFreelancerFilterChange("is_available", e.target.value)
                }
                options={[
                  { value: "", label: "All" },
                  { value: "true", label: "Available" },
                  { value: "false", label: "Unavailable" },
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Experience (Years)"
                  type="number"
                  name="min_experience"
                  value={freelancerFilters.min_experience || ''} // הוסף fallback
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleFreelancerFilterChange("min_experience", e.target.value)
                  }
                  placeholder="0"
                />
                <Input
                  label="Max Experience (Years)"
                  type="number"
                  name="max_experience"
                  value={freelancerFilters.max_experience || ''} // הוסף fallback
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleFreelancerFilterChange("max_experience", e.target.value)
                  }
                  placeholder="20"
                />
              </div>
            </>
          )}
          {pageType === "projects" && (
            <>
              <SelectField
                label="Project Type"
                value={projectFilters.type || ''} // הוסף fallback גם כאן
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleProjectFilterChange("type", e.target.value)
                }
                options={[
                  { value: "", label: "All" },
                  { value: "app", label: "App" },
                  { value: "ecommerce", label: "E-commerce" },
                  { value: "website", label: "Website" },
                ]}
              />
              <SelectField
                label="Status"
                value={projectFilters.is_open || ''} // הוסף fallback
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleProjectFilterChange("is_open", e.target.value)
                }
                options={[
                  { value: "", label: "All" },
                  { value: "true", label: "Open" },
                  { value: "false", label: "Closed" },
                ]}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Filter;