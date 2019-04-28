const getNestedValue = (obj, key) => key.split('.').reduce((o,i) => {
  // Check for undefined references
  if (!(i in o)) {
    throw `Cannot find self refrencing property ${key} in object`;
  }
  return o[i];
}, obj);

// tagged template literal that checks if the template literal is only a single string.
// Defined in string form to pass into Function constructor
const isSingleTag = 'const isSingleTag = (strings, ...keys) => { return (keys.length === 1 && strings[0] === "" && strings[1] === ""); };'

// tagged template literal that returns the first expression
// Defined in string form to pass into Function constructor
const returnSingleTag = 'const returnSingleTag = (_, ...keys) => { return keys[0]; };'

// if the template literal only contains only a single expression, return a value, otherwise return a string
const evaluateTemplateLiteral = expression => {
  const isSingleExpression = Function('"use strict";' + isSingleTag + ' return isSingleTag`' + expression + "`;")();
  if (isSingleExpression) {
    return Function('"use strict";' + returnSingleTag + ' return returnSingleTag`' + expression + "`;")();
  }
  return Function('"use strict"; return `' + expression + "`;")();
}

// Uses backtracking DFS to traverse object graph
const sro = object => {
  const checkedReferences = [];

  const parseValue= (value) => {
    if (typeof value !== 'string') {
      return value;
    }
    // lookup any `this` values
    const expression = value.replace(/this\.[A-Za-z0-9_.]+/g, thisMatch => {
      return JSON.stringify(lookup(thisMatch.slice(5)));
    });

    return evaluateTemplateLiteral(expression);
  }

  const lookup = (key) => {
    // Check for circular references
    if (checkedReferences.indexOf(key) !== -1) {
      throw `Circular dependency found in self referencing object: ${JSON.stringify(checkedReferences)}`;
    }
    // Add the key to the stack to support back tracking
    checkedReferences.push(key);

    const value = parseValue(getNestedValue(object, key));

    // pop the key from the stack to continue back tracking
    checkedReferences.pop();
    return value;
  }

  const parseObject = (currentObject) => {
    Object.entries(currentObject).forEach(([key, value]) => {
      if (typeof value  === 'object') {
        parseObject(value);
      } else {
        currentObject[key] = parseValue(value);
      }
    });
  }

  parseObject(object);
  return object;
};

module.exports = sro;
