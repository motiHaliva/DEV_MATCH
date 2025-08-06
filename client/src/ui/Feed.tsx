import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Button from "./Button";
import { FaFilter, FaSort } from "react-icons/fa";
import {FilterSortPopup} from "../ui/FilterSort/FilterSortPopup"
import type { FreelancerFilters, ProjectFilters, PostFilters } from "../../src/api/typs";

type Filters = FreelancerFilters | ProjectFilters | PostFilters;

export type FeedProps = {
  pageType?: "freelancers" | "projects" | "posts";
  onFiltersChange?: (filters: Filters) => void;
}

const NAV_ITEMS = [
  { to: "/posts", text: "Posts" },
  { to: "/projects", text: "Projects" },
  { to: "/freelancers", text: "Freelancers" },
];

const Feed: React.FC<FeedProps> = ({ 
  pageType: propPageType, 
  onFiltersChange
}) => {
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [popupTab, setPopupTab] = useState<"filter" | "sort">("filter");

  const getPageType = (): "freelancers" | "projects" | "posts" => {
    if (propPageType) return propPageType;
    
    const path = location.pathname;
    if (path.includes("/freelancers")) return "freelancers";
    if (path.includes("/projects")) return "projects";
    return "posts";
  };

  const pageType = getPageType();

  const getButtonClass = (isActive: boolean) =>
    `w-full text-center block duration-200 border rounded-md px-1 py-1 ${
      isActive
        ? "bg-white font-bold text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white"
        : "bg-gradient-to-r from-brand-gradientStart to-brand-gradientEnd text-white border-transparent hover:bg-brand-blue hover:bg-none"
    }`;

  const handleFiltersChange = (newFilters: Filters) => {
    onFiltersChange?.(newFilters);
    setShowFilters(false);
  };

  return (
    <>
      <div className="flex flex-col items-center mt-3">
        {/* Navigation Tabs */}
        <div className="flex gap-2 m-2 w-full justify-center font-semibold">
          {NAV_ITEMS.map(({ to, text }) => (
            <div key={to} className="w-1/4">
              <NavLink to={to} className={({ isActive }) => getButtonClass(isActive)}>
                {text}
              </NavLink>
            </div>
          ))}
        </div>

        {/* Filter + Sort Buttons - רק במובייל */}
        {pageType !== "posts" && (
          <div className="flex flex-row gap-4 w-40 rounded-lg justify-center mb-4 lg:hidden">
            <Button
              variant="icon"
              className="font-semibold border border-brand-blue text-brand-blue rounded-lg bg-sky-100"
              icon={<FaFilter />}
              onClick={() => {
                setPopupTab("filter");
                setShowFilters(true);
              }}
            />
            <Button
              variant="icon"
              className="font-semibold border border-brand-blue text-brand-blue rounded-lg bg-sky-100 py-0"
              icon={<FaSort />}
              onClick={() => {
                setPopupTab("sort");
                setShowFilters(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Filter Sidebar/Popup - תמיד רנדר */}
      <FilterSortPopup
        pageType={pageType}
        currentTab={popupTab}
        onFiltersChange={handleFiltersChange}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
      />
    </>
  );
};

export default Feed;