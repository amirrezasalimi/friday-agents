const getFullUrl = (path: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return path;
};

export const SEARCH_API_URL = getFullUrl('/api/search');
export const CHAT_API_URL = getFullUrl('/api/chat');