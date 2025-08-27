import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function TeacherDashboard({ theme }) {
  const [courses, setCourses] = useState([]);
  const [assignmentsWithSubs, setAssignmentsWithSubs] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const isDark = theme === "dark";
  const bgClass = isDark
    ? "bg-gray-900 text-white"
    : "bg-gray-50 text-gray-900";
  const cardClass = isDark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-200 text-gray-900";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("email");

        // Fetch teacher's courses
        const coursesRes = await axios.get(
          `${API_URL}/courses/courseOfTeacher/all`,
          {
            headers: { email },
          }
        );
        setCourses(coursesRes.data);

        // Fetch all assignments of the teacher
        const assignmentsRes = await axios.get(
          `${API_URL}/assignments/getAssignmentofTeacher`,
          {
            headers: { email },
          }
        );

        const assignments = assignmentsRes.data;

        // For each assignment, fetch submissions
        const submissionsPromises = assignments.map(async (assignment) => {
          const subsRes = await axios.get(
            `${API_URL}/submissions/assignment/${assignment.id}`,
            { headers: { email } }
          );
          const allSubmissions = subsRes.data;
          const ungradedSubmissions = subsRes.data.filter(
            (sub) => sub.grade === 0 || sub.grade === null
          );
          return {
            ...assignment,
            submissions: ungradedSubmissions,
            totalSubmissions: allSubmissions.length,
          };
        });

        const assignmentsWithSubsData = await Promise.all(submissionsPromises);
        setAssignmentsWithSubs(assignmentsWithSubsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={`min-h-screen p-6 ${bgClass} caret-transparent`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Teacher Dashboard</h2>
        <button
          onClick={() => navigate("/teacher/courses/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Courses Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">My Courses</h3>
          {courses.length === 0 ? (
            <p className="text-gray-400">No courses found.</p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className={`p-4 rounded-lg shadow border mb-4 transition hover:shadow-lg ${cardClass}`}
              >
                <div className="flex justify-between items-center">
                  <Link
                    to={`/teacher/courses/edit/${course.id}`}
                    className="text-blue-500 font-semibold hover:underline"
                  >
                    {course.title}
                  </Link>
                  <button className="text-red-500 hover:text-red-700 font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Assignments & Submissions Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold">
              Assignments & Submissions
            </h3>
            <button
              onClick={() => navigate("/teacher/assignments")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Assignment
            </button>
          </div>

          {assignmentsWithSubs.length === 0 ? (
            <p className="text-gray-400">No assignments found.</p>
          ) : (
            assignmentsWithSubs.map((assignment) => (
              <div
                key={assignment.id}
                className={`p-4 rounded-lg shadow border mb-4 transition hover:shadow-lg ${cardClass}`}
              >
                <h4 className="text-lg font-semibold">{assignment.title}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Deadline:{" "}
                  {assignment.deadline
                    ? new Date(assignment.deadline).toLocaleString()
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Submissions: {assignment.totalSubmissions}
                </p>

                {assignment.submissions.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-300">
                    {assignment.submissions.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex justify-between items-center mb-1"
                      >
                        <span>Student ID: {sub.studentId}</span>
                        <button
                          onClick={() =>
                            navigate(`/teacher/assignments/grade/${sub.id}`)
                          }
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Grade
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
