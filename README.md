# swagger-walker
NodeJS utility to help work with Swagger Spec

It eats any version and format of Swagger schema and return strict internal Swagger schema representation  


## Usage  

1. Install  
```bash
npm i -D swagger-walker
```
2. Usage  
```ts
import { createSwaggerWalker } from "swagger-walker";


// ...somewhere

const walker = await createSwaggerWalker({
  path: PATH_TO_YOUR_SWAGGER_SCHEMA, // optional
  url: URL_TO_YOUR_SWAGGER_SCHEMA; // optional
  spec: JS_OBJECT_SWAGGER_SCHEMA; // optional
})

if (!walker) {
  walker.components.schemas.find(/* do something */)
}

```
