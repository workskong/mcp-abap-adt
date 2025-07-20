import { handel_ApiReleases } from '../src/handlers/handel_API_Releases';

describe('handel_ApiReleases', () => {
  it('should search, extract uri, encode, and fetch apireleases', async () => {
    // 실제 SAP 시스템이 연결되어 있어야 통합 테스트가 동작합니다.
    // 테스트용 query는 실제 존재하는 오브젝트명으로 대체하세요.
    const query = 'sbook'; //c_gregoriancalsgldatefuncvh
    const result = await handel_ApiReleases({ query });
    // 콘솔 로그는 함수 내부에서 이미 출력됨
    expect(result).toBeDefined();
    // 추가적으로 result의 구조나 일부 필드 검증 가능
  });

  it('should return error if query is missing', async () => {
    // @ts-expect-error intentionally missing query
    const result = await handel_ApiReleases({});
    expect(result.isError).toBe(true);
  });
});
