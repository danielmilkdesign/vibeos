const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
 const filename = path.resolve(__dirname, '..', file);
 const module = {exports:{}};
 const code = ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const req = id => mocks[id] ?? (id.startsWith('.') ? load(path.relative(path.resolve(__dirname,'..'),path.resolve(path.dirname(filename),id))+'.ts',mocks) : require(id));
 new Function('require','module','exports',code)(req,module,module.exports); return module.exports;
}
module.exports = {load};
