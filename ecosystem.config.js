// pm2 deploy ecosystem.config.js staging setup
// pm2 deploy ecosystem.config.js production setup
// pm2 deploy ecosystem.config.js staging
// pm2 deploy ecosystem.config.js production

module.exports = {
  apps : [{
    name: 'wc-api-STAGING-MATHIEU',
    script: 'build/index.js',
    max_memory_restart: '512M',
    exec_mode : "cluster",
    instances : "-1",
    "env_staging" : {
      "NODE_ENV": "staging"
    },
  },{
    name: 'wc-api-STAGING',
    script: 'build/index.js',
    max_memory_restart: '512M',
    exec_mode : "cluster",
    instances : "-1",
    "env_staging" : {
      "NODE_ENV": "staging"
    },
  },
  {
    name: 'wc-api-PROD',
    script: 'build/index.js',
    max_memory_restart: '512M',
    exec_mode : "cluster",
    instances : "-1",
    "env_production" : {
      "NODE_ENV": "production"
    },
  },
  {
    name: 'wc-api-STAGING-THOMAS',
    script: 'build/index.js',
    max_memory_restart: '512M',
    exec_mode : "cluster",
    instances : "-1",
    "env_production" : {
      "NODE_ENV": "staging"
    },
  },{
    name: 'wc-api-STAGING-3',
    script: 'build/index.js',
    max_memory_restart: '512M',
    exec_mode : "cluster",
    instances : "-1",
    "env_production" : {
      "NODE_ENV": "staging"
    },
  }],

  deploy : {
    staging_thomas: {
      key: '__ssh_staging_key_path_to_replace__',
      user : 'mainadmin',
      host : '152.228.167.38',
      ref  : 'origin/dev-thomas',
      repo : 'git@gitlab.com:wecount1/wecount-api.git',
      path : '/var/www/wecount-api/staging-thomas',
      'pre-deploy-local': '',
      'post-deploy' : 'yarn && yarn build && yarn typeorm migration:run && yarn typeorm schema:sync && pm2 reload ecosystem.config.js --only wc-api-STAGING-THOMAS --env=staging',
      'pre-setup': ''
    },
    staging_mathieu: {
      key: '__ssh_staging_key_path_to_replace__',
      user : 'mainadmin',
      host : '152.228.167.38',
      ref  : 'origin/dev-mathieu',
      repo : 'git@gitlab.com:wecount1/wecount-api.git',
      path : '/var/www/wecount-api/staging-mathieu',
      'pre-deploy-local': '',
      'post-deploy' : 'yarn && yarn build && yarn typeorm migration:run && yarn typeorm schema:sync && pm2 reload ecosystem.config.js --only wc-api-STAGING-MATHIEU --env=staging',
      'pre-setup': ''
    },
    staging_3: {
      key: '__ssh_staging_key_path_to_replace__',
      user : 'mainadmin',
      host : '152.228.167.38',
      ref  : 'origin/dev-gilles',
      repo : 'git@gitlab.com:wecount1/wecount-api.git',
      path : '/var/www/wecount-api/staging-3',
      'pre-deploy-local': '',
      'post-deploy' : 'yarn && yarn build && yarn typeorm migration:run && yarn typeorm schema:sync && pm2 reload ecosystem.config.js --only wc-api-STAGING-3 --env=staging',
      'pre-setup': ''
    },
    staging : {
      key: '__ssh_staging_key_path_to_replace__',
      user : 'mainadmin',
      host : '152.228.167.38',
      ref  : 'origin/dev',
      repo : 'git@gitlab.com:wecount1/wecount-api.git',
      path : '/var/www/wecount-api/staging',
      'pre-deploy-local': '',
      'post-deploy' : 'yarn && yarn build && yarn typeorm migration:run && yarn typeorm schema:sync && pm2 reload ecosystem.config.js --only wc-api-STAGING --env=staging',
      'pre-setup': ''
    },
    production : {
      key: '__ssh_production_key_path_to_replace__',
      user : 'mainadmin',
      host : '152.228.167.38',
      ref  : 'origin/master',
      repo : 'git@gitlab.com:wecount1/wecount-api.git',
      path : '/var/www/wecount-api/production',
      'pre-deploy-local': '',
      'post-deploy' : 'yarn && yarn build && yarn typeorm migration:run && yarn typeorm schema:sync && pm2 reload ecosystem.config.js --only wc-api-PROD --env=production',
      'pre-setup': ''
    }
  }
};
