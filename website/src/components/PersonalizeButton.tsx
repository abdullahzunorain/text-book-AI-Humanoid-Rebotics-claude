import React, {useState, useCallback, useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAuth} from '@site/src/components/AuthProvider';

/**
 * Props for the PersonalizeButton component.
 */
interface PersonalizeButtonProps {
  /** Current chapter slug derived from the URL path */
  chapterSlug: string;
  /** Callback to pass personalized content up to parent */
  onPersonalized: (content: string) => void;
  /** Callback when user wants to go back to original */
  onShowOriginal: () => void;
  /** Whether personalized content is currently being displayed */
  isPersonalizedActive: boolean;
}

/**
 * "Personalize This Chapter" button — only visible when authenticated.
 * Calls POST /api/personalize with the current chapter slug.
 */
export default function PersonalizeButton({
  chapterSlug,
  onPersonalized,
  onShowOriginal,
  isPersonalizedActive,
}: PersonalizeButtonProps): React.JSX.Element | null {
  const {siteConfig} = useDocusaurusContext();
  const API_URL = useMemo(
    () => (siteConfig.customFields?.apiUrl as string) || 'http://localhost:8000',
    [siteConfig.customFields?.apiUrl],
  );
  const {isAuthenticated} = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    if (isPersonalizedActive) {
      onShowOriginal();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/personalize`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({chapter_slug: chapterSlug}),
      });

      if (response.status === 401) {
        setError('Please sign in to personalize content.');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      onPersonalized(data.personalized_content);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Personalization failed. Try again later.',
      );
    } finally {
      setLoading(false);
    }
  }, [chapterSlug, isPersonalizedActive, onPersonalized, onShowOriginal, API_URL]);

  // Only render when authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{marginBottom: '0.5rem'}}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={isPersonalizedActive ? 'action-btn action-btn--active' : 'action-btn'}
        type="button"
        title="Adapt this chapter to your learning profile">
        {loading
          ? '⏳ Personalizing…'
          : isPersonalizedActive
            ? '📖 Show Original'
            : '🎯 Personalize This Chapter'}
      </button>
      {error && (
        <span
          style={{color: 'var(--ifm-color-danger)', marginLeft: '0.5rem', fontSize: '0.85rem'}}>
          {error}
        </span>
      )}
    </div>
  );
}
