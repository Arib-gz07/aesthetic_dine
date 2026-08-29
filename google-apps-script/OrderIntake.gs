/**
 * Aesthetic Dine — Order intake + Drive uploads
 *
 * IMPORTANT — grant Drive permission once:
 * 1. In the Apps Script editor, select function: authorizeDrive
 * 2. Click Run ▶
 * 3. Review permissions → Allow (must include Google Drive)
 * 4. Deploy → Manage deployments → Edit → New version → Deploy
 */

const SHEET_NAME = 'Sheet1';
const PARENT_FOLDER_ID = '1LHwHXPc235qV5BdOO66nSjyD3vk2qo6D';

/** Run this once from the editor to trigger the Drive permission popup. */
function authorizeDrive() {
  const folder = DriveApp.getFolderById(PARENT_FOLDER_ID);
  Logger.log('Drive OK: ' + folder.getName());
}

function doPost(e) {
  try {
    const raw = e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    if (data.action === 'upload_file') {
      return uploadFile_(data);
    }

    return createOrder_(data);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Aesthetic Dine intake + Drive upload is running.' });
}

function createOrder_(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return json_({ ok: false, error: 'Sheet not found: ' + SHEET_NAME });
  }

  const folderName = sanitizeFolderName_(
    data.preferred_slug || data.restaurant_name || 'unnamed-restaurant',
  );
  const folder = getOrCreateFolder_(PARENT_FOLDER_ID, folderName);

  sheet.appendRow([
    new Date().toISOString(),
    data.restaurant_name || '',
    data.owner_name || '',
    data.phone || '',
    data.email || '',
    data.cuisine || '',
    data.preferred_slug || '',
    data.theme || '',
    data.plan || '',
    data.description || '',
    data.special_requests || '',
    folder.getUrl(),
    data.status || 'new',
    '',
  ]);

  return json_({
    ok: true,
    folder_id: folder.getId(),
    drive_folder_link: folder.getUrl(),
  });
}

function uploadFile_(data) {
  if (!data.folder_id || !data.file || !data.file.data) {
    return json_({ ok: false, error: 'Missing folder_id or file.' });
  }

  const mime = data.file.mimeType || 'application/octet-stream';
  if (!isAllowedMime_(mime)) {
    return json_({ ok: false, error: 'Unsupported file type: ' + mime });
  }

  const folder = DriveApp.getFolderById(data.folder_id);
  const blob = Utilities.newBlob(
    Utilities.base64Decode(data.file.data),
    mime,
    safeFileName_(data.file.name || 'upload'),
  );
  folder.createFile(blob);

  return json_({ ok: true, uploaded: blob.getName() });
}

function getOrCreateFolder_(parentId, name) {
  const parent = DriveApp.getFolderById(parentId);
  const existing = parent.getFoldersByName(name);
  if (existing.hasNext()) {
    return existing.next();
  }
  return parent.createFolder(name);
}

function isAllowedMime_(mime) {
  return (
    mime === 'image/jpeg' ||
    mime === 'image/png' ||
    mime === 'image/webp' ||
    mime === 'image/gif' ||
    mime === 'application/pdf'
  );
}

function sanitizeFolderName_(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'unnamed-restaurant'
  );
}

function safeFileName_(name) {
  return String(name).replace(/[\\/]+/g, '-').slice(0, 120);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
