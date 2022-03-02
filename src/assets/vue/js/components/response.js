window.Yii2VuexOrm = window.Yii2VuexOrm || {};
Yii2VuexOrm.Response = class {

    request;
    response;
    entities = [];
    query;
    page;
    total_items;

    constructor( request, response ) {

        this.request = request;
        this.response = response;

        if ( response.response.status === 200 ) {

            if ( response.response.headers[ 'x-pagination-current-page' ] ) {

                this.page = parseInt( response.response.headers[ 'x-pagination-current-page' ], 10 );
            }

            if ( response.response.headers[ 'x-pagination-total-count' ] ) {

                this.total_items = parseInt( response.response.headers[ 'x-pagination-total-count' ], 10 );
            }

            if ( !response.response.data || ( Array.isArray( response.response.data ) && response.response.data.length === 0 ) ) {

                return;
            }

            let ids = [];
            const primary_keys = response.model.primaryKey;
            response.entities[ response.model.entity ].forEach( function ( entity ) {

                if ( Array.isArray( primary_keys ) ) {

                    let pkeys = [];
                    primary_keys.forEach( key => pkeys.push( entity[ key ] ) );
                    ids.push( pkeys );
                } else {

                    ids.push( entity[ primary_keys ] )
                }
            } );

            let expand = request.expand;
            if ( !Array.isArray( expand ) ) {

                expand = expand.split( ',' );
            }

            this.query = response.model.query().with( expand ).whereIdIn( ids );

            let sorts = request.sort ? request.sort.split( ',' ) : [];
            if ( sorts.length ) {

                for ( let i in sorts ) {

                    let order = 'asc';
                    let sort = sorts[i];
                    if ( sort[ 0 ] === '-' ) {

                        order = 'desc';
                        sort = sort.substring( 1 );
                    }

                    this.query.orderBy( sort, order );
                }
            }

            this.entities = this.query.all();
        }
    }
}