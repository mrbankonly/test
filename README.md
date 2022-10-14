# exp-mgo-toolings
Made faster query for express and mongoose

### Modules
- **Query** helper for MongoDB mongoose
	**Required packages**
	- bson
- **AWS** helper easy use and include resize before upload
	**Required packages**
	- aws-sdk
	- uuid
	- dotenv
	- sharp
- **Pubnub** helper a little helper made more understandable for using pubnub as realtime app
	**Required packages**
	- pubnub
- **Mail** helper
	**Required packages**
	- nodemailer
- **Api Response** for express made code easier to handle error and standard response
- **asyncHandler** handler all error and no more try catch block every where

#### If you want to ignore package from other modules
- Import directly from DIR
```js
const asyncHandle = require("exp-mgo-toolings/src/async-handler")
const ApiResponse = require("exp-mgo-toolings/src/api-response")
const Aws = require("exp-mgo-toolings/src/aws")
const Mail = require("exp-mgo-toolings/src/mail")
const PubNub = require("exp-mgo-toolings/src/pubnub")
```

### # Query function's description
**Automatic Detect**  query params from query string
<mark style="background-color: #e1e5f5;padding: 5px"><b>page</b></mark> Perform paginate current page. Note: must follow with limit
<mark style="background-color: #e1e5f5;padding: 5px"><b>limit</b></mark>  Perform paginate current limit. Note: must follow with page 
<mark style="background-color: #e1e5f5;padding: 5px"><b>q</b></mark> Perform search keyword, work with **setSearchField** method
<mark style="background-color: #e1e5f5;padding: 5px"><b>start_date</b></mark> Perform filtering by date rate required with **end_date**
<mark style="background-color: #e1e5f5;padding: 5px"><b>end_date</b></mark> Perform filtering by date rate required with **start_date**
<mark style="background-color: #e1e5f5;padding: 5px"><b>sort</b></mark> Perform sorting concept column|arg ex: **created_at|asc**
<mark style="background-color: #e1e5f5;padding: 5px"><b>summary</b></mark> Get full paginate response such like: total, total_page,  total_in_page, etc...


#### Simple usage
```js
const { Query } = require("exp-mgo-toolings")
const mongoose = require("mongoose")

// Register somewhere for future use
const query = new Query(mongoose)

// ex1: "order" as collection's name
const execute = query.model("order") 

// ex2: Put model instance of mongoose
const ExampleModel = require("./some-mongoose-model")
const execute = query.model(ExampleModel) // ex2: "order" as collection's name

// Perform sample query
const result = await execute.exec(req) // "req" coming from express request

// ex3: Perform select and unset. Important select & unset cannot combine together
const result = await excute.
	unset("removeField1 removeField2") // or ["removeField1","removeField1"]
	.exec(req) // "req" coming from express request

const result = await excute.
	select("field1","field2") // or ["field1","field2"]
	.exec(req) // "req" coming from express request
```

### Example usage of $lookup
```js
// Peform sample lookup aggreagte concept
const result = await excute.
	lookup({ from: "modelName", localField: "localField", foreignField: "_id", as: "localField" })
	.exec(req) // "req" coming from express request

// Peform sample lookup aggreagte concept with select
const result = await excute.
	lookup({ from: "modelName", localField: "localField", foreignField: "_id", as: "localField", select: "field1 field2" })
	.exec(req) // "req" coming from express request

// Peform sample lookup aggreagte concept with unset
const result = await excute.
	lookup({ from: "modelName", localField: "localField", foreignField: "_id", as: "localField", unset: ["field1", "field2"] })
	.exec(req) // "req" coming from express request

// Peform sample lookup aggreagte concept with many. Default is true
const result = await excute.
	lookup({ from: "modelName", localField: "localField", foreignField: "_id", as: "localField", many: false })
	// many false return as object
	.exec(req) // "req" coming from express request
```

