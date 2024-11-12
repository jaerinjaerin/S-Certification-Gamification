'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [resultUser, setResultUser] = useState<any | null>(null);
  const [resultActivity, setResultActivity] = useState<any | null>(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sumtotal/user/profile', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile');
      }

      const data = await response.json();

      if (data.organizations.length === 0) {
        setResultUser('Organizations 정보가 없습니다.');
        return;
      }

      const foundPrimaryOrganization = data.organizations.find(
        (org: any) => org.isPrimary
      );
      if (!foundPrimaryOrganization) {
        setResultUser('Primary Organization 정보가 없습니다.');
        return;
      }

      console.log('data', data);
      fetchUserPrimaryOrganization(foundPrimaryOrganization);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPrimaryOrganization = async (organizationrg: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sumtotal/user/org?id=${organizationrg.id}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to fetch user organization'
        );
      }

      const data = await response.json();

      if (data.data?.length === 0) {
        setResultUser('Organization 정보가 없습니다.');
        return;
      }

      console.log('data', data);

      const text9 = data.data[0]?.optionalInfo.text9;
      if (text9 === '4' || text9 === '5' || text9 === '6') {
        setResultUser('Job: FF');
      } else {
        setResultUser('Job: FSM/Other');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // API 호출 함수
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sumtotal/activity', {
        cache: 'no-store',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activities');
      }

      const data = await response.json();
      console.log('fetchActivities data', data);
      setActivities(data.data); // Extract and store activities array
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySelect = (activity: any) => {
    setSelectedActivity(activity);
  };

  const postActivitieRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sumtotal/activity/register', {
        method: 'PUT',
        cache: 'no-store',
        body: JSON.stringify({
          activityId: selectedActivity.activityId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activities');
      }

      const data = await response.json();
      console.log('data', data);
      // setActivities(JSON.stringify(data, null, 2)); // 응답 데이터를 JSON 포맷으로 텍스트 필드에 표시
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const postActivitieEnd = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sumtotal/activity/end', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({
          activityId: selectedActivity.activityId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activities');
      }

      const data = await response.json();
      console.log('data', data);
      if (data.status === 'attended') {
        setResultActivity('Activity의 메달을 획득하였습니다.');
      }
      // setActivities(JSON.stringify(data, null, 2)); // 응답 데이터를 JSON 포맷으로 텍스트 필드에 표시
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setResultActivity(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => signOut()}>Sign out</button>
      <h1>Activity 메달 획득 테스트</h1>
      <h3>유저 정보</h3>
      <ul>
        <li>
          <strong>이름:</strong> {session?.user.name}
        </li>
      </ul>
      <button onClick={fetchUserProfile} disabled={loading}>
        {loading ? 'Loading...' : '유저 Job 정보 조회'}
      </button>
      {resultUser && (
        <div style={{ marginTop: '1rem' }}>
          <p>{resultUser}</p>
        </div>
      )}
      <br />
      <button onClick={fetchActivities} disabled={loading}>
        {loading ? 'Loading...' : 'Activity 목록 조회'}
      </button>

      {activities.length > 0 && (
        <ul
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '0',
            marginTop: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          {activities.map((activity) => (
            <li
              key={activity.activityId}
              style={{ padding: '10px', borderBottom: '1px solid #ddd' }}
            >
              <span>{activity.activityName}</span>
              <button
                onClick={() => handleActivitySelect(activity)}
                style={{ marginLeft: '10px' }}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedActivity && (
        <div style={{ marginTop: '1rem' }}>
          <h2>선택된 Activity</h2>
          <p>
            <strong>Name:</strong> {selectedActivity.activityName}
          </p>
          <p>
            <strong>Type:</strong> {selectedActivity.activityType}
          </p>
          <p>
            <strong>Status:</strong> {selectedActivity.assignmentStatus}
          </p>
        </div>
      )}

      {selectedActivity && selectedActivity.assignmentStatus !== 'Attended' && (
        <>
          <button onClick={postActivitieRegister} disabled={loading}>
            {loading ? 'Loading...' : 'Activity 등록'}
          </button>
          <button onClick={postActivitieEnd} disabled={loading}>
            {loading ? 'Loading...' : 'Activity 종료'}
          </button>
        </>
      )}

      {resultActivity && (
        <div style={{ marginTop: '1rem' }}>
          <h2>결과</h2>
          <p>{resultActivity}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
