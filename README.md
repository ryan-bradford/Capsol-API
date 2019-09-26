TODO:

Implement Purchase and Sell Requests and corresponding service
Write tests
Create dashboard
Add ability to sell
    Add the idea of a buy request and sell request
Design Database/Data Structure


Overall Architecture Design:
/env -> stores configuration stuff
/db -> stores the schema and all migration scripts
/spec -> where all the tests lie
/src/services -> stores all the classes for interacting with the database. Here is where business logic will go.
/src/entities -> all the entities that this app will use. Here is where the validation will go.
/src/public -> any publicly accessible scripts (CSS, JS, ect);
/src/routes -> links the views to the entities/DAOS
/src/shared -> any helper functions that need to be used globally
/src/views -> the PUG views for rendering the JSON content


APIs:

GET /investors                  - get all investors 
POST /investors                 - create an investor
GET /investors/{id}             - get a single investor account
DELETE /investors/{id}          - delete an investor
PUT /investor/{id}/investment   - adds more money to the investors portfolio

GET /homeowners                 - get all homeowners
POST /homeowners                - create a homeowner
GET /homeowners/{id}            - get a single homeowners
DELETE /homeowners/{id}         - delete a homeowner
PUT /homeowners/{id}/home       - signs this user up for investments