### Example usage of $populate
```js
// Peform sample populate mongoose concept with many. Default is true
// ex1: Sample usage
const result = await excute.
	populate("ref_field", "field1 field2") // 1. ref model 2.select field
	.exec(req) // "req" coming from express request

// ex2: With $select
const result = await excute.
	populate({ path: "ref_field", select: "field1 field2" })
	.exec(req) // "req" coming from express request

// ex3:With $unset
const result = await excute.
	populate({ path: "ref_field", unset: ["field1", "field2"] })
	.exec(req) // "req" coming from express request

// ex3: With $many  deafult is false
const result = await excute.
	populate({ path: "ref_field", many: true })
	.exec(req) // "req" coming from express request

// ex4: With sub populate required "modelName"
const result = await excute.
	populate({
		path: "ref_field",
		populate: {
			modelName: "ref_model", path: "ref_field"
			// Can use unset, select, many, etc...
		}
	})
	.exec(req) // "req" coming from express request

// ex5: With many sub populate required "modelName"
const result = await excute.
	populate({
		path: "ref_field",
		populate: [{
			modelName: "ref_model", path: "ref_field"
			// Can use unset, select, many, etc...
		}]
	})
	.exec(req) // "req" coming from express request

// ex6: With sub populate required "modelName"
const result = await excute.
	populate({
		path: "ref_field",
		populate: {
			modelName: "ref_model", path: "ref_field",
			// Can use unset, select, many, etc...
			populate: {
				modelName: "ref_model", path: "ref_field"
				// Can use unset, select, many, etc...
			}
		}
	})
	.exec(req) // "req" coming from express request
```

### Example usage of $match
```js
// ex1: simple match
const result = await excute.
	match({
		name: "bank"
	})
	.exec(req) // "req" coming from express request


// ex2: Perform match with populate
/* 
[
	{
		"name":"bank",
		"office_id":"18273817231927371892731"
	}
]
*/
const result = await excute.
	populate({
		path: "office_id",
		select: "name"
	}).
	match({
		"office_id.name": "where is my office data"
	})
	.exec(req) // "req" coming from express request
```

### Example usage of $setSearchField work with "q" from query string
```js
// ex1: simple match
const result = await excute.
	.setSearchField("name", "another_field")
	.exec(req) // "req" coming from express request


// ex2: Perform match with populate
/* 
[
	{
		"name":"bank",
		"office_id":"18273817231927371892731"
	}
]
*/
const result = await excute.
	populate({
		path: "office_id",
		select: "name"
	}).
	.setSearchField("office_id.name", "another_field")
	.exec(req) // "req" coming from express request
```

<mark style="background-color: #e1e5f5;padding: 5px"><b>lookup</b></mark> Perform join document in aggregate concept
- **path** Reference path
- **select** Filter only given select field
- **populate** Sub populate
- **many** Perform default "false"
- **unset** Filter out field

<mark style="background-color: #e1e5f5;padding: 5px"><b>populate</b></mark>  Perform join document in mongoose concept
- **path** Reference path
- **select** Filter only given select field
- **populate** Sub populate
- **many** Perform default "false"
- **unset** Filter out field
- **modelName** Models's name to reference to. Required only in sub **populate**

<mark style="background-color: #e1e5f5;padding: 5px"><b>set(String)</b></mark> Set response json like $project ex: "field1 field2"

<mark style="background-color: #e1e5f5;padding: 5px"><b>match(Object)</b></mark> Perform $match condition 

<mark style="background-color: #e1e5f5;padding: 5px"><b>setSearchField(...String)</b></mark> Perform $match condition ("field1","field2")

<mark style="background-color: #e1e5f5;padding: 5px"><b>custom(Object)</b></mark> Perform custom pipeline in aggregate concept

<mark style="background-color: #e1e5f5;padding: 5px"><b>forcePaginate(Boolean)</b></mark> True: required page, limit in query

<mark style="background-color: #e1e5f5;padding: 5px"><b>select(String)</b></mark> Perform Select field ex: "field1 field2" or ["field1","field2"]

<mark style="background-color: #e1e5f5;padding: 5px"><b>unset(...String)</b></mark> Perform filter out parameters in response ex: ("field1","field2")

