import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import type { Property } from '@/shared/types';

interface WishlistItem {
  id: number;
  property_id: number;
  property: Property;
  created_at: string;
}

interface UseWishlistReturn {
  wishlist: WishlistItem[];
  loading: boolean;
  isInWishlist: (propertyId: number) => boolean;
  addToWishlist: (propertyId: number) => Promise<boolean>;
  removeFromWishlist: (propertyId: number) => Promise<boolean>;
  toggleWishlist: (propertyId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
}

export function useWishlist(): UseWishlistReturn {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((propertyId: number): boolean => {
    return wishlist.some(item => item.property_id === propertyId);
  }, [wishlist]);

  const addToWishlist = useCallback(async (propertyId: number): Promise<boolean> => {
    if (!user) {
      alert('Please sign in to add to wishlist');
      return false;
    }

    try {
      const response = await fetch(`/api/wishlist/${propertyId}`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  }, [user, fetchWishlist]);

  const removeFromWishlist = useCallback(async (propertyId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/wishlist/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.property_id !== propertyId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }, [user]);

  const toggleWishlist = useCallback(async (propertyId: number): Promise<boolean> => {
    const inWishlist = isInWishlist(propertyId);
    
    if (inWishlist) {
      return await removeFromWishlist(propertyId);
    } else {
      return await addToWishlist(propertyId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist,
    wishlistCount: wishlist.length,
  };
}