var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var multer  = require('multer');
var ObjectID = mongodb.ObjectID;

var products_COLLECTION = "products";
var orders_COLLECTION = "orders";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect("mongodb://localhost:27017/myAPP", function (err, database) {
    if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// products API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/products"
 *    GET: finds all products
 *    POST: creates a new product
 */

app.get("/products", function(req, res) {
  db.collection(products_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get products.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/products", function(req, res) {
  var newproduct = req.body;
  newproduct.createDate = new Date();

  if (!(req.body.name || req.body.price)) {
    handleError(res, "Invalid user input", "Must provide a name and price.", 400);
  }

  db.collection(products_COLLECTION).insertOne(newproduct, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new product.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/products/:id"
 *    GET: find product by id
 *    PUT: update product by id
 *    DELETE: deletes product by id
 */

app.get("/products/:id", function(req, res) {
  db.collection(products_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get product");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/products/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(products_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update product");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/products/:id", function(req, res) {
  db.collection(products_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete product");
    } else {
      res.status(204).end();
    }
  });
});

/* order details restful codes */

app.get("/orders", function(req, res) {
  db.collection(orders_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get orders.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/orders", function(req, res) {
  var neworder = req.body;
  neworder.createDate = new Date();

  if (!(req.body.name || req.body.street)) {
    handleError(res, "Invalid user input", "Must provide a name and address.", 400);
  }

  db.collection(orders_COLLECTION).insertOne(neworder, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new order.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});



var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images/uploads/');
  },
  filename: function (req, file, callback) {
    callback(null,file.originalname);
  }
});

var upload = multer({ storage : storage}).single('img');

app.post('/fileUpload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });    
});