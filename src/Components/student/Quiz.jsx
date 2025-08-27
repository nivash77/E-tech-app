import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Quiz() {
  const { id, quizId } = useParams(); 
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const email = localStorage.getItem('email');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`${API_URL}/quizzes/${id}`, {
          headers: { email: email },
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          const foundQuiz = response.data.find(q => q.id === quizId) || response.data[0];
          setQuiz(foundQuiz);
        } else {
          console.error('No quiz found for this ID');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
      }
    };
    fetchQuiz();
  }, [quizId, id]);

  const handleAnswerChange = (questionIndex, value, type) => {
    if (type === 'SINGLE') {
      setAnswers(prev => ({ ...prev, [questionIndex]: [value] }));
    } else if (type === 'MULTI') {
      setAnswers(prev => {
        const currentAnswers = prev[questionIndex] || [];
        if (currentAnswers.includes(value)) {
          // Remove option if already selected
          return { ...prev, [questionIndex]: currentAnswers.filter(ans => ans !== value) };
        } else {
          // Add option
          return { ...prev, [questionIndex]: [...currentAnswers, value] };
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    let calculatedScore = 0;
    quiz.questions.forEach((q, index) => {
      const userAnswer = answers[index] || [];
      const correctAnswers = q.correctAnswers;

      // Check if arrays match (for MULTI) or single correct for SINGLE
      if (
        userAnswer.length === correctAnswers.length &&
        userAnswer.every(ans => correctAnswers.includes(ans))
      ) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);

    try {
      await axios.post(`${API_URL}/enrollments/quiz/submit`, null, {
        headers: { email },
        params: {
          courseId: id,
          quizId,
          score: calculatedScore,
        },
      });
      console.log('Score updated in enrollment');
      navigate(`/dashboard`);
    } catch (err) {
      console.error('Error updating quiz score:', err);
    }
  };

  if (!quiz) return <div className="text-center text-gray-500">Loading quiz...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">{quiz.title}</h2>

        {score !== null && (
          <p className="text-green-600 font-bold mb-4 text-center">
            Your Score: {score} / {quiz.questions.length}
          </p>
        )}

        {quiz.questions.map((question, index) => (
          <div key={index} className="border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
            <p className="font-semibold mb-2">{index + 1}. {question.questionText}</p>

            {/* SINGLE choice (Radio Buttons) */}
            {question.type === 'SINGLE' &&
              question.options.map((option, idx) => (
                <label key={idx} className="block mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index]?.includes(option) || false}
                    onChange={() => handleAnswerChange(index, option, 'SINGLE')}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}

            {/* MULTI choice (Checkboxes) */}
            {question.type === 'MULTI' &&
              question.options.map((option, idx) => (
                <label key={idx} className="block mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index]?.includes(option) || false}
                    onChange={() => handleAnswerChange(index, option, 'MULTI')}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
          </div>
        ))}

        <div className="text-center mt-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
