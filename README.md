TODO:

Write tests
Create dashboard
Add ability to sell
    Add the idea of a buy request and sell request
Design Database/Data Structure


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
