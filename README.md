# swagger-walker
NodeJS utility to help work with Swagger Spec

It eats any version and format of Swagger schema and return strict internal Swagger schema representation  


⚠⚠⚠ WIP ⚠⚠⚠   
# npm package currently is not exist  

## Usage  

1. Install  
```bash
npm i -D swagger-walker
```
2. Import  
```ts
import { createSwaggerWalker } from "swagger-walker";


// ...somewhere

const walker = await createSwaggerWalker({
  path: PATH_TO_YOUR_SWAGGER_SCHEMA,
  url: URL_TO_YOUR_SWAGGER_SCHEMA;
  spec: JS_OBJECT_SWAGGER_SCHEMA;
})

```
