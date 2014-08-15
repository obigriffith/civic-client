angular
  .module('civic.pages')
  .controller('AuthTestCtrl', AuthTestCtrl);

function AuthTestCtrl ($scope, $rootScope, $log) {
  'use strict';
  $log.info('AuthTestCtrl loaded.');
  $rootScope.navMode = 'sub';
  $rootScope.viewTitle = 'AuthTest';
  $log.info('AuthTest loaded.');
  $scope.loadedMsg = 'Loaded AuthTest!';
}
