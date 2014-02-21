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

    // ---------------------------------------------------------------
    // This was copied from another project and needs to be reworked
    // ---------------------------------------------------------------
    .controller('RegisterController', ['$scope', '$window', 'Restangular', 'SessionService', function($scope, $window, Restangular, SessionService) {
        $scope.user = {}

        $scope.username = null;
        $scope.password = null;
        $scope.first_name = null;
        $scope.last_name = null;
        $scope.email = null;

        $scope.doRegister = function() {
            $scope.user = {
                'email': $scope.email,
                'password': $scope.password,
                'username': $scope.username,
                'date_joined': new Date(),
                'first_name': $scope.first_name,
                'last_name': $scope.last_name
            };
            Restangular.all('users').customPOST($scope.user)
                .then(function(data) {
                    $window.location = 'index.html#/accountProfile';
                    console.log('Register Success: ' + response);
                }), function(response) {
                    console.log('Register error: ' + response);
                    $scope.errorMessage = response;
                };
        };

        $scope.hasError = function (field, validation) {
            if (validation) {
                return $scope.registerForm[field].$dirty && $scope.registerForm[field].$error[validation];
            }
            return $scope.registerForm[field].$dirty && $scope.registerForm[field].$invalid;
        };
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
        $scope.new_event = {};
        $scope.session = SessionService.getSession();

        $scope.$on('event:login-confirmed', function () {
            console.log('event has been broadcast to Home Controller');
            $scope.session = SessionService.getSession();

        });

        $scope.uploadFile = function (files) {
            $scope.new_event.photos = files[0];

        };

        $scope.save = function () {

            var newEvent = {
                'user': $scope.session.id,
                'eventName': $scope.new_event.eventName,
                'description': $scope.new_event.description,
                'gpsLng': $scope.new_event.gpsLng,
                'gpsLat': $scope.new_event.gpsLat,
                'reliableGPS': $scope.new_event.reliableGPS,
                'street': $scope.new_event.street,
                'city': $scope.new_event.city,
                'state': $scope.new_event.state,
                'country': $scope.new_event.country,
                'comments': $scope.new_event.comments,
                'sponsored': $scope.new_event.sponsored,
                'forCharity': $scope.new_event.forCharity,
                'totalCost': $scope.new_event.totalCost,
                'participantCost': $scope.new_event.participantCost,
                'linkUrl': $scope.new_event.linkUrl,
                'eventStartDate': $scope.new_event.eventStartDate,
                'eventEndDate': $scope.new_event.eventEndDate,
                'photo': $scope.new_event.photos
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
        //to display images from Home page
        $scope.paymentForm = 'partials/paymentForm.html';

        Restangular.one('uploadedimages', $routeParams.id).customGET()
            .then(function (photo_url) {
                $scope.photo_url = photo_url[0];
        });

        Restangular.one('location-detail', $routeParams.id).customGET()
        .then(function (location) {
            $scope.location = location;

            // this Shows the Edit Event button if you are a logged in as a super user or you are the user that created the event
            /*if ($scope.session.is_superuser == true || $scope.location.user == $scope.session.id){
                $scope.showEdit = "Approved";
                }
                else{
                $scope.showEdit = null;
                }*/
            // This Shows a warning if the GPS coordinantes were not manually entered at the time of the event creation
            if ($scope.location.reliableGPS == false){
                $scope.gpsStatus = "These coordinates have been approximated to the city center";
                }
                else{
                    $scope.gpsStatus = "These coordinates have been manually entered and should be exact";
                }

            // Maps the Location --------------------------------------------------------------------------------->
            var myLatlng = new google.maps.LatLng($scope.location.gpsLat, $scope.location.gpsLng);
            var mapOptions = {
                zoom: 6,
                center: myLatlng
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: $scope.location.eventName
            });
            // Ends Maps the Location --------------------------------------------------------------------------------->

            eventPopulator();

        });

        $scope.uiConfig = {
          calendar:{
            height: 250,
            editable: true,
            header:{
              left: false,
              center: false, //'title',
              right: false
            },
            dayClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize
          }
        };

        $scope.eventSources = [];

        function eventPopulator(){
            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            $scope.events = [
              {title: $scope.location.eventName, start: $scope.location.eventStartDate, end: $scope.location.eventEndDate}
            ];
            $scope.eventSources.push($scope.events);
        }

        console.log($scope.eventSources);

        $scope.commentText = null;
        $scope.submitted = false;

        $scope.save = function () {
            if ($scope.submitted == false) {

                var fd = {};
                fd["locationPostID"] = $routeParams.id;
                fd["commentText"] = $scope.commentText;
                fd["user"] = $scope.session.id;

                $http({
                    method: 'POST',
                    url: 'http://localhost:8001/comment',
//                    url: 'http://vast-journey-8108.herokuapp.com/comment',
                    data: fd
                }).success(function (response) {
                        $scope.commentList[$scope.commentList.length] = response;
                        $scope.submitted = true;
                    }).error(function (response) {
                        console.log("there was an Error! Run!!" + response);
                    });
            }
        };
        //to save upvotes and downvotes to server

        $scope.countChoculaUp = function(location){
            if (location.voted==null){
                location.voteCount += 1;
                location.voted = true;
                delete location.photos;
                Restangular.one('location-detail', location.id).customPUT(location)
                .then(function (data) {
                })
            }
        };
        $scope.countChoculaDown = function(location){
            if (location.voted==null){
                location.voteCount -= 1;
                location.voted = true;
                delete location.photos;
                Restangular.one('location-detail', location.id).customPUT(location)
                .then(function (data) {
                })
            }
        };
        $scope.starLocation = function(location){
            location.starLocation = !location.starLocation;
            delete location.photos;
            Restangular.one('location-detail', location.id).customPUT(location)
                .then(function (data) {
                    $scope.location.starLocation = data.starLocation;
                })
        };
        $scope.commentList = {};
        Restangular.all('comments-by-location').getList({'locationID':$routeParams.id})
            .then(function (data) {
                $scope.commentList = data;
            });
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
    }]);