const express = require("express")
const mongoose = require("mongoose")
const app = express()
const Query = require("express-mongo")

# Required bson package and only work with mongoose
# NOTE, This is just little part of how to use this package
# IF HAVE FREE TIME I WILL ADJUST DOCS AND PACKAGE   

# Default query
- start_date
- end_date
- q ? use for search
    use with setSearchField Function
- limit
- page
- sort ? EX: created_at|desc or created_at|asc
- summary ? summary response


# Function
- lookup ? Join with lookup concept
- populate ? Joi with mongoose concept
- set ? set response json
- setSearchField ? add search field
- match ? condition
- custom ? custom aggregation
- forcePaginate ? forcePaginate by requried limit & page in query
- select ? select field
- unset ? remove field from response
- setOption ? option for Search & Filter Date
- exec ? Important This function must be call after finish condition


const query = new Query(mongoose)
const result = await query.model("order")
    .unset("staff_id user_id")
    .setOption({ performPaginateBeforeLogic: false })
    .setSearchField("seller_id.name", "payment_method_id.title", "order_number")
    .exec(req)

