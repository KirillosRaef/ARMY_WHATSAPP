import { Elysia } from 'elysia';
import path from 'path';

export const audioRoute = new Elysia();

const AUDIO_DIR = 'attachments/audio';

audioRoute
  .onError((e) => {
    console.error('audioRoute error:', e);
  })
  .group('api/attachment', (app) =>
    app
      .post('/audio/upload', async ({ body }: { body: any }) => {
        try {
          await Bun.$`mkdir -p ${AUDIO_DIR}`.nothrow();

          const file = body.file as File;
          if (!file || !(file instanceof File)) {
            return { success: false, error: 'No audio file uploaded' };
          }

          const ext = path.extname(file.name) || '.webm';
          const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = `${AUDIO_DIR}/${uniqueName}`;

          await Bun.write(filePath, file);

          return {
            success: true,
            fileName: uniqueName,
            fileSize: file.size,
          };
        } catch (error) {
          console.error('Audio upload error:', error);
          return { success: false, error: 'Failed to upload audio' };
        }
      })
      .get('/audio/:filename', async ({ params }) => {
        const { filename } = params;
        const filePath = `${AUDIO_DIR}/${filename}`;
        const file = Bun.file(filePath);

        return new Response(file.stream(), {
          headers: {
            'Content-Type': file.type || 'audio/webm',
            'Cache-Control': 'no-cache, must-revalidate',
          },
        });
      })
  );
