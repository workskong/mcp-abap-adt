import { handle_API_Releases } from '../src/handlers/handle_API_Releases';

describe('handle_API_Releases (integration)', () => {
  it('should return API release information for a valid query', async () => {
    const result = await handle_API_Releases({ query: 'SBOOK' });

    console.log('API Release result (object):', JSON.stringify(result, null, 2));
    if (result && result.content && result.content[0] && result.content[0].text) {
      console.log('API Release result (text):', result.content[0].text);
    }
    expect(result).toBeDefined();

  });
});
