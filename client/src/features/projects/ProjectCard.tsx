
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import type { ProjectCardProps } from "./type";
import { getUserInitials } from "../../utils/userInitials";
import { YMdate, YMDdate } from "../../utils/formatDate";
import Button from "../../ui/Button";
import { variants } from "../../utils/variants";

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const createdAtFormatted = YMdate(project.created_at);
  const deadlineFormatted = YMDdate(project.deadline);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden max-w-full flex flex-col h-full">
      <div className="flex flex-1">
        {/* Sidebar with Meta Info */}
        <div className="w-36 bg-gradient-to-b from-blue-50 to-white p-4 border-r border-blue-100">
          {/* Client Info */}
          <Link to={`/clientProfile/${project.client_id}`} className="block mb-5">
            <div className="flex flex-col items-center text-center">
              {project.client_avatar ? (
                <img
                  src={project.client_avatar}
                  alt="Client avatar"
                  className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 object-cover mb-3"
                />
              ) : (
                <div className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-brand-blueLight to-brand-blue flex items-center justify-center text-white font-bold text-base hover:scale-105 transition-transform duration-200 mb-3">
                  {getUserInitials(project.client_firstname, project.client_lastname)}
                </div>
              )}
              <h4 className="font-bold text-gray-900 text-xs hover:text-blue-600 transition-colors mb-1">
                {project.client_firstname} {project.client_lastname}
              </h4>
              
                <span className={`inline-block px-2  rounded-full text-sm font-medium mt-1 ${
                  variants[project.project_type] ?? variants.default
                }`}>
                  {project.project_type}
                </span>
  
              {/* <span className="text-xs text-blue-600 font-medium">Client</span> */}
            </div>
          </Link>

          {/* Timeline Info */}
          <div className="space-y-3 mb-4">
            <div className="text-center">
              <FaClock className="text-orange-500 mx-auto mb-1" size={14} />
              <div className="text-xs text-gray-500 mb-1">Deadline</div>
              <div className="text-xs font-bold text-gray-800">{deadlineFormatted}</div>
            </div>
            
            <div className="text-center">
              <FaCalendarAlt className="text-gray-400 mx-auto mb-1" size={14} />
              <div className="text-xs text-gray-500 mb-1">Created</div>
              <div className="text-xs font-bold text-gray-800">{createdAtFormatted}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-6 flex flex-col">
                          <h1 className="text-2xl font-extrabold text-blue-800 mb-4 uppercase tracking-wide leading-none">{project.title}</h1>

            <div className="flex items-start justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                project.is_open
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  project.is_open ? "bg-green-500" : "bg-red-500"
                }`} />
                {project.is_open ? "Open" : "Closed"}
              </span>
            </div>
          </div>

          {/* Description Section - גדל לפי הצורך */}
          <div className="mb-8 flex-1">
            <p className={`text-gray-700 text-base leading-relaxed ${expanded ? "" : "line-clamp-4"}`}>
              {project.description}
            </p>
            {project.description.length > 80 && (
              <Button
                text={expanded ? "Show less ▲" : "Show more ▼"}
                variant="text"
                onClick={() => setExpanded(!expanded)}
                className="mt-3"
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Section - תמיד בתחתית */}
      <div className="flex justify-center p-6 pt-0">
        <Button
          text="MATCH"
          variant="blue"
          className="px-8 py-3 text-base font-semibold"
          onClick={() => {
            console.log("Match clicked");
          }}
        />
      </div>
    </div>
  );
};

export default ProjectCard;