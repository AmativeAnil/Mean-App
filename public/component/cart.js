angular.module("cart", [])
.service("cart", function(){
   var cartData = [];
      this.addProduct = function(id, name, price){
          var addedToExistingItem = false;
          for(var i=0; i < cartData.length; i++){
              if(cartData[i].id == id){
                  cartData[i].count++;
                  addedToExistingItem = true;
                  break;
              }
          }
          if(!addedToExistingItem){
              cartData.push({
                 count: 1, id: id, price: price, name: name 
              });
          }
      },
        this.removeProduct = function(id){
            for(var i=0; i<cartData.length; i++){
                if(cartData[i].id == id){
                    cartData.splice(i, 1);
                    break;
                }
            }
        },
        this.getProducts = function(){
            return cartData;
        }
});