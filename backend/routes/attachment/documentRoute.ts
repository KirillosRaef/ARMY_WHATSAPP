import { Elysia } from 'elysia';
import path from 'path';

export const documentRoute = new Elysia();

const DOC_DIR = 'attachments/documents';

documentRoute
  .onError((e) => {
    console.error('documentRoute error:', e);
  })
  .group('api/attachment', (app) =>
    app
      .post('/document/upload', async ({ body }: { body: any }) => {
        try {
          await Bun.$`mkdir -p ${DOC_DIR}`.nothrow();

          const file = body.file as File;
          if (!file || !(file instanceof File)) {
            return { success: false, error: 'No document file uploaded' };
          }

          const ext = path.extname(file.name) || '.pdf';
          const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = `${DOC_DIR}/${uniqueName}`;

          await Bun.write(filePath, file);

          return {
            success: true,
            fileName: uniqueName,
            originalName: file.name,
            fileSize: file.size,
          };
        } catch (error) {
          console.error('Document upload error:', error);
          return { success: false, error: 'Failed to upload document' };
        }
      })
      .get('/document/:filename', async ({ params, set }) => {
        const { filename } = params;
        const filePath = `${DOC_DIR}/${filename}`;
        const file = Bun.file(filePath);

        // Guess content type from extension
        const ext = path.extname(filename).toLowerCase();
        const contentType =
          ext === '.pdf'
            ? 'application/pdf'
            : ext === '.doc'
            ? 'application/msword'
            : ext === '.docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : ext === '.pptx'
            ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            : ext === '.ppt'
            ? 'application/vnd.ms-powerpoint'
            : ext === '.xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : ext === '.xls'
            ? 'application/vnd.ms-excel'
            : ext === '.csv'
            ? 'text/csv'
            : 'application/octet-stream';

        return new Response(file.stream(), {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache, must-revalidate',
          },
        });
      })
  );
