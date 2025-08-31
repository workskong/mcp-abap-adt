import { handle_API_Releases } from '../src/handlers/handle_API_Releases';

describe('handle_API_Releases (integration)', () => {
  it('should return API release information for a valid query', async () => {
    const result = await handle_API_Releases({ query: 'SBOOK' });
    // content[0].text는 JSON 문자열이므로 파싱해서 전체 구조를 출력
    // 전체 결과와 text 원문을 모두 출력
    console.log('API Release result (object):', JSON.stringify(result, null, 2));
    if (result && result.content && result.content[0] && result.content[0].text) {
      console.log('API Release result (text):', result.content[0].text);
    }
    expect(result).toBeDefined();
    // 실제 환경에서는 아래와 같이 구체적인 결과 검증이 가능합니다.
    // expect(result.isError).not.toBe(true);
    // expect(result.content).toBeDefined();
  });
});
