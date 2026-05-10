// Script to initialize Supabase storage bucket for CV uploads
// Run this in your Supabase dashboard or as a migration

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createResumesBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const resumesBucket = buckets.find(bucket => bucket.name === 'resumes');

    if (!resumesBucket) {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('resumes', {
        public: true, // Allow public access to CV files
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 5242880 // 5MB limit
      });

      if (error) {
        console.error('Error creating resumes bucket:', error);
      } else {
        console.log('✅ Resumes bucket created successfully');
      }
    } else {
      console.log('✅ Resumes bucket already exists');
    }

    // Set up bucket policy to allow authenticated users to upload
    const { error: policyError } = await supabase.storage.from('resumes').createSignedUploadUrl('test.pdf');

    if (policyError) {
      console.log('Note: You may need to configure bucket policies in Supabase dashboard');
      console.log('Go to Storage > resumes > Policies and allow INSERT for authenticated users');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createResumesBucket();