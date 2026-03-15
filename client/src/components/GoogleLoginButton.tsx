import { useGoogleLogin } from "@react-oauth/google";

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: { credential: string }) => void;
  onError?: () => void;
  disabled?: boolean;
}

/**
 * Google Login Button Component
 * 
  Uses Google Identity Services react-oauth/google to render the official
  Google Sign-In button with a clean, professional design.
 
  Security Flow:
   User clicks the Google button
  Google handles the OAuth popup and user consent
  Google returns an ID Token (JWT) to the frontend
  This token is sent to our backend for verification
  Backend verifies with Google and creates/logs in the user
  *  importand note Never trust the user data from Google token on the frontend.
 * lways verify the token on the backend using google-auth-library.
 */
export const GoogleLoginButton = ({
  onSuccess,
  onError,
  disabled = false,
}: GoogleLoginButtonProps) => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // For implicit flow, we get access_token, but we need id_token
      // We'll use the credential response from the token client
      if (tokenResponse.access_token) {
        // Convert to credential format expected by parent
        onSuccess({ credential: tokenResponse.access_token });
      }
    },
    onError: () => {
      onError?.();
    },
    flow: "implicit",
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={disabled}
      className={`
        w-full h-12 lg:h-14
        bg-white hover:bg-gray-50
        border border-slate-200 hover:border-slate-300
        rounded-full
        flex items-center justify-center gap-3
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Google "G" Logo */}
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 4.6c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>

      {/* Button Text */}
      <span className="text-[#1a2f1a] font-semibold text-sm lg:text-base">
        Continue with Google
      </span>
    </button>
  );
};

export default GoogleLoginButton;
