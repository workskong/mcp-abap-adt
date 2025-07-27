import { handle_Get_ABAPTracesDetails } from '../src/handlers/handle_Get_ABAPTracesDetails';

describe('handle_Get_ABAPTracesDetails (integration)', () => {
  it('should return error if id or type is missing', async () => {
    const result = await handle_Get_ABAPTracesDetails({});
    expect(result.isError).toBe(true);
    expect(result.error).toBeDefined();
  });

  it('should return error if type is invalid', async () => {
    const result = await handle_Get_ABAPTracesDetails({ id: 'BF0BF43A6A2611F0B8A40644525CFAA3', type: 'invalidType' });
    expect(result.isError).toBe(true);
    expect(result.error).toBeDefined();
  });

  it('should return response for valid type dbAccesses', async () => {
    const result = await handle_Get_ABAPTracesDetails({ id: 'BF0BF43A6A2611F0B8A40644525CFAA3', type: 'dbAccesses' });
    expect(result.isError).toBe(false);
    expect(result.content).toBeDefined();
  });

  it('should return response for valid type hitlist', async () => {
    const result = await handle_Get_ABAPTracesDetails({ id: 'BF0BF43A6A2611F0B8A40644525CFAA3', type: 'hitlist' });
    expect(result.isError).toBe(false);
    expect(result.content).toBeDefined();
  });

  it('should return response for valid type statements', async () => {
    const result = await handle_Get_ABAPTracesDetails({ id: 'BF0BF43A6A2611F0B8A40644525CFAA3', type: 'statements' });
    expect(result.isError).toBe(false);
    expect(result.content).toBeDefined();
  });
});
