/**
 * Log Patrol Incident – In-Memory Draft Repository
 *
 * Test double for the DraftRepository port.
 */

/**
 * @returns {import('../ports/draftRepository').DraftRepository}
 */
export function InMemoryDraftRepository() {
  let draft = null;

  return {
    async save(d)   { draft = d; },
    async find()    { return draft; },
    async delete()  { draft = null; },
  };
}

export default InMemoryDraftRepository;
