class Response {

    request;
    response;
    entities;
    page;
    total_items;

    constructor( request, response ) {

        this.request = request;
        this.response = response;

        if ( response.response.status === 200 ) {

            this.page = response.response.headers[ 'x-pagination-current-page' ];
            this.total_items = response.response.headers[ 'x-pagination-total-count' ];

            let ids = [];
            response.entities[ response.model.entity ].forEach( entity => ids.push( entity.id ) );

            let expand = request.expand;
            if ( !Array.isArray( expand ) ) {

                expand = expand.split( ',' );
            }

            this.entities = response.model.query().with( expand ).whereIdIn( ids ).all();
        }
    }
}