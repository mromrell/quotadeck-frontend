'use strict';

/* Controllers */

angular.module('roApp.controllers', [])
    .controller('BaseController', ['$scope', '$window', 'brand', 'SessionService', function($scope, $window, brand, SessionService) {
        $scope.brand = brand;
        $scope.session = SessionService.getSession();
//        console.log($scope.session);
        $scope.$on('event:login-confirmed', function() {
            console.log('event has been broadcast to Home Controller');
            $scope.session = SessionService.getSession();
        });

        $scope.doLogout = function() {
            SessionService.removeSession();
            $window.location = '/';
        };
    }])
    .controller('HomeController', ['$scope', 'SessionService', function($scope, SessionService) {

    }])
    .controller('UserCreateController', ['$scope', '$window', 'Restangular', 'SessionService', function($scope, $window, Restangular, SessionService) {
        $scope.createUser = function(user) {
            console.log(JSON.stringify(user));

            Restangular.all('users/new').customPOST(user).then(function (data) {
                user.id = data.id;
                user.date_joined = data.date_joined;
                user.last_login = data.last_login;
                user.stats = 'Active';
                user.username = data.username;
//                console.log('Token: ' + JSON.stringify(data));

                SessionService.saveSession(data.auth_token);

                console.log('User Created!');

                $window.location = '/';
            }, function (data) {
//                if (data.data.errors.hasOwnProperty('email')) {
//                    console.log(data.data.errors.email[0]);
//                }
            });
        }
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

        $scope.$on('event:login-confirmed', function () {
            console.log('event has been broadcast to Home Controller');
            $scope.session = SessionService.getSession();

        });
        console.log($scope.session);
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

//        $scope.uploadFile = function (files) {
//            $scope.newJob.photos = files[0];
//
//        };

        $scope.save = function () {

            var job = {
                'company': $scope.newJob.company,
                'user': $scope.session.id,
                'jobTitle': $scope.newJob.jobTitle,
                'industry': $scope.newJob.industry,
                'description': $scope.newJob.jobDescription,
                'location': $scope.newJob.location,
                'startDate': $scope.newJob.startDate,
                'totalCost': $scope.newJob.totalCost,
                'commission': $scope.newJob.commission,
                'linkUrl': $scope.newJob.linkUrl
//                'photo': $scope.newJob.photos
            };
            $http.post('http://localhost:8001/job', job, {
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
        $scope.apply = false;
        $scope.applySwitch = function (){
            if ($scope.apply==false){
                $scope.apply=true;
                console.log("true");
                return
            }
            if ($scope.apply==true){
                $scope.apply=false;
                console.log("false");
            }
        }
        $scope.application = {
            'user': 1,
            'job': 1,
            'dateApplied': '2014-02-22',
            'appTitle':'',
            'appDescription':$scope.description,
            'appCost':$scope.cost
        }


        $scope.submitApplication = function() {
           Restangular.one('application').customPOST($scope.application)
               .then(function (data) {
            });
           $window.location = 'index.html#/home';
        }

    }])
    .controller('FindJobController', ['$scope', '$http', 'SessionService', 'Restangular', '$routeParams', function ($scope, $http, SessionService, Restangular, $routeParams) {
         Restangular.all('job').getList()
            .then(function (data) {
                $scope.jobList = data;
                  Restangular.all('companies').getList()
                    .then(function (data) {
                        for (var i = 0; i < $scope.jobList.length; i++){
                           var num = $scope.jobList[i].company;
                           $scope.jobList[i].company = data[num - 1].companyName;
                        }

                    });
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