import client from './client';

const PAGE_SIZE = 40;

export const getVisitorsAPI = (params: {
  startIndex?: number;
  query?: string;
  leadStatus?: string;
}) => {
  const { startIndex = 0, query, leadStatus } = params;
  return client.get('/visitor', {
    params: {
      startIndex,
      endIndex: PAGE_SIZE,
      ...(query && { q: query }),
      ...(leadStatus && { leadStatus }),
    },
  });
};

export const addVisitorAPI = (body: Record<string, unknown>) => {
  const { _id, ...rest } = body;
  return client.post('/visitor', rest);
};

export const updateVisitorAPI = (body: Record<string, unknown>) =>
  client.put('/visitor', body);

export const deleteVisitorAPI = (visitorId: string) =>
  client.delete('/visitor', { params: { visitorId } });
