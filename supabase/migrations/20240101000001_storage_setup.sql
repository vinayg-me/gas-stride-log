-- Create storage bucket for receipt images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- RLS policy for receipt storage
create policy "Users can upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );
