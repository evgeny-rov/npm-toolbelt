# Npm Toolbelt

Is a service to look up your most used **node packages**.

Use [npm toolbelt website](https://npm-toolbelt.vercel.app/) to:
- Get concise SVG image that can be used in GitHub readmes or other web pages.
- Limit, Filter anything you don't want from the result.
- Look up most used packages of any other github user.

Here is what my toolbelt looks like:

<img height="150" alt="dependencies" src="https://npm-toolbelt.vercel.app/api/users/evgeny-rov?format=svg&limit=19&filter=@,config,plugin,webpack,loader,detector,scripts,vitals,native-,autoprefixer">

## REST API Recipe

API’s base endpoint is `https://npm-toolbelt.vercel.app/api/` There is only one main resource `/users` and method `GET`

Combine everything and stir in github username `https://npm-toolbelt.vercel.app/api/users/{github_username}`

Now sprinkle some query parameters and you should get something that looks like this:

```
https://npm-toolbelt.vercel.app/api/users/evgeny-rov?format=svg&limit=10&filter=@,config,plugin
```

### Query parameters 

| Parameter name | Parameter value | Description |
| :------------- | :-------------- | :---------- |
| format         | raw/svg         |  {svg} generates SVG image based on collected data, {raw} will result in a json containing array of dependencies. |
| limit          | number          | The limit query parameter is used to include only the first N items of collected dependencies. |
| filter         | Comma-separated list of string values | Dependencies that partially or completely match any of the specified string values will be excluded from the response. |




