import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function CourseEditor({ theme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const email = localStorage.getItem("email");

  const [course, setCourse] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    modules: [],
  });
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [error, setError] = useState("");

  const [activeModuleIndex, setActiveModuleIndex] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const [lessonData, setLessonData] = useState({
    title: "",
    contentType: "",
    contentUrl: "",
    textContent: "",
    file: null,
    lIdx: null,
    id: null,
  });

  const [quizData, setQuizData] = useState({ title: "", questions: [], qIdx: null, id: null });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    type: "SINGLE",
    options: "",
    correctAnswers: "",
  });

  // Fetch course, modules, lessons, quizzes
  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const courseRes = await axios.get(`${API_URL}/courses/${id}`, { headers: { email } });
        const courseData = courseRes.data;

        const modulesRes = await axios.get(`${API_URL}/modules/course/${id}`, { headers: { email } });
        const modules = modulesRes.data || [];

        const modulesWithDetails = await Promise.all(
          modules.map(async (mod) => {
            const lessonsRes = await axios.get(`${API_URL}/lessons/module/${mod.id}`, { headers: { email } });
            const quizzesRes = await axios.get(`${API_URL}/quizzes/${mod.id}`, { headers: { email } });

            return {
              ...mod,
              lessons: lessonsRes.data || [],
              quizzes: quizzesRes.data || [],
            };
          })
        );

        setCourse({
          title: courseData.title || "",
          description: courseData.description || "",
          thumbnailUrl: courseData.thumbnailUrl || "",
          modules: modulesWithDetails,
        });
      } catch (err) {
        console.error(err);
        setError("Error fetching course data");
      }
    };

    fetchCourse();
  }, [id]);

  // Course change handler
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  // Modules
  const addModule = () => {
    if (!newModuleTitle.trim()) return setError("Module title required");
    setCourse({
      ...course,
      modules: [...course.modules, { title: newModuleTitle, lessons: [], quizzes: [] }],
    });
    setNewModuleTitle("");
    setError("");
  };

  const deleteModule = (mIdx) => {
    const updated = [...course.modules];
    updated.splice(mIdx, 1);
    setCourse({ ...course, modules: updated });
  };

  // Lessons
  const openLessonModal = (mIdx, lesson = null, lIdx = null) => {
    setActiveModuleIndex(mIdx);
    if (lesson) setLessonData({ ...lesson, file: null, lIdx, id: lesson.id });
    else setLessonData({ title: "", contentType: "", contentUrl: "", textContent: "", file: null, lIdx: null, id: null });
    setShowLessonModal(true);
  };

  const saveLessonLocally = () => {
    if (!lessonData.title || !lessonData.contentType) {
      setError("Lesson title and content type required");
      return;
    }
    const updatedModules = [...course.modules];
    if (lessonData.lIdx !== null) updatedModules[activeModuleIndex].lessons[lessonData.lIdx] = { ...lessonData };
    else updatedModules[activeModuleIndex].lessons.push({ ...lessonData });
    setCourse({ ...course, modules: updatedModules });
    setShowLessonModal(false);
  };

  const deleteLesson = (mIdx, lIdx) => {
    const updatedModules = [...course.modules];
    updatedModules[mIdx].lessons.splice(lIdx, 1);
    setCourse({ ...course, modules: updatedModules });
  };

  // Quizzes
  const openQuizModal = (mIdx, quiz = null, qIdx = null) => {
    setActiveModuleIndex(mIdx);
    if (quiz) setQuizData({ ...quiz, qIdx, id: quiz.id });
    else setQuizData({ title: "", questions: [], qIdx: null, id: null });
    setCurrentQuestion({ questionText: "", type: "SINGLE", options: "", correctAnswers: "" });
    setShowQuizModal(true);
  };

  const addQuestionToQuiz = () => {
    if (!currentQuestion.questionText.trim()) return setError("Question text required");
    const question = {
      questionText: currentQuestion.questionText,
      type: currentQuestion.type,
      options: currentQuestion.options.split(",").map((o) => o.trim()),
      correctAnswers: currentQuestion.correctAnswers.split(",").map((a) => a.trim()),
    };
    setQuizData({ ...quizData, questions: [...quizData.questions, question] });
    setCurrentQuestion({ questionText: "", type: "SINGLE", options: "", correctAnswers: "" });
  };

  const saveQuiz = () => {
    if (!quizData.title) return setError("Quiz title required");
    const updatedModules = [...course.modules];
    if (quizData.qIdx !== null) updatedModules[activeModuleIndex].quizzes[quizData.qIdx] = quizData;
    else updatedModules[activeModuleIndex].quizzes.push(quizData);
    setCourse({ ...course, modules: updatedModules });
    setShowQuizModal(false);
  };

  const deleteQuiz = (mIdx, qIdx) => {
    const updatedModules = [...course.modules];
    updatedModules[mIdx].quizzes.splice(qIdx, 1);
    setCourse({ ...course, modules: updatedModules });
  };

  // Save all to backend
  const handleSaveCourse = async () => {
    try {
      await axios.put(`${API_URL}/courses/${id}`, {
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
      }, { headers: { email } });

      for (const mod of course.modules) {
        // Module
        if (mod.id) await axios.put(`${API_URL}/modules/${mod.id}`, { title: mod.title }, { headers: { email } });
        else {
          const newModule = await axios.post(`${API_URL}/modules/add`, { courseId: id, title: mod.title }, { headers: { email } });
          mod.id = newModule.data.id;
        }

        // Lessons
        for (const lesson of mod.lessons) {
          if (lesson.file) {
            const formData = new FormData();
            formData.append("title", lesson.title);
            formData.append("contentType", lesson.contentType);
            formData.append("moduleId", mod.id);
            formData.append("file", lesson.file);

            if (lesson.id) await axios.put(`${API_URL}/lessons/${lesson.id}`, formData, { headers: { "Content-Type": "multipart/form-data", email } });
            else await axios.post(`${API_URL}/lessons/add`, formData, { headers: { "Content-Type": "multipart/form-data", email } });
          } else {
            const payload = {
              title: lesson.title,
              contentType: lesson.contentType,
              contentUrl: lesson.contentType === "video" ? lesson.contentUrl : undefined,
              textContent: lesson.contentType === "text" ? lesson.textContent : undefined,
              moduleId: mod.id,
            };
            if (lesson.id) await axios.put(`${API_URL}/lessons/${lesson.id}`, payload, { headers: { "Content-Type": "multipart/form-data", email } });
            else await axios.post(`${API_URL}/lessons/add`, payload, { headers: { "Content-Type": "multipart/form-data", email } });
          }
        }

        // Quizzes
        for (const quiz of mod.quizzes) {
          if (quiz.id) await axios.put(`${API_URL}/quizzes/${quiz.id}`, quiz, { headers: { email } });
          else await axios.post(`${API_URL}/quizzes/add`, { ...quiz, moduleId: mod.id }, { headers: { email } });
        }
      }

      alert("Course saved successfully!");
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      setError("Error saving course data");
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Edit Course' : 'Create Course'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className={`p-6 rounded shadow-md space-y-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <input type="text" name="title" placeholder="Course Title" value={course.title} onChange={handleCourseChange} className="w-full border p-2 rounded" />
        <textarea name="description" placeholder="Course Description" value={course.description} onChange={handleCourseChange} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Thumbnail URL" value={course.thumbnailUrl} onChange={(e) => setCourse({ ...course, thumbnailUrl: e.target.value })} className="w-full border p-2 rounded" />

        <h3 className="text-xl font-semibold mt-4">Modules</h3>
        {course.modules.map((mod, mIdx) => (
          <div key={mIdx} className="border p-3 rounded mb-3">
            <div className="flex justify-between items-center">
              <p className="font-bold">{mod.title}</p>
              <button onClick={() => deleteModule(mIdx)} className="text-red-500">Delete Module</button>
            </div>

            {/* Lessons */}
            <div className="mt-2">
              <h4 className="font-semibold">Lessons</h4>
              {mod.lessons?.map((lesson, lIdx) => (
                <div key={lIdx} className="p-2 border rounded mb-1 flex justify-between items-center">
                  <p>{lesson.title} ({lesson.contentType})</p>
                  <div>
                    <button onClick={() => openLessonModal(mIdx, lesson, lIdx)} className="text-blue-500 mr-2">Edit</button>
                    <button onClick={() => deleteLesson(mIdx, lIdx)} className="text-red-500">Delete</button>
                  </div>
                </div>
              ))}
              <button onClick={() => openLessonModal(mIdx)} className="bg-green-600 text-white px-2 py-1 rounded mt-1">+ Add Lesson</button>
            </div>

            {/* Quizzes */}
            <div className="mt-2">
              <h4 className="font-semibold">Quizzes</h4>
              {mod.quizzes?.map((quiz, qIdx) => (
                <div key={qIdx} className="p-2 border rounded mb-1 flex justify-between items-center">
                  <p>{quiz.title} ({quiz.questions.length} Questions)</p>
                  <div>
                    <button onClick={() => openQuizModal(mIdx, quiz, qIdx)} className="text-blue-500 mr-2">Edit</button>
                    <button onClick={() => deleteQuiz(mIdx, qIdx)} className="text-red-500">Delete</button>
                  </div>
                </div>
              ))}
              <button onClick={() => openQuizModal(mIdx)} className="bg-yellow-500 text-white px-2 py-1 rounded mt-1">+ Add Quiz</button>
            </div>
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          <input type="text" placeholder="New Module Title" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} className="flex-1 p-2 border rounded" />
          <button onClick={addModule} className="bg-blue-600 text-white px-4 py-2 rounded">Add Module</button>
        </div>
        <button onClick={()=>navigate('/teacher/dashboard')} className="bg-red-600 text-white px-4 py-2 rounded mt-4">Cancel</button>
        <button onClick={handleSaveCourse} className="bg-green-600 text-white px-4 py-2 rounded w-full mt-4">Save Course</button>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`p-6 rounded shadow w-96 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <h3 className="text-xl font-bold mb-4">Add/Edit Lesson</h3>
            <input type="text" placeholder="Lesson Title" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} className="w-full border p-2 mb-2 rounded" />
            <select value={lessonData.contentType} onChange={(e) => setLessonData({ ...lessonData, contentType: e.target.value })} className="w-full border p-2 mb-2 rounded">
              <option value="">Select Type</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="text">Text</option>
            </select>
            {lessonData.contentType === 'video' && <input type="text" placeholder="Video URL" value={lessonData.contentUrl} onChange={(e) => setLessonData({ ...lessonData, contentUrl: e.target.value })} className="w-full border p-2 mb-2 rounded" />}
            {lessonData.contentType === 'text' && <textarea placeholder="Text Content" value={lessonData.textContent} onChange={(e) => setLessonData({ ...lessonData, textContent: e.target.value })} className="w-full border p-2 mb-2 rounded"></textarea>}
            {lessonData.contentType === 'pdf' && <input type="file" onChange={(e) => setLessonData({ ...lessonData, file: e.target.files[0] })} className="w-full mb-2" />}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowLessonModal(false)} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
              <button onClick={saveLessonLocally} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
          <div className={`p-6 rounded shadow w-96 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <h3 className="text-xl font-bold mb-4">Add/Edit Quiz</h3>
            <input type="text" placeholder="Quiz Title" value={quizData.title} onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} className="w-full border p-2 mb-2 rounded" />
            <h4 className="font-semibold mt-2">Add Question</h4>
            <input type="text" placeholder="Question Text" value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} className="w-full border p-2 mb-2 rounded" />
            <select value={currentQuestion.type} onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })} className="w-full border p-2 mb-2 rounded">
              <option value="SINGLE">Single</option>
              <option value="MULTI">Multiple</option>
            </select>
            <input type="text" placeholder="Options (comma separated)" value={currentQuestion.options} onChange={(e) => setCurrentQuestion({ ...currentQuestion, options: e.target.value })} className="w-full border p-2 mb-2 rounded" />
            <input type="text" placeholder="Correct Answers (comma separated)" value={currentQuestion.correctAnswers} onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswers: e.target.value })} className="w-full border p-2 mb-2 rounded" />
            <button onClick={addQuestionToQuiz} className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2">Add Question</button>
            <p>Questions Added: {quizData.questions.length}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowQuizModal(false)} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
              <button onClick={saveQuiz} className="bg-green-600 text-white px-4 py-2 rounded">Save Quiz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseEditor;
