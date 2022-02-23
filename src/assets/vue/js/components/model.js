class Model extends VuexORM.Model {

    static endpoint_create;
    static endpoint_update;
    static endpoint_delete;
    static endpoint_list;

    _errors;
    _default_error_field = 'id';

    isNewRecord() {

        return this.id === null;
    }

    async save() {

        let errors = {};
        this._errors = {};

        let result = null;

        if ( this.isNewRecord() ) {

            if ( !this.constructor.endpoint_create ) {

                console.error( 'No endpoint set for a model', this );
                throw 'No endpoint set for a model';
            }

            result = await this.constructor.api().post( this.constructor.endpoint_create, this );
        } else {

            if ( !this.constructor.endpoint_update ) {

                console.error( 'No endpoint set for a model', this );
                throw 'No endpoint set for a model';
            }

            result = await this.constructor.api().put( this.constructor.endpoint_update, this );
        }

        if ( result.response.status === 422 ) {

            for ( let i in result.response.data ) {

                let error = result.response.data[ i ];
                errors[ error.field ] = error.message;
            }

            this._errors = errors;
        } else if ( result.response.status !== 200 && result.response.status !== 201 && this._default_error_field ) {

            errors[ this._default_error_field ] = result.response.statusText;
            this._errors = errors;
        }

        return result;
    }

    async delete() {

        if ( !this.constructor.endpoint_delete ) {

            console.error( 'No endpoint set for a model', this );
            throw 'No endpoint set for a model';
        }

        return await this.constructor.api().delete( this.constructor.endpoint_delete + '?id=' + this.id, {
            delete: this.id
        } );
    }

    static async list( request ) {

        const default_params = {
            url: this.endpoint_list,
            expand: '',
            filter: null,
            params: {},
            page: null,
            page_size: 5,
            axios: {}
        }

        request = $.extend( default_params, request );
        let expand = request.expand;
        if ( Array.isArray( request.expand ) ) {

            expand = request.expand.join( ',' );
        }

        let get_params = $.extend( request.params, { expand: expand } );
        if ( request.page ) {

            get_params.page = request.page;
        }

        if ( request.page_size ) {

            get_params['per-page'] = request.page_size;
        }

        if ( request.filter ) {

            if ( !request.axios ) {

                request.axios = {};
            }

            if ( !request.axios.paramsSerializer ) {

                request.axios.paramsSerializer = function ( params ) {

                    return $.param( params );
                }
            }

            get_params.filter = request.filter;
        }

        const axios_params = $.extend( request.axios, { params: get_params } );
        const result = await this.api().get( request.url, axios_params );

        return new Response( request, result );
    }
}