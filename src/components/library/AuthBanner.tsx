interface AuthBannerProps {
  isAuthenticated: boolean;
}

export const AuthBanner = ({ isAuthenticated }: AuthBannerProps) => {
  if (isAuthenticated) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <p className="text-blue-700 text-sm">
        Sign in to request tools, add your own tools, or manage your tool inventory.
      </p>
    </div>
  );
};