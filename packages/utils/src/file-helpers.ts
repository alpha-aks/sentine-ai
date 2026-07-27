export function getFileExtension(filename: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()!.toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${size} ${units[i]}`;
}

export function isAllowedExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = getFileExtension(filename);
  return allowedExtensions.map(e => e.toLowerCase().replace(/^\./, '')).includes(ext);
}

export function mimeTypeFromExtension(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    json: 'application/json',
    txt: 'text/plain',
    csv: 'text/csv'
  };
  return mimeMap[ext] || 'application/octet-stream';
}

export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  return filename
    .trim()
    .replace(/[/\?<>\\:*|":]/g, '_')
    .replace(/[\s]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  return isAllowedExtension(filename, imageExtensions);
}

export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['mp4', 'webm', 'ogv', 'mov', 'avi', 'mkv'];
  return isAllowedExtension(filename, videoExtensions);
}

export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
  return isAllowedExtension(filename, audioExtensions);
}

export function isDocumentFile(filename: string): boolean {
  const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  return isAllowedExtension(filename, docExtensions);
}
