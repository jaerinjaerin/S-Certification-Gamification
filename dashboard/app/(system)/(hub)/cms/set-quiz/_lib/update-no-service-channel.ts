export const updateNoServiceChannel = async (campaignId?: string) => {
  if (!campaignId) return;

  try {
    const response = await fetch(`/api/cms/no_service_channel/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaignId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update no service channel');
    }

    console.log('No service channel updated successfully');
  } catch (error) {
    console.error('Error updating no service channel:', error);
  }
};
