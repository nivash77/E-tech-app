import { useEffect, useState } from "react";
import axios from "axios";

function AllCourses({ theme }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const email = localStorage.getItem("email");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all courses
        const coursesRes = await axios.get(`${API_URL}/courses/all`);

        // Fetch user's enrolled courses
        const enrollmentsRes = await axios.get(`${API_URL}/courses/enroll`, {
          headers: { email },
        });

        const enrolledIds = enrollmentsRes.data.map((course) => course.id);

        // Filter out enrolled courses
        const availableCourses = coursesRes.data.filter(
          (course) => !enrolledIds.includes(course.id)
        );

        setCourses(availableCourses);
        setEnrolledCourses(enrolledIds);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEnroll = async (courseId,courseTitle) => {
    try {
      await axios.post(`${API_URL}/enrollments/enroll`, null, {
        params: { courseId },
        headers: { email },
      });
      alert("Enrolled successfully!");
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId)
    );
    setEnrolledCourses((prev) => [...prev, courseId]);
    await axios.post(`${API_URL}/notifications/create`,null,{
      params:{type:"course enrolled",message:`You enrolled the course of ${courseTitle}`},
      headers: { email },
    })
  } catch (error) {
    console.error(error);
    alert("Error enrolling in course.");
  }
  };

  const handleViewModules = async (course) => {
    try {
      setSelectedCourse(course);
      setIsModalOpen(true);

      // Fetch modules for the course
      const moduleRes = await axios.get(
        `${API_URL}/modules/course/${course.id}`
      );
      setModules(moduleRes.data);

      // Fetch lessons for each module
      const lessonsData = {};
      for (const module of moduleRes.data) {
        const lessonsRes = await axios.get(
          `${API_URL}/lessons/module/${module.id}`
        );
        lessonsData[module.id] = lessonsRes.data;
      }
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching modules or lessons:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setModules([]);
    setLessons({});
  };

  const bgClass =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
  const cardClass =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800";
  const modalClass =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen ${bgClass} px-6 py-10`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center text-primary">
          All Courses
        </h2>
        {courses.length === 0 ? (
          <p className="text-center text-gray-500">
            You have enrolled in all available courses!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`card ${cardClass} p-4 rounded-2xl shadow-lg hover:shadow-xl transition`}
              >
                <img
                  src={course.thumbnail || "/default-course.jpg"}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-sm opacity-80 mb-4">
                  {course.description?.slice(0, 80)}...
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEnroll(course.id,course.title)}
                    className={` bg-primary text-white px-4 py-2 rounded-lg w-1/2  transition  ${
                      theme === "dark"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Enroll
                  </button>
                  <button
                    onClick={() => handleViewModules(course)}
                    className={` bg-primary text-white px-4 py-2 rounded-lg w-1/2  transition  ${
                      theme === "dark"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`${modalClass} p-6 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto`}
          >
            <h2 className="text-2xl font-bold mb-4">{selectedCourse.title}</h2>
            <p className="opacity-80 mb-6">{selectedCourse.description}</p>

            <div>
              {modules.length === 0 ? (
                <p>No modules found for this course.</p>
              ) : (
                modules.map((module) => (
                  <div key={module.id} className="mb-6 border-b pb-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {module.title}
                    </h3>
                    <p className="opacity-70 mb-2">Order: {module.order}</p>

                    <h4 className="font-medium mb-1">Lessons:</h4>
                    {lessons[module.id]?.length > 0 ? (
                      <ul className="list-disc list-inside opacity-90">
                        {lessons[module.id].map((lesson) => (
                          <li key={lesson.id}>{lesson.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="opacity-70">No lessons available.</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="text-right mt-4">
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllCourses;
