'use strict';

/* Controllers */

angular.module('roApp.controllers', [])
    .controller('BaseController', ['$scope', '$window', 'brand', 'SessionService', function($scope, $window, brand, SessionService) {
        $scope.brand = brand;

        $scope.doLogout = function() {
            SessionService.removeSession();
            $window.location = '/';
        };
    }])
    .controller('HomeController', ['$scope', 'SessionService', function($scope, SessionService) {
        $scope.session = SessionService.getSession();

        $scope.user = {};

        $scope.$on('event:login-confirmed', function() {
            console.log('event has been broadcast to Home Controller');
            $scope.session = SessionService.getSession();
        });
    }])
    .controller('LoginController', ['$scope', 'SessionService', 'Restangular', function($scope, SessionService, Restangular) {
        $scope.session = SessionService.getSession();
        $scope.user = {};

        $scope.$on('event:login-confirmed', function () {
            console.log('event has been broadcast to Home Controller');
            $scope.session = SessionService.getSession();
        });
    }])

    // ---------------------------------------------------------------
    // This was copied from another project and needs to be reworked
    // ---------------------------------------------------------------
     .controller('RegisterController', ['$scope', 'Restangular', '$window', function($scope, Restangular, $window) {
        $scope.user = {
            'username': '',
            'first_name':'',
            'last_name':'',
            'email':'',
            'password':''
        }


        $scope.adduser = function() {
           Restangular.one('users').customPOST($scope.user).then(function (data) {
//                $scope.user_goals = data;
                console.log(data);
            })
           $window.location = 'index.html#/home';
        }

        //console.log('In Register controller');
    }])

    // ---------------------------------------------------------------
    // This was copied from another project and needs to be reworked
    // ---------------------------------------------------------------
    .controller('MyAccountProfileController', ['$scope', 'SessionService', 'Restangular', function($scope, SessionService, Restangular) {
        $scope.session = SessionService.getSession();
        $scope.currentUserInfo = SessionService.getSession();

        $scope.myLocationList = [];
        $scope.myPaymentList = [];

        if (SessionService.getUserLocations()){
            $scope.myLocationList=SessionService.getUserLocations();
        }

        //fd.append("eventName", $scope.location.eventName);
        Restangular.all('payment').getList()
            .then(function (data) {
                $scope.paymentList = data;
                for (var i = 0; i < $scope.paymentList.length; i++){
                    if ($scope.paymentList[i].user_id==$scope.session.id){
                        var eventIdNum = $scope.paymentList[i].event_id - 1;
                        var event={
                            'eventId': $scope.paymentList[i].event_id,
                            'eventName':$scope.myLocationList[eventIdNum].eventName,
                            'description':$scope.myLocationList[eventIdNum].description,
                            'eventStartDate':$scope.myLocationList[eventIdNum].eventStartDate,
                            'totalCost':$scope.myLocationList[eventIdNum].totalCost,
                            'payment_amount':$scope.paymentList[i].payment_amount
                        };
                        $scope.myPaymentList.push(event);
                    }
                }

                console.log($scope.paymentList);
                console.log($scope.myPaymentList);
            });

        $scope.$on('event:login-confirmed', function() {
            console.log('event has been broadcast to Home Controller');
            $scope.session = SessionService.getSession();



            Restangular.all('location').getList()
            .then(function (data) {
                $scope.locationList = data;
                for (var i = 0; i < $scope.locationList.length; i++){
                    if ($scope.locationList[i].user==$scope.session.id){
                        $scope.myLocationList.push($scope.locationList[i]);
                        console.log($scope.myLocationList);
                    }
                }
                SessionService.saveUserLocations($scope.myLocationList);
            })
        });
    }])

    // ---------------------------------------------------------------
    // This was copied from another project and needs to be reworked
    // ---------------------------------------------------------------
    .controller('CreateJobController', ['$scope', 'SessionService', 'Restangular', '$window', '$http', function ($scope, SessionService, Restangular, $window, $http) {
        $scope.newJob = {};
        $scope.session = SessionService.getSession();

        $scope.$on('event:login-confirmed', function () {
            console.log('event has been broadcast to Home Controller');
            $scope.session = SessionService.getSession();

        });

        $scope.uploadFile = function (files) {
            $scope.newJob.photos = files[0];

        };

        $scope.save = function () {

            var newEvent = {
                'user': 1, //$scope.session.id,
                'eventName': $scope.newJob.eventName,
                'listingTitle': $scope.newJob.listingTitle,
                'industry': $scope.newJob.industry,
                'description': $scope.newJob.description,
                'location': $scope.newJob.location,
                'startDate': $scope.newJob.startDate,
                'totalCost': $scope.newJob.totalCost,
                'commissionAmount': $scope.newJob.commissionAmount,
                'linkUrl': $scope.newJob.linkUrl,



                'photo': $scope.newJob.photos,
            };

            // Grabs the GPS coordinates if it's not already there --------------------------------------------------------------------------------->
            if ($scope.new_event.gpsLat == null || $scope.new_event.gpsLng == null) {
                $scope.new_event.reliableGPS = false; // determines if the coordinates were manually entered or approximated based on the city
                var geocoder = new google.maps.Geocoder();
                var locateMe = $scope.new_event.city + ", " + $scope.new_event.state;

                var geocoderRequest = { address: locateMe };
                geocoder.geocode(geocoderRequest, function (results, status) {
                    $scope.geoLocater = results;
                    $scope.new_event.gpsLng = $scope.geoLocater[0].geometry.location.e;
                    $scope.new_event.gpsLat = $scope.geoLocater[0].geometry.location.d;
                });

            }
            $http.post('http://localhost:8001/newevent', newEvent, {
//                withCredentials: true,
                headers: {'Content-Type': undefined },
                transformRequest: angular.identity
            }).success(function (response) {
                $window.location = 'index.html#/accountProfile';
            }).error(function (response) {
                console.log('Response: ' + response);
            });


        }
    }])

    // ---------------------------------------------------------------
    // This was copied from another project and needs to be reworked
    // ---------------------------------------------------------------
    .controller('JobDetailsController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {
        $scope.session = SessionService.getSession();

        var requestURI = window.location.hash.substr(2);  // then do a split to get the last value, then plug in that last value into the route params.ID (or similar variable)
        var requestURIarray = requestURI.split("/");
        var jobId = requestURIarray[1];
        Restangular.all('job').getList()
            .then(function (data) {
                $scope.jobList = data;
                $scope.job = $scope.jobList[jobId];
                Restangular.all('companies').getList()
                    .then(function (data) {
                        $scope.company = data[$scope.job.company - 1];
                        console.log($scope.company);
                    });
            });
        var apply = false;
        $scope.applySwitch = function (){
            if (apply==false){
                apply=true;
                console.log("true");
                return
            }
            if (apply==true){
                apply=false;
                console.log("false");
            }
        }
    }])
    .controller('FindJobController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {
         Restangular.all('job').getList()
            .then(function (data) {
                $scope.jobList = data;
                console.log($scope.jobList);
            });
    }])
    .controller('browseApplicantsController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

        Restangular.all('applications').getList({'jobID':$routeParams.id})
            .then(function (data) {
                $scope.applicationList = data;
            });
    }])
    .controller('jobChatRoomController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

        Restangular.all('chat').getList({'jobID':$routeParams.id})
            .then(function (data) {
                $scope.chatList = data;
            });
    }])
    .controller('jobOfferController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

        Restangular.all('applications').getList({'jobID':$routeParams.id})
            .then(function (data) {
                $scope.applicationList = data;
            });

        Restangular.all('chat').getList({'jobID':$routeParams.id})
            .then(function (data) {
                $scope.chatList = data;
            });
    }])
    .controller('leaveRatingController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

        Restangular.all('ratings').getList({'jobID':$routeParams.id})
            .then(function (data) {
                $scope.ratingList = data;
            });
    }])
    .controller('salesRepDetailsController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

        Restangular.all('sales-user').getList({'userID':$routeParams.id})
            .then(function (data) {
                $scope.salesUser = data;
            });

    }])
    .controller('companyDetailsController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

        var requestURI = window.location.hash.substr(2);  // then do a split to get the last value, then plug in that last value into the route params.ID (or similar variable)
        var requestURIarray = requestURI.split("/");
        var companyId = requestURIarray[1];
        // this needs to pull in a company list first, then pick off the id of the company you want to view and assign that to a variable for that specific company
        Restangular.all('company/'+companyId).getList()
            .then(function (data) {
                $scope.company = data;
            });
    }])
    .controller('LeaderboardController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

    }])
    .controller('SalesmanController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

    }])
    .controller('ProfileDashController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

    }])
    .controller('DashboardController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {

    }]);