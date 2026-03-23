/**
 * Tests for src/app/api/testimonials/upload-video/route.ts
 *
 * Strategy: mock all I/O boundaries (Supabase clients, rate limiter, Next.js
 * cookies) and drive the route handler with realistic FormData payloads.
 * Each test group targets one decision branch so a regression in that branch
 * produces exactly one failing test.
 *
 * Magic byte reference (from route source):
 *   MP4:  bytes[4..7] === 'ftyp'  (0x66 0x74 0x79 0x70)
 *   WebM: bytes[0..3] === EBML    (0x1A 0x45 0xDF 0xA3)
 *   Ogg:  bytes[0..3] === 'OggS'  (0x4F 0x67 0x67 0x53)
 *   JPEG: bytes[0..2] === FF D8 FF
 *
 * PLANS.free.videoLimit === 0, so a free user with count >= 0 is blocked.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Shared mock state ────────────────────────────────────────────────────────

// Supabase server client (anon, used for form lookup)
const mockFormSelect = vi.fn();
const mockServerClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: mockFormSelect,
      })),
    })),
  })),
};

// Supabase admin client (service role, used for sub + count + storage)
const mockSubSelect = vi.fn();
const mockCountSelect = vi.fn();
const mockStorageUpload = vi.fn();
const mockStorageGetPublicUrl = vi.fn();
const mockCreateBucket = vi.fn();
const mockUpdateBucket = vi.fn();

// Each `adminClient.from(table)` call returns the right mock chain depending
// on which table is queried. The route calls both 'subscriptions' and
// 'testimonials' in parallel via Promise.all.
const adminFromImpl = vi.fn((table: string) => {
  if (table === 'subscriptions') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: mockSubSelect })),
      })),
    };
  }
  // testimonials count query (head: true)
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        not: vi.fn(() => mockCountSelect()),
      })),
    })),
  };
});

const mockAdminClient = {
  from: adminFromImpl,
  storage: {
    createBucket: mockCreateBucket,
    updateBucket: mockUpdateBucket,
    from: vi.fn(() => ({
      upload: mockStorageUpload,
      getPublicUrl: mockStorageGetPublicUrl,
    })),
  },
};

// Rate limiter
const mockRateLimiterCheck = vi.fn();

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => mockServerClient),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

// next/headers must exist for createServerSupabaseClient to not crash
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

vi.mock('@/lib/ratelimit', () => ({
  createRateLimiter: vi.fn(() => ({ check: mockRateLimiterCheck })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

// ─── Import route AFTER mocks are in place ────────────────────────────────────

const { POST } = await import('@/app/api/testimonials/upload-video/route');

// ─── Test helpers ─────────────────────────────────────────────────────────────

const VALID_FORM_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/** Build a 12-byte buffer with magic bytes for the given format. */
function makeVideoBuffer(format: 'mp4' | 'webm' | 'ogg' | 'garbage'): Uint8Array {
  const buf = new Uint8Array(12);
  if (format === 'mp4') {
    // ftyp box at bytes 4–7
    buf[4] = 0x66; buf[5] = 0x74; buf[6] = 0x79; buf[7] = 0x70;
  } else if (format === 'webm') {
    buf[0] = 0x1A; buf[1] = 0x45; buf[2] = 0xDF; buf[3] = 0xA3;
  } else if (format === 'ogg') {
    buf[0] = 0x4F; buf[1] = 0x67; buf[2] = 0x67; buf[3] = 0x53;
  }
  // 'garbage': all zeros, matches none of the magic byte patterns
  return buf;
}

/** Build a 3-byte JPEG magic header followed by padding. */
function makeJpegBuffer(sizeBytes = 100): Uint8Array {
  const buf = new Uint8Array(sizeBytes);
  buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF;
  return buf;
}

function makeRequest(formData: FormData, headers: Record<string, string> = {}): NextRequest {
  const req = new NextRequest('http://localhost/api/testimonials/upload-video', {
    method: 'POST',
    body: formData,
    headers,
  });
  return req;
}

/** Build a minimal valid FormData with a real video file payload. */
function makeValidFormData(format: 'mp4' | 'webm' | 'ogg' = 'mp4', options: {
  mimeOverride?: string;
  sizeBytes?: number;
} = {}): FormData {
  const fd = new FormData();
  const buf = makeVideoBuffer(format);
  // Pad to requested size by creating a larger buffer with correct magic bytes
  const finalBuf = options.sizeBytes
    ? (() => {
        const b = new Uint8Array(options.sizeBytes);
        b.set(buf);
        return b;
      })()
    : buf;
  const mime = options.mimeOverride ?? (format === 'mp4' ? 'video/mp4' : format === 'webm' ? 'video/webm' : 'video/ogg');
  fd.append('video', new File([finalBuf], `test.${format}`, { type: mime }));
  fd.append('formId', VALID_FORM_ID);
  return fd;
}

/** Wire up the "happy path" mocks: rate limiter passes, form found, pro plan, storage succeeds. */
function setupHappyPath() {
  mockRateLimiterCheck.mockResolvedValue(true);
  mockFormSelect.mockResolvedValue({
    data: { id: VALID_FORM_ID, project_id: 'proj-1', user_id: 'user-1' },
    error: null,
  });
  mockSubSelect.mockResolvedValue({ data: { plan: 'pro' }, error: null });
  mockCountSelect.mockResolvedValue({ count: 0, error: null });
  mockCreateBucket.mockResolvedValue({ error: null });
  mockStorageUpload.mockResolvedValue({ error: null });
  mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/video.mp4' } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('upload-video route: rate limiting', () => {
  it('should return 429 when rate limit is exceeded', async () => {
    mockRateLimiterCheck.mockResolvedValue(false);
    const fd = makeValidFormData();
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many/i);
  });

  it('should proceed when rate limit allows the request', async () => {
    setupHappyPath();
    const fd = makeValidFormData('mp4');
    const res = await POST(makeRequest(fd));
    // Should not be 429
    expect(res.status).not.toBe(429);
  });
});

describe('upload-video route: input validation', () => {
  beforeEach(() => { mockRateLimiterCheck.mockResolvedValue(true); });

  it('should return 400 when video field is missing', async () => {
    const fd = new FormData();
    fd.append('formId', VALID_FORM_ID);
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
  });

  it('should return 400 when formId field is missing', async () => {
    const buf = makeVideoBuffer('mp4');
    const fd = new FormData();
    fd.append('video', new File([buf], 'v.mp4', { type: 'video/mp4' }));
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(400);
  });

  it('should return 400 when formId is not a valid UUID', async () => {
    const buf = makeVideoBuffer('mp4');
    const fd = new FormData();
    fd.append('video', new File([buf], 'v.mp4', { type: 'video/mp4' }));
    fd.append('formId', 'not-a-uuid');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(400);
  });

  it('should return 400 for a non-video MIME type', async () => {
    const buf = makeVideoBuffer('mp4');
    const fd = new FormData();
    fd.append('video', new File([buf], 'v.mp4', { type: 'image/png' }));
    fd.append('formId', VALID_FORM_ID);
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid file type/i);
  });

  it('should accept application/octet-stream MIME (iOS Safari blob serialization)', async () => {
    setupHappyPath();
    const fd = makeValidFormData('mp4', { mimeOverride: 'application/octet-stream' });
    const res = await POST(makeRequest(fd));
    // Passes MIME check; should not return 400 for MIME reason
    expect(res.status).not.toBe(400);
  });

  it('should return 400 when file exceeds 100 MB', async () => {
    // NextRequest.formData() re-creates File objects from serialized bytes,
    // so Object.defineProperty(.size) is lost after body parsing. We must mock
    // formData() on the request to return a File-like object with the large size.
    const bigFile = { type: 'video/mp4', size: 101 * 1024 * 1024, name: 'big.mp4' };
    const req = {
      headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
      formData: async () => ({
        get: (key: string) => key === 'video' ? bigFile : VALID_FORM_ID,
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/too large/i);
  });

  it('should allow a file at exactly 100 MB (boundary value)', async () => {
    setupHappyPath();
    // Same technique: mock formData() to return exact-boundary size with real magic bytes
    const exactFile = {
      type: 'video/mp4',
      size: 100 * 1024 * 1024,
      name: 'exact.mp4',
      arrayBuffer: async () => makeVideoBuffer('mp4').buffer,
    };
    const req = {
      headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
      formData: async () => ({
        get: (key: string) => {
          if (key === 'video') return exactFile;
          if (key === 'formId') return VALID_FORM_ID;
          return null;
        },
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).not.toBe(400);
  });
});

describe('upload-video route: form lookup', () => {
  beforeEach(() => { mockRateLimiterCheck.mockResolvedValue(true); });

  it('should return 404 when form does not exist', async () => {
    mockFormSelect.mockResolvedValue({ data: null, error: { message: 'No rows' } });
    const fd = makeValidFormData();
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/form not found/i);
  });

  it('should return 404 when form query returns no data without error', async () => {
    mockFormSelect.mockResolvedValue({ data: null, error: null });
    const fd = makeValidFormData();
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(404);
  });
});

describe('upload-video route: subscription and plan checks', () => {
  beforeEach(() => {
    mockRateLimiterCheck.mockResolvedValue(true);
    mockFormSelect.mockResolvedValue({
      data: { id: VALID_FORM_ID, project_id: 'proj-1', user_id: 'user-1' },
      error: null,
    });
  });

  it('should return 403 with limitReached when user is on free plan (videoLimit is 0)', async () => {
    // Free plan: videoLimit === 0, any count >= 0 triggers the block
    mockSubSelect.mockResolvedValue({ data: { plan: 'free' }, error: null });
    mockCountSelect.mockResolvedValue({ count: 0, error: null });
    const fd = makeValidFormData();
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.limitReached).toBe(true);
  });

  it('should return 403 when subscription row does not exist (treated as free)', async () => {
    mockSubSelect.mockResolvedValue({ data: null, error: null });
    mockCountSelect.mockResolvedValue({ count: 0, error: null });
    const fd = makeValidFormData();
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.limitReached).toBe(true);
  });

  it('should return 403 when subscription query returns an error (no rows = treated as free)', async () => {
    // When subRes has error, subRes.data is null → isFree = true
    mockSubSelect.mockResolvedValue({ data: null, error: { message: 'no rows' } });
    mockCountSelect.mockResolvedValue({ count: 0, error: null });
    const fd = makeValidFormData();
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.limitReached).toBe(true);
  });

  it('should return 500 when video count query fails', async () => {
    mockSubSelect.mockResolvedValue({ data: { plan: 'pro' }, error: null });
    mockCountSelect.mockResolvedValue({ count: null, error: { message: 'DB error' } });
    const fd = makeValidFormData();
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(500);
  });

  it('should allow a pro user to upload video', async () => {
    mockSubSelect.mockResolvedValue({ data: { plan: 'pro' }, error: null });
    mockCountSelect.mockResolvedValue({ count: 99, error: null });
    mockCreateBucket.mockResolvedValue({ error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/v.mp4' } });
    const fd = makeValidFormData('mp4');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBeTruthy();
  });

  it('should allow a studio user to upload video', async () => {
    mockSubSelect.mockResolvedValue({ data: { plan: 'studio' }, error: null });
    mockCountSelect.mockResolvedValue({ count: 10, error: null });
    mockCreateBucket.mockResolvedValue({ error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/v.mp4' } });
    const fd = makeValidFormData('webm');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
  });
});

describe('upload-video route: magic byte validation', () => {
  beforeEach(() => {
    mockRateLimiterCheck.mockResolvedValue(true);
    mockFormSelect.mockResolvedValue({
      data: { id: VALID_FORM_ID, project_id: 'proj-1', user_id: 'user-1' },
      error: null,
    });
    mockSubSelect.mockResolvedValue({ data: { plan: 'pro' }, error: null });
    mockCountSelect.mockResolvedValue({ count: 0, error: null });
    mockCreateBucket.mockResolvedValue({ error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/v.mp4' } });
  });

  it('should accept an MP4 file (ftyp magic bytes at offset 4)', async () => {
    const fd = makeValidFormData('mp4');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
  });

  it('should accept a WebM file (EBML header magic bytes at offset 0)', async () => {
    const fd = makeValidFormData('webm');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
  });

  it('should accept an Ogg file (OggS magic bytes at offset 0)', async () => {
    const fd = makeValidFormData('ogg');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
  });

  it('should return 400 for random bytes that match no video format', async () => {
    const fd = makeValidFormData('garbage' as 'mp4'); // type cast; buffer has no magic bytes
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid video file/i);
  });

  it('should reject a JPEG file even when sent with video/mp4 MIME (magic byte mismatch)', async () => {
    const jpegBuf = makeJpegBuffer(12);
    const fd = new FormData();
    fd.append('video', new File([jpegBuf], 'fake.mp4', { type: 'video/mp4' }));
    fd.append('formId', VALID_FORM_ID);
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid video file/i);
  });

  it('should derive extension from magic bytes, not client MIME (octet-stream + MP4 bytes → mp4)', async () => {
    const fd = makeValidFormData('mp4', { mimeOverride: 'application/octet-stream' });
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    // The upload should have been called with video/mp4 content type, not octet-stream
    const uploadCall = mockStorageUpload.mock.calls[0];
    expect(uploadCall[2].contentType).toBe('video/mp4');
  });
});

describe('upload-video route: storage bucket self-healing', () => {
  beforeEach(() => {
    mockRateLimiterCheck.mockResolvedValue(true);
    mockFormSelect.mockResolvedValue({
      data: { id: VALID_FORM_ID, project_id: 'proj-1', user_id: 'user-1' },
      error: null,
    });
    mockSubSelect.mockResolvedValue({ data: { plan: 'pro' }, error: null });
    mockCountSelect.mockResolvedValue({ count: 0, error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/v.mp4' } });
  });

  it('should call createBucket on the first attempt', async () => {
    mockCreateBucket.mockResolvedValue({ error: null });
    const fd = makeValidFormData('mp4');
    await POST(makeRequest(fd));
    expect(mockCreateBucket).toHaveBeenCalledWith('testimonial-videos', { public: true });
  });

  it('should fall back to updateBucket when createBucket throws (bucket already exists)', async () => {
    // createBucket rejects → catch calls updateBucket
    mockCreateBucket.mockRejectedValue(new Error('bucket already exists'));
    mockUpdateBucket.mockResolvedValue({ error: null });
    const fd = makeValidFormData('mp4');
    const res = await POST(makeRequest(fd));
    expect(mockUpdateBucket).toHaveBeenCalledWith('testimonial-videos', { public: true });
    // Upload should still proceed after bucket fallback
    expect(res.status).toBe(200);
  });

  it('should return 500 when the actual video upload to storage fails', async () => {
    mockCreateBucket.mockResolvedValue({ error: null });
    mockStorageUpload.mockResolvedValue({ error: { message: 'Storage quota exceeded' } });
    const fd = makeValidFormData('mp4');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/storage upload failed/i);
  });
});

describe('upload-video route: successful upload response', () => {
  beforeEach(() => {
    setupHappyPath();
  });

  it('should return { url, thumbnailUrl: null } when no thumbnail is provided', async () => {
    const fd = makeValidFormData('mp4');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://cdn.example.com/video.mp4');
    expect(body.thumbnailUrl).toBeNull();
  });

  it('should return the public URL for the uploaded video', async () => {
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/specific-path.webm' } });
    const fd = makeValidFormData('webm');
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://cdn.example.com/specific-path.webm');
  });
});

describe('upload-video route: thumbnail handling', () => {
  beforeEach(() => {
    setupHappyPath();
    // For tests that add a thumbnail, getPublicUrl is called twice: once for
    // the video and once for the thumbnail. Use a counter to return different URLs.
    let callCount = 0;
    mockStorageGetPublicUrl.mockImplementation(() => {
      callCount++;
      return {
        data: {
          publicUrl: callCount === 1
            ? 'https://cdn.example.com/video.mp4'
            : 'https://cdn.example.com/thumb.jpg',
        },
      };
    });
  });

  it('should include thumbnailUrl in response when valid JPEG thumbnail is provided', async () => {
    const fd = makeValidFormData('mp4');
    const jpegBuf = makeJpegBuffer(500);
    fd.append('thumbnail', new File([jpegBuf], 'thumb.jpg', { type: 'image/jpeg' }));
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.thumbnailUrl).toBe('https://cdn.example.com/thumb.jpg');
  });

  it('should silently skip thumbnail and still return video URL when thumbnail exceeds 5 MB', async () => {
    // NextRequest re-parses body bytes, so we mock formData() directly to get
    // a thumbnail File-like object with a size above the 5MB threshold.
    const videoFile = new File([makeVideoBuffer('mp4')], 'v.mp4', { type: 'video/mp4' });
    const bigThumb = { type: 'image/jpeg', size: 5 * 1024 * 1024 + 1, name: 'big-thumb.jpg' };
    const req = {
      headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
      formData: async () => ({
        get: (key: string) => {
          if (key === 'video') return videoFile;
          if (key === 'formId') return VALID_FORM_ID;
          if (key === 'thumbnail') return bigThumb;
          return null;
        },
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBeTruthy();
    expect(body.thumbnailUrl).toBeNull();
    expect(mockStorageUpload).toHaveBeenCalledTimes(1); // video only
  });

  it('should silently skip thumbnail when magic bytes are not JPEG (non-JPEG image data)', async () => {
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    const pngBuffer = new Uint8Array(12);
    pngBuffer[0] = 0x89; pngBuffer[1] = 0x50; pngBuffer[2] = 0x4E; pngBuffer[3] = 0x47;
    const fd = makeValidFormData('mp4');
    fd.append('thumbnail', new File([pngBuffer], 'thumb.png', { type: 'image/png' }));
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.thumbnailUrl).toBeNull();
    expect(mockStorageUpload).toHaveBeenCalledTimes(1); // video only, no thumb upload
  });

  it('should still return video URL when thumbnail storage upload fails', async () => {
    // First upload (video) succeeds, second upload (thumbnail) fails
    mockStorageUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'thumb upload failed' } });
    const fd = makeValidFormData('mp4');
    const jpegBuf = makeJpegBuffer(500);
    fd.append('thumbnail', new File([jpegBuf], 'thumb.jpg', { type: 'image/jpeg' }));
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBeTruthy();
    expect(body.thumbnailUrl).toBeNull(); // thumb upload failed, so null
  });

  it('should skip thumbnail entirely when thumbnail field is absent', async () => {
    const fd = makeValidFormData('mp4');
    // No thumbnail appended
    const res = await POST(makeRequest(fd));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.thumbnailUrl).toBeNull();
    expect(mockStorageUpload).toHaveBeenCalledTimes(1);
  });
});
