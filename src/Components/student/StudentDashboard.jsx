import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentDashboard({ theme }) {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const navigate = useNavigate();

  //Apply theme dynamically to root element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("email");

        const [coursesRes, assignmentsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/courses/enroll`, { headers: { email } }),
          axios.get(`${import.meta.env.VITE_API_URL}/assignments/deadlines`, { headers: { email } }),
        ]);

        setCourses(coursesRes.data);
        setAssignments(assignmentsRes.data);

        const progressObj = {};
        await Promise.all(
          coursesRes.data.map(async (course) => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/enrollments/progress`, {
              headers: { email },
              params: { courseId: course.id },
            });
            progressObj[course.id] = res.data;
          })
        );
        setProgressMap(progressObj);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const getProgressColor = (progress) => {
    if (progress <= 20) return "bg-red-500";
    if (progress <= 50) return "bg-orange-500";
    if (progress <= 80) return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <div
      className={`min-h-screen px-6 py-10 transition-colors caret-transparent${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className={`text-4xl font-bold mb-10 text-center caret-transparent ${
            theme === "dark" ? "text-blue-400" : "text-blue-700"
          }`}
        >
          Student Dashboard
        </h2>

        {/* Button to All Courses Page */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/all-courses")}
            className={`px-6 py-2 rounded-lg shadow transition caret-transparent ${
              theme === "dark" ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            View All Courses
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Enrolled Courses */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 caret-transparent">Enrolled Courses</h3>
            {courses.length === 0 ? (
              <p className="text-gray-500 caret-transparent">No enrolled courses yet.</p>
            ) : (
              courses.map((course) => {
                const progress = progressMap[course.id] || 0;
                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className={`cursor-pointer p-4 mb-4 rounded-2xl shadow-lg hover:shadow-xl transition flex gap-4 items-start ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <img
                      src={course.thumbnail || "/default-course.jpg"}
                      alt={course.title}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                    />
                    <div className="flex-1">
                      <p
                        className={`text-lg font-bold hover:underline ${
                          theme === "dark" ? "text-blue-400" : "text-blue-700"
                        }`}
                      >
                        {course.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {course.description?.slice(0, 60)}...
                      </p>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                        <div
                          className={`${getProgressColor(progress)} h-2 rounded-full transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {progress.toFixed(0)}% Complete
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Assignments */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 caret-transparent">Upcoming Assignments</h3>
            {assignments.length === 0 ? (
              <p className="text-gray-500 caret-transparent">No upcoming assignments.</p>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() =>
                    navigate(`/courses/${assignment.courseId}/assignment/${assignment.id}`)
                  }
                  className={`cursor-pointer p-4 mb-4 rounded-2xl shadow-lg hover:shadow-xl transition ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <p
                    className={`font-medium text-lg hover:underline ${
                      theme === "dark" ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    {assignment.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {assignment.description?.slice(0, 100)}...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Due: {new Date(assignment.deadline).toLocaleDateString()} | Max Points:{" "}
                    {assignment.maxPoints}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
