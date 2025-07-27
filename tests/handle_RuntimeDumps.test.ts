import { handle_RuntimeDumps } from '../src/handlers/handle_RuntimeDumps';

describe('handle_RuntimeDumps', () => {
  it('should fetch dumps for given from/to', async () => {
    const result = await handle_RuntimeDumps({
      start_date: '2025-07-25',
      end_date: '2025-07-25',
      start_time: '00:08:03',
      end_time: '12:08:03',
      maxResults: 5,
      category: 'ZPEST002'
    });
    expect(result).toBeDefined();
    expect(result.isError).not.toBe(true);
    expect(result.content || result.data).toBeDefined();
    // 추가적으로 entry 개수 등 검증 가능
  });
});
