import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createReviewsTable() {
  try {
    console.log('🔧 Creating reviews table directly...')
    
    // Test if we can create a simple table
    const testInsert = {
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      display_name: 'Test User',
      email: 'test@example.com',
      rating: 5,
      review_title: 'Great product!',
      review_content: 'This is a test review to check if our table structure works.',
      images: [],
      video_url: null,
      helpful_votes: 0,
      status: 'pending',
      verified_purchase: false
    }

    // Try to insert data (this will fail if table doesn't exist)
    const { data: insertResult, error: insertError } = await supabase
      .from('product_reviews')
      .insert([testInsert])
      .select()

    if (insertError) {
      console.log('❌ Table does not exist, error:', insertError.message)
      console.log('\n🔧 You need to create the table manually in Supabase dashboard:')
      console.log('1. Go to https://supabase.com/dashboard')
      console.log('2. Select your project')
      console.log('3. Go to Table Editor')
      console.log('4. Click "Create a new table"')
      console.log('5. Use this SQL:')
      console.log(`
CREATE TABLE product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(100) NOT NULL,
  review_content TEXT NOT NULL CHECK (char_length(review_content) >= 10),
  images TEXT[],
  video_url TEXT,
  helpful_votes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read approved reviews" 
ON product_reviews FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Anyone can create reviews" 
ON product_reviews FOR INSERT 
WITH CHECK (status = 'pending');
      `)
    } else {
      console.log('✅ Table exists and working! Test review created:', insertResult)
      
      // Clean up test data
      await supabase
        .from('product_reviews')
        .delete()
        .eq('email', 'test@example.com')
      
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createReviewsTable()