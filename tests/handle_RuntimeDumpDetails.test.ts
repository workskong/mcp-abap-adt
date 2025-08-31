import { handle_RuntimeDumpDetails } from '../src/handlers/handle_RuntimeDumpDetails';

describe('handle_RuntimeDumpDetails', () => {
  it('should fetch dump details for given id', async () => {
    // 실제 ADT 서버에 요청하도록 목업을 제거하고, 요구된 파라미터를 사용합니다.
    const result = await handle_RuntimeDumpDetails({
      id: '20250828150432vhcala4hci_A4H_00%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20DEV00%20%20%20%20%20%20%20001%20%20%20%20%20%20%20%203'
    });
    console.log('test result:', result);
    expect(result).toBeDefined();
    expect(result.isError).not.toBe(true);
    expect(result.content).toBeDefined();
    // 추가적으로 상세 내용 검증 가능
  });
});
