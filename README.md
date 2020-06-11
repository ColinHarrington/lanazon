# Lanazon
A code challenge by Colin Harrington. Also a bad play-on-words relating to a bookstore.   

Tools utilized:
* Node 14
* Typescript
* Express 
* sqlite
* docker

## Running the app
```sh
docker build . -t lanazon
docker run -p 3000:3000 lanazon
```

* Swagger UI at http://localhost:3000/api-docs
* List all Products: http://localhost:3000/api/products
* Checkout endpoint: http://localhost:3000/api/checkout

Beyond using swagger and the codebase to look at using this API here are cURL commands for the three scenarios below:

Scanned Items: MacBook Pro, Raspberry Pi B Total: $5,399.99
```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"cart":{"43N23P":1,"234234":1}}' \
  http://localhost:3000/api/checkout
```
Yields:
```json
{
   "lineItems":[
      {
         "product":{
            "sku":"234234",
            "name":"Raspberry Pi",
            "price":30,
            "qty":2
         },
         "quantity":1,
         "amount":30,
         "total":0,
         "discount":{
            "amount":30,
            "description":"Each sale of a MacBook Pro comes with a free Raspberry Pi B"
         }
      },
      {
         "product":{
            "sku":"43N23P",
            "name":"MacBook Pro",
            "price":5399.99,
            "qty":5
         },
         "quantity":1,
         "amount":5399.99,
         "total":5399.99
      }
   ],
   "total":5399.99
}
```
---
Scanned Items: Google Home, Google Home, Google Home Total: $99.98

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"cart":{"120P90":3}}' \
  http://localhost:3000/api/checkout
```
Yields:
```json
{
   "lineItems":[
      {
         "product":{
            "sku":"120P90",
            "name":"Google Home",
            "price":49.99,
            "qty":10
         },
         "quantity":3,
         "amount":149.97,
         "total":99.98,
         "discount":{
            "amount":49.99,
            "description":"Buy 3 Google Homes for the price of 2"
         }
      }
   ],
   "total":99.98
}
```
---
Scanned Items: Alexa Speaker, Alexa Speaker, Alexa Speaker Total: $295.65
```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"cart":{"A304SD":3}}' \
  http://localhost:3000/api/checkout
```
Yields
```json
{
   "lineItems":[
      {
         "product":{
            "sku":"A304SD",
            "name":"Alexa Speaker",
            "price":109.5,
            "qty":10
         },
         "quantity":3,
         "amount":328.5,
         "total":295.65,
         "discount":{
            "amount":32.85,
            "description":"Buying more than 3 Alexa Speakers will have a 10% discount on all Alexa speakers"
         }
      }
   ],
   "total":295.65
}
```


## Engineering code challenge, backend
Welcome to our backend challenge. We’re excited that you’ve decided
to invest your time in completing this exercise and we’re looking forward
to reviewing your code. There’s no time limit to complete this
assignment although we recommend spending between 3 to 6 hours.

Please use **NodeJS** as runtime environment and **Typescript** /
Javascript as the programming language for this coding exercise and
provide either a Dockerfile or clear build instructions to run your
application. You can also use any Javascript frameworks or libraries as
long as they don’t solve the core problem for you.
We’re looking for code that is readable, extensible, with functioning unit
and/or integration tests, proper use of logging, and error handling.
Documentation is also important on your thought process, usage
instructions, and how you would invest further time in making your
solution better.

### Shopping Cart
Have you shopped online? Let’s imagine that you need to build the
checkout business logic that will support different promotions with the
given inventory.
Build a checkout system as a standalone NodeJS API with these items:

|SKU   |Name           |Price     |Qty|
|------|:--------------|---------:|---:|
|120P90|Google Home    |$49.99    | 10|
|43N23P|MacBook Pro    |$5,399.99 |  5|
|A304SD|Alexa Speaker  |$109.50   | 10|
|234234|Raspberry Pi B |$30.00    |  2| 

**The system should have the following promotions:**
* Each sale of a MacBook Pro comes with a free Raspberry Pi B
* Buy 3 Google Homes for the price of 2
* Buying more than 3 Alexa Speakers will have a 10% discount on
all Alexa speakers

**Example Scenarios:**
* Scanned Items: MacBook Pro, Raspberry Pi B Total: $5,399.99
* Scanned Items: Google Home, Google Home, Google Home Total:
$99.98
* Scanned Items: Alexa Speaker, Alexa Speaker, Alexa Speaker Total:
$295.65

Please provide appropriate documentation on how to interact with your
API (i.e. Readme file, curl commands, or POSTman scripts, etc.).
Thank you for your time and we look forward to reviewing your solution.
