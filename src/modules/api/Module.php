<?php
    namespace unique\yii2vuexorm\modules\api;
    
    use yii\base\Application;
    use yii\base\BootstrapInterface;
    use yii\helpers\Inflector;
    use yii\helpers\Url;
    use yii\web\Response;
    use yii\web\UrlRule;

    class Module extends \unique\yii2vue\modules\api\Module {

        public string $rest_config_path = __DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php';
    }