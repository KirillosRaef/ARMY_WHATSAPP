import { Elysia } from 'elysia';
import path from 'path';

export const imageRoute = new Elysia();

const IMAGE_DIR = 'attachments/images';

imageRoute
  .onError((e) => {
    console.error('imageRoute error:', e);
  })
  .group('api/attachment', (app) =>
    app
      .post('/image/upload', async ({ body }: { body: any }) => {
        try {
          await Bun.$`mkdir -p ${IMAGE_DIR}`.nothrow();

          const file = body.file as File;
          if (!file || !(file instanceof File)) {
            return { success: false, error: 'No image file uploaded' };
          }

          // Unique filename to avoid collisions
          const ext = path.extname(file.name) || '.png';
          const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = `${IMAGE_DIR}/${uniqueName}`;

          await Bun.write(filePath, file);

          return {
            success: true,
            fileName: uniqueName,
            fileSize: file.size,
          };
        } catch (error) {
          console.error('Image upload error:', error);
          return { success: false, error: 'Failed to upload image' };
        }
      })
      .get('/image/:filename', async ({ params }) => {
        const { filename } = params;
        const filePath = `${IMAGE_DIR}/${filename}`;
        const file = Bun.file(filePath);

        return new Response(file.stream(), {
          headers: {
            'Content-Type': file.type || 'image/png',
            'Cache-Control': 'no-cache, must-revalidate',
          },
        });
      })
  );