<mark style="background-color: #e1e5f5;padding: 5px"><b>setOption(Object)</b></mark> 
- **performPaginateBeforeLogic** Advance usage perform paginate before condition or end of condition
- **dateField** Set filter field from query "start_date" and "end_date"

### Final query must be called (Promise function)
<mark style="background-color: #e1e5f5;padding: 5px"><b>exec(req)</b></mark> Combine all condition and Automatic detect query string and perform query


### # ApiResponse with asyncHandler
**API RESPONSE Usage description**
- Ex1: Throw new Error(`400::Your error message`)
- Ex2: Throw new Error(`Your error message`) Default 500 status
- Ex2 Multi language: Throw new Error(`400::en=English message && la=Lao message`)
- Ex3 With error CODE as ER001: Throw new Error(`400-ER001::Your error message`)

#### Let's try in express and asyncHandle
```js
const { asyncHandle, ApiResponse } = require("exp-mgo-toolings")

// ex1: sample use sage
app.get("/", asyncHandle(async ({ req, res }) => {
	const resp = new ApiResponse(res)

	if (checkError) throw new Error(`400::Your response message`)

	// Your code here
	return resp.response({})
}))

// ex2: sample with mongoose transaction
app.get("/",asyncHandle(async ({ body, res, opts, commit }) => {
	const resp = new ApiResponse(res)

	// Dont worry about abort 
	// If there is error automatic abort transaction

	await ExampleModel.insertOne(body, opts)

	await commit() // commit transaction

	return resp.response({})
}, mongoose))
```

### #AWS File upload
**Important ENV must specific** 
Don't worry I wont save your credential XD
- AWS_ACCESS_KEY_ID
- AWS_SECRET_KEY
- AWS_S3_BUCKET_NAME

#### Methods
**uploadFile()** 
<mark style="background-color: #e1e5f5;padding: 5px"><b>file</b></mark> file as buffer ex: req.file.image
<mark style="background-color: #e1e5f5;padding: 5px"><b>bucket</b></mark> (optional) default is set in ENV
<mark style="background-color: #e1e5f5;padding: 5px"><b>fileType</b></mark> file's format jpg,png...
<mark style="background-color: #e1e5f5;padding: 5px"><b>path</b></mark> storage path
<mark style="background-color: #e1e5f5;padding: 5px"><b>file_name</b></mark> by default it will generate file name as uuid string for you if you want to generate your own file's name then use this
<mark style="background-color: #e1e5f5;padding: 5px"><b>origin_filename</b></mark> use original file's name
<mark style="background-color: #e1e5f5;padding: 5px"><b>return_only_name</b></mark> by default will return with path if you want to return only filename then set this to "true"

**upload() and uploadMany()** 
<mark style="background-color: #e1e5f5;padding: 5px"><b>file</b></mark> file as buffer ex: req.file.image
<mark style="background-color: #e1e5f5;padding: 5px"><b>bucket</b></mark> (optional) default is set in ENV
<mark style="background-color: #e1e5f5;padding: 5px"><b>fileType</b></mark> file's format jpg,png...
<mark style="background-color: #e1e5f5;padding: 5px"><b>path</b></mark> storage path
<mark style="background-color: #e1e5f5;padding: 5px"><b>resize</b></mark> (Optional) ex: we want to resize image to 256px then set [256] or multiple size [500,256]

Example usage
```js
// Ex1: Sample usage
const filename = await AwsFunc.upload({
	file: req.files.image,
	fileType: "jpg",
	path: "some_path/"
})

// Ex2: With resize
const filename = await AwsFunc.upload({
	file: req.files.image,
	fileType: "jpg",
	resize: [256, 800],
	path: "some_path/"
})

// Ex3: Multiple File
const filename = await AwsFunc.uploadMany({
	file: req.files.image,
	fileType: "jpg",
	path: "some_path/"
})

// Ex4: Multiple File With resize
const filename = await AwsFunc.uploadMany({
	file: req.files.image,
	fileType: "jpg",
	resize: [256, 800],
	path: "some_path/"
})
```







