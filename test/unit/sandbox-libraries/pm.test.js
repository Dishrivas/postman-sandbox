describe('sandbox library - pm api', function () {
    this.timeout(1000 * 60);
    var Sandbox = require('../../../'),

        sampleContextData = {
            globals: [{
                key: 'var1',
                value: 'one'
            }, {
                key: 'var2',
                value: 2,
                type: 'number'
            }],
            environment: [{
                key: 'var1',
                value: 'one-env'
            }, {
                key: 'var2',
                value: 2.5,
                type: 'number'
            }]
        },
        context;

    beforeEach(function (done) {
        Sandbox.createContext({}, function (err, ctx) {
            context = ctx;
            done(err);
        });
    });

    afterEach(function () {
        context.dispose();
        context = null;
    });

    it('pm object should be in globals', function (done) {
        context.execute(`
            var assert = require('assert');
            assert.strictEqual(typeof pm, 'object');
        `, done);
    });

    describe('globals', function () {
        it('must be defined as VariableScope', function (done) {
            context.execute(`
                var assert = require('assert'),
                    VariableScope = require('postman-collection').VariableScope;
                assert.strictEqual(VariableScope.isVariableScope(pm.globals), true);
            `, done);
        });

        it('must be a readonly property', function (done) {
            context.execute(`
                var assert = require('assert'),
                    _globals;

                _globals = pm.globals;
                pm.globals = [];

                assert.strictEqual(pm.globals, _globals, 'property stays inchanged');
            `, done);
        });

        it('must forward global variables forwarded during execution', function (done) {
            context.execute(`
                var assert = require('assert');
                assert.strictEqual(pm.globals.get('var1'), 'one');
                assert.strictEqual(pm.globals.get('var2'), 2);
            `, {context: sampleContextData}, done);
        });

        it('must propagate updated globals from inside sandbox', function (done) {
            context.execute(`
                var assert = require('assert');

                assert.strictEqual(pm.globals.get('var1'), 'one');
                pm.globals.set('var1', 'one-one');
                assert.strictEqual(pm.globals.get('var1'), 'one-one');

            `, {context: sampleContextData}, function (err, exec) {
                expect(err).not.be.ok();
                expect(exec).be.ok();
                expect(exec.globals.values).eql([
                    {type: 'any', value: 'one-one', key: 'var1'},
                    {type: 'number', value: 2, key: 'var2'}
                ]);
                done();
            });
        });
    });

    describe('environment', function () {
        it('must be defined as VariableScope', function (done) {
            context.execute(`
                var assert = require('assert'),
                    VariableScope = require('postman-collection').VariableScope;
                assert.strictEqual(VariableScope.isVariableScope(pm.environment), true);
            `, done);
        });

        it('must be a readonly property', function (done) {
            context.execute(`
                var assert = require('assert'),
                    _environment;

                _environment = pm.globals;
                pm.globals = [];

                assert.strictEqual(pm.globals, _environment, 'property stays inchanged');
            `, done);
        });

        it('must forward environment variables forwarded during execution', function (done) {
            context.execute(`
                var assert = require('assert');
                assert.strictEqual(pm.environment.get('var1'), 'one-env');
                assert.strictEqual(pm.environment.get('var2'), 2.5);
            `, {context: sampleContextData}, done);
        });

        it('must propagate updated environment from inside sandbox', function (done) {
            context.execute(`
                var assert = require('assert');

                assert.strictEqual(pm.environment.get('var1'), 'one-env');
                pm.environment.set('var1', 'one-one-env');
                assert.strictEqual(pm.environment.get('var1'), 'one-one-env');

            `, {context: sampleContextData}, function (err, exec) {
                expect(err).not.be.ok();
                expect(exec).be.ok();
                expect(exec.environment.values).eql([
                    {type: 'any', value: 'one-one-env', key: 'var1'},
                    {type: 'number', value: 2.5, key: 'var2'}
                ]);
                done();
            });
        });
    });
});
