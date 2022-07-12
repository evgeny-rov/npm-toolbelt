import { graphql, GraphqlResponseError } from '@octokit/graphql';
import { z } from 'zod';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '@octokit/graphql-schema';

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

const userSchema = z.union([z.string().min(1), z.array(z.string().min(1))]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = userSchema.parse(req.query.user);
    const packagesGithubResponse = await getGithubUserPackageFiles(
      Array.isArray(user) ? user[0] : user
    );

    res.status(200).json(req.query);
  } catch (e) {
    if (e instanceof GraphqlResponseError) {
      res.status(500).json(e);
    } else {
      res.status(500).json(e);
      console.log(e);
    }
  }
}
