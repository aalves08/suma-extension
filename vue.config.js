const config = require('@rancher/shell/vue.config');
const configHelper = require('@rancher/shell/vue-config-helper.js');

module.exports = config(__dirname, {
  excludes: [],
  proxies:  { '/rhn/manager': configHelper.proxyOpts('https://ec2-52-206-103-214.compute-1.amazonaws.com') }
});
