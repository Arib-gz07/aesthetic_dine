import type { APIRoute } from 'astro';

type IntakeFile = {
  field: string;
  name: string;
  mimeType: string;
  data: string;
};

type IntakeBody = {
  action?: 'create' | 'upload';
  restaurantName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  cuisine?: string;
  preferredSlug?: string;
  theme?: string;
  plan?: string;
  description?: string;
  specialRequests?: string;
  folderId?: string;
  file?: IntakeFile;
  files?: IntakeFile[];
};

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function required(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function estimateDecodedBytes(base64: string) {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function validateFile(file: IntakeFile | undefined) {
  if (!file?.name || !file?.data || !file?.mimeType) {
    return { error: 'Missing file data.' };
  }
  if (!ALLOWED_MIME.has(file.mimeType)) {
    return { error: `Unsupported file type: ${file.name}. Use JPG, PNG, WebP, or PDF.` };
  }
  if (estimateDecodedBytes(file.data) > MAX_FILE_BYTES) {
    return { error: `${file.name} is too large. Max size is 10 MB per file.` };
  }
  return {
    file: {
      field: file.field || 'file',
      name: file.name,
      mimeType: file.mimeType,
      data: file.data,
    } satisfies IntakeFile,
  };
}

/**
 * Temporary demo intake — Sheets/Drive are disconnected while we migrate to Vercel.
 * Reconnect Google in a later step.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as IntakeBody;
    const action = body.action || 'create';

    if (action === 'upload') {
      if (!required(body.folderId)) {
        return new Response(JSON.stringify({ error: 'Missing upload folder.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const checked = validateFile(body.file);
      if ('error' in checked && checked.error) {
        return new Response(JSON.stringify({ error: checked.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('Intake demo upload:', checked.file!.name);
      return new Response(JSON.stringify({ ok: true, uploaded: checked.file!.name }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (
      !required(body.restaurantName) ||
      !required(body.ownerName) ||
      !required(body.phone) ||
      !required(body.email) ||
      !required(body.cuisine) ||
      !required(body.preferredSlug) ||
      !required(body.description)
    ) {
      return new Response(JSON.stringify({ error: 'Please fill in all required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orderPayload = {
      restaurant_name: body.restaurantName!.trim(),
      owner_name: body.ownerName!.trim(),
      phone: body.phone!.trim(),
      email: body.email!.trim(),
      cuisine: body.cuisine!.trim(),
      preferred_slug: body.preferredSlug!.trim().toLowerCase(),
      theme: (body.theme || 'warm').trim(),
      plan: (body.plan || 'starter').trim(),
      description: body.description!.trim(),
      special_requests: (body.specialRequests || '').trim(),
    };

    console.log('Intake demo create:', orderPayload);

    return new Response(
      JSON.stringify({
        ok: true,
        folderId: 'demo-folder',
        message:
          'Thank you! We received your request (demo mode — Google Sheets/Drive not connected yet).',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Intake error:', err);
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
