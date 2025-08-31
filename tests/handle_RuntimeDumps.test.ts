import { handle_RuntimeDumps } from '../src/handlers/handle_RuntimeDumps';

describe('handle_RuntimeDumps', () => {
  it('should fetch dumps for given from/to', async () => {
    const result = await handle_RuntimeDumps({
      start_date: '20250828',
      end_date: '20250828',
      maxResults: 5,
    });

    // entry 정보 추출 및 출력
    const entry = result?.content?.feed?.entry;
    if (entry) {
      console.log('--- 덤프 주요 정보 ---');
      // 오류 유형
      if (Array.isArray(entry.category)) {
        console.log('오류 유형:', entry.category.map(c => c.term).join(', '));
      } else if (entry.category?.term) {
        console.log('오류 유형:', entry.category.term);
      }
      // 프로그램
      if (Array.isArray(entry.category)) {
        const prog = entry.category.find(c => c.label === 'Terminated ABAP program');
        if (prog) {
          console.log('프로그램:', prog.term);
        }
      }
      // id
      if (entry.id) {
        console.log('id:', entry.id);
      }
      // 발생 시각
      if (entry.published) {
        console.log('발생 시각:', entry.published);
      }
      // 제목
      if (entry.title) {
        console.log('제목:', entry.title);
      }
      // 요약
      if (entry.summary) {
        console.log('요약:', entry.summary);
      }
    } else {
      console.log('No entry found in result.');
    }

    expect(result).toBeDefined();
    expect(result.isError).not.toBe(true);
    expect(result.content || result.data).toBeDefined();
  });
});
