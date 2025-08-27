import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CourseView({ theme }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState([]);
  const [sidebarExpandedModules, setSidebarExpandedModules] = useState([]);
  const [lastLesson, setLastLesson] = useState(null);

  const email = localStorage.getItem('email');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setError('');
        const courseRes = await axios.get(`${API_URL}/courses/${id}`, { headers: { email } });
        setCourse(courseRes.data);

        const modulesRes = await axios.get(`${API_URL}/modules/course/${id}`, { headers: { email } });

        const modulesWithContent = await Promise.all(
          modulesRes.data.map(async (module) => {
            const lessonsRes = await axios.get(`${API_URL}/lessons/module/${module.id}`);
            let quizzes = [];
            try {
              const quizRes = await axios.get(`${API_URL}/quizzes/${module.id}`, { headers: { email } });
              quizzes = quizRes.data || [];
            } catch {
              console.error('Error fetching quizzes for module:', error);
            }
            return { ...module, lessons: lessonsRes.data, quizzes };
          })
        );

        setModules(modulesWithContent);
        setExpandedModules(modulesWithContent.map(() => false));
        setSidebarExpandedModules(modulesWithContent.map(() => false));

        // Fetch progress and enrollment
        const progressRes = await axios.get(`${API_URL}/enrollments/progress`, {
          headers: { email },
          params: { courseId: id }
        });
        setProgress(progressRes.data);

        const enrollmentRes = await axios.get(`${API_URL}/enrollments/user`, { headers: { email } });
        const enrollment = enrollmentRes.data.find((e) => e.courseId === id);
        if (enrollment) {
          setCompletedLessons(enrollment.completedLessons || []);
          setCompletedQuizzes(enrollment.completedQuizzes || []); // NEW
          setLastLesson(enrollment.lastLesson || null);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, email]);

  const markLessonComplete = async (lessonId) => {
    try {
      const res = await axios.post(
        `${API_URL}/enrollments/lesson/complete`,
        null,
        { headers: { email }, params: { courseId: id, lessonId } }
      );
      setCompletedLessons(res.data.completedLessons);
      setProgress(Math.round(res.data.progress));
      setLastLesson(lessonId);
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const toggleModule = (index) => {
    const updated = [...expandedModules];
    updated[index] = !updated[index];
    setExpandedModules(updated);
  };

  const toggleSidebarModule = (index) => {
    const updated = [...sidebarExpandedModules];
    updated[index] = !updated[index];
    setSidebarExpandedModules(updated);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading course content...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!course) return <div className="text-center text-red-500">Course not found.</div>;

  return (
    <div className={`min-h-screen px-4 md:px-6 py-10 caret-transparent ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Course Header */}
          <div className="mb-8 text-center">
            {course.image && <img src={course.image} alt="Course Banner" className="w-full rounded-lg mb-6 max-h-72 object-cover" />}
            <h1 className="text-4xl font-extrabold mb-2">{course.title}</h1>
            <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{course.description}</p>
           
            
          </div>

          {/* Modules */}
          {modules.map((module, idx) => (
            <div key={module.id} className={`p-6 rounded-2xl shadow-lg transition ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <button
                onClick={() => toggleModule(idx)}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="text-2xl font-semibold flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full mr-3">{idx + 1}</span>
                  {module.title}
                </h3>
                <span>{expandedModules[idx] ? '▲' : '▼'}</span>
              </button>
              <p className="text-sm text-gray-500 mt-1">{module.lessons.length} Lessons | {module.quizzes.length} Quizzes</p>

              {expandedModules[idx] && (
                <>
                  {/* Lessons */}
                  {module.lessons.length > 0 ? (
                    <div className="space-y-4 mt-4">
                      {module.lessons.map((lesson) => {
                        const isVideo = lesson.contentType.toLowerCase() === 'video';
                        const isText = lesson.contentType.toLowerCase() === 'text';
                        const isPdf = lesson.contentType.toLowerCase() === 'pdf';
                        const completed = completedLessons.includes(lesson.id);

                        let embedUrl = '';
                        if (isVideo && (lesson.contentUrl.includes('youtube.com') || lesson.contentUrl.includes('youtu.be'))) {
                          embedUrl = lesson.contentUrl
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'youtube.com/embed/');
                        }

                        return (
                          <div key={lesson.id} className={`border p-4 rounded-lg mb-4 ${completed ? 'border-green-500 bg-green-50 dark:bg-green-800' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex justify-between items-center">
                              <p className={`font-semibold ${completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                                {lesson.title}
                              </p>
                              {!completed && (
                                <button
                                  onClick={() => markLessonComplete(lesson.id)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </div>

                            {isVideo && (
                              <div className="mt-3 aspect-video">
                                {embedUrl ? (
                                  <iframe
                                    width="100%"
                                    height="315"
                                    src={embedUrl}
                                    title="Course Video"
                                    frameBorder="0"
                                    allowFullScreen
                                    className="rounded-lg w-full h-full"
                                  />
                                ) : (
                                  <video controls className="w-full rounded-lg">
                                    <source src={lesson.contentUrl} type="video/mp4" />
                                  </video>
                                )}
                              </div>
                            )}

                            {isText && (
                              <div
                                dangerouslySetInnerHTML={{ __html: lesson.content }}
                                className="mt-3 text-gray-600 dark:text-gray-300"
                              />
                            )}

                            {isPdf && (
                              <iframe
                                src={lesson.contentUrl}
                                className="w-full h-96 border rounded-lg mt-3"
                                title="PDF Document"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic mt-4">No lessons yet.</p>
                  )}

                  {/* Quizzes */}
                  {module.quizzes.filter(q => !completedQuizzes.includes(q.id)).length > 0 && (
                    <div className="mt-6 p-4 border-t border-gray-300">
                      <h4 className="text-lg font-semibold mb-3">Module Quizzes</h4>
                      {module.quizzes
                        .filter(q => !completedQuizzes.includes(q.id))
                        .map((quiz) => (
                          <Link key={quiz.id} to={`/courses/${module.id}/quiz/${quiz.id}`} className="block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 mb-3">
                            Start Quiz: {quiz.title}
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className={`p-6 rounded-2xl shadow-lg h-fit sticky top-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h4 className="text-xl font-semibold mb-4">Course Progress</h4>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="mb-6">{progress.toFixed(1)}% Completed</p>

          {progress === 100 && (
            <a
              href={`${API_URL}/certificate/download?courseId=${id}&email=${email}`}
              className="block mb-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center"
            >
              Download Certificate
            </a>
          )}

          <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-3 mb-6">
            <li>
              <Link to={`/courses/${id}/discussions`} className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center">Discussion Forum</Link>
            </li>
            <li>
              <Link to="/dashboard" className={`block px-4 py-2 rounded-lg text-center transition ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Back to Dashboard</Link>
            </li>
          </ul>

          <h4 className="text-xl font-semibold mb-4">Modules & Quizzes</h4>
          <ul className="space-y-2">
            {modules.map((module, idx) => (
              <li key={module.id}>
                <button
                  onClick={() => toggleSidebarModule(idx)}
                  className="w-full text-left font-semibold flex justify-between items-center"
                >
                  {idx + 1}. {module.title}
                  <span>{sidebarExpandedModules[idx] ? '-' : '+'}</span>
                </button>
                {sidebarExpandedModules[idx] && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {module.quizzes.filter(q => !completedQuizzes.includes(q.id)).length > 0 ? (
                      module.quizzes
                        .filter(q => !completedQuizzes.includes(q.id))
                        .map((quiz) => (
                          <li key={quiz.id}>
                            <Link
                              to={`/courses/${module.id}/quiz/${quiz.id}`}
                              className="text-purple-500 hover:underline text-sm"
                            >
                              {quiz.title}
                            </Link>
                          </li>
                        ))
                    ) : (
                      <li className="text-gray-500 text-sm italic">No quizzes</li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseView;
