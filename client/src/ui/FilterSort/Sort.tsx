import React from 'react';
import { RadioField } from './RadioField';
import type { FreelancerFilters, ProjectFilters } from '../../api/typs'

interface SortProps {
  pageType: "freelancers" | "projects";
  tab: "filter" | "sort";
  freelancerFilters: FreelancerFilters;
  projectFilters: ProjectFilters;
  handleFreelancerFilterChange: (key: keyof FreelancerFilters, value: string) => void;
  handleProjectFilterChange: (key: keyof ProjectFilters, value: string) => void;
}

const Sort: React.FC<SortProps> = ({ 
  pageType, 
  tab, 
  freelancerFilters, 
  projectFilters, 
  handleFreelancerFilterChange, 
  handleProjectFilterChange 
}) => {
  return (
    <div>
      {tab === "sort" && (
        <div className="space-y-3">
          {pageType === "freelancers" && (
            <>
              {[
                { id: "rating_desc", label: "Rating (High to Low)" },
                { id: "rating_asc", label: "Rating (Low to High)" },
                { id: "experience_desc", label: "Experience (Most to Least)" },
                { id: "experience_asc", label: "Experience (Least to Most)" },
                { id: "", label: "Newest First" }
              ].map(({ id, label }) => (
                <RadioField
                  key={id}
                  id={id}
                  name="freelancer_sort"
                  value={id}
                  checked={(freelancerFilters.sort || '') === id} // הוסף fallback
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleFreelancerFilterChange("sort", e.target.value)
                  }
                  label={label}
                />
              ))}
            </>
          )}
          {pageType === "projects" && (
            <>
              <RadioField
                id="project_newest"
                name="project_sort"
                value=""
                checked={(projectFilters.sort || '') === ""} // הוסף fallback
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleProjectFilterChange("sort", e.target.value)
                }
                label="Newest First"
              />
              <RadioField
                id="project_oldest"
                name="project_sort"
                value="created_asc"
                checked={(projectFilters.sort || '') === "created_asc"} // הוסף fallback
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleProjectFilterChange("sort", e.target.value)
                }
                label="Oldest First"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Sort;