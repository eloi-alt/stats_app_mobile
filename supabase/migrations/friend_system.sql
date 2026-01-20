-- =====================================================
-- STATS_APP Friend System - Core Tables & RLS
-- Tables: friendships, friend_requests
-- =====================================================

-- Table: friend_requests (Demandes d'amitié)
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT different_users CHECK (sender_id != receiver_id),
  CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
);

-- Table: friendships (Amitiés actives)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank TEXT NOT NULL DEFAULT 'amis' CHECK (rank IN ('cercle_proche', 'amis')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT different_users_friendship CHECK (user_id != friend_id),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- =====================================================
-- RLS Policies
-- =====================================================

-- friend_requests policies
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Users can view requests they sent or received
CREATE POLICY "Users can view own friend requests" ON friend_requests
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can send friend requests
CREATE POLICY "Users can send friend requests" ON friend_requests
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Users can update requests they received (accept/reject)
CREATE POLICY "Users can update received requests" ON friend_requests
  FOR UPDATE USING (
    auth.uid() = receiver_id
  );

-- Users can delete requests they sent
CREATE POLICY "Users can delete sent requests" ON friend_requests
  FOR DELETE USING (
    auth.uid() = sender_id
  );

-- friendships policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships where they are user_id or friend_id
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Friendships are created by system (via trigger on accepted request)
CREATE POLICY "System can create friendships" ON friendships
  FOR INSERT WITH CHECK (true);

-- Users can update friendships they own (change rank)
CREATE POLICY "Users can update own friendships" ON friendships
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Users can delete friendships they own
CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- =====================================================
-- Trigger: Auto-create bidirectional friendship on accept
-- =====================================================

-- Function to create bidirectional friendship when request is accepted
CREATE OR REPLACE FUNCTION create_friendship_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Create bidirectional friendships
    -- From receiver to sender
    INSERT INTO friendships (user_id, friend_id, rank)
    VALUES (NEW.receiver_id, NEW.sender_id, 'amis')
    ON CONFLICT (user_id, friend_id) DO NOTHING;
    
    -- From sender to receiver
    INSERT INTO friendships (user_id, friend_id, rank)
    VALUES (NEW.sender_id, NEW.receiver_id, 'amis')
    ON CONFLICT (user_id, friend_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on friend_requests
DROP TRIGGER IF EXISTS on_friend_request_accepted ON friend_requests;
CREATE TRIGGER on_friend_request_accepted
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_friendship_on_accept();

-- =====================================================
-- Trigger: Delete bidirectional friendship on unfriend
-- =====================================================

-- Function to delete both sides of friendship
CREATE OR REPLACE FUNCTION delete_bidirectional_friendship()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the reverse friendship
  DELETE FROM friendships
  WHERE user_id = OLD.friend_id AND friend_id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on friendships
DROP TRIGGER IF EXISTS on_friendship_deleted ON friendships;
CREATE TRIGGER on_friendship_deleted
  BEFORE DELETE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION delete_bidirectional_friendship();
