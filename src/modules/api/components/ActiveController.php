<?php
    namespace unique\yii2vuexorm\modules\api\components;

    use unique\yii2vue\modules\api\actions\CreateAction;
    use unique\yii2vue\modules\api\actions\ViewAction;
    use unique\yii2vuexorm\modules\api\actions\IndexAction;
    use unique\yii2vuexorm\modules\api\actions\UpdateAction;
    use yii\data\ActiveDataFilter;
    use yii\rest\DeleteAction;

    /**
     * Class ActiveController
     * @method actionView( int $id ) Returns specified entity.
     * @method actionIndex() Returns a list of entities.
     * @method actionCreate() Creates a new entity.
     * @method actionUpdate( int $id = null ) Updates a specified entity.
     * @method actionDelete( int $id ) Deletes an entity.
     */
    class ActiveController extends \yii\rest\ActiveController {

        /**
         * A class of the Model that needs to be used to search for data in the index action.
         * Will be set as a {@see ActiveDataFilter::searchModel}
         * @var string
         */
        public $search_model;

        /**
         * Public options for each of the action: delete, update, create, index, view.
         * @var array
         */
        protected $action_options = [];

        /**
         * Overwrite default Serializer options, because it is important for us to preserve the keys,
         * since data in the ModelsManager will be indexed by keys.
         *
         * @var array
         */
        public $serializer = [
            'class' => '\yii\rest\Serializer',
            'preserveKeys' => true,
        ];

        /**
         * @inheritdoc
         */
        public function actions() {

            $actions = parent::actions();

            $actions['delete']['class'] = DeleteAction::class;
            $actions['create']['class'] = CreateAction::class;
            $actions['update']['class'] = UpdateAction::class;
            $actions['view']['class'] = ViewAction::class;
            $actions['index']['class'] = IndexAction::class;

            if ( $this->search_model ) {

                $model = new $this->search_model( [ 'scenario' => 'search' ] );
                $actions['index']['dataFilter'] = [ 'class' => ActiveDataFilter::class, 'searchModel' => $model ];
            }

            $actions = array_merge_recursive( $actions, $this->action_options );

            return array_filter( $actions, function ( $action ) {

                return !$this->hasMethod( 'action' . ucfirst( $action ) );
            }, ARRAY_FILTER_USE_KEY );
        }
    }