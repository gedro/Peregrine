﻿//define the main module
angular.module('peregrineUi', [
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
			.when('/Tournament', {
				controller: 'tournamentController',
				templateUrl: 'Partials/TournamentDetail.html'
			})
			.when('/Tournament/:tournamentKey', {
				controller: 'tournamentController',
				templateUrl: 'Partials/TournamentDetail.html'
			})
			.when('/Tournament/:tournamentKey/Round/:roundNumber', {
				controller: 'roundController',
				templateUrl: 'Partials/RoundDetail.html'
			})
			.when('/Tournament/:tournamentKey/Standings', {
				controller: 'standingsController',
				templateUrl: 'Partials/Standings.html'
			})
			.otherwise({ redirectTo: '/' });
	});

//modules
angular.module('peregrineUi.resources', [
]);

angular.module('peregrineUi.controllers', [
	'peregrineUi.resources'
]);

angular.module('peregrineUi.directives', [
]);


//resources
angular
.module('peregrineUi.resources')
.factory('tournamentResource', [
	'$resource',
	function ($resource) {
		return $resource('/api/tournaments/:tournamentKey', { tournamentKey: '@key' }, {
			create: {
				method: 'post'
			}
		});
	}
])

angular
.module('peregrineUi.resources')
.factory('playerResource', [
	'$resource',
	function ($resource) {
		return $resource('/api/tournaments/:tournamentKey/players/:playerName', { playerName: '@name' }, {
			save: {
				method: 'put'
			}
		});
	}
])

angular
.module('peregrineUi.resources')
.factory('roundResource', [
	'$resource',
	function ($resource) {
		return $resource('/api/tournaments/:tournamentKey/rounds/:roundNumber', { roundNumber: '@number' }, {
			save: {
				method: 'put'
			}
		});
	}
])

angular
.module('peregrineUi.resources')
.factory('outcomeResource', [
	'$resource',
	function ($resource) {
		return $resource('/api/tournaments/:tournamentKey/rounds/:roundNumber/:playerName/:outcome/:number', null, {
			save: {
				method: 'put'
			}
		});
	}
])

//controllers
angular
.module('peregrineUi.controllers')
.controller('mainController', [
	'$scope', '$resource', 'tournamentResource',
	function ($scope, $resource, tournamentResource) {
		$scope.error = '';
		tournamentResource.query(
			{},
			function success(tournaments) {
				$scope.tournaments = tournaments;
				$scope.error = '';
			},
			function error() {
				$scope.error = 'We were unable to retrieve the tournament list';
			});
	}
]);

angular
.module('peregrineUi.controllers')
.controller('roundController',[
	'$scope', '$route', '$routeParams', '$http', '$location', 'roundResource', 'outcomeResource', 'playerResource',
	function ($scope, $route, $routeParams, $http, $location, roundResource, outcomeResource, playerResource) {
		$scope.error = '';
		$scope.tournamentKey = $routeParams.tournamentKey;
		$scope.updateRound = function () {
			roundResource.get({ tournamentKey: $routeParams.tournamentKey, roundNumber: $routeParams.roundNumber },
			function success(round) {
				$scope.error = '';
				$scope.round = round;
				roundResource.query(
				{
					tournamentKey: $routeParams.tournamentKey
				},
				function success(rounds) {
					$scope.error = '';
					$scope.isAnotherRound = rounds.length > $scope.round.number;
				},
				function error() {
					$scope.error = 'We couldn\'t tell if there is another round or not.';
				});
			},
			function error() {
				$scope.error = 'We couldn\'t get your round';
			});
		};
		$scope.updatePlayerOutcome = function (player, outcome) {
			var apiOutcome = ((outcome === 'wins') ? 'wins' : 'draws');
			if (isNaN(Number(player[outcome])) || player[outcome] === "") {
				return;
			}
			outcomeResource.save(
				{
					tournamentKey: $routeParams.tournamentKey,
					roundNumber: $routeParams.roundNumber,
					playerName: player.name,
					outcome: apiOutcome,
					number: player[outcome]
				},
				{},
				function success() {
					$scope.error = '';
					$scope.updateRound();
				},
				function error() {
					$scope.error = 'We were unable to save your match data.';
				});
		}
		$scope.dropPlayer = function (player) {
			if (confirm('Seriously?')){
				playerResource.delete(
					{
						tournamentKey: $routeParams.tournamentKey,
						playerName: player.name
					},
					function success() {
						$scope.error = '';
						$scope.updateRound();
					},
					function error() {
						$scope.error = 'We were unable to save your match data.';
					});
		    }
		}
		$scope.go = function (path) {
			$location.path(path);
		};

		$scope.updateRound();
		
	}
]);

