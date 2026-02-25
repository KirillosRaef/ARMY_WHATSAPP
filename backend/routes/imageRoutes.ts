import { Elysia } from 'elysia';

export const imageRoutes = new Elysia();

// Upload endpoint
  imageRoutes
    .onError((e) => {
      console.log(e);
    })
  .group('api/image', (serialNumberRoutes) =>
    serialNumberRoutes
      .post('/upload', async ({ body }: { body: any }) => {
        try {
          // const uploadDir = 'images/serial-numbers';
          const uploadDir = body.uploadDir;
          await Bun.$`mkdir -p ${uploadDir}`.nothrow();

          const file =  body.imageFile as File;

          if (!file) {
            return { success: false, error: 'No file uploaded' };
          }

          const filePath = `${uploadDir}/${file.name}`;

          await Bun.write(filePath, file);

          return {
            success: true,
            fileUrl: `${uploadDir}/${file.name}`,
            fileName: file.name,
            fileSize: file.size,
          };
        } catch (error) {
          console.error('Upload error:', error);
          return { success: false, error: 'Failed to upload file' };
        }
    })
  );
