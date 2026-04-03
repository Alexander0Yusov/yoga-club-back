import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { MediaConfig } from '../media.config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

jest.mock('cloudinary');
jest.mock('streamifier');

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let config: MediaConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: MediaConfig,
          useValue: {
            cloudName: 'test-cloud',
            apiKey: 'test-key',
            apiSecret: 'test-secret',
          },
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    config = module.get<MediaConfig>(MediaConfig);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image and return the secure_url', async () => {
      const mockFile = {
        buffer: Buffer.from('test-buffer'),
      } as Express.Multer.File;

      const mockUploadStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockReturnValue(mockUploadStream);
      (streamifier.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn().mockImplementation((dest) => {
          // Simulate successful upload
          const callback = (cloudinary.uploader.upload_stream as jest.Mock).mock.calls[0][1];
          callback(null, { secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg' });
          return dest;
        }),
      });

      const result = await service.uploadImage(mockFile, 'test-folder');

      expect(result).toBe('https://res.cloudinary.com/test/image/upload/v1/test.jpg');
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'test-folder' },
        expect.any(Function),
      );
    });

    it('should throw if upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('test-buffer'),
      } as Express.Multer.File;

      const mockUploadStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockReturnValue(mockUploadStream);
      (streamifier.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn().mockImplementation((dest) => {
          const callback = (cloudinary.uploader.upload_stream as jest.Mock).mock.calls[0][1];
          callback(new Error('Upload failed'), null);
          return dest;
        }),
      });

      await expect(service.uploadImage(mockFile, 'test-folder')).rejects.toThrow();
    });
  });

  describe('deleteImage', () => {
    it('should delete an image by public_id', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

      await service.deleteImage('test-id');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test-id');
    });

    it('should throw if deletion fails', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteImage('test-id')).rejects.toThrow();
    });
  });
});
