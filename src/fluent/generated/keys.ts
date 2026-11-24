import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'aiux-color-swatch|my-app': {
                        table: 'sys_aix_color_swatch'
                        id: '3798d5761261d5d6f1a1d7701eeedd8c'
                        deleted: true
                    }
                    'aiux-dependency|document-title.js': {
                        table: 'sys_aix_dependency'
                        id: '088668cf584e030a0c6878c1003f3f8e'
                    }
                    'aiux-dependency|knowledge-workspace-actions.js': {
                        table: 'sys_aix_dependency'
                        id: '555cc67ebea34de89729df94b312631a'
                    }
                    'aiux-experience-page-rel|x-saghs-aiux-lux-lab-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: '25b9d0d1117b7eb8d5c106e4427e9054'
                    }
                    'aiux-experience-page-rel|x-saghs-my-app-battleship-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: '7abf52002d76600a955e7ab0136517ce'
                    }
                    'aiux-experience-page-rel|x-saghs-my-app-home-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: '4df9c092e38c9bcd8341248386832828'
                    }
                    'aiux-experience-page-rel|x-saghs-my-app-incidents-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: '674ce5cbd4b08cddae46153c7c4a5ed0'
                    }
                    'aiux-experience-page-rel|x-saghs-my-app-workspace-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: 'f07d9b65aaff8f2967e3cfb03b7887cc'
                    }
                    'aiux-experience-page-rel|x-space-fighter-game-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: 'c991f2d4159853abcc83f2242896ba0e'
                    }
                    'aiux-experience-prop|appHeadCss': {
                        table: 'sys_aix_experience_properties'
                        id: '8dd8c07cdc98ffe5a0a4449355b7c0c9'
                    }
                    'aiux-experience-prop|appPlatform': {
                        table: 'sys_aix_experience_properties'
                        id: '48b75376dafa98c5d07635c0f1e2f6be'
                    }
                    'aiux-experience-prop|appTailwindCss': {
                        table: 'sys_aix_experience_properties'
                        id: 'b1da73202775335001c2b23e89eee67e'
                    }
                    'aiux-experience|my-app': {
                        table: 'sys_aix_experience'
                        id: '8ae8a9712fdc88cd0dd8792793e16d87'
                    }
                    'aiux-layout-widget|lifecycle': {
                        table: 'sys_aix_widget'
                        id: '8a71e373c7a34c0cb129a73b0a0fbe48'
                    }
                    'aiux-m2m-widget-dep|aiux-kb-article-detail|knowledge-workspace-actions.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '0f3a2237e24340240513bfc4dc6498e3'
                    }
                    'aiux-m2m-widget-dep|aiux-kb-article-list|knowledge-workspace-actions.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '16b3397e177e2fe9c652f0b130a9c96f'
                    }
                    'aiux-m2m-widget-dep|x-saghs-my-app-battleship-page|document-title.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '425939084e2b8e5ab41cb27d9c8bdd63'
                    }
                    'aiux-m2m-widget-dep|x-saghs-my-app-workspace-page|document-title.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '9f3cf5db7cbf3893044360ae722ac655'
                    }
                    'aiux-m2m-widget-dep|x-space-fighter-game-page|document-title.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '2cb1aed983880bf323d1d314d9bd7a95'
                    }
                    'aiux-page-widget|x-saghs-aiux-lux-lab-page': {
                        table: 'sys_aix_widget'
                        id: '3fcb409e6aa1026b2dd702f1df9a1fe5'
                    }
                    'aiux-page-widget|x-saghs-my-app-battleship-page': {
                        table: 'sys_aix_widget'
                        id: 'dd4c897b7922d81e81237dec93a6dae7'
                    }
                    'aiux-page-widget|x-saghs-my-app-home-page': {
                        table: 'sys_aix_widget'
                        id: '456499c450b41fd78dfd25b68b9c0718'
                    }
                    'aiux-page-widget|x-saghs-my-app-incidents-page': {
                        table: 'sys_aix_widget'
                        id: '7c81833732df439493e83430f11add79'
                    }
                    'aiux-page-widget|x-saghs-my-app-workspace-page': {
                        table: 'sys_aix_widget'
                        id: '644920c551ce693b620a72e8a527126a'
                    }
                    'aiux-page-widget|x-space-fighter-game-page': {
                        table: 'sys_aix_widget'
                        id: 'f5b8a20ee5506437e0200323d9d36dd0'
                    }
                    'aiux-page|x-saghs-aiux-lux-lab-page': {
                        table: 'sys_aix_page'
                        id: '795e5dbe1e7248509160f0170afc1f27'
                    }
                    'aiux-page|x-saghs-my-app-battleship-page': {
                        table: 'sys_aix_page'
                        id: '4ab7f7b62b5a9a8dc87349718e2f6495'
                    }
                    'aiux-page|x-saghs-my-app-home-page': {
                        table: 'sys_aix_page'
                        id: 'd9d8a1c1d7f50160bb2272049bf89c32'
                    }
                    'aiux-page|x-saghs-my-app-incidents-page': {
                        table: 'sys_aix_page'
                        id: '205c2cec5db417201d9ae7f83b752e3e'
                    }
                    'aiux-page|x-saghs-my-app-workspace-page': {
                        table: 'sys_aix_page'
                        id: 'e49d5c0201d6c3436097d88aa7eaae5f'
                    }
                    'aiux-page|x-space-fighter-game-page': {
                        table: 'sys_aix_page'
                        id: '2956a36b3f0ccecc32c847b15520882b'
                    }
                    'aiux-project|x_saghs_my_app_my_app': {
                        table: 'sys_aix_project'
                        id: '44734188d95c5edfe1306e512a7b2651'
                    }
                    'aiux-theme|my-app': {
                        table: 'sys_aix_theme'
                        id: '64b6b99c72442bdcf9fa600eb0ad9761'
                    }
                    'aiux-widget|aiux-hello-world': {
                        table: 'sys_aix_widget'
                        id: 'd7032715645e03f038e8cddb97a5f2f8'
                    }
                    'aiux-widget|aiux-kb-article-detail': {
                        table: 'sys_aix_widget'
                        id: '04eb411b66a6469931457e3f8af894b5'
                    }
                    'aiux-widget|aiux-kb-article-list': {
                        table: 'sys_aix_widget'
                        id: '784fda1877dc89ceec122222796d6168'
                    }
                    'aiux-widget|aiux-lux-lab': {
                        table: 'sys_aix_widget'
                        id: 'd254abab7dc0015fe3f11e1745cce479'
                    }
                    'aiux-widget|aiux-studio-preview': {
                        table: 'sys_aix_widget'
                        id: 'af93d0e8a8b67c971ffbba8903b4126e'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '0d4a0925f1fe4ebeb679687a559c6061'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'e9e5cf50a2ad44a2bf74c0c8f28bbfce'
                    }
                    'sys-analytics-app|my-app': {
                        table: 'sys_analytics_app'
                        id: 'b5cff53d8de24151c35683642ab00b6f'
                    }
                }
                composite: [
                    {
                        table: 'sn_glider_source_artifact'
                        id: '3e926bdc2fb4438284963e9344988e56'
                        key: {
                            name: 'aiux-source 44734188d95c5edfe1306e512a7b2651'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '7e5bc713c1ad4e058c90a64bbbf664df'
                        key: {
                            application_file: '44734188d95c5edfe1306e512a7b2651'
                            source_artifact: '3e926bdc2fb4438284963e9344988e56'
                        }
                    },
                ]
            }
        }
    }
}
