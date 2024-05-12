# OSAM Mock Server

A sample mock server for receiving successful applicants' data from organizations sent by OrgTracks.

## Pre-requisite

- Node.js v20.9.0
- MongoDB v6.0.1

## Set up

### Environment Variables

Copy `.env.sample` as `.env` and set the applicable value for each variable.

```
# SERVER
PORT=6000

# MONGO DB
DB_HOST=localhost
DB_PORT=27017
DB_NAME=db_name

# INTEGRATIONS
OSAM_API_KEY=secret_string
```

### Development
1. Install the dependencies.
    ```
    yarn
    ```

2. Run the dev server.
    ```
    yarn dev
    ```

## Using the API

### POST `/api/organizations`

Create an organization record.

**PARAMETERS**:

`none`

**HEADER**:

| Name                    | Format                  |
| --------                | -------                  | 
| `Authorization`         | Bearer: `<OSAM_API_KEY>` |

**JSON BODY**:

| Name             | Type        | Description |
| --------         | -------     | -------     | 
| `_id`            | `ObjectId`  | id of organization from OrgTracks. |
| `name`           | `string`    | name of organization. |
| `description`    | `string`    | description of organization. |

---

### POST `/api/organizations/:organizationId/roster/add`

Save the email addresses of newly accepted members in an organization.

**PARAMETERS**:

| Name             | Type        | Description |
| --------         | -------     | -------     | 
| `organizationId`            | `ObjectId`  | id of organization from OrgTracks. |

**HEADER**:

| Name                    | Format                  |
| --------                | -------                  | 
| `Authorization`         | Bearer: `<OSAM_API_KEY>` |


**JSON BODY**:

| Name             | Type        | Description |
| --------         | -------     | -------     | 
| `users`            | `string[]`  | email addresses of newly accepted members in an organization. |
