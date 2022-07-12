// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { graphql } from '@octokit/graphql';
import type { User } from '@octokit/graphql-schema';

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${process.env.GH_TOKEN}`,
  },
});

const createPackagesQuery = () =>
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
  }`;

const getUserReposWithPackages = (username: string) => {
  const query = createPackagesQuery();
  const response = graphqlWithAuth<{ user: User }>(query, { username });

  return response;
};

type Data = string[];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const anyGhRequest = await getUserReposWithPackages('gawg213dsg4y3y4ysfs35@#');

    res.status(200).json(anyGhRequest);
  } catch (req) {
    console.log(e.errors);
    res.status(500).json(e.errors[0].message);
  }
}
