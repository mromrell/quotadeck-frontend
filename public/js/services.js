'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('roApp.services', ['angularLocalStorage'])
    .factory('SessionService', function ($http, storage) {
        return {
            saveSession: function (data) {
                storage.set('user', data);
            },
            getSession: function () {
                return storage.get('user');
            },
            removeSession: function () {
                storage.clearAll();
            },
            isLoggedIn: function () {
                return storage.get('user') != null;
            },
            saveToken: function(token){
                storage.set('token', token);
            },
            getToken: function(){
                return storage.get('token');
            }
        };
    });