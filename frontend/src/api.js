import { supabase } from './supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const request = async (method, path, body = null) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
  };
  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);
  return fetch(`${API_URL}${path}`, options);
};

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};
