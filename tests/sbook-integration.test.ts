import { handle_DDIC_Table } from '../src/handlers/handle_DDIC_Table';

describe('SBOOK 테이블 통합 테스트', () => {
  it('SBOOK 테이블 정보를 정상적으로 조회하고 결과를 출력한다', async () => {
    const result = await handle_DDIC_Table({ object_name: 'SBOOK' });
    console.log('SBOOK 조회 결과:', result.content[0].text);
    expect(result.isError).toBe(false);
    expect(result.content[0].text.toLowerCase()).toContain('sbook');
  });
}); 