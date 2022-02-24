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

            this.page = parseInt( response.response.headers[ 'x-pagination-current-page' ], 10 );
            this.total_items = parseInt( response.response.headers[ 'x-pagination-total-count' ], 10 );

            if ( !response.response.data || ( Array.isArray( response.response.data ) && response.response.data.length === 0 ) ) {

                return;
            }

            let ids = [];
            response.entities[ response.model.entity ].forEach( entity => ids.push( entity.id ) );

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