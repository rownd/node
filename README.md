# Rownd bindings for Node.js

Use this library to integrate Rownd into your Node.js application. Convenience wrappers are provided
for common server implementations.

## Installation

```bash
npm i @rownd/node
```

## Supported frameworks

- [Express](#express)

Don't see your framework of choice? Open an issue and request it, or contribute it via pull request!

## Usage

### Express

An `authenticate` function is provided for use as Express middleware.
It takes the usual `req, res, next` arguments and will call `next()` if authentication
succeeds or `next(err)` if it fails.

Upon successful authentication, the request will be augmented with a `tokenInfo` property containing
details about the authenticated token. `req.isAuthenticated` will also be set to `true`.

Each user's information is cached in memory for a short period of time to speed up subsequent requests.

See the [Express example](/examples/express/server.js) for a working implementation.

Here's an example protecting one route:
```js
const { rownd } = require('@rownd/node');
const { authenticate } = rownd.express;

app.get('/protected-route', authenticate(), (req, res) => {
    res.send({
        message: 'You are authenticated!',
        tokenObj: req.tokenObj,
    });
});
```

Here's an example protecting multiple routes on a certain path prefix:
```js
const { rownd } = require('@rownd/node');
const { authenticate } = rownd.express;

app.use('/protected-path', authenticate());
```

The `authenticate()` function accepts an optional `options` object containing the following properties:
- `fetchUserInfo: boolean (default: false)` - If `true`, the user's data will be fetched from the Rownd API and annotated on the request object as `req.user`. When present, it will contain a set of key/value pairs that match your application's schema. The user's data will be cached for a short period of time to speed up subsequent requests.
- `errOnInvalidToken: boolean (default: true)` - When `true`, the an error will be passed to `next(err)` if the token fails to validate. When `false`, the token will still be validated, but `next()` will be called without an error. `req.isAuthenticated` will be `false` and `req.tokenInfo` will be `null`.

### Vanilla JS

The SDK exposes the following methods to help you validate user tokens, create or update user records, generate sign-in links, and so on.

Here's a basic usage example:

```js
const Rownd = require('rownd');

const rownd = Rownd.createInstance({
  app_key: 'YOUR_ROWND_APP_KEY',
  app_secret: 'YOUR_ROWND_APP_SECRET'
});

try {
  // Receive a Rownd bearer token within your request headers (e.g., Authorization: Bearer <token>)
  let token = headers['authorization'].replace(/^bearer /i, '');

  let tokenInfo = await rownd.validateToken(token);
  // Available properties: decoded_token, user_id, access_token (the same token you passed into `validateToken()`)

  // If you want to grab the user's profile from Rownd
  let userInfo = await fetchUserInfo({ user_id: tokenInfo.user_id });

  console.log(userInfo.data); // Print user profile to console
} catch (err) {
  // Something went wrong--probably the token was invalid, expired, etc.
}

```
