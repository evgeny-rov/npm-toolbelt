import { graphql, GraphqlResponseError } from '@octokit/graphql';
import { z } from 'zod';
import { getSortedPackageFilesDependencies } from '../../../helpers/githubPackages';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '@octokit/graphql-schema';
import { createPipeline, exclude, limit } from '../../../helpers/general';
import { formatData } from '../../../helpers/formatData';

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${process.env.GH_TOKEN}`,
  },
});

const getGithubUserPackageFiles = (username: string) => {
  return graphqlWithAuth<{ user: User }>(
    `query packages($username: String!) {
    user(login: $username) {
      repositories(
        isFork: false,
        first: 100,
        orderBy: {field: UPDATED_AT, direction: DESC}
      ) {
        edges {
          node {
            object(expression: "HEAD:package.json") {
              ... on Blob {
                text
              }
            }
          }
        }
      }
    }
  }`,
    { username }
  );
};

const querySchema = z.object({
  user: z.union([z.string().min(1), z.array(z.string().min(1))]),
  limit: z.string().optional(),
  filter: z.string().min(1).optional(),
  format: z.union([z.literal('svg'), z.literal('raw')]).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const DEFAULT_ITEMS_LIMIT = 50;

  try {
    const query = querySchema.parse(req.query);
    const userSlug = query.user;
    const user = Array.isArray(userSlug) ? userSlug[0] : userSlug;
    const packagesGithubResponse = await getGithubUserPackageFiles(user);

    const packageFilesDependenciesList = getSortedPackageFilesDependencies(
      packagesGithubResponse.user.repositories.edges
    );

    const filters = query.filter ? query.filter.split(',') : [];
    const limitAmount = query.limit ? Number(query.limit) : DEFAULT_ITEMS_LIMIT;
    const format = query.format ? query.format : 'raw';

    const pipeline = createPipeline<string[]>(
      exclude(filters),
      limit(limitAmount),
      formatData(format)
    );

    const result = pipeline(packageFilesDependenciesList);

    format === 'svg' && res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(result);
  } catch (e) {
    if (e instanceof GraphqlResponseError) {
      res.status(500).json(e.errors![0].message);
    } else if (e instanceof Error) {
      res.status(500).json(e.message);
    } else {
      console.log('what is this error then?', e);
    }
  }
}