angular
.module('peregrineUi.controllers')
.controller('tournamentController',[
	'$scope', '$routeParams', '$http', '$resource', 'tournamentResource', 'playerResource',
	function ($scope, $routeParams, $http, $resource, tournamentResource, playerResource) {
		$scope.players = []; //necessary?
		$scope.error = '';
		$scope.newPlayer = {};

		$scope.$watch('players', function (newValue) {
			if (newValue) {
				newValue.sort(comparePlayer);
			}
		}, true);

		if ($routeParams.tournamentKey) {
			//get existing tournament
			tournamentResource.get(
				{ tournamentKey: $routeParams.tournamentKey },
				function success(tournament) {
					$scope.error = '';
					$scope.tournament = tournament;
					//get players
					playerResource.query({ tournamentKey: tournament.key },
						function success(players) {
							$scope.error = '';
							$scope.players = players;
						},
						function error() {
							$scope.error = 'Sorry =( We failed to load your players.';
						});
				},
				function error() {
					$scope.error = 'Sorry =( We were unable to find your tournament.';
				});
		}
		else {
			//create a tournament
			$scope.tournament = tournamentResource.create(
				{},
				function () {
					$scope.error = '';
				}, 
				function () {
					$scope.error = 'We were unable to create a tournament.';
				});
		}

		$scope.addPlayer = function (newplayer) {
			if (!newplayer) {
				newplayer = $scope.newPlayer;
			}
			if (newplayer.name && newplayer.name.length > 0 && $scope.tournament.key) {
				playerResource.save(
					{ tournamentKey: $scope.tournament.key },
					newplayer,
					function success() {
						$scope.error = '';
						//get players
						playerResource.query({ tournamentKey: $scope.tournament.key },
							function success(players) {
								$scope.error = '';
								$scope.players = players;
							},
							function error(players) {
								$scope.error = 'Sorry =( We failed to load your players.';
							});
						$scope.newPlayer = {};
					},
					function error(response) {
						if (response && response.status === 409) {
							$scope.error = 'Sorry a player with the same name already exists.'
						}
						else {
							$scope.error = 'We were unable to add the player!';
						}
					});
			}
		};

		$scope.deletePlayer = function (player) {
			playerResource.delete(
				{ tournamentKey: $scope.tournament.key, playerName: player.name },
				function () {
					$scope.error = '';
					//get players
					playerResource.query({ tournamentKey: $scope.tournament.key },
						function success(players) {
							$scope.error = '';
							$scope.players = players;
						},
						function error(players) {
							$scope.error = 'Sorry =( We failed to load your players.';
						});
				},
				function () {
					$scope.error = 'We were unable to delete the player!';
				});
		};
	}
]);

function comparePlayer(playerOne, playerTwo) {
	if (playerOne.name < playerTwo.name)
		return -1;
	if (playerOne.name > playerTwo.name)
		return 1;
	return 0;
}

//directives

angular
.module('peregrineUi.directives')
.directive('upDown', function () {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: '/DirectiveTemplates/UpDown.html?1=1',
		scope: {
			item: '=upDown',
			attribute: '=upDownAttribute',
			updateFunction: '=upDownChange'
		},
		link: function ($scope, element, attrs) {
			$scope.value = $scope.item[$scope.attribute];
			$scope.increment = function () {
				$scope.item[$scope.attribute]++;
				$scope.updateFunction($scope.item, $scope.attribute);
			};

			$scope.decrement = function () {
				$scope.item[$scope.attribute]--;
				$scope.updateFunction($scope.item, $scope.attribute);
			};
		}	
	};
});