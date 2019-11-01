# Capsol API

[![Build Status](https://travis-ci.org/ryan-bradford/Solar-API.svg?branch=master)](https://travis-ci.org/ryan-bradford/Solar-API) [![codecov](https://codecov.io/gh/ryan-bradford/Solar-API/branch/master/graph/badge.svg)](https://codecov.io/gh/ryan-bradford/Solar-API)

## Company

Our company helps to connect every day investors who want to do good, yet still make money, with homeowners who need help purchasing solar. Investors make investments through our software platform, creating crowdsourced financing now available for registered homeowners. Once the solar panel is installed through this funding, it drops the cost of a person’s electricity bill significantly, allowing the saved money to be returned back to both the investor and the homeowner at a set interest rate. 

## Design

This API follows a MVC architecture. Additionally, we chose to use TypeScript because of its ease-of-use, but also because of the aid type notation brings to development. On-top of TypeScript we chose to use Express.js to build a HTTP RESTful API architecture. 

### Model
We are resting on a model heavy design. The model contains three parts:

1. Database: we use a MySQL database to store all data. We chose MySQL because it is a ACID store and we need this service to be reliable.
2. DAO Layer: This is a layer of TypeScript code that sits between the database and the business logic. This layer exists soley to interface with the database.
3. Service Layer: This is a layer on top of the DAO layer that provides all the business logic.

### Controller
The controller is fairly simple. It calls all the appropriate service methods for the given endpoint and calls any appropriate view methods for making this data public.

### View
The view is the smallest part of the application. Because the Angular app rests in a separate repository, this view has nothing to do with HTTP. This view takes a entity made for the model and converts it into a model made the the view. This means the view methods rest mostly in the Stored{Entity}.

## TODO:

1. Strange bug with far too much investment transfer<br>
2. Add more tests (getPortfolioValue, makePayment, takeAssets, transferInvestment, saveInvestment)<br>
3. Improve speed of everything<br>
4. Change deleted to table field<br>
5. Create dashboard<br>
6. Add stuff about locking and transactions<br>
7. Codacy integration<br>
8. Make RAML<br>
