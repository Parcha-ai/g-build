import { app } from 'electron';

/**
 * Get the session store name, separated by dev vs prod to prevent
 * concurrent read-modify-write race conditions from losing data.
 *
 * Dev uses 'claudette-sessions-dev', prod uses 'claudette-sessions'.
 */
export function getSessionStoreName(): string {
  return 'claudette-sessions';
}
