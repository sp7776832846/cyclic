
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
// _______________________________________________________________________________________________//

const mongoose = require("mongoose");

mongoose.set('strictQuery', false);
// _______________________________________________________________________________________________//

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// _______________________________________________________________________________________________//
// *** Create a New Database inside MongoDB via connecting mongoose: ***
// mongoose.connect("mongodb://127.0.0.1/todolistDB");
 mongoose.connect("mongodb+srv://admin-sushil:Test123@cluster0.0sb3sws.mongodb.net/todolistDB");
// _______________________________________________________________________________________________//

const itemsSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

const Item = mongoose.model("Item", itemsSchema);
// _______________________________________________________________________________________________//

const item1 = new Item({
  name: "Prepare food"
});

const item2 = new Item({
  name: "Eat food"
});

const item3 = new Item({
  name: "Serve food"
});

const defaultItems = [item1, item2, item3];
// _______________________________________________________________________________________________//

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

// _______________________________________________________________________________________________//

// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   } else{
//     console.log("Successfully saved to do list in DB.");
//   }
// });
// _______________________________________________________________________________________________//

app.get("/", function(req, res) {

// const day = date.getDate();

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else{
          console.log("Successfully saved to do list in DB.");
        }
      });
      res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customerListName", function(req, res){
  const customerListName = _.capitalize(req.params.customerListName);

// Cannot used below code bcz it give same list again and again. 
// const list = new List({
//   name: customerListName,
//   items: defaultItems
// });

  List.findOne({ name: customerListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
            name: customerListName,
            items: defaultItems
        });

       list.save(function(){
       res.redirect("/"+customerListName);
       });

      // I believe callbacks do not execute until the rest of the parent function has completed i.e below code not used. 
      //  res.redirect("/"+customerListName);

      } else {
        // Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      
      foundList.items.push(item);

      foundList.save(function(){
        res.redirect("/"+ listName);
        });
    });
  }

  // item.save(function(err){
  //   if (err) {
  //     console.log(err);
  //   } else{
  //     res.redirect("/");
  //   }
  // });

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){

  const checkBoxId = req.body.checkbox;
  const  listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkBoxId, function(err){
      if(!err){
        console.log("Successfully deleted document from DB.");
        res.redirect("/");
      } 
    });
  } else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkBoxId}}},function(err, foundList){
      if(!err){
      res.redirect("/"+ listName);
      }
    });
  }

  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
