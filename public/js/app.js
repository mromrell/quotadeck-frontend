'use strict';

var roApp = angular.module('roApp', [
        'ngRoute',
        'restangular',
        'roApp.services',
        'roApp.controllers',
        'roApp.constants',
        'roApp.filters',
        'roApp.directives'
    ])
    .config(['$routeProvider', 'RestangularProvider', function($routeProvider, RestangularProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'partials/home.tpl.html',
                controller: 'HomeController',
                title: 'Home Page'
            })
            .when('/register', {
                templateUrl: 'partials/register.tpl.html',
                controller: 'RegisterController',
                title: "Create an Account"
            })
            .when('/myAccountProfile', {
                templateUrl: 'partials/myAccountProfile.html',
                controller: 'MyAccountProfileController',
                title: 'My Account Profile'
            })
            .when('/jobChatRoom/:id', {
                templateUrl: 'partials/jobChatRoom.html',
                controller: 'jobChatRoomController',
                title: 'Chat with your new salesperson'
            })
            .when('/leaveRating', {
                templateUrl: 'partials/leaveRating.html',
                controller: 'leaveRatingController',
                title: 'leave a Rating'
            })
            .when('/login', {
                templateUrl: 'partials/login.tpl.html',
                controller: 'LoginController',
                title: 'Log in'
            })
            .when('/createJob', {
                templateUrl: 'partials/createJob.html',
                controller: 'CreateJobController',
                title: 'Create a Job'
            })
            .when('/findJob', {
                templateUrl: 'partials/findJob.html',
                controller: 'FindJobController',
                title: 'Find a Job'
            })
            .when('/jobOffer', {
                templateUrl: 'partials/jobOffer.html',
                controller: 'JobOfferController',
                title: 'Send a job offer'
            })
            .when('/browseApplicants/:id', {
                templateUrl: 'partials/browseApplicants.html',
                controller: 'browseApplicantsController',
                title: 'Browse Applicants'
            })
            .when('/jobDetails/:id', {
                templateUrl: 'partials/jobDetails.html',
                controller: 'JobDetailsController',
                title: 'Job Details',
                locationspecific:'locationSpecific.html'
            })
            .when('/companyDetails/:id', {
                templateUrl: 'partials/companyDetails.html',
                controller: 'companyDetailsController',
                title: 'company Details'
            })
            .when('/salesRepDetails/:id', {
                templateUrl: 'partials/salesRepDetails.tpl.html',
                controller: 'salesRepDetailsController',
                title: 'sales Rep Details'
            })
            .when('/index', {
                templateUrl: 'index.html',
                controller: 'HomeController',
                title: 'Home Page'
            })
            .when('/leaderboard', {
                templateUrl: 'leaderboard.html',
                controller: 'LeaderboardController',
                title: 'leaderboard'
            })
            .when('/salesman', {
                templateUrl: 'salesman.html',
                controller: 'SalesmanController',
                title: 'salesman'
            })
            .when('/profileDash', {
                templateUrl: 'profileDash.html',
                controller: 'ProfileDashController',
                title: 'salesman'
            })
            .when('/dashboard', {
                templateUrl: 'partials/dashboard.html',
                controller: 'DashboardController',
                title: 'Dashboard'
            })
            .when('/landing', {
                templateUrl: 'landing-page.html',
                controller: 'HomeController',
                title: 'QuotaDeck.com'
            })
            .otherwise({
                redirectTo: '/home'
            });

           RestangularProvider.setBaseUrl('http://quotadeck-backend.herokuapp.com');
//            RestangularProvider.setBaseUrl('http://localhost:8001');
    }])
    .run(['$location', '$rootScope', 'baseTitle', '$http', 'Restangular', 'SessionService', function ($location, $rootScope, baseTitle, $http, Restangular, SessionService) {
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
            // Check to see if the 'title' attribute exists on the route
            if (current.hasOwnProperty('$route')) {
                $rootScope.title = baseTitle + current.$route.title;
            } else {
                $rootScope.title = baseTitle.substring(0, baseTitle.length - 3);
            }

        /* The following is for $http and Restangular token auth */
        if (SessionService.isLoggedIn()) {
            var token = SessionService.getSession();
            $http.defaults.headers.common['Authorization'] = 'Token ' + token;
        }


        // add Auth Token to every Restangular request
        Restangular.setFullRequestInterceptor(function(element, operation, route, url, headers, params) {
            if (SessionService.isLoggedIn()) {
                var token = SessionService.getSession();
                headers['Authorization'] = 'Token ' + token;
            }

            return { element: element, params: params, headers: headers }
            });
        });


    }]);