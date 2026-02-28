import { error } from 'better-auth/api';
import { Elysia, t } from 'elysia';

export const imageRoutes = new Elysia();

// Upload endpoint
  imageRoutes
    .onError((e) => {
      console.log(e);
    })
  .group('api/image', (imageRoutes) =>
    imageRoutes
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
      .get('/:type/:filename', async ({ params, set }) => {
        const { type, filename } = params;   
  
        const filePath = `images/${type}/${filename}`;
        const file = Bun.file(filePath);

        return new Response(file.stream(), {
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      })
    .get('/logos', async () => {
      const logos = await Bun.$`ls images/logos`.text();
      return logos.split('\n').filter(Boolean);
    })
      .delete('/logos', async ({ body: { brands } }) => {
              const filePath = `images/logos`;
              for (const brand of brands) {
                await Bun.$`rm -f ${filePath}/${brand}`.nothrow();
              }
              // return { filePath, brands };
            },
            {
              body: t.Object({
                brands: t.Array(t.String()),
              }),
            },
          )
  );
