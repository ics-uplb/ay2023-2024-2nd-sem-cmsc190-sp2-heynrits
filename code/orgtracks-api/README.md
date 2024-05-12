# OrgTracks API

This project contains the HTTP and SocketIO server of OrgTracks API.

## Pre-requisite

- Node.js v20.9.0
- MongoDB v6.0.1

## Set up

### Environment Variables

Copy `.env.sample` as `.env` and set the applicable value for each variable.

```
# SERVER
PORT=3001

# MONGO DB
DB_HOST=localhost
DB_PORT=27017
DB_NAME=db_name
JWT_SECRET=RANDOMSTRING

# FRONTEND
FRONTEND_URL=http://localhost:3000

# INTEGRATIONS
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OSAM_API_URL=
OSAM_API_KEY=
```

**Notes**:
- `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` may be obtained through Google APIs console. Please see [Get your Google API client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#get_your_google_api_client_id) for a detailed guide.
- `OSAM_API_KEY` must be the same as the one defined in `osam-mock-server` as this is the one that is used to authorize API access to the mock server.

### Development
1. Install the dependencies.
    ```
    yarn
    ```

2. Run the dev server.
    ```
    yarn dev
    ```
