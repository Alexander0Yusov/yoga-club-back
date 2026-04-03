export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  // Example URL: https://res.cloudinary.com/demo/image/upload/v12345678/folder/image_id.jpg
  // Matches everything after /upload/ (skipping version like v12345678/) until the extension
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
