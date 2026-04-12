import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import qiniu from 'qiniu';

type UploadOutcome = {
    bucket: 'qiniu' | 'supabase';
    url?: string;
    error?: string;
};

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
        const supabaseEndpoint = process.env.SUPABASE_S3_ENDPOINT;
        const supabaseBucket = process.env.SUPABASE_S3_BUCKET;
        const supabaseAccessKey = process.env.SUPABASE_S3_ACCESS_KEY;
        const supabaseSecretKey = process.env.SUPABASE_S3_SECRET_KEY;
        const supabaseRegion = process.env.SUPABASE_S3_REGION || 'us-east-1';

        const qiniuConfigured = Boolean(accessKey && secretKey && bucket && domain);
        const supabaseConfigured = Boolean(
            supabaseEndpoint &&
            supabaseBucket &&
            supabaseAccessKey &&
            supabaseSecretKey
        );

        if (!qiniuConfigured && !supabaseConfigured) {
            console.error('No storage provider configured');
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

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadTasks: Promise<UploadOutcome>[] = [];

        if (qiniuConfigured) {
            uploadTasks.push(
                (async () => {
                    try {
                        const mac = new qiniu.auth.digest.Mac(accessKey!, secretKey!);
                        const options = {
                            scope: bucket!,
                            expires: 3600,
                        };
                        const putPolicy = new qiniu.rs.PutPolicy(options);
                        const uploadToken = putPolicy.uploadToken(mac);
                        const config = new qiniu.conf.Config();
                        const formUploader = new qiniu.form_up.FormUploader(config);
                        const putExtra = new qiniu.form_up.PutExtra();

                        const uploadedKey = await new Promise<string>((resolve, reject) => {
                            formUploader.put(uploadToken, key, buffer, putExtra, (err, body, info) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                if (info.statusCode === 200) {
                                    resolve(body.key);
                                    return;
                                }

                                const bodyMessage =
                                    body && typeof body === 'object' && 'error' in body
                                        ? String(body.error)
                                        : '';
                                const detail = bodyMessage || JSON.stringify(info);
                                reject(new Error(`Upload failed with status ${info.statusCode}: ${detail}`));
                            });
                        });

                        const normalizedDomain = domain!.replace(/\/$/, '');
                        return {
                            bucket: 'qiniu' as const,
                            url: `${normalizedDomain}/${uploadedKey}`,
                        };
                    } catch (error) {
                        return {
                            bucket: 'qiniu' as const,
                            error: error instanceof Error ? error.message : 'Unknown Qiniu upload error',
                        };
                    }
                })()
            );
        }

        if (supabaseConfigured) {
            uploadTasks.push(
                (async () => {
                    try {
                        const supabaseClient = new S3Client({
                            region: supabaseRegion,
                            endpoint: supabaseEndpoint,
                            forcePathStyle: true,
                            credentials: {
                                accessKeyId: supabaseAccessKey!,
                                secretAccessKey: supabaseSecretKey!,
                            },
                        });

                        await supabaseClient.send(
                            new PutObjectCommand({
                                Bucket: supabaseBucket,
                                Key: key,
                                Body: buffer,
                                ContentType: file.type,
                                CacheControl: 'public, max-age=31536000, immutable',
                            })
                        );

                        const endpointUrl = new URL(supabaseEndpoint!);
                        const publicHost = endpointUrl.hostname.replace('.storage.supabase.co', '.supabase.co');
                        return {
                            bucket: 'supabase' as const,
                            url: `${endpointUrl.protocol}//${publicHost}/storage/v1/object/public/${supabaseBucket}/${key}`,
                        };
                    } catch (error) {
                        return {
                            bucket: 'supabase' as const,
                            error: error instanceof Error ? error.message : 'Unknown Supabase upload error',
                        };
                    }
                })()
            );
        }

        const outcomes = await Promise.all(uploadTasks);
        const qiniuResult = outcomes.find((item) => item.bucket === 'qiniu');
        const supabaseResult = outcomes.find((item) => item.bucket === 'supabase');
        const cnUrl = qiniuResult?.url;
        const enUrl = supabaseResult?.url;
        const warnings = outcomes
            .filter((item) => item.error)
            .map((item) =>
                item.bucket === 'qiniu'
                    ? `七牛上传失败：${item.error}`
                    : `Supabase 上传失败：${item.error}`
            );

        if (!cnUrl && !enUrl) {
            console.error('All uploads failed', outcomes);
            return NextResponse.json(
                { error: warnings.join('；') || 'All uploads failed' },
                { status: 500 }
            );
        }

        console.log('Upload completed', { cnUrl, enUrl, warnings });

        return NextResponse.json({
            success: true,
            url: cnUrl || enUrl || '',
            url_en: enUrl,
            filename: file.name,
            size: file.size,
            warnings,
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
