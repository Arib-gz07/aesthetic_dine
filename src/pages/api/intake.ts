import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

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

type AppsScriptResponse = {
  ok?: boolean;
  error?: string;
  folder_id?: string;
  drive_folder_link?: string;
  uploaded?: string;
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

/**
 * Apps Script ContentService returns 302 → echo URL.
 * You must POST the payload to /exec, then GET the Location to read JSON.
 */
async function postToAppsScript(webAppUrl: string, payload: unknown): Promise<AppsScriptResponse> {
  const body = JSON.stringify(payload);

  const postRes = await fetch(webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    redirect: 'manual',
  });

  let text = '';

  if (postRes.status >= 300 && postRes.status < 400) {
    const location = postRes.headers.get('Location');
    if (!location) {
      return { ok: false, error: 'Google Script redirect was missing.' };
    }
    const getRes = await fetch(location, { method: 'GET', redirect: 'follow' });
    text = await getRes.text();
  } else {
    text = await postRes.text();
  }

  try {
    return JSON.parse(text) as AppsScriptResponse;
  } catch {
    console.error('Apps Script non-JSON response:', text.slice(0, 400));
    return {
      ok: false,
      error:
        'Google Script did not return JSON. In Apps Script: Project Settings → show appsscript.json, paste scopes, Deploy new version, then Run authorizeDrive and click Allow for Drive.',
    };
  }
}

function friendlyError(message?: string) {
  if (!message) return 'Failed to save your request. Please try again.';
  if (message.includes('DriveApp') || message.includes('auth/drive') || message.includes('অনুমতি')) {
    return 'Google Drive permission is missing. In Apps Script, select authorizeDrive → Run → Allow (Drive access), then Deploy a new version.';
  }
  return message;
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

function successMessage(fileCount: number) {
  if (fileCount > 0) {
    return `Thanks! We’ve got your restaurant details and ${fileCount} image${fileCount === 1 ? '' : 's'}. We’ll review everything and reach out within 1–2 business days.`;
  }
  return 'Thanks! We’ve got your restaurant details. We’ll review everything and reach out within 1–2 business days.';
}

/** Prefer Cloudflare runtime secrets; fall back to Vite/.env for local dev. */
function getWebAppUrl(): string | undefined {
  const fromRuntime = getSecret('GOOGLE_SHEETS_WEBAPP_URL');
  if (typeof fromRuntime === 'string' && fromRuntime.trim()) return fromRuntime.trim();

  const fromMeta = import.meta.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim();

  return undefined;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as IntakeBody;
    const webAppUrl = getWebAppUrl();
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

      if (!webAppUrl) {
        if (import.meta.env.DEV) {
          return new Response(JSON.stringify({ ok: true, uploaded: checked.file!.name }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({
            error:
              'Form backend is not configured on this server. Set GOOGLE_SHEETS_WEBAPP_URL as a Cloudflare Worker secret, then redeploy.',
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const uploaded = await postToAppsScript(webAppUrl, {
        action: 'upload_file',
        folder_id: body.folderId!.trim(),
        file: checked.file,
      });

      if (!uploaded.ok) {
        return new Response(
          JSON.stringify({
            error: friendlyError(
              uploaded.error ||
                `Uploading "${checked.file!.name}" failed. Authorize Drive in Apps Script.`,
            ),
          }),
          { status: 502, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ ok: true, uploaded: uploaded.uploaded || checked.file!.name }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
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
      action: 'create',
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
      status: 'new',
    };

    if (!webAppUrl) {
      if (import.meta.env.DEV) {
        console.log('Intake demo mode:', orderPayload);
        return new Response(
          JSON.stringify({
            ok: true,
            folderId: 'demo-folder',
            message: 'Thank you! We received your request (demo mode — Sheets URL not configured).',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          error:
            'Form backend is not configured on this server. Set GOOGLE_SHEETS_WEBAPP_URL as a Cloudflare Worker secret, then redeploy.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const created = await postToAppsScript(webAppUrl, orderPayload);
    if (!created.ok || !created.folder_id) {
      return new Response(JSON.stringify({ error: friendlyError(created.error) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Legacy single-shot: create + all files in one request
    const incomingFiles = Array.isArray(body.files) ? body.files : [];
    const uploadedNames: string[] = [];
    for (const rawFile of incomingFiles) {
      const checked = validateFile(rawFile);
      if ('error' in checked && checked.error) {
        return new Response(JSON.stringify({ error: checked.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const uploaded = await postToAppsScript(webAppUrl, {
        action: 'upload_file',
        folder_id: created.folder_id,
        file: checked.file,
      });
      if (!uploaded.ok) {
        return new Response(
          JSON.stringify({
            error: friendlyError(
              uploaded.error ||
                `Order was saved, but uploading "${checked.file!.name}" failed. Authorize Drive in Apps Script.`,
            ),
          }),
          { status: 502, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (uploaded.uploaded) uploadedNames.push(uploaded.uploaded);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        folderId: created.folder_id,
        driveFolderLink: created.drive_folder_link,
        message: successMessage(uploadedNames.length),
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
