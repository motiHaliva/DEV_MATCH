import axiosInstance from "./axiosInstance";

export const skillsApi = {
  getAll: () => Promise.all([
    axiosInstance.get("/titles"),
    axiosInstance.get("/skills"),
  ]).then(([titlesRes, skillsRes]) => ({
    titles: titlesRes.data,
    skills: skillsRes.data
  })),

  addTitles: (titleIds: number[]) =>
    axiosInstance.post("/titles", { titles: titleIds }),

  addSkills: (skillIds: number[]) =>
    axiosInstance.post("/skills", { skills: skillIds }),

  removeTitle: (titleId: number) =>
    axiosInstance.delete(`/titles/${titleId}`),

  removeSkill: (skillId: number) =>
    axiosInstance.delete(`/skills/${skillId}`),
};