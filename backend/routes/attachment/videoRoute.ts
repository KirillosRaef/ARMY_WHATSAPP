import { Elysia } from 'elysia';
import path from 'path';

export const videoRoute = new Elysia();

const VIDEO_DIR = 'attachments/videos';

videoRoute
  .onError((e) => {
    console.error('videoRoute error:', e);
  })
  .group('api/attachment', (app) =>
    app
      .post('/video/upload', async ({ body }: { body: any }) => {
        try {
          await Bun.$`mkdir -p ${VIDEO_DIR}`.nothrow();

          const file = body.file as File;
          if (!file || !(file instanceof File)) {
            return { success: false, error: 'No video file uploaded' };
          }

          const ext = path.extname(file.name) || '.mp4';
          const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = `${VIDEO_DIR}/${uniqueName}`;

          await Bun.write(filePath, file);

          return {
            success: true,
            fileName: uniqueName,
            originalName: file.name,
            fileSize: file.size,
          };
        } catch (error) {
          console.error('Video upload error:', error);
          return { success: false, error: 'Failed to upload video' };
        }
      })
      .get('/video/:filename', async ({ params }) => {
        const { filename } = params;
        const filePath = `${VIDEO_DIR}/${filename}`;
        const file = Bun.file(filePath);

        // Guess content type from extension
        const ext = path.extname(filename).toLowerCase();
        const contentTypes: Record<string, string> = {
          '.mp4': 'video/mp4',
          '.webm': 'video/webm',
          '.mov': 'video/quicktime',
          '.avi': 'video/x-msvideo',
          '.mkv': 'video/x-matroska',
        };
        const contentType = contentTypes[ext] || 'video/mp4';

        return new Response(file.stream(), {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, must-revalidate',
          },
        });
      })
  );
