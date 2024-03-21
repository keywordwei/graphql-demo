function findSameField(selections = [], node) {
  return selections.find(({ name }) => {
    const isSameKind = name.kind === node.name.kind;
    const isSameField = name.value === node.name.value;
    return isSameKind && isSameField;
  });
}

function differenceFields(targets = [], sources = []) {
  const fields = [];
  targets.forEach((node) => {
    const field = findSameField(sources, node);
    if (!field) {
      fields.push(node);
    }
  });
  return fields;
}

function findSameFragment(fragments, node) {
  const fragmentType = node.typeCondition.name.value;
  const fragmentName = node.name.value;
  return fragments.find((node) => {
    return node.typeCondition.name.value === fragmentType && node.name.value === fragmentName;
  });
}

function differenceFragments(targets, sources) {
  const fragments = [];
  targets.forEach(node => {
    const fragment = findSameFragment(sources, node);
    if (!fragment) {
      fragments.push(node);
    }
  });
  return fragments;
}

function mergeSelections(targets = [], sources = []) {
  const selections = [];
  const notSameFieldsFromTarget = differenceFields(targets, sources);
  selections.push(...notSameFieldsFromTarget);
  targets.forEach((node) => {
    const sameField = findSameField(sources, node);
    if (sameField) {
      const nodes = mergeSelections(node?.selectionSet?.selections, sameField?.selectionSet?.selections);
      if (nodes.length > 0) {
        node.selectionSet.selections = nodes;
      }
      selections.push(node);
    }
  });
  const notSameFieldsFromSource = differenceFields(sources, targets);
  selections.push(...notSameFieldsFromSource);
  return selections;
}

function filterFragments(document) {
  return document.definitions.filter(({ kind }) => kind === 'FragmentDefinition');
}

function findQuery(document) {
  return document.definitions.find(({ operation }) => operation === 'query');
}

function mergeFragments(target, source) {
  const sourceFragments = filterFragments(source);
  const targetFragments = filterFragments(target);
  const fragments = [];
  const notSameFragmentsFromTarget = differenceFragments(targetFragments, sourceFragments);
  fragments.push(...notSameFragmentsFromTarget);
  targetFragments.forEach(node => {
    const fragment = findSameFragment(sourceFragments, node);
    if (fragment) {
      const nodes = mergeSelections(node.selectionSet.selections, fragment.selectionSet.selections);
      if (nodes.length > 0) {
        node.selectionSet.selections = nodes;
      }
      fragments.push(node);
    }
  });
  const notSameFragmentsFromSource = differenceFragments(sourceFragments, targetFragments);
  fragments.push(...notSameFragmentsFromSource);
  return fragments;
}

function mergeQuery(target, source) {
  const targetQuery = findQuery(target);
  const sourceQuery = findQuery(source);
  const selections = mergeSelections(targetQuery?.selectionSet?.selections, sourceQuery?.selectionSet?.selections);
  if (selections.length > 0) {
    targetQuery.selectionSet.selections = selections;
  }
  return targetQuery;
}

export default function mergeGql(target, source) {
  const document = {
    kind: 'Document',
    definitions: []
  };
  const targetQuery = mergeQuery(target, source);
  document.definitions.push(targetQuery);
  const fragments = mergeFragments(target, source);
  if (fragments.length > 0) {
    document.definitions.push(...fragments);
  }
  return document;
}
