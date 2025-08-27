import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CourseBuilder({ theme }) {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
  });

  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [error, setError] = useState('');

  //Modal States
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);

  //Lesson Form Data
  const [lessonData, setLessonData] = useState({ title: '', contentType: '', contentUrl: '', file: null, textContent: '' });

  // Quiz Form Data
  const [quizData, setQuizData] = useState({ title: '', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    type: 'SINGLE',
    options: '',
    correctAnswers: '',
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const addModule = () => {
    if (!newModuleTitle.trim() || !newModuleDescription.trim()) {
      setError('Module title and description are required');
      return;
    }
    setModules([...modules, { title: newModuleTitle, description: newModuleDescription, lessons: [], quizzes: [] }]);
    setNewModuleTitle('');
    setNewModuleDescription('');
    setError('');
  };

  // Open Lesson Modal
  const openLessonModal = (index) => {
    setActiveModuleIndex(index);
    setLessonData({ title: '', contentType: '', contentUrl: '', file: null, textContent: '' });
    setShowLessonModal(true);
  };

  const saveLesson = () => {
    const updatedModules = [...modules];

    // Determine content based on type
    let lessonContent = {};
    if (lessonData.contentType === 'video') {
      lessonContent = { ...lessonData, contentUrl: lessonData.contentUrl };
    } else if (lessonData.contentType === 'pdf') {
      lessonContent = { ...lessonData, file: lessonData.file };
    } else if (lessonData.contentType === 'text') {
      lessonContent = { ...lessonData, textContent: lessonData.textContent };
    }

    updatedModules[activeModuleIndex].lessons.push(lessonContent);
    setModules(updatedModules);
    setShowLessonModal(false);
  };

  // Open Quiz Modal
  const openQuizModal = (index) => {
    setActiveModuleIndex(index);
    setQuizData({ title: '', questions: [] });
    setShowQuizModal(true);
  };

  const addQuestionToQuiz = () => {
    const newQuestion = {
      questionText: currentQuestion.questionText,
      type: currentQuestion.type,
      options: currentQuestion.options.split(',').map((opt) => opt.trim()),
      correctAnswers: currentQuestion.correctAnswers.split(',').map((ans) => ans.trim()),
    };

    setQuizData({ ...quizData, questions: [...quizData.questions, newQuestion] });
    setCurrentQuestion({ questionText: '', type: 'SINGLE', options: '', correctAnswers: '' });
  };

  const saveQuiz = () => {
    const updatedModules = [...modules];
    updatedModules[activeModuleIndex].quizzes.push(quizData);
    setModules(updatedModules);
    setShowQuizModal(false);
  };

  const handleSaveCourse = async () => {
    if (!course.title.trim()) {
      setError('Course title is required');
      return;
    }

    try {
      const email = localStorage.getItem('email');

      const courseRes = await axios.post(`${API_URL}/courses/add`, course, {
        headers: { email },
      });
      const courseId = courseRes.data.id;

      for (const [index, module] of modules.entries()) {
        const moduleRes = await axios.post(
          `${API_URL}/modules/add`,
          {
            courseId,
            title: module.title,
            description: module.description,
            order: index + 1,
          },
          { headers: { email } }
        );
        const moduleId = moduleRes.data.id;

        for (const lesson of module.lessons) {
          const formData = new FormData();
          formData.append('title', lesson.title);
          formData.append('contentType', lesson.contentType);

          if (lesson.contentType === 'video') {
            formData.append('contentUrl', lesson.contentUrl);
          } else if (lesson.contentType === 'pdf') {
            formData.append('file', lesson.file);
          } else if (lesson.contentType === 'text') {
            formData.append('textContent', lesson.textContent);
          }

          formData.append('moduleId', moduleId);

          await axios.post(`${API_URL}/lessons/add`, formData, {
            headers: { email, 'Content-Type': 'multipart/form-data' },
          });
        }

        for (const quiz of module.quizzes) {
          await axios.post(
            `${API_URL}/quizzes/add`,
            { ...quiz, moduleId },
            { headers: { email } }
          );
        }
      }

      navigate('/teacher/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error saving course');
    }
  };

  return (
    <div className={`container mx-auto p-6 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <h2 className="text-3xl font-bold mb-6">Create New Course</h2>
      {error && <p className="text-red-500">{error}</p>}

      <div className={`p-6 rounded shadow space-y-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Course Info */}
        <input type="text" name="title" value={course.title} onChange={handleCourseChange} placeholder="Enter course title" className="w-full border p-2 rounded" />
        <textarea name="description" value={course.description} onChange={handleCourseChange} placeholder="Enter course description" className="w-full border p-2 rounded" />
        <input type="text" name="price" value={course.price} onChange={handleCourseChange} placeholder="Enter price" className="w-full border p-2 rounded" />
        <input type="text" name="thumbnail" value={course.thumbnail} onChange={handleCourseChange} placeholder="Enter thumbnail URL" className="w-full border p-2 rounded" />

        {/* Modules */}
        <h3 className="text-xl font-semibold mt-4">Modules</h3>
        {modules.map((mod, index) => (
          <div key={index} className="border p-4 rounded mb-3">
            <p className="font-bold">{mod.title}</p>
            <p className="text-sm">{mod.description}</p>
            <button onClick={() => openLessonModal(index)} className="bg-green-600 text-white px-3 py-1 rounded mt-2">+ Add Lesson</button>
            <button onClick={() => openQuizModal(index)} className="bg-yellow-500 text-white px-3 py-1 rounded mt-2 ml-2">+ Add Quiz</button>
            <div className="mt-2 text-sm">
              <p>Lessons: {mod.lessons.length}</p>
              <p>Quizzes: {mod.quizzes.length}</p>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <input type="text" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="New Module Title" className="w-full border p-2 rounded" />
          <textarea value={newModuleDescription} onChange={(e) => setNewModuleDescription(e.target.value)} placeholder="New Module Description" className="w-full border p-2 rounded" />
          <button onClick={addModule} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add Module</button>
        </div>
         <div className="flex justify-end gap-2">
           <button onClick={() => navigate('/teacher/dashboard')} className="bg-gray-400 px-6 py-3 rounded  mt-4">Cancel</button>
        <button onClick={handleSaveCourse} className="bg-purple-600 text-white px-6 py-3 rounded  mt-4">Save Course</button>

        </div>
      </div>

      {/*Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-xl font-bold mb-4">Add Lesson</h3>
            <input type="text" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} placeholder="Lesson Title" className="w-full border p-2 mb-2 rounded" />
            <select value={lessonData.contentType} onChange={(e) => setLessonData({ ...lessonData, contentType: e.target.value })} className="w-full border p-2 mb-2 rounded">
              <option value="">Select Content Type</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="text">Text</option>
            </select>

            {lessonData.contentType === 'video' && (
              <input type="text" value={lessonData.contentUrl} onChange={(e) => setLessonData({ ...lessonData, contentUrl: e.target.value })} placeholder="Video URL" className="w-full border p-2 mb-2 rounded" />
            )}

            {lessonData.contentType === 'pdf' && (
              <input type="file" accept="application/pdf" onChange={(e) => setLessonData({ ...lessonData, file: e.target.files[0] })} className="w-full border p-2 mb-2 rounded" />
            )}

            {lessonData.contentType === 'text' && (
              <textarea value={lessonData.textContent} onChange={(e) => setLessonData({ ...lessonData, textContent: e.target.value })} placeholder="Enter text content" className="w-full border p-2 mb-2 rounded"></textarea>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLessonModal(false)} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
              <button onClick={saveLesson} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/*Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-xl font-bold mb-4">Add Quiz</h3>
            <input type="text" value={quizData.title} onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} placeholder="Quiz Title" className="w-full border p-2 mb-4 rounded" />

            <h4 className="font-semibold">Add Question</h4>
            <input type="text" value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} placeholder="Question Text" className="w-full border p-2 mb-2 rounded" />
            
            <select value={currentQuestion.type} onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })} className="w-full border p-2 mb-2 rounded">
              <option value="SINGLE">Single Answer</option>
              <option value="MULTI">Multiple Answers</option>
            </select>

            <input type="text" value={currentQuestion.options} onChange={(e) => setCurrentQuestion({ ...currentQuestion, options: e.target.value })} placeholder="Options (comma separated)" className="w-full border p-2 mb-2 rounded" />
            <input type="text" value={currentQuestion.correctAnswers} onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswers: e.target.value })} placeholder="Correct Answers (comma separated)" className="w-full border p-2 mb-2 rounded" />
            <button onClick={addQuestionToQuiz} className="bg-blue-500 text-white px-4 py-2 mb-4 rounded w-full">Add Question</button>

            <div className="mt-2">
              <p className="font-semibold">Questions Added: {quizData.questions.length}</p>
            </div>

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

export default CourseBuilder;
