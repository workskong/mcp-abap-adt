
import { handle_RuntimeDumps } from '../src/handlers/handle_RuntimeDumps';

describe('handle_RuntimeDumps integration test', () => {
  it('should return dumps for 2025-07-24', async () => {
    const args = {
      start_date: '2025-07-24',
      end_date: '2025-07-24',
      maxResults: 3
    };
    const result = await handle_RuntimeDumps(args);
    expect(result).toBeDefined();
    if (result.success) {
      expect(result.content).toBeDefined();
      expect(result.content.data).toBeDefined();
      expect(result.content.originalEntryCount).toBeGreaterThanOrEqual(0);
      if (args.maxResults > 5) {
        expect(result.content.trimmedNotice).toBeDefined();
      }
    } else {
      expect(result.error).toBeDefined();
      expect(result.error.code).toBeDefined();
    }
  });
});
