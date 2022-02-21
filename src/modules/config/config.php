<?php
    /**
     * @var \unique\yii2vuexorm\modules\api\Module $this
     */

    return [
        'components' => [
            'request' => [
                'class' => \yii\web\Request::class,
                'parsers' => [
                    'application/json' => 'yii\web\JsonParser',
                ],
            ],
            'response' => [
                'class' => \yii\web\Response::class,
                'format' => \yii\web\Response::FORMAT_JSON,
            ],
        ],
    ];