/**
 * Log Incident – useIncidentServices hook
 *
 * Resolves all services needed by DetailsScreen from the DI container.
 * Returns safe in-memory fallbacks for tests and environments without a container.
 */

import { useMemo } from 'react';
import { InMemoryIncidentRepository } from '../../infrastructure/inMemoryIncidentRepository';
import { MockRemoteGateway } from '../../infrastructure/mockRemoteGateway';
import { DefaultClock } from '../../../../core/services/clock';
import { DefaultIdGenerator } from '../../../../core/services/idGenerator';
import { NullConnectivityMonitor } from '../../../../core/services/connectivity/ConnectivityMonitor';

let _container = null;

/**
 * @param {import('../../../../core/di/container').DIContainer} container
 */
export function setServicesContainer(container) {
  _container = container;
}

export function useIncidentServices() {
  return useMemo(() => {
    if (_container) {
      return {
        incidentRepo:        _container.resolve('log-incident.incidentRepo'),
        gateway:             _container.resolve('log-incident.gateway'),
        connectivityMonitor: _container.resolve('log-incident.connectivityMonitor'),
        clock:               _container.resolve('log-incident.clock'),
        idGenerator:         _container.resolve('log-incident.idGenerator'),
      };
    }
    // Fallback for isolated test/storybook use
    return {
      incidentRepo:        InMemoryIncidentRepository(),
      gateway:             MockRemoteGateway(),
      connectivityMonitor: NullConnectivityMonitor(),
      clock:               DefaultClock,
      idGenerator:         DefaultIdGenerator,
    };
  }, []);
}

export default useIncidentServices;
