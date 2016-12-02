angular.module("productsApp", ['ngRoute', 'cart'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "views/home.html",
                controller: "mainCtrl",
                resolve: {
                        products: function(products) {
                            return products.getproducts();
                        }
                    }
            })
            .when("/onlinePage", {
                templateUrl: "views/onlinePage.html",
                controller: "mainCtrl",
                resolve: {
                        products: function(products) {
                            return products.getproducts();
                        }
                    }
            })
            .when("/cart", {
                templateUrl: "views/cartSummary.html",
                controller: "cartSummaryController"
            })
            .when("/placeOrder", {
                templateUrl: "views/placeOrder.html",
                controller: "placeOrderController"
            })
            .when("/complete", {
                templateUrl: "views/thankYou.html",
                controller: "placeOrderController"
            })
            .when("/adminOrders", {
                templateUrl: "views/adminOrder.html",
                controller: "orderController"
            })
            .when("/admin", {
                templateUrl: "views/admin.html",
                controller: "ListController",
                resolve: {
                    productlist: function(products) {
                        return products.getproducts();
                    }
                }
            })
            .when("/new/product", {
                controller: "NewproductController",
                templateUrl: "views/product-form.html"
            })
            .when("/product/:productId", {
                controller: "EditproductController",
                templateUrl: "views/product.html"
            })
            .when("/fileUpload", {
                templateUrl: "views/fileUpload.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("products", function($http) {
        this.getproducts = function() {
            return $http.get("/products").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding products.");
                });
        }
        this.createproduct = function(product) {
            return $http.post("/products", product).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating product.");
                });
        }
        this.getproduct = function(productId) {
            var url = "/products/" + productId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this product.");
                });
        }
        this.editproduct = function(product) {
            var url = "/products/" + product._id;
            console.log(product._id);
            return $http.put(url, product).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this product.");
                    console.log(response);
                });
        }
        this.deleteproduct = function(productId) {
            var url = "/products/" + productId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this product.");
                    console.log(response);
                });
        }
    })
    .controller('mainCtrl', function($scope, products, cart) {
//        var products = [{"id":1, "imgUrl":"flower1.jpg", "name": "Demo1", "price": 100},
//                            {"id":2, "imgUrl":"flower2.jpg", "name": "Demo2", "price": 200},
//                            {"id":3, "imgUrl":"flower3.jpg", "name": "Demo3", "price": 300},
//                            {"id":4, "imgUrl":"flower4.jpg", "name": "Demo4", "price": 400}
//                            ];
            $scope.productList = products.data;
            $scope.cartData = cart.getProducts();
            $scope.addProductToCart = function(product){
                cart.addProduct(product._id, product.name, product.price);
            }
            $scope.modalFunction = function(product){
                $scope.productData = product;
            }
    })
    .controller("cartSummaryController", function($scope, cart){
        $scope.cartData = cart.getProducts();

        $scope.total = function(){
            var total = 0;
            for(var i=0; i < $scope.cartData.length; i++){
                total += ($scope.cartData[i].price * $scope.cartData[i].count);
            }
            return total;
        }
        $scope.remove = function(id){
            cart.removeProduct(id);
        }
    })
    .controller('placeOrderController', function($scope, $http, cart, $location) {
    
            $scope.cartData = cart.getProducts();
            $scope.sendOrder = function(shippingDetails){
            order = angular.copy(shippingDetails);
            order.products = cart.getProducts();

            $http.post("/orders", order)
            .success(function(data){
                $scope.data.orderId = data._id;
            })
            .error(function(err){
                $scope.data.orderError = err;
            })
            .finally(function(){
                $location.path("/complete");
                cart.getProducts().length = 0;
            });
        }
    })
    .controller("orderController", function($scope, $http){
        $http.get("/orders")
        .success(function(data){
            $scope.orders = data;
        })
        .error(function(err){
            $scope.error = err;
        });
        $scope.selectedOrder;
        $scope.selectOrder = function(order){
          $scope.selectedOrder = order;  
        };

        $scope.calculateTotal = function(order){
            var total = 0;

            for(var i=0; i<order.products.length; i++){
                total += order.products[i].count * order.products[i].price;
            }
            return total;
        };
    })
    .controller("ListController", function($scope,$location, productlist, products) {
        $scope.productlist = productlist.data;
    
            $scope.deleteproduct = function(product) {
            products.deleteproduct(product).then(function(){
                location.reload();
            });
        }   
    })
    .controller("NewproductController", function($scope, $location, products) {
        $scope.back = function() {
            $location.path("/admin");
        }

        $scope.saveproduct = function(product) {
            products.createproduct(product).then(function(doc) {
                var productUrl = "/fileUpload";
                $location.path(productUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditproductController", function($scope, $routeParams, products) {
        products.getproduct($routeParams.productId).then(function(doc) {
            $scope.product = doc.data;
        }, function(response) {
            alert(response);
        });
        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.productFormUrl = "/views/product-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.productFormUrl = "";
        }

        $scope.saveproduct = function(product) {
            products.editproduct(product);
            $scope.editMode = false;
            $scope.productFormUrl = "";
        }

        $scope.deleteproduct = function(productId) {
            products.deleteproduct(productId);
            $scope.productFormUrl = "";
        }
    });