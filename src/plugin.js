import fs from 'fs';
import path from 'path';
import template from 'babel-template';
import {isMatch} from 'micromatch';
import {compile} from 'vue-template-compiler';
import transpile from 'vue-template-es2015-compiler';

function toFunction(code) {
  return transpile(`function render(){${code}}`);
}

export default function () {
  return {
    visitor: {
      ImportDeclaration(link, state) {
        const {
          include = '*.html'
        } = state.opts;

        const node = link.node;
        const source = node.source.value;

        if (!isMatch(source, include, {matchBase: true})) {
          return;
        }

        const directory = path.dirname(path.resolve(state.file.opts.filename));
        const file = path.resolve(directory, source);
        let html;

        try {
          html = fs.readFileSync(file, 'utf8');
        } catch (err) {
          throw link.buildCodeFrameError('Imported file could not be found');
        }

        const compiled = compile(html);

        const {name} = node.specifiers[0].local;

        link.replaceWith(template(`
            var ${name} = {
              render: ${toFunction(compiled.render)},
              staticRenderFns: [
                ${compiled.staticRenderFns.map(toFunction).join(',')}
              ]
            }
        `)());
      }
    }
  };
}
