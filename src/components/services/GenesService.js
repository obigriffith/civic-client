(function() {
  angular.module('civic.services')
    .factory('GenesResource', GenesResource)
    .factory('Genes', GenesService);

  function GenesResource($resource, $cacheFactory) {
    var cache = $cacheFactory('genesCache');

    // adding this interceptor to a route will delete
    var cacheInterceptor = function(response) {
      cache.remove(response.config.url);
      return response.$promise;
    };
    return $resource('/api/genes/:geneId',
      {
        geneId: '@geneId'
      },
      {
        // Base Gene Resources
        query: {
          method: 'GET',
          isArray: true,
          cache: cache
        },
        get: { // get a single gene
          method: 'GET',
          isArray: false,
          cache: cache
        },
        update: {
          method: 'PATCH',
          interceptor: {
            response: cacheInterceptor
          },
          cache: false
        },
        delete: {
          method: 'DELETE',
          interceptor: {
            response: cacheInterceptor
          },
          cache: false
        },

        // Gene Additional Info
        getMyGeneInfo: {
          url: '/api/genes/:geneId/mygene_info_proxy',
          params: {
            geneId: '@geneId'
          },
          cache: cache,
          transformResponse: function(data) {
            if(typeof data == 'string') {
              data = JSON.parse(data);
            }
            var srcMap = {
              kegg: 'http://www.genome.jp/kegg-bin/show_pathway?',
              reactome: 'http://www.reactome.org/cgi-bin/control_panel_st_id?ST_ID=',
              pharmgkb: 'https://www.pharmgkb.org/pathway/',
              humancyc: 'http://humancyc.org/HUMAN/NEW-IMAGE?type=PATHWAY&object=',
              smpdb: 'http://www.smpdb.ca/view/',
              pid: 'http://pid.nci.nih.gov/search/pathway_landing.shtml?what=graphic&jpg=on&pathway_id=',
              wikipathways: 'http://wikipathways.org/index.php/Pathway:',
              netpath: null,
              biocarta: null,
              inoh: null,
              signalink: null,
              ehmn: null
            };
            var pathways = data.pathway || [];
            var pathwaysFinal = [];
            var link;
            for(var src in pathways){
              if(!angular.isArray(pathways[src])){
                pathways[src] = [pathways[src]];
              }
              for(var p in pathways[src]){
                link = srcMap[src]+pathways[src][p].id;
                if(srcMap[src] === null){
                  link = null;
                }
                pathwaysFinal.push({
                  name: pathways[src][p].name,
                  link: link,
                  src: src
                });
              }
            }
            data.pathway = pathwaysFinal;
            if(!_.isArray(data.alias) && data.alias){
              data.alias = [data.alias];
            }
            if(!_.isArray(data.interpro) && data.interpro){
              data.interpro = [data.interpro];
            }
            return data;
          }
        },

        // Gene Collections
        queryVariants: {
          method: 'GET',
          url: '/api/genes/:geneId/variants',
          isArray: true,
          cache: cache
        },
        queryVariantGroups: {
          method: 'GET',
          url: '/api/genes/:geneId/variant_groups',
          isArray: true,
          cache: cache
        },

        // Base Gene Refresh
        queryFresh: { // get list of genes
          method: 'GET',
          isArray: true,
          cache: false
        },
        getFresh: { // get gene, force cache
          method: 'GET',
          isArray: false,
          cache: false
        },

        // Base Collections Refresh
        queryVariantsFresh: {
          method: 'GET',
          url: '/api/genes/:geneId/variants',
          isArray: true,
          cache: false
        },
        queryVariantGroupsFresh: {
          method: 'GET',
          url: '/api/genes/:geneId/variant_groups',
          isArray: true,
          cache: false
        },

        // Gene Comments Resources
        queryComments: {
          method: 'GET',
          url: '/api/genes/:geneId/comments',
          isArray: true,
          cache: cache
        },
        getComment: {
          method: 'GET',
          url: '/api/genes/:geneId/comments/:commentId',
          params: {
            geneId: '@geneId',
            commentId: '@commentId'
          },
          isArray: false,
          cache: cache
        },

        submitComment: {
          method: 'POST',
          url: '/api/genes/:geneId/comments',
          params: {
            geneId: '@geneId'
          },
          cache: false
        },
        updateComment: {
          method: 'PATCH',
          url: '/api/genes/:geneId/comments/:commentId',
          params: {
            geneId: '@geneId',
            commentId: '@commentId'
          },
          cache: false,
          interceptor: {
            response: cacheInterceptor
          }
        },
        deleteComment: {
          method: 'DELETE',
          url: '/api/genes/:geneId/comments/:commentId',
          params: {
            geneId: '@geneId',
            commentId: '@commentId'
          },
          cache: false,
          interceptor: {
            response: cacheInterceptor
          }
        },

        // Gene Comments Refresh
        queryCommentsFresh: {
          method: 'GET',
          url: 'api/genes/:geneId/comments',
          isArray: true,
          cache: false
        },
        getCommentFresh: {
          method: 'GET',
          url: '/api/genes/:geneId/comments/:commentId',
          params: {
            geneId: '@geneId',
            commentId: '@commentId'
          },
          isArray: false,
          cache: false
        }
      }
    )
  }

  function GenesService(GenesResource, $q) {
    // Base Gene and Gene Collection
    var item = {};
    var collection = [];

    // Additional Gene Data
    var myGeneInfo = {};

    // Gene Collections
    var variants = [];
    var variantGroups = [];
    var comment = {};
    var comments = [];

    return {
      init: init,
      data: {
        item: item,
        collection: collection,
        myGeneInfo: myGeneInfo,
        variants: variants,
        variantGroups: variantGroups,
        comment: comment,
        comments: comments
      },

      // Gene Base
      query: query,
      get: get,
      update: update,
      delete: deleteItem,

      // Gene Additional Info
      getMyGeneInfo: getMyGeneInfo,

      // Gene Base Refresh
      queryFresh: queryFresh,
      getFresh: getFresh,

      // Gene Colletions
      queryVariants: queryVariants,
      queryVariantGroups: queryVariantGroups,

      // Gene Collections Refresh
      queryVariantsFresh: queryVariantsFresh,
      queryVariantGroupsFresh: queryVariantGroupsFresh,

      // Gene Comments
      queryComments: queryComments,
      getComment: getComment,
      submitComment: submitComment,
      updateComment: updateComment,
      deleteComment: deleteComment,

      // Gene Comments Refresh
      queryCommentsFresh: queryCommentsFresh,
      getCommentFresh: getCommentFresh
    };

    function init(geneId) {
      return $q.all([
        get(geneId),
        getMyGeneInfo(geneId),
        queryVariants(geneId),
        queryVariantGroups(geneId)
      ])
    }

    // Gene Base
    function query() {
      return GenesResource.query().$promise
        .then(function(response) {
          angular.copy(response, collection);
          return response.$promise;
        });
    }
    function get(geneId) {
      return GenesResource.get({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, item);
          return response.$promise;
        });
    }
    function update(reqObj) {
      return GenesResource.update(reqObj).$promise
        .then(function(response) {
          angular.copy(response, item);
          return response.$promise;
        });
    }
    function deleteItem(geneId) {
      return GenesResource.delete({geneId: geneId}).$promise
        .then(function(response) {
          item = null;
          return response.$promise;
        });
    }

    // Gene Additional Data
    function getMyGeneInfo(geneId) {
      return GenesResource.getMyGeneInfo({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, myGeneInfo);
          return response.$promise;
        });
    }

    // Gene Collections
    function queryVariants(geneId) {
      return GenesResource.queryVariants({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, variants);
          return response.$promise;
        });
    }
    function queryVariantGroups(geneId) {
      return GenesResource.queryVariantGroups({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, variantGroups);
          return response.$promise;
        });
    }
    // Gene Base Refresh
    function queryFresh() {
      return GenesResource.queryFresh({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, collection);
          return response.$promise;
        });
    }
    function getFresh() {
      return GenesResource.getFresh({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, item);
          return response.$promise;
        });
    }

    // Gene Collections Refresh
    function queryVariantsFresh(geneId) {
      return GenesResource.queryVariantsFresh({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, variants);
          return response.$promise;
        });
    }
    function queryVariantGroupsFresh(geneId) {
      return GenesResource.queryVariantGroupsFresh({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, variantGroups);
          return response.$promise;
        });
    }

    // Gene Comments
    function queryComments(geneId) {
      return GenesResource.queryComments({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, comments);
          return response.$promise;
        });
    }
    function getComment(geneId, commentId) {
      return GenesResource.getComment({geneId: geneId, commentId: commentId}).$promise
        .then(function(response) {
          angular.copy(response, comment);
          return response.$promise;
        });
    }
    function submitComment(reqObj) {
      return GenesResource.submitComment(reqObj).$promise
        .then(function(response) {
          queryCommentsFresh(reqObj);
          return response.$promise;
        });
    }
    function updateComment(reqObj) {
      return GenesResource.updateComment(reqObj).$promise
        .then(function(response) {
          angular.copy(response, comment);
          getCommentFresh(reqObj);
          return response.$promise;
        });
    }
    function deleteComment(geneId, commentId) {
      return GenesResource.deleteComment({geneId: geneId, commentId: commentId}).$promise
        .then(function(response) {
          comment = null;
          return response.$promise;
        });
    }

    // Gene Comments Refresh
    function queryCommentsFresh(geneId) {
      return GenesResource.queryCommentsFresh({geneId: geneId}).$promise
        .then(function(response) {
          angular.copy(response, comments);
          return response.$promise;
        });
    }
    function getCommentFresh(geneId, commentId) {
      return GenesResource.getCommentFresh({geneId: geneId, commentId: commentId}).$promise
        .then(function(response) {
          angular.copy(response   , comment);
          return response.$promise;
        });
    }
  }
})();
