const fs = require('fs');
const path = require('path');

const handlersDir = 'src/handlers';
const handlers = fs.readdirSync(handlersDir).filter(file => file.startsWith('handle_') && file.endsWith('.ts') && file !== 'handle_SearchObject.ts');

console.log('Found handlers:', handlers);

handlers.forEach(handlerFile => {
  const filePath = path.join(handlersDir, handlerFile);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already updated (check for both auth fields)
  if (content.includes('_sapUsername?: string') && content.includes('_sapPassword?: string')) {
    // Fix validation order
    if (content.includes('const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);\n    if (!args')) {
      content = content.replace(
        /const baseUrl = await getBaseUrl\(args\._sapUsername, args\._sapPassword\);\s*if \(!args/g,
        'if (!args'
      );
      
  // Add baseUrl declaration after validation
      content = content.replace(
        /(if \(!args[^}]+\}[^}]*?)(\s*)(const url =)/,
        '$1$2const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);$2$3'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed validation order in ${handlerFile}`);
    } else {
      console.log(`Skipping ${handlerFile} - already properly updated`);
    }
    return;
  }
  
  // Add SAP authentication fields to interface
  content = content.replace(
    /interface\s+(\w+Args)\s*\{([^}]+)\}/,
    (match, interfaceName, interfaceBody) => {
      if (interfaceBody.includes('_sapUsername')) return match; // 이미 있으면 건너뛰기
      const updatedBody = interfaceBody.trim() + 
  '\n  _sapUsername?: string;  // SAP authentication info per client\n' +
  '  _sapPassword?: string;  // SAP authentication info per client';
      return `interface ${interfaceName} {\n${updatedBody}\n}`;
    }
  );
  
  // getBaseUrl() 호출을 getBaseUrl(args._sapUsername, args._sapPassword)로 변경
  content = content.replace(
    /await getBaseUrl\(\)/g,
    'await getBaseUrl(args._sapUsername, args._sapPassword)'
  );
  
  // makeAdtRequest 호출에 인증 정보 추가
  content = content.replace(
    /makeAdtRequest\(([^)]+)\)/g,
    (match, params) => {
      const paramList = params.split(',').map(p => p.trim());
      // 이미 7개 파라미터가 있으면 건너뛰기
      if (paramList.length >= 7) return match;
      
      // responseType이 없으면 기본값 추가
      if (paramList.length === 3) {
        paramList.push('undefined', 'undefined', "'json'");
      } else if (paramList.length === 4) {
        paramList.push('undefined', "'json'");
      } else if (paramList.length === 5) {
        paramList.push("'json'");
      }
      
      // SAP 인증 파라미터 추가
      paramList.push('args._sapUsername', 'args._sapPassword');
      
      return `makeAdtRequest(${paramList.join(', ')})`;
    }
  );
  
  // ${await getBaseUrl()} 패턴을 ${baseUrl}로 변경하고 baseUrl 변수 추가
  if (content.includes('${await getBaseUrl(args._sapUsername, args._sapPassword)}')) {
    // validation 이후에 baseUrl 변수 선언 추가
    content = content.replace(
      /(if \(!args[^}]+\}[^}]*?)(\s*)(const url =)/,
      '$1$2const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);$2$3'
    );
    
    // URL에서 getBaseUrl 호출을 baseUrl로 변경
    content = content.replace(
      /\$\{await getBaseUrl\(args\._sapUsername, args\._sapPassword\)\}/g,
      '${baseUrl}'
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${handlerFile}`);
});

console.log('Handler update completed!');
