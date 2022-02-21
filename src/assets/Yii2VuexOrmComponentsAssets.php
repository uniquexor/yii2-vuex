<?php
    namespace unique\yii2vuexorm\assets;

    use yii\web\AssetBundle;
    use yii\web\View;

    class Yii2VuexOrmComponentsAssets extends AssetBundle {

        public $sourcePath = __DIR__ . '/vue';

        public $js = [
            'js/components/model.js'
        ];

        public $jsOptions = [
            'position' => View::POS_HEAD
        ];
    }