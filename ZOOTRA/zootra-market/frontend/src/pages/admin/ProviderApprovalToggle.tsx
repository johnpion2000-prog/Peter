import React, { useState } from 'react';
import { AppUser } from '../../types/user.types';
import { updateUserProfile } from '../../services/userService';

interface ProviderApprovalToggleProps {
  user: AppUser;
}

const ProviderApprovalToggle: React.FC<ProviderApprovalToggleProps> = ({ user }) => {
  const [approved, setApproved] = useState(!!user.isApproved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { isApproved: !approved });
      setApproved(!approved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`px-3 py-1 rounded text-xs font-medium ${approved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} ${loading ? 'opacity-50' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={approved ? 'Revoke provider access' : 'Approve provider'}
    >
      {approved ? 'Approved' : 'Not Approved'}
    </button>
  );
};

export default ProviderApprovalToggle;
