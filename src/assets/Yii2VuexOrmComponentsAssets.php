<?php
    namespace unique\yii2vuexorm\assets;

    use yii\web\AssetBundle;
    use yii\web\View;

    class Yii2VuexOrmComponentsAssets extends AssetBundle {

        public $js = [];

        public $jsOptions = [
            'position' => View::POS_HEAD
        ];
    }