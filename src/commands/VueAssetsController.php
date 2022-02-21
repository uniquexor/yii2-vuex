<?php
    namespace unique\yii2vuexorm\commands;

    use yii\console\Controller;
    use yii\db\ActiveRecord;
    use yii\helpers\Console;
    use yii\helpers\Inflector;

    class VueAssetsController extends \unique\yii2vue\commands\VueAssetsController {

        /**
         * @var string Path to Model's class's template file.
         */
        public string $js_model_template_path = __DIR__ . DIRECTORY_SEPARATOR . '__vue_model_template.js';

        protected function generateBody( string $attribute_name, string $attribute_type, string $padding ) {

            return $padding . $attribute_name . ': this.attr( null )';
        }

        protected function generateRelation( string $attribute_name, string $attribute_type, bool $is_array, string $padding ) {

            // @todo
            return false;
        }

        protected function beforeWrite( string $template, string $object_class, \ReflectionClass $reflection ): string {

            $template = str_replace( '__TABLE_NAME__', $object_class::tableName(), $template );

            return parent::beforeWrite( $template, $object_class, $reflection );
        }
    }