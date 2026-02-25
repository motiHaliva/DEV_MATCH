import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import type { ProjectCardProps } from "./type";
import { getUserInitials } from "../../utils/userInitials";
import { YMdate, YMDdate } from "../../utils/formatDate";
import Button from "../../ui/Button";
import { variants } from "../../utils/variants";
import { useAuth } from "../auth/AuthContext";
import { createRequest } from "../../api/requestsApi";
import { toast } from "react-toastify";

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const { currentUser } = useAuth();

  const createdAtFormatted = YMdate(project.created_at);
  const deadlineFormatted = YMDdate(project.deadline);

  /* =========================
     Guards
  ========================= */

  const isFreelancer = currentUser?.role === "freelancer";
  const isOwnProject = currentUser?.id === project.client_id;
  const isOpen = project.is_open === true;

  const canMatch = useMemo(() => {
    return (
      !!currentUser &&
      isFreelancer &&
      !isOwnProject &&
      isOpen &&
      !!project.client_id &&
      !!project.id
    );
  }, [currentUser, isFreelancer, isOwnProject, isOpen, project]);

  /* =========================
     Handle Match
  ========================= */

  const handleMatch = async () => {
    if (!currentUser) {
      toast.warning("Please login first.");
      return;
    }

    if (!isFreelancer) {
      toast.warning("Only freelancers can apply to projects.");
      return;
    }

    if (isOwnProject) {
      toast.warning("You cannot apply to your own project.");
      return;
    }

    if (!isOpen) {
      toast.warning("Project is closed.");
      return;
    }

    if (!project.client_id || !project.id) {
      toast.error("Invalid project data.");
      return;
    }

    try {
      setIsMatching(true);

      await createRequest({
        to_user_id: project.client_id,
        project_id: project.id,
      });

      toast.success("Match request sent successfully!");
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.info("You already applied to this project.");
      } else if (error.response?.status === 400) {
        toast.warning(error.response.data?.error || "Invalid request.");
      } else {
        toast.error("Failed to send match request.");
      }
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden max-w-full flex flex-col h-full">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-36 bg-gradient-to-b from-blue-50 to-white p-4 border-r border-blue-100">
          <Link to={`/clientProfile/${project.client_id}`} className="block mb-5">
            <div className="flex flex-col items-center text-center">
              {project.client_avatar ? (
                <img
                  src={project.client_avatar}
                  alt="Client avatar"
                  className="w-14 h-14 rounded-full shadow-lg object-cover mb-3"
                />
              ) : (
                <div className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-brand-blueLight to-brand-blue flex items-center justify-center text-white font-bold text-base mb-3">
                  {getUserInitials(project.client_firstname, project.client_lastname)}
                </div>
              )}

              <h4 className="font-bold text-gray-900 text-xs mb-1">
                {project.client_firstname} {project.client_lastname}
              </h4>

              <span
                className={`inline-block px-2 rounded-full text-sm font-medium mt-1 ${
                  variants[project.project_type] ?? variants.default
                }`}
              >
                {project.project_type}
              </span>
            </div>
          </Link>

          <div className="space-y-3 mb-4 text-center">
            <div>
              <FaClock className="text-orange-500 mx-auto mb-1" size={14} />
              <div className="text-xs text-gray-500">Deadline</div>
              <div className="text-xs font-bold text-gray-800">{deadlineFormatted}</div>
            </div>

            <div>
              <FaCalendarAlt className="text-gray-400 mx-auto mb-1" size={14} />
              <div className="text-xs text-gray-500">Created</div>
              <div className="text-xs font-bold text-gray-800">{createdAtFormatted}</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-6 flex flex-col">
          <h1 className="text-2xl font-extrabold text-blue-800 mb-4 uppercase tracking-wide">
            {project.title}
          </h1>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isOpen ? "Open" : "Closed"}
          </span>

          <div className="mt-6 flex-1">
            <p className={`text-gray-700 ${expanded ? "" : "line-clamp-4"}`}>
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

      {/* Action */}
      <div className="flex justify-center p-6 pt-0">
        <Button
          text={isMatching ? "Sending..." : "MATCH"}
          variant="blue"
          className="px-8 py-3 text-base font-semibold"
          onClick={handleMatch}
          disabled={!canMatch || isMatching}
        />
      </div>
    </div>
  );
};

export default ProjectCard;