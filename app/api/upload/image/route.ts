import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import qiniu from 'qiniu';

// POST /api/upload/image - Upload image to Qiniu
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size === 0) {
            return NextResponse.json(
                { error: 'Empty file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Get Qiniu credentials from environment variables
        const accessKey = process.env.QINIU_ACCESS_KEY;
        const secretKey = process.env.QINIU_SECRET_KEY;
        const bucket = process.env.QINIU_BUCKET;
        const domain = process.env.QINIU_DOMAIN;

        if (!accessKey || !secretKey || !bucket || !domain) {
            console.error('Qiniu credentials not configured');
            return NextResponse.json(
                { error: 'Storage service not configured' },
                { status: 500 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split('.').pop();
        const key = `${folder}/${timestamp}-${randomStr}.${ext}`;

        // Create Qiniu upload token
        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        const options = {
            scope: bucket,
            expires: 3600, // 1 hour
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Qiniu
        // Let the Qiniu SDK resolve the bucket region automatically.
        const config = new qiniu.conf.Config();
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();

        // Upload using promise
        const uploadPromise = new Promise<string>((resolve, reject) => {
            formUploader.put(
                uploadToken,
                key,
                buffer,
                putExtra,
                (err, body, info) => {
                    if (err) {
                        console.error('Qiniu upload error:', err);
                        reject(err);
                        return;
                    }
                    if (info.statusCode === 200) {
                        console.log('Upload successful, key:', body.key);
                        resolve(body.key);
                    } else {
                        console.error('Qiniu upload failed:', { info, body });
                        const bodyMessage =
                            body && typeof body === 'object' && 'error' in body
                                ? String(body.error)
                                : '';
                        const detail = bodyMessage || JSON.stringify(info);
                        reject(new Error(`Upload failed with status ${info.statusCode}: ${detail}`));
                    }
                }
            );
        });

        const uploadedKey = await uploadPromise;

        // Generate public URL (no signature needed for public bucket)
        const url = `${domain}/${uploadedKey}`;
        console.log('Upload successful, URL:', url);

        return NextResponse.json({
            success: true,
            url,
            filename: file.name,
            size: file.size,
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
