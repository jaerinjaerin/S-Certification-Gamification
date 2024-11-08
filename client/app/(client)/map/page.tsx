'use client';

export default function QuizMap() {
  const routeQuiz = () => {
    window.location.href = '/quiz';
  };

  return (
    <div>
      <h1>Map</h1>
      <button onClick={routeQuiz}>Go Quiz</button>
    </div>
  );
}
