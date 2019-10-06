TODO:

Write tests for daos<br>
Write tests for entities<br>
Write tests for service<br>
Change user id to VARCHAR<br>
Change deleted to table field<br>
Add validation to entities in routers<br>
Design better error handling<br>
Comment shit<br>
Create dashboard<br>
Add ability to sell<br>
    Add the idea of a buy request and sell request<br>
Design Database/Data Structure<br>
Make RAML<br>


Overall Architecture Design:<br>
/env -> stores configuration stuff<br>
/db -> stores the schema and all migration scripts<br>
/spec -> where all the tests lie<br>
/src/dao -> stores the classes that interact with the database, whatever that may be.<br>
/src/services -> stores important business processes that are tangential to database or entity. Here is where business logic will go.<br>
/src/entities -> all the entities that this app will use. Here is where the validation will go.<br>
/src/public -> any publicly accessible scripts (CSS, JS, ect);<br>
/src/controllers -> links the views to the entities/DAOS<br>
/src/routes -> links the controller to the proper auth + validation methods<br>
/src/shared -> any helper functions that need to be used globally<br>
/src/views -> the PUG views for rendering the JSON content<br>


APIs: 

GET /investors                  - get all investors<br> 
POST /investors                 - create an investor<br>
GET /investors/{id}             - get a single investor account<br>
DELETE /investors/{id}          - delete an investor<br>
PUT /investor/{id}/investment   - adds more money to the investors portfolio<br>

GET /homeowners                 - get all homeowners<br>
POST /homeowners                - create a homeowner<br>
GET /homeowners/{id}            - get a single homeowners<br>
DELETE /homeowners/{id}         - delete a homeowner<br>
PUT /homeowners/{id}/home       - signs this user up for investments<br>
