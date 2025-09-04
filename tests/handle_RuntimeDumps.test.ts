import { handle_RuntimeDumps } from '../src/handlers/handle_RuntimeDumps';

describe('handle_RuntimeDumps', () => {
  it('should fetch dumps for given from/to', async () => {
    const result = await handle_RuntimeDumps({
      start_date: '20250828',
      end_date: '20250828',
      maxResults: 5,
    });

    const entry = result?.content?.feed?.entry;
    if (entry) {
  console.log('--- Dump key information ---');
      if (Array.isArray(entry.category)) {
  console.log('Error type:', entry.category.map(c => c.term).join(', '));
      } else if (entry.category?.term) {
  console.log('Error type:', entry.category.term);
      }
      if (Array.isArray(entry.category)) {
        const prog = entry.category.find(c => c.label === 'Terminated ABAP program');
        if (prog) {
          console.log('Program:', prog.term);
        }
      }
      if (entry.id) {
        console.log('id:', entry.id);
      }
      if (entry.published) {
  console.log('Occurred at:', entry.published);
      }
      if (entry.title) {
  console.log('Title:', entry.title);
      }
      if (entry.summary) {
  console.log('Summary:', entry.summary);
      }
    } else {
      console.log('No entry found in result.');
    }

    expect(result).toBeDefined();
    expect(result.isError).not.toBe(true);
    expect(result.content || result.data).toBeDefined();
  });
});
