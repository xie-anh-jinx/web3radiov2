import { from as dbFrom } from '@/integrations/local/client';

export const checkAdminStatus = async (addr: string | null): Promise<boolean> => {
  if (!addr) return false;
  
  try {
    const { data, error } = await dbFrom('admins').select();
    if (error || !data) {
      console.error('Error fetching admins:', error);
      return false;
    }
    
    return data.some((admin: any) => 
      admin.address.toLowerCase() === addr.toLowerCase()
    );
  } catch (e) {
    console.error('Auth check failed:', e);
    return false;
  }
};

export const truncateAddress = (addr: string | null): string => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
};
