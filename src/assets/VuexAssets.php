<?php
    namespace unique\yii2vuexorm\assets;

    use yii\web\AssetBundle;
    use yii\web\View;

    class VuexAssets extends AssetBundle {

        public $sourcePath = __DIR__ . '/vuex-assets';

        public $jsOptions = [
            'position' => View::POS_HEAD
        ];

        public function init() {

            parent::init();

            if ( YII_DEBUG ) {

                $this->js[] = 'vuex.js';
                $this->js[] = 'vuex-orm.global.js';
                $this->js[] = 'axios.js';
                $this->js[] = 'vuex-orm-axios.js';
            } else {

                $this->js[] = 'vuex.min.js';
                $this->js[] = 'vuex-orm.global.js';
                $this->js[] = 'axios.min.js';
                $this->js[] = 'vuex-orm-axios.min.js';
            }
        }
    }