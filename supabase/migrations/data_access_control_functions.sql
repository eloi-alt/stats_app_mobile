-- =====================================================
-- STATS_APP Data Access Control - SQL Functions
-- Helper functions for checking friend data access permissions
-- =====================================================

-- Function: Check if current user can view a friend's data in a specific category
CREATE OR REPLACE FUNCTION can_view_friend_category(
    p_friend_id UUID,
    p_category TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_friend BOOLEAN;
    v_is_public BOOLEAN;
BEGIN
    -- Check if users are friends (bidirectional)
    SELECT EXISTS (
        SELECT 1 FROM friendships
        WHERE (user_id = auth.uid() AND friend_id = p_friend_id)
           OR (user_id = p_friend_id AND friend_id = auth.uid())
    ) INTO v_is_friend;
    
    -- If not friends, deny access
    IF NOT v_is_friend THEN
        RETURN FALSE;
    END IF;
    
    -- Check if the category is public for this friend
    CASE p_category
        WHEN 'finance' THEN
            SELECT finance_public INTO v_is_public FROM privacy_settings WHERE user_id = p_friend_id;
        WHEN 'physio' THEN
            SELECT physio_public INTO v_is_public FROM privacy_settings WHERE user_id = p_friend_id;
        WHEN 'world' THEN
            SELECT world_public INTO v_is_public FROM privacy_settings WHERE user_id = p_friend_id;
        WHEN 'career' THEN
            SELECT career_public INTO v_is_public FROM privacy_settings WHERE user_id = p_friend_id;
        WHEN 'social' THEN
            SELECT social_public INTO v_is_public FROM privacy_settings WHERE user_id = p_friend_id;
        ELSE
            RETURN FALSE; -- Unknown category
    END CASE;
    
    -- Return TRUE only if the setting exists and is public
    RETURN COALESCE(v_is_public, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get all accessible categories for a specific friend
CREATE OR REPLACE FUNCTION get_friend_accessible_categories(
    p_friend_id UUID
)
RETURNS TABLE(
    category TEXT,
    is_accessible BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        category_name as category,
        can_view_friend_category(p_friend_id, category_name) as is_accessible
    FROM (
        VALUES 
            ('finance'::TEXT),
            ('physio'::TEXT),
            ('world'::TEXT),
            ('career'::TEXT),
            ('social'::TEXT)
    ) AS categories(category_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get privacy settings for multiple friends (batch)
CREATE OR REPLACE FUNCTION get_friends_privacy_settings(
    p_friend_ids UUID[]
)
RETURNS TABLE(
    user_id UUID,
    finance_public BOOLEAN,
    physio_public BOOLEAN,
    world_public BOOLEAN,
    career_public BOOLEAN,
    social_public BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.user_id,
        ps.finance_public,
        ps.physio_public,
        ps.world_public,
        ps.career_public,
        ps.social_public
    FROM privacy_settings ps
    WHERE ps.user_id = ANY(p_friend_ids)
      AND EXISTS (
          SELECT 1 FROM friendships f
          WHERE (f.user_id = auth.uid() AND f.friend_id = ps.user_id)
             OR (f.user_id = ps.user_id AND f.friend_id = auth.uid())
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
