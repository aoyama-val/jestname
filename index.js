// Print full name of the test case specified by file name and line number.
//
// Example:
//   $ node jestname.js xxx.test.js:99
//
// Based on vscode-jest-runner (https://github.com/firsttris/vscode-jest-runner)

import { parse } from 'jest-editor-support';

function main() {
  const [filePath, lineNum] = process.argv[2].split(":");
  //console.log(filePath);
  //console.log(lineNum);
  //return;

  const testFile = parse(filePath);
  const blocks = testFile.root.children.flatMap(parsedNode => getTestsBlocks(parsedNode, testFile.root.children));
  blocks.sort((a, b) => a.range.length - b.range.length);

  const testName = getEscapedTestName(blocks, lineNum, testFile.root.children);
  console.log(testName ?? '');
}

function getEscapedTestName(blocks, selectedLine) {
  const containers = blocks.filter(b => b.range.start <= selectedLine && selectedLine <= b.range.end);
  if (containers.length == 0) {
    return '';
  }
  const fullTestName = containers[0].fullTestName; // shortest block containing selectedLine
  const escaped = escapeRegExp(fullTestName);
  const updated = updateTestNameIfUsingProperties(escaped);
  return updated;
}

function findFullTestName(selectedLine, children) {
  if (!children) {
    return;
  }
  for (const element of children) {
    if (element.type === 'describe' && selectedLine === element.start.line) {
      return resolveTestNameStringInterpolation(element.name);
    }
    if (element.type !== 'describe' && selectedLine >= element.start.line && selectedLine <= element.end.line) {
      return resolveTestNameStringInterpolation(element.name);
    }
  }
  for (const element of children) {
    const result = findFullTestName(selectedLine, element.children);
    if (result) {
      return resolveTestNameStringInterpolation(element.name) + ' ' + result;
    }
  }
}

function resolveTestNameStringInterpolation(s) {
  const variableRegex = /(\${?[A-Za-z0-9_]+}?|%[psdifjo#%])/gi;
  const matchAny = '(.*?)';
  return s.replace(variableRegex, matchAny);
}

function escapeRegExp(s) {
  const escapedString = s.replace(/[.*+?^${}<>()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  return escapedString.replace(/\\\(\\\.\\\*\\\?\\\)/g, '(.*?)'); // should revert the escaping of match all regex patterns.
}

function updateTestNameIfUsingProperties(receivedTestName) {
  if (receivedTestName === undefined) {
    return undefined;
  }

  const namePropertyRegex = /(?<=\S)\\.name/g;
  const testNameWithoutNameProperty = receivedTestName.replace(namePropertyRegex, '');

  const prototypePropertyRegex = /\w*\\.prototype\\./g;
  return testNameWithoutNameProperty.replace(prototypePropertyRegex, '');
}

function getTestsBlocks(
  parsedNode,
  parseResults
) {
  const result = [];

  parsedNode.children?.forEach((subNode) => {
    result.push(...getTestsBlocks(subNode, parseResults));
  });

  const range = {
    start: parsedNode.start.line,
    startCol: parsedNode.start.column,
    end: parsedNode.end.line,
    endCol: parsedNode.end.column,
    length: parsedNode.end.line - parsedNode.start.line + 1,
  };

  if (parsedNode.type === 'expect') {
    return [];
  }

  const fullTestName = findFullTestName(parsedNode.start.line, parseResults);

  result.push({ range, fullTestName });

  return result;
}

main();
