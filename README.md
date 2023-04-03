# personal-budget

## Description

Small API project for managing a personal budget.

## Installation

1. Clone the repository
```
git clone https://github.com/PFrek/personal-budget.git [folder_name]
```
2. Change to the cloned folder
```bash
cd [folder_name]
```
3. Install dependencies
```bash
npm install
```
4. Run the server
```bash
node server.js
```
5. Send requests to the endpoints

## Endpoints

Base URL: http://localhost:3000/

### GET '/envelopes'

Retrieves all created envelopes

*Example request*:

GET /envelopes

*Example response*:

Status: 200 (OK)

Body:

```json
{
  "envelopes": [
    {
      "id": 1,
      "title": "example envelope",
      "budget": 100
    }
  ]
}
```
-----
### GET '/envelopes/:id'

Searchs for a specific envelope.

*Example request*:

GET /envelopes/1

*Example response*:

Status: 200 (OK)

Body:
```json
{
  "envelope": {
    "id": 1,
    "title": "example envelope",
    "budget": 100
  }
}
```
-----
### POST '/envelopes'

Creates a new envelope.

*Example request*:

POST /envelopes

Body:
```json
{
  "envelope": {
    "title": "New envelope",
    "budget": 450
  }
}
```

*Example response*:

Status: 201 (Created)

Body:
```json
{
  "envelope": {
    "title": "New envelope",
    "budget": 450,
    "id": 2
  }
}
```
-----
### POST /envelopes/transfer/:from/:to?value=[value]

Transfer a specific amount from an envelope to another envelope. The original envelope must have enough balance for the transfer to take place.

*Example request*:

POST /envelopes/transfer/2/1?value=50

*Example response*:

Status: 200 (OK)

Body:
```json
{
  "message": "Successfully transfered 50 from envelope #2 to envelope #1",
  "from": {
    "title": "New envelope",
    "budget": 400,
    "id": 2
  },
  "to": {
    "id": 1,
    "title": "example envelope",
    "budget": 150
  }
}
```
-----
PUT '/envelopes/:id?spending=[value]

Updates the title of an envelope. Also used to spend an amount from the envelope's budget.

*Example request*:

PUT /envelopes/1?spending=10

Body:
```json
{
  "title": "new title"
}
```

*Example response*:

Status: 200 (OK)

Body:
```json
{
  "envelope": {
    "id": 1,
    "title": "new title",
    "budget": 140
  }
}
```
-----
DELETE '/envelopes/:id'

Deletes a specific envelope.

*Example request*:

DELETE /envelopes/1

*Example response*:

Status: 204 (No Content)