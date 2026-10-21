import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from '@/stores/toastStore';
import { isClientError, isPhoneRequired, isSessionError } from '@/utils/apiError';

/**
 * Failures nobody wrote UI for still get said out loud. Anything that already
 * shows its own message opts out with `meta: { silent: true }` on the query or
 * mutation, so a person never reads the same problem twice.
 */
const reportFailure = (error: unknown, meta?: Record<string, unknown>) => {
  if (meta?.silent) return;
  // An ended session is announced once, by the request layer, and signs the person out.
  if (isSessionError(error)) return;
  // Not failures: the add-to-cart flow uses these to ask for a phone number or a sign-in.
  if (isPhoneRequired(error)) return;
  if (error instanceof Error && error.message === 'Auth required') return;

  toast.fromError(error);
};

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      // Only when there is nothing to show: a failed background refresh of data that
      // is already on screen is not worth interrupting anyone for.
      onError: (error, query) => {
        if (query.state.data !== undefined) return;
        reportFailure(error, query.meta);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => reportFailure(error, mutation.meta),
    }),
    defaultOptions: {
      queries: {
        // A 404 or a 403 answers the same way every time; retrying only delays the
        // message. Network trouble and server errors are worth another go.
        retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
        // Keep the retry delay short enough that a person is not left staring at a spinner.
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      },
    },
  });
