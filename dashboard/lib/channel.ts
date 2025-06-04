export function getChannelName(channelId: String): String | undefined {
  const channel = [
    { id: '1', name: 'Carrier(Operator)' },
    { id: '2', name: 'Retail Channel (retailer, pure player and samsung.com)' },
    { id: '3', name: 'Others' },
  ];

  const foundChannel = channel.find((c) => c.id === channelId);
  return foundChannel?.name;
}

export function getChannelSegmentName(channelId: String): String | undefined {
  const channelSegment = [
    { id: '1', name: 'Carrier(Operator)' },
    { id: '2', name: 'Retailer (MM/IT/Traditaionl etc)' },
    { id: '3', name: 'Retailer (Pure plyer)' },
    { id: '4', name: 'samsung.com' },
    { id: '5', name: 'others' },
  ];

  const foundChannelSegment = channelSegment.find((c) => c.id === channelId);
  return foundChannelSegment?.name;
}
