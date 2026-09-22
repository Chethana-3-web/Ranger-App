/**
 * Log Incident – useDraftRepo hook
 *
 * Resolves the DraftRepository from the DI container.
 * Returns an InMemoryDraftRepository fallback in test/dev environments
 * where the container has not been initialised.
 */

import { useMemo } from 'react';
import { InMemoryDraftRepository } from '../../infrastructure/inMemoryDraftRepository';

let _container = null;

/**
 * Set the DI container reference (called from App.js after init).
 *
 * @param {import('../../../../core/di/container').DIContainer} container
 */
export function setDIContainer(container) {
  _container = container;
}

/**
 * @returns {import('../../ports/draftRepository').DraftRepository}
 */
export function useDraftRepo() {
  return useMemo(() => {
    if (_container && _container.has('log-incident.draftRepo')) {
      return _container.resolve('log-incident.draftRepo');
    }
    // Fallback for tests / storybook
    return InMemoryDraftRepository();
  }, []);
}

export default useDraftRepo;
