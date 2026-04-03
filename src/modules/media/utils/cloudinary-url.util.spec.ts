import { extractPublicIdFromUrl } from './cloudinary-url.util';

describe('cloudinary-url.util', () => {
  it('should extract public_id from a standard Cloudinary URL', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v12345678/folder/image_id.jpg';
    expect(extractPublicIdFromUrl(url)).toBe('folder/image_id');
  });

  it('should extract public_id from a URL without folder', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v12345678/image_id.png';
    expect(extractPublicIdFromUrl(url)).toBe('image_id');
  });

  it('should extract public_id from a URL without version', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/folder/image_id.webp';
    expect(extractPublicIdFromUrl(url)).toBe('folder/image_id');
  });

  it('should return null for non-Cloudinary URL', () => {
    const url = 'https://example.com/image.jpg';
    expect(extractPublicIdFromUrl(url)).toBeNull();
  });

  it('should return null for empty URL', () => {
    expect(extractPublicIdFromUrl('')).toBeNull();
  });
});
