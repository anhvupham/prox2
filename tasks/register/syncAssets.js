module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
		'jst:dev',
		'less:dev',
		'sync:dev',
		'coffee:dev',
		'concat:js',
		'concat:css'
	]);
};
