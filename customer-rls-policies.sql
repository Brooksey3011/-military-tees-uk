-- Customer Table RLS Policies
-- Fix for 400 errors when fetching/creating customer profiles

-- Ensure RLS is enabled on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own customer profile
CREATE POLICY "Users can read own customer profile" ON customers
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy 2: Users can insert their own customer profile  
CREATE POLICY "Users can create own customer profile" ON customers
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own customer profile
CREATE POLICY "Users can update own customer profile" ON customers
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Policy 4: Service role can manage all customer profiles (for admin operations)
CREATE POLICY "Service role can manage all customers" ON customers
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON customers TO authenticated;
GRANT ALL ON customers TO service_role;