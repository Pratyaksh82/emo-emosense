const fs = require('fs');
const path = require('path');

const srcPath = 'c:/Users/praty/Desktop/emo-girl/emosense-source/src/lib/sessionReportGenerator.ts';
if (fs.existsSync(srcPath)) {
  let content = fs.readFileSync(srcPath, 'utf8');
  content = content.replace(/from ["']\.\/emotion-types["']/g, 'from "./emosenseTypes"');
  fs.writeFileSync(path.join(__dirname, '../src/lib/sessionReportGenerator.ts'), content, 'utf8');
  console.log('Successfully created src/lib/sessionReportGenerator.ts, bytes:', content.length);
} else {
  console.error('Source file not found at:', srcPath);
}
