const fs = require('fs');
const path = require('path');

const testName = process.argv[2];
if (!testName) {
  console.error('테스트 파일명을 입력하세요. 예: npm run create:test myModule');
  process.exit(1);
}

const testDir = path.join(__dirname, '..', 'tests');
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

const filePath = path.join(testDir, `${testName}.test.ts`);
const template = `import { describe, it, expect } from '@jest/globals';

describe('${testName}', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
`;

fs.writeFileSync(filePath, template);
console.log(`테스트 파일 생성: ${filePath}`);
