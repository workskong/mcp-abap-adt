import { handle_RuntimeDumpDetails } from '../src/handlers/handle_RuntimeDumpDetails';

describe('handle_RuntimeDumpDetails', () => {
  it('should fetch dump details for given id', async () => {
    const result = await handle_RuntimeDumpDetails({
      id: '20250725000803vhcala4hci_A4H_00%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20DEV00%20%20%20%20%20%20%20001%20%20%20%20%20%20%20%201'
    });
    console.log('test result:', result);
    expect(result).toBeDefined();
    expect(result.isError).not.toBe(true);
    expect(result.content).toBeDefined();
    // 추가적으로 상세 내용 검증 가능
  });
});
