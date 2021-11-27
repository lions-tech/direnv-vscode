import * as glob from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

export const workspaceRoot = path.resolve(__dirname, '../../../test/workspace');

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: 'bdd',
		color: true,
		rootHooks: {
			afterEach() {
				sinon.restore();
			},
			afterAll() {
				return vscode.commands.executeCommand('workbench.action.closeFolder');
			},
		}
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
			if (err) {
				return e(err);
			}

			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		});
	});
}