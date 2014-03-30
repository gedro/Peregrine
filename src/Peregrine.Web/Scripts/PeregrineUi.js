﻿//define the main module
angular
.module('peregrineUi', [
	'ngRoute',
	'ngResource',
	'peregrineUi.controllers',
	'peregrineUi.directives',
	'ui.bootstrap'
]).config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			controller: 'mainController',
			templateUrl: 'Partials/Home.html'
		})
		.when('/dash/tournament/:tournamentKey', {
			controller: 'tournamentDashboardController',
			templateUrl: 'Partials/TournamentDashboard.html'
		})
		.when('/Tournament', {
			controller: 'tournamentController',
			templateUrl: 'Partials/TournamentEdit.html'
		})
		.when('/Tournament/:tournamentKey', {
			controller: 'tournamentController',
			templateUrl: 'Partials/TournamentEdit.html'
		})
		.when('/Tournament/:tournamentKey/Round/:roundNumber', {
			controller: 'roundController',
			templateUrl: 'Partials/RoundDetail.html'
		})
		.when('/Tournament/:tournamentKey/RoundEdit/:roundNumber', {
			controller: 'roundController',
			templateUrl: 'Partials/RoundEdit.html'
		})
		.when('/Tournament/:tournamentKey/Standings', {
			controller: 'standingsController',
			templateUrl: 'Partials/Standings.html'
		})
		.otherwise({ redirectTo: '/' });
});

angular.module('peregrineUi.controllers', [
	'peregrineUi.resources',
	'peregrineUi.filters'
]);

angular.module('peregrineUi.resources', [
]);

angular.module('peregrineUi.filters', [
]);

angular.module('peregrineUi.directives', [
]);
