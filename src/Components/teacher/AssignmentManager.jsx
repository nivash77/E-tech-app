import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AssignmentManager({ theme }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const email = localStorage.getItem("email");
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxPoints, setMaxPoints] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_URL}/courses/courseOfTeacher/all`, {
          headers: { email },
        });
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses", err);
      }
    };
    fetchCourses();
  }, []);

  // ✅ Fetch modules when course selected
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchModules = async () => {
      try {
        const res = await axios.get(`${API_URL}/modules/course/${selectedCourse}`);
        setModules(res.data);
      } catch (err) {
        console.error("Error fetching modules", err);
      }
    };
    fetchModules();
  }, [selectedCourse]);

  // ✅ Handle create assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedModule) {
      setError("Please select course and module");
      return;
    }

    const selectedCourseObj = courses.find((c) => c.id === selectedCourse);
    if (!selectedCourseObj) {
      setError("Invalid course selected");
      return;
    }

    const teacherId = selectedCourseObj.teacherId;
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/assignments/add`,
        {
          courseId: selectedCourse,
          moduleId: selectedModule,
          teacherId,
          title,
          description,
          deadline,
          maxPoints,
        },
        { headers: { email } }
      );

      alert("✅ Assignment created successfully!");
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      setError("Error creating assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 caret-transparent ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`">
      <h1 className="text-2xl font-bold mb-6">Create Assignment</h1>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleCreateAssignment} className="bg-white p-6 rounded shadow">
        {/* Course Dropdown */}
        <div className="mb-4">
          <label className="block font-medium">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">--Select Course--</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Module Dropdown */}
        <div className="mb-4">
          <label className="block font-medium">Select Module</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full border p-2 rounded"
            required
            disabled={!selectedCourse}
          >
            <option value="">--Select Module--</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows="4"
            required
          />
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <label className="block font-medium">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Max Points */}
        <div className="mb-4">
          <label className="block font-medium">Max Points</label>
          <input
            type="number"
            value={maxPoints}
            onChange={(e) => setMaxPoints(e.target.value)}
            className="w-full border p-2 rounded"
            min="1"
            required
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
}

export default AssignmentManager;
