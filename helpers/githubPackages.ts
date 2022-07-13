import type { RepositoryEdge, Blob, Maybe } from '@octokit/graphql-schema';
import { countDuplicates } from './general';

const parsePackageFilesContents = (packages: Maybe<RepositoryEdge>[]) => {
  return packages.reduce<any[]>((acc, edge) => {
    const gitObject = edge?.node?.object as Blob;

    if (gitObject?.text) {
      return [...acc, JSON.parse(gitObject.text)];
    }
    return acc;
  }, []);
};

const extractPackagesDependencies = (packageFilesContents: Array<Record<string, any>>) => {
  const result: string[] = [];

  packageFilesContents.forEach((packageContent) => {
    const dependenciesFieldKeys = Object.keys(packageContent).filter((packageFieldKey) =>
      packageFieldKey.toLowerCase().includes('dependencies')
    );

    dependenciesFieldKeys.forEach((fieldKey) =>
      result.push(...Object.keys(packageContent[fieldKey]))
    );
  });

  return result;
};

export const getSortedPackageFilesDependencies = (
  packageFiles: Maybe<Maybe<RepositoryEdge>[]> | undefined
) => {
  if (!packageFiles || packageFiles.length === 0) return [];

  const packagesContents = parsePackageFilesContents(packageFiles);
  const dependencies = extractPackagesDependencies(packagesContents);
  const countedDependencies = countDuplicates(dependencies);

  const sortedDependencies = Object.entries(countedDependencies).sort(
    ([, countA], [, countB]) => countB - countA
  );

  const sortedDependenciesNames = sortedDependencies.map(([depName]) => depName);

  return sortedDependenciesNames;
};
