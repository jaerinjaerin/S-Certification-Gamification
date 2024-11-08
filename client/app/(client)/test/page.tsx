'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestPage({ params }: { params: { userId: string } }) {
  const [activities, setActivities] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  console.log('session', session);

  // API 호출 함수
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://samsung.sumtotal.host/api/v1/users/${params.userId}/activities`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(JSON.stringify(data, null, 2)); // 응답 데이터를 JSON 포맷으로 텍스트 필드에 표시
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>User Activities</h1>
      <button onClick={fetchActivities} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Activities'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <textarea
        readOnly
        rows={10}
        cols={50}
        value={activities || 'No activities fetched yet'}
        style={{ marginTop: '1rem', width: '100%' }}
      />
    </div>
  );
}
