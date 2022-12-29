let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const {Client}=require("pg");
const client=new Client({
    user:"postgres",
    password:"ajay1#vinay",
    database:"postgres",
    port:5432,
    host:"db.cxpnemgrdlhijklkenyl.supabase.co"
})
client.connect(function (res,error){
    console.log("connected !!!");
    if(error)console.log(error);
})


let {shops,products,purchases}=require("./shopData")

app.get("/resetData",function(req,res){
    resetShops()
    resetProducts()
    resetPurchases()
})

resetShops=()=>{
  let sql="truncate table shops"
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else{
      let shopArray=shops.map(ele=>[ele.shopId,ele.name,ele.rent])
      shopArray.map(ele=>{
        let sql1="INSERT INTO shops VALUES  ($1,$2,$3)"
        client.query(sql1,ele,function(err,result){
        })
      })
    }
  })
}
resetProducts=()=>{
  let sql="truncate table products"
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else{
      console.log("products empty success");
      let productArray=products.map(ele=>[ele.productId,ele.productName,ele.category,ele.description])
      productArray.map(ele=>{
        let sql1="INSERT INTO products VALUES ($1,$2,$3,$4)"
        client.query(sql1,ele,function(err,result){
      })
      })
    }
  })
}
resetPurchases=()=>{
  let sql="truncate table purchases"
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else{
      let purchasesArray=purchases.map(ele=>[ele.purchaseId,ele.shopId,ele.productid,ele.quantity,ele.price])
      purchasesArray.map(ele=>{
        let sql1="insert into purchases values  ($1,$2,$3,$4,$5)"
        client.query(sql1,ele,function(err,result){
         
        })
      })
    }
  })
}

app.get("/shops",function(req,res){
  let sql="select shopid,name from shops "
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else{
      res.send(result.rows)
    }
  })
})
app.get("/products",function(req,res){
  let sql="select * from products "
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else(res.send(result.rows))
  })
})
app.get("/purchases",function(req,res){
  let sql="select purchases.shopid,purchases.productid,productname,quantity,price,name from purchases join shops on shops.shopid=purchases.shopid join products on products.productid=purchases.productid"
  client.query(sql,function(err,result){
    if(err)console.log(err);
    else(res.send(result.rows))
  })
})
app.post("/shops",function(req,res){
  let body=req.body
  let str="SELECT * FROM shops"
  client.query(str,function(err,result){
    if(err)console.log(err.message);
    else{
      let shopsFromDb=result.rows
      let maxid=shopsFromDb.reduce((acc,crr)=>crr.shopid >= acc ? crr.shopid:acc,0)
      let newShopId=maxid+1
      console.log({maxid});
      let arr1=[newShopId,body.name,body.rent]
      let sql="INSERT INTO shops VALUES ($1,$2,$3)"
      client.query(sql,arr1,function(err,result){
        if(err)console.log(err);
        else(res.send(result.rows))
      })
    }
  })
 
})
app.post("/products",function(req,res){
  let body=req.body
  let str="SELECT * FROM products"
  client.query(str,function(err,result){
    if(err)console.log(err.message);
    else{
      let productsFromDb=result.rows
      let maxid=productsFromDb.reduce((acc,crr)=>crr.productid >= acc ? crr.productid:acc,0)
      let newProductId=maxid+1
      let arr1=[newProductId,body.productname,body.category,body.description]
      let sql="INSERT INTO products VALUES ($1,$2,$3,$4)"
      client.query(sql,arr1,function(err,result){
        if(err)console.log(err);
        else(res.send(result.rows))
      })
    }
  })
})
app.put("/products/:id",function(req,res){
  let body=req.body
  let id=+req.params.id
  let arr1=[body.productname,body.category,body.description,id]
  let sql="update products set productname=$1,category=$2,description=$3 where productid=$4"
  client.query(sql,arr1,function(err,result){
    if(err)console.log(err);
    else(res.send(result.rows))
  })
})

app.get("/purchases/shops/:id",function(req,res){
  let id=+req.params.id
  let sql="select * from purchases"
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else{
      let arr=result.rows
      arr=arr.filter(ele=>ele.shopid===id)
      res.send(arr)
    }
  })
})
app.get("/purchases/products/:id",function(req,res){
  let id=+req.params.id
  let sql="select * from purchases"
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else{
      let arr=result.rows
      arr=arr.filter(ele=>ele.productid===id)
      res.send(arr)
    }
  })
})
app.get("/purchases/qp",function(req,res){
  let shop=+req.query.storeid
  let product=req.query.productid
  let sort=req.query.orderby
  console.log("yes");
  console.log(shop,product,sort);
  let sql="SELECT purchaseid,productname,purchases.shopid,name,purchases.productid,quantity,price FROM purchases JOIN shops ON shops.shopid=purchases.shopid JOIN products ON products.productid=purchases.productid"
  client.query(sql,function(err,result){
    if(err)console.log(err.message);
    else{
      let arr=result.rows
      // console.log(arr);
      if(product) {
        product=product.split(",")
        arr=arr.filter(ele=>product.findIndex(sh=>sh==ele.productid)>=0)
      }
      if(shop) arr=arr.filter(ele=>ele.shopid===shop)
      if(sort==="QtyAsc") arr.sort((j1,j2)=>j1.quantity-j2.quantity)
      if(sort==="QtyDesc") arr.sort((j1,j2)=>j2.quantity-j1.quantity)
      if(sort==="ValueAsc") arr.sort((j1,j2)=>(j1.quantity*j1.price)-(j2.quantity*j2.price))
      if(sort==="ValueDesc") arr.sort((j1,j2)=>(j2.quantity*j2.price)-(j1.quantity*j1.price))
      res.send(arr)
    }
  })
})

app.get("/totalPurchase/shop/:id",function(req,res){
  let id=+req.params.id
  let sql="select shopid,productid,sum(quantity) as totalpurchase from purchases where shopid=$1 group by shopid,productid"
  client.query(sql,[id],function(err,result){
    if(err)console.log(err.message);
    else{
      res.send(result.rows)
    }
  })
})

app.get("/totalPurchase/product/:id",function(req,res){
  let id=+req.params.id
  console.log(id,"jj");
  let sql="SELECT productid,shopid,sum(quantity) AS totalpurchase FROM purchases WHERE productid=$1 GROUP BY shopid,productid"
  client.query(sql,[id],function(err,result){
    if(err)console.log(err.message);
    else{
      res.send(result.rows)
      console.log(result.rows);
    }
  })
})

app.post("/purchases",function(req,res){
  let body=req.body
  let maxid=purchases.reduce((acc,crr)=>crr.purchaseId >= acc ? crr.purchaseId:acc,0)
  let newPurchaseId=maxid+1
  let arr=[newPurchaseId,body.shopid,body.productid,body.quantity,body.price]
  let sql="INSERT INTO purchases VALUES ($1,$2,$3,$4,$5)"
  client.query(sql,arr,function(err,result){
    if(err)console.log(err.message);
    else{
      res.send(result.rows)
    }
  })
})