import type { ApiResponse, ListFilesResponse, UploadedFile } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data as T;
}

export async function fetchFiles(prefix: string): Promise<ListFilesResponse> {
  return request<ListFilesResponse>(`/files?prefix=${encodeURIComponent(prefix)}`);
}

export async function downloadFile(key: string): Promise<void> {
  // 直接打开下载链接，避免大文件 blob 中转导致 ERR_CONNECTION_CLOSED
  const downloadUrl = `${API_BASE}/files/download?key=${encodeURIComponent(key)}`;
  window.open(downloadUrl, '_blank');
}

export async function uploadFiles(
  files: File[],
  prefix: string,
  accessCode: string,
  turnstileToken: string,
  onProgress?: (progress: number) => void
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('prefix', prefix);
  for (const file of files) {
    formData.append('files', file);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/files/upload`);
    xhr.setRequestHeader('X-Access-Code', accessCode);
    xhr.setRequestHeader('X-Turnstile-Token', turnstileToken);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const json: ApiResponse<UploadedFile> = JSON.parse(xhr.responseText);
        if (json.success && json.data) {
          resolve(json.data);
        } else {
          reject(new Error(json.error || 'Upload failed'));
        }
      } catch {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export async function deleteFile(key: string, accessCode: string, turnstileToken: string): Promise<void> {
  await request(`/files/delete?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: {
      'X-Access-Code': accessCode,
      'X-Turnstile-Token': turnstileToken,
    },
  });
}

export async function createFolder(name: string, prefix: string, accessCode: string, turnstileToken: string): Promise<void> {
  await request('/folders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Code': accessCode,
      'X-Turnstile-Token': turnstileToken,
    },
    body: JSON.stringify({ name, prefix }),
  });
}

export async function verifyAccessCodeApi(code: string): Promise<{ valid: boolean }> {
  return request('/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
}

export async function verifyTurnstileApi(token: string): Promise<{ valid: boolean }> {
  return request('/turnstile/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export async function getPreviewUrl(key: string): Promise<string> {
  const res = await fetch(`${API_BASE}/files/download?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('Failed to load preview');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}