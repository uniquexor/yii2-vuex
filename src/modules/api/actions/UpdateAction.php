<?php
    namespace unique\yii2vuexorm\modules\api\actions;

    use unique\yii2vue\modules\api\components\ListChanges;
    use unique\yii2vue\modules\api\interfaces\WithListChangesInterface;
    use yii\db\ActiveRecord;
    use yii\web\ServerErrorHttpException;

    class UpdateAction extends \unique\yii2vue\modules\api\actions\UpdateAction {

        public function run( $id = null ) {

            if ( $id === null ) {

                $id = \Yii::$app->request->getBodyParam( 'id' );
            }

            return parent::run( $id );
        }
    